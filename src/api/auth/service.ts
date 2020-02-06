import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

import { ISendVerificationEmailBody, ICheckAuthCodeBody, IRegisterBody, ILocalLoginBody, ISocialLoginBody, IRestoreAccountBody } from './model';
import { UserRoleEnum, AuthActivityTypeEnum, LoginProviderTypeEnum, OsTypeEnum, LanguageEnum } from '../../services/enums';

import UserSchema from '../../schemas/user';
import UserPasswordSchema from '../../schemas/userPassword';
import DeviceSchema from '../../schemas/device';
import RefreshTokenSchema, { getUniqueToken } from '../../schemas/refreshToken';

import { generateVerificationCode, downloadImageFromUrl } from '../../services/utilities';

import * as mailer from '../../services/mailer';
import SocialMedia, { ISocialMediaData } from '../../services/social';

import { IUser } from '../../schemas/user/model';
import mainConfig from '../../env';
import { failedResponse, succeedResponse } from '../response';
import { IResponseModel } from '../model';
import { IUserPassword } from '../../schemas/userPassword/model';
import { mediaPaths, refreshExpiration } from '../../services/constants';
import { blockedAccount, accountAlreadyExists } from './validation';
import { IRefreshToken } from '../../schemas/refreshToken/model';

export const sendVerificationEmail = async(body: ISendVerificationEmailBody): Promise<void> => {
  let user = body.user;
  if (!user) {
    user = new UserSchema();
  }
  user.role = body.role;
  user.email = body.email;
  const isUser = body.role === UserRoleEnum.user;
  user.firstName = isUser ? body.firstName : null;
  user.lastName = isUser ? body.lastName : null;
  user.fullName = isUser ? `${body.firstName} ${body.lastName}` : body.corporateName;
  user.taxNumber = !isUser ? body.taxNumber : null;
  const code = generateVerificationCode(4);
  user.verificationCode = code;
  mailer.sendVerificationEmail(code, user.email, body.osType, isUser ? user.fullName : `${user.fullName} staff`);
  await user.save();
};

export const checkAuthCode = async(body: ICheckAuthCodeBody, language: number ): Promise<IResponseModel> => {
  const user = body.user;
  if (body.type === AuthActivityTypeEnum.register) {
    if (user.verificationCode === body.code) {
      return succeedResponse('ok');
    } else {
      return failedResponse(wrongCode(language));
    }
  } else {
    if (user.restoreCode === body.code) {
      return succeedResponse('ok');
    } else {
      return failedResponse(wrongCode(language));
    }
  }
};

export const register = async(body: IRegisterBody): Promise<{ authToken: string, refreshToken: string }> => {
  const user = body.user;
  if (!user.registeredDt) user.registeredDt = new Date();
  const localPassword = new UserPasswordSchema({
    user: user._id,
    providerType: LoginProviderTypeEnum.local,
    passwordHash: bcrypt.hashSync(body.password, 12)
  });
  user.passwords.push(localPassword._id);
  user.verificationCode = null;
  if (body.deviceId) {
    await DeviceSchema.deleteMany({ deviceId: body.deviceId });
    const device = new DeviceSchema({
      user: user._id,
      language: body.language,
      osType: body.osType,
      deviceId: body.deviceId,
      deviceToken: body.deviceToken || null
    });
    await device.save();
  }
  await Promise.all([
    user.save(),
    localPassword.save()
  ]);
  return assignToken(user, LoginProviderTypeEnum.local, body.osType, body.deviceId);
};

export const login = async(body: ILocalLoginBody): Promise<{ authToken: string, refreshToken: string }> => {
  const user = body.user;
  if (body.deviceId) {
    await DeviceSchema.deleteMany({ deviceId: body.deviceId });
    const device = new DeviceSchema({
      user       : user._id,
      language   : body.language,
      osType     : body.osType,
      deviceId   : body.deviceId,
      deviceToken: body.deviceToken || null
    });
    await device.save();
  }
  return assignToken(user, LoginProviderTypeEnum.local, body.osType, body.deviceId);
};

export const socialLogin = async (body: ISocialLoginBody): Promise<IResponseModel> => {
  const userData = await SocialMedia.getUserData(body.provider, body.token);
  let tokens;
  if (userData) {
    userData.email = userData.email.toLowerCase();
    const user: IUser<IUserPassword> = await UserSchema.findOne({
      email: userData.email,
    }).populate({
      path: 'passwords',
      match: { providerType: body.provider }
    });
    let userId = user ? user._id : null;
    if (!user) {
      // User with email doesn't exist, create one with user role
      const newUser = await createUserFromSocial(userData, body.provider);
      userId = newUser._id;
      tokens = assignToken(newUser, body.provider, body.osType, body.deviceId);
    } else if (user && user.blocked) {
      return failedResponse(blockedAccount(body.language));
    } else if (user && user.role !== UserRoleEnum.user && user.role !== UserRoleEnum.corporate) {
      // Email is used by another user having other role
      return failedResponse(accountAlreadyExists(body.language));
    } else if (user && !user.passwords.length) {
      // User exists but logins with chosen provider for the 1st time, add provider password
      await addSocialProviderToUser(user, userData, body.provider);
      tokens = assignToken(user, body.provider, body.osType, body.deviceId);
    } else {
      // User exists and logins with chosen provider not for the 1st time, check password and give token
      const currentPassword = user.passwords[0];
      if (bcrypt.compareSync(userData.id, currentPassword.passwordHash)) {
        tokens = assignToken(user, body.provider, body.osType, body.deviceId);
      } else {
        return failedResponse('Not unique identifier from provider');
      }
    }
    if (body.deviceId) {
      await DeviceSchema.deleteMany({ deviceId: body.deviceId });
      const device = new DeviceSchema({
        user       : userId,
        language   : body.language,
        osType     : body.osType,
        deviceId   : body.deviceId,
        deviceToken: body.deviceToken || null
      });
      await device.save();
    }
    if (!user.registeredDt) user.registeredDt = new Date();
    return succeedResponse('Logged in successfully', tokens);
  }
  else {
    return failedResponse('Wrong token');
  }
};

export const sendRestoreEmail = async(body: ISendVerificationEmailBody): Promise<void> => {
  const user = body.user;
  const code = generateVerificationCode(4);
  user.restoreCode = code;
  // let userName = user.role === UserRoleEnum.user ? user.fullName : `${user.fullName} staff`;
  const userName = user.fullName ? UserRoleEnum.user ? user.fullName : `${user.fullName} staff` : null;
  mailer.sendRestoreCode(code, user.email, body.osType, userName, user.role);
  await user.save();
};

export const restoreAccount = async(body: IRestoreAccountBody): Promise<{ authToken: string, refreshToken: string }> => {
  const user = body.user;
  const localPassword = user.passwords.find(item => item.providerType === LoginProviderTypeEnum.local);
  if (localPassword) {
    localPassword.passwordHash = bcrypt.hashSync(body.password, 12);
    await localPassword.save();
  } else {
    const newPassword = new UserPasswordSchema({
      user: user._id,
      providerType: LoginProviderTypeEnum.local,
      passwordHash: bcrypt.hashSync(body.password, 12)
    });
    user.passwords.push(newPassword._id);
    await Promise.all([
      newPassword.save(),
      user.save()
    ]);
  }
  if (body.deviceId) {
    await DeviceSchema.deleteMany({ deviceId: body.deviceId });
    const device = new DeviceSchema({
      user       : user._id,
      language   : body.language,
      osType     : body.osType,
      deviceId   : body.deviceId,
      deviceToken: body.deviceToken || null
    });
    await device.save();
  }
  return assignToken(user, LoginProviderTypeEnum.local, body.osType, body.deviceId);
};

export const logout = async(deviceId: string): Promise<void> => {
  await Promise.all([
    DeviceSchema.deleteMany({ deviceId }),
    RefreshTokenSchema.updateMany({ uuid: deviceId, expired: false }, { expired: true, expDt: new Date() })
  ]);
};

export const getNewToken = async(refreshToken: IRefreshToken<IUser>): Promise<{ authToken: string, refreshToken: string }> => {
  // TODO Read from config
  const authToken = jwt.sign({ _id: refreshToken.user, role: refreshToken.user.role, provider: refreshToken.provider }, mainConfig.JWT_SECRET, { expiresIn: '6h' });
  const newRefreshToken = await getUniqueToken();
  refreshToken.token = newRefreshToken;
  refreshToken.updatedCount++;
  refreshToken.expectedExpDt = null;
  refreshToken.updatedDt = new Date();
  if (refreshToken.osType in [OsTypeEnum.android, OsTypeEnum.ios]) {
    refreshToken.expectedExpDt = new Date(Date.now() + refreshExpiration.app);
  } else {
    if (refreshToken.user.role in [UserRoleEnum.corporate, UserRoleEnum.user]) {
      refreshToken.expectedExpDt = new Date(Date.now() + refreshExpiration.web);
    } else {
      refreshToken.expectedExpDt = new Date(Date.now() + refreshExpiration.admin);
    }
  }
  await refreshToken.save();
  return { authToken, refreshToken: newRefreshToken };
};

function assignToken(user: IUser<any>, provider: number = LoginProviderTypeEnum.local, osType: number, uuid: string): { authToken: string, refreshToken: string } {
  // TODO Read from config
  const authToken = jwt.sign({ _id: user._id, role: user.role, provider }, mainConfig.JWT_SECRET, { expiresIn: '3d' });
  const refreshToken = jwt.sign({ _id: user._id }, mainConfig.JWT_SECRET, { expiresIn: '12h' });
  // const refreshToken = await RefreshTokenSchema.assign(user._id, user.role, osType, uuid), provider;
  // TODO Open this when client side is ready
  return { authToken, refreshToken };
}

async function createUserFromSocial(data: ISocialMediaData, provider: number): Promise<IUser> {
  const user = new UserSchema({
    email: data.email,
    role: UserRoleEnum.user,
    firstName: data.firstName,
    lastName: data.lastName,
  });
  // Download image
  const fileName = mediaPaths.photos + `${Date.now()}-${user._id}.jpg`;
  await downloadImageFromUrl(data.profilePicture, fileName);
  user.avatar = fileName;
  if (data.firstName && data.lastName) user.fullName = `${data.firstName} ${data.lastName}`;
  else if (data.firstName) user.fullName = data.firstName;
  else if (data.lastName) user.fullName = data.lastName;
  const password = await new UserPasswordSchema({
    user: user._id,
    providerType: provider,
    passwordHash: bcrypt.hashSync(data.id, 12)
  });
  user.passwords.push(password._id);
  await Promise.all([
    await user.save(),
    await password.save()
  ]);
  return user;
}

async function addSocialProviderToUser(user: IUser<any>, data: ISocialMediaData, provider: number): Promise<IUser> {
  const password = new UserPasswordSchema({
    user: user._id,
    providerType: provider,
    passwordHash: bcrypt.hashSync(data.id, 12)
  });
  user.passwords.push(password._id);
  await Promise.all([
    await password.save(),
    await user.save()
  ]);
  return user;
}

function wrongCode(language: number): string {
  switch (language) {
    case LanguageEnum.armenian : return 'Սխալ կոդ';
    case LanguageEnum.russian  : return 'Неправильный код';
    case LanguageEnum.english  : return 'Wrong code';
    case LanguageEnum.french   : return 'Mauvais code';
    default  : return 'Wrong code';
  }
}