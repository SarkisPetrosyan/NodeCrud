import * as fs from 'fs';
import * as bcrypt from 'bcrypt';

import { IUser } from '../../schemas/user/model';
import { UserRoleEnum, LoginProviderTypeEnum, UserStatusEnum, LanguageEnum } from '../../services/enums';
import mainConfig from '../../env';
import CountryTranslationSchema from '../../schemas/countryTranslation';
import { getMimeType, deleteFiles } from '../../services/utilities';
import { IUpdateUserBody, IChangePasswordBody, IGetUserListForAdminBody, IGetUserCountByFilters } from './model';
import { IResponseModel } from '../model';
import UserPasswordSchema from '../../schemas/userPassword';
import { mediaPaths } from '../../services/constants';
import UserSchema from '../../schemas/user';
import { succeedResponse, failedResponse } from '../response';
import { ICountry } from '../../schemas/country/model';
import RefreshTokenSchema from '../../schemas/refreshToken';
import TopicSchema from '../../schemas/topic';

export const getProfile = async(user: IUser, language: number) => {
  let details: any;
  if (user.role === UserRoleEnum.user)  {
    details = {
      email      : user.email,
      avatar     : user.avatar ? mainConfig.BASE_URL + user.avatar : null,
      firstName  : user.firstName,
      lastName   : user.lastName,
      birthDate  : user.birthDate,
      fullName   : user.fullName,
      phoneNumber: user.phoneNumber,
      gender     : user.gender,
    };
  } else {
    details = {
      email        : user.email,
      avatar       : user.avatar ? mainConfig.BASE_URL + user.avatar : null,
      fullName     : user.fullName,
      phoneNumber  : user.phoneNumber,
      taxNumber    : user.taxNumber,
      contactPerson: user.contactPerson
    };
  }
  details.country = null;
  details.countryId = null;
  if (user.country) {
    const countryTranslation = await CountryTranslationSchema.findOne({ country: user.country, language: language });
    if (countryTranslation) {
      details.countryId = user.country;
      details.country = countryTranslation.name;
    }
  }
  const localPassword = await UserPasswordSchema.findOne({ user: user._id, providerType: LoginProviderTypeEnum.local });
  details.hasPassword = !!localPassword;
  return details;
};

export const setUserAvatar = async(user: IUser, file: Express.Multer.File): Promise<void> => {
  if (fs.existsSync(file.path)) {
    const fileName = `${Date.now()}-${user._id}.${getMimeType(file.originalname)}`;
    fs.renameSync(file.path, mainConfig.MEDIA_PATH + mediaPaths.photos + fileName);
    user.avatar = fileName;
    await user.save();
  }
};

export const updateUser = async(user: IUser, body: IUpdateUserBody): Promise<void> => {
  if (body.avatar && fs.existsSync(body.avatar.path)) {
    const fileName = `${mediaPaths.photos}${Date.now()}-${user._id}.${getMimeType(body.avatar.originalname)}`;
    fs.renameSync(body.avatar.path, mainConfig.MEDIA_PATH + fileName);
    user.avatar = fileName;
  } else if (body.deleteAvatar) {
    if (user.avatar) deleteFiles([user.avatar], true);
    user.avatar = null;
  }
  user.phoneNumber = body.phoneNumber || null;
  user.country = body.countryId || null;
  if (user.role === UserRoleEnum.corporate) {
    user.fullName = body.fullName;
    user.taxNumber = body.taxNumber;
    user.contactPerson = body.contactPerson || null;
  } else {
    user.firstName = body.firstName;
    user.lastName = body.lastName;
    user.fullName = `${body.firstName} ${body.lastName}`;
    user.birthDate = body.birthDate || null;
    user.gender = body.gender || null;
  }
  await user.save();
  return await getProfile(user, body.language);
};

export const setNewUserPassword = async(user: IUser, body: IChangePasswordBody): Promise<IResponseModel> => {
  if (body.localPassword) {
    if (!bcrypt.compareSync(body.oldPassword, body.localPassword.passwordHash)) {
      return { success: false, message: 'Wrong old password', data: null};
    } else {
      body.localPassword.passwordHash = bcrypt.hashSync(body.newPassword, 12);
      await body.localPassword.save();
    }
  } else {
    const localPassword = new UserPasswordSchema({
      user: user._id,
      passwordHash: bcrypt.hashSync(body.newPassword, 12),
      providerType: LoginProviderTypeEnum.local
    });
    user.passwords.push(localPassword._id);
    await Promise.all([
      await localPassword.save(),
      await user.save()
    ]);
  }
  return { success: true, message: 'Set', data: null };
};

export const getUserListForAdmin = async(body: IGetUserListForAdminBody): Promise<IResponseModel> => {
  const filter: any = {
    'passwords.0': { $exists: true }
  };
  if (body.status) {
    if (body.status === UserStatusEnum.blocked) filter.blocked = true;
    else filter.blocked = false;
  }
  if (body.role) {
    filter.role = body.role;
  } else {
    filter.role = { $in: [ UserRoleEnum.user, UserRoleEnum.corporate ] };
  }
  if (body.search) {
    filter.$or = [
      { fullName: new RegExp(body.search, 'i') },
      { phoneNumber: new RegExp(body.search, 'i') },
      { taxNumber: new RegExp(body.search, 'i') },
      { email: new RegExp(body.search, 'i') }
    ];
  }
  if (body.country) {
    filter.country = body.country;
  }
  const itemCount = await UserSchema.countDocuments(filter);
  if (!itemCount) return succeedResponse('Got', { itemCount, itemList: [], pageCount: 0 });
  const pageCount = Math.ceil(itemCount / body.limit);
  if (body.pageNo > pageCount) return failedResponse('Too high pageNo');
  const skip = (body.pageNo - 1) * body.limit;
  const list = await UserSchema.find(filter)
    .sort({ registeredDt: -1, createdDt: -1 })
    .skip(skip)
    .limit(body.limit);
  const itemList = await Promise.all(list.map(async item => {
    const countryTranslation = await CountryTranslationSchema.findOne({ language: LanguageEnum.english, country: item.country });
    return {
      _id: item._id,
      avatar: item.avatar ? mainConfig.BASE_URL + item.avatar : null,
      fullName: item.fullName,
      email: item.email,
      phoneNumber: item.phoneNumber,
      country: countryTranslation ? countryTranslation.name : null,
      role: item.role,
      status: item.blocked ? UserStatusEnum.blocked : UserStatusEnum.active
    };
  }));
  return succeedResponse('Got', { itemList, pageCount, itemCount });
};

export const blockOrUnBlockUser = async(user: IUser): Promise<void> => {
  user.blocked = !user.blocked;
  if (user.blocked) {
    await RefreshTokenSchema.updateMany({ user: user._id, expired: false }, { expired: true, expDt: new Date() });
  }
  await user.save();
};

export const getUserCountByFilters = async(body: IGetUserCountByFilters): Promise<number> => {
  const mainFilter = getMainFilterByFilters(body.filters);
  return await UserSchema.countDocuments(mainFilter);
};

export const getUserIdListByFilters = async(filters: Array<{ search: string; role: number; country: string; status: number; }>): Promise<string[]> => {
  const mainFilter = getMainFilterByFilters(filters);
  return await UserSchema.countDocuments(mainFilter).distinct('_id');
};

export const getUserDetailsForAdmin = async(user: IUser): Promise<any> => {
  const topicCount = await TopicSchema.countDocuments({ createdBy: user._id });
  let countryName = null;
  if (user.country) {
    const countryTranslation = await CountryTranslationSchema.findOne({ country: user.country, language: LanguageEnum.english });
    if (countryTranslation) countryName = countryTranslation.name;
  }
  const donationCount = 0; // ! TODO Change this
  return {
    _id     : user._id,
    fullName: user.fullName,
    avatar: user.avatar ? mainConfig.BASE_URL + user.avatar : null,
    email   : user.email,
    topicCount,
    donationCount,
    firstName  : user.firstName,
    lastName   : user.lastName,
    birthDate  : user.birthDate,
    gender     : user.gender,
    phoneNumber: user.phoneNumber,
    countyName : countryName
  };
};

function getMainFilterByFilters(filters: Array<{ search: string; role: number; country: string; status: number; }>): any {
  const mainFilter: any = {
    'passwords.0': { $exists: true }
  };
  if (filters && filters.length) {
    mainFilter.$or = [];
    filters.forEach(filter => {
      const filterItem: any = {};
      if (filter.status) {
        if (filter.status === UserStatusEnum.blocked) filterItem.blocked = true;
        else filterItem.blocked = false;
      }
      if (filter.role) {
        filterItem.role = filter.role;
      } else {
        filterItem.role = { $in: [ UserRoleEnum.user, UserRoleEnum.corporate ] };
      }
      if (filter.search) {
        filterItem.$or = [
          { fullName: new RegExp(filter.search, 'i') },
          { phoneNumber: new RegExp(filter.search, 'i') },
          { taxNumber: new RegExp(filter.search, 'i') },
          { email: new RegExp(filter.search, 'i') }
        ];
      }
      if (filter.country) {
        filterItem.country = filter.country;
      }
      mainFilter.$or.push(filterItem);
    });
  }
  return mainFilter;
}