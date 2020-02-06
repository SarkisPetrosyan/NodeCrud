import * as Joi from 'joi';
import * as bcrypt from 'bcrypt';

import { Request, Response, NextFunction } from 'express';
import APIError from '../../services/APIError';
import { getErrorResponse, failedResponse } from '../response';
import { ISendVerificationEmailBody, ICheckAuthCodeBody, IRegisterBody, ILocalLoginBody, ISocialLoginBody, ISendRestoreEmailBody, IRestoreAccountBody } from './model';
import { UserRoleEnum, LanguageEnum, AuthActivityTypeEnum, OsTypeEnum, LoginProviderTypeEnum } from '../../services/enums';
import { osTypeValidation, numberRegex, languageValidation } from '../validation';

import UserSchema from '../../schemas/user';
import RefreshTokenSchema from '../../schemas/refreshToken';

export const sendVerificationEmail = async(req: Request, res: Response, next: NextFunction) => {
  try {
    const body: ISendVerificationEmailBody = req.body;
    const bodyValidationSchema = {
      email: Joi.string().email().required(),
      role: Joi.number().equal(UserRoleEnum.user, UserRoleEnum.corporate).required(),
      ...osTypeValidation,
      firstName: Joi.string().when('role', {
        is: Joi.number().equal(UserRoleEnum.user),
        then: Joi.string().min(2).required(),
        otherwise: Joi.string().allow(['', null]).optional()
      }),
      lastName: Joi.string().when('role', {
        is: Joi.number().equal(UserRoleEnum.user),
        then: Joi.string().min(2).required(),
        otherwise: Joi.string().allow(['', null]).optional()
      }),
      corporateName: Joi.string().when('role', {
        is: Joi.number().equal(UserRoleEnum.corporate),
        then: Joi.string().min(2).required(),
        otherwise: Joi.string().allow(['', null]).optional()
      }),
      taxNumber: Joi.string().when('role', {
        is: Joi.number().equal(UserRoleEnum.corporate),
        then: Joi.string().regex(numberRegex).min(2).required(),
        otherwise: Joi.string().allow(['', null]).optional()
      }),
    };
    const result = Joi.validate(body, bodyValidationSchema);
    if (result.error) return res.send(failedResponse(result.error.details[0].message));
    body.email = body.email.toLocaleLowerCase();
    const user = await UserSchema.findOne({ email: body.email });
    if (user && user.passwords.length > 0) return res.send(failedResponse(accountAlreadyExists(<string>req.headers['language'])));
    req.body.user = user;
    return next();
  } catch (e) {
    new APIError(e, 500, 'sendVerificationEmail in auth/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};

export const checkAuthCode = async(req: Request, res: Response, next: NextFunction) => {
  try {
    const body: ICheckAuthCodeBody = req.body;
    const bodyValidationSchema = {
      type : Joi.number().equal([AuthActivityTypeEnum.register, AuthActivityTypeEnum.restore]).required(),
      email: Joi.string().email().required(),
      code : Joi.string().required()
    };
    const result = Joi.validate(body, bodyValidationSchema);
    if (result.error) {
      return res.send(failedResponse(result.error.details[0].message));
    }
    body.email = body.email.toLocaleLowerCase();
    const user = await UserSchema.findOne({ email: body.email });
    if (!user) return res.send(failedResponse(accountDoesNotExist(<string>req.headers['language'])));
    req.body.user = user;
    return next();
  } catch (e) {
    new APIError(e, 500, 'checkAuthCode in auth/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};

export const register = async(req: Request, res: Response, next: NextFunction) => {
  try {
    const body: IRegisterBody = req.body;
    console.log(body);
    body.language = +req.headers['language'];
    const bodyValidationSchema: any = {
      ...osTypeValidation,
      email   : Joi.string().email().required(),
      code    : Joi.string().required(),
      password: Joi.string().min(6).required()
    };
    if (body.osType !== OsTypeEnum.web) {
      bodyValidationSchema.language    = languageValidation.language;
      bodyValidationSchema.deviceId    = Joi.string().required();
      bodyValidationSchema.deviceToken = Joi.string().allow([null, '']).optional();
    }
    const result = Joi.validate(body, bodyValidationSchema, { allowUnknown: true });
    if (result.error) {
      return res.send(failedResponse(result.error.details[0].message));
    }
    body.email = body.email.toLocaleLowerCase();
    const user = await UserSchema.findOne({
      email: body.email,
      'password.0': { $exists: false },
      verificationCode: body.code
    });
    if (!user) return res.send(failedResponse(incorrectMailOrPassword(<string>req.headers['language'])));
    req.body.user = user;
    return next();
  } catch (e) {
    new APIError(e, 500, 'register in auth/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};

export const login = async(req: Request, res: Response, next: NextFunction) => {
  try {
    const body: ILocalLoginBody = req.body;
    console.log(body);
    body.language = +req.headers['language'];
    const bodyValidationSchema: any = {
      ...osTypeValidation,
      email   : Joi.string().email().required(),
      password: Joi.string().required()
    };
    if (body.osType !== OsTypeEnum.web) {
      bodyValidationSchema.language    = languageValidation.language;
      bodyValidationSchema.deviceId    = Joi.string().required();
      bodyValidationSchema.deviceToken = Joi.string().allow([null, '']).optional();
    }
    const result = Joi.validate(body, bodyValidationSchema, { allowUnknown: true });
    if (result.error) {
      return res.send(failedResponse(result.error.details[0].message));
    }
    body.email = body.email.toLocaleLowerCase();
    const user = await UserSchema.findOne({ email: body.email }).populate({
      path: 'passwords',
      match: { providerType: LoginProviderTypeEnum.local }
    });
    console.log(user);
    if (!user || !user.passwords.length || !bcrypt.compareSync(body.password, user.passwords[0].passwordHash)) {
      return res.send(failedResponse(incorrectEmailOrPassword(<string>req.headers['language'])));
    } else if (user && user.blocked) {
      return res.send(failedResponse(blockedAccount(<string>req.headers['language'])));
    }
    req.body.user = user;
    return next();
  } catch (e) {
    new APIError(e, 500, 'login in auth/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};

export const socialLogin = async(req: Request, res: Response, next: NextFunction) => {
  try {
    const body: ISocialLoginBody = req.body;
    body.language = +req.headers['language'];
    const bodyValidationSchema: any = {
      osType   : Joi.number().min(1).max(3).required(),
      provider : Joi.number().min(1).max(3).required(),
      token    : Joi.string().required()
    };
    if (req.body.osType !== OsTypeEnum.web) {
      bodyValidationSchema.language    = languageValidation.language;
      bodyValidationSchema.deviceId    = Joi.string().required();
      bodyValidationSchema.deviceToken = Joi.string().optional();
    }
    const result = Joi.validate(body, bodyValidationSchema, { allowUnknown: true });
    if (result.error) {
      return res.send(failedResponse(result.error.details[0].message));
    }
    return next();
  } catch (e) {
    new APIError(e, 500, 'socialLogin function in auth/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};

export const sendRestoreEmail = async(req: Request, res: Response, next: NextFunction) => {
  try {
    const body: ISendRestoreEmailBody = req.body;
    const bodyValidationSchema = {
      email: Joi.string().email().required(),
      ...osTypeValidation
    };
    const result = Joi.validate(body, bodyValidationSchema);
    if (result.error) return res.send(failedResponse(result.error.details[0].message));
    body.email = body.email.toLocaleLowerCase();
    const user = await UserSchema.findOne({ email: body.email, 'passwords.0': { $exists: true } });
    if (!user) return res.send(failedResponse(accountDoesNotExist(<string>req.headers['language'])));
    req.body.user = user;
    return next();
  } catch (e) {
    new APIError(e, 500, 'sendRestoreEmail in auth/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};

export const restoreAccount = async(req: Request, res: Response, next: NextFunction) => {
  try {
    const body: IRestoreAccountBody = req.body;
    body.language = +req.headers['language'];
    const bodyValidationSchema: any = {
      ...osTypeValidation,
      email   : Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      code    : Joi.string().required()
    };
    if (body.osType !== OsTypeEnum.web) {
      bodyValidationSchema.language    = languageValidation.language;
      bodyValidationSchema.deviceId    = Joi.string().required();
      bodyValidationSchema.deviceToken = Joi.string().allow([null, '']).optional();
    }
    const result = Joi.validate(body, bodyValidationSchema, { allowUnknown: true });
    if (result.error) {
      return res.send(failedResponse(result.error.details[0].message));
    }
    body.email = body.email.toLocaleLowerCase();
    const user = await UserSchema.findOne({ email: body.email, restoreCode: body.code }).populate('passwords');
    if (!user) {
      return res.send(failedResponse(incorrectEmailOrPassword(<string>req.headers['language'])));
    }
    req.body.user = user;
    return next();
  } catch (e) {
    new APIError(e, 500, 'login in restoreAccount/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};

export const logout = async(req: Request, res: Response, next: NextFunction) => {
  try {
    const result = Joi.validate(req.query.deviceId, Joi.string().required());
    if (result.error) {
      return res.send(failedResponse(result.error.details[0].message));
    }
    return next();
  } catch (e) {
    new APIError(e, 500, 'logout in restoreAccount/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};

export const getNewToken = async(req: Request, res: Response, next: NextFunction) => {
  try {
    const result = Joi.validate(req.body, {
      ...osTypeValidation,
      deviceId    : Joi.string().required(),
      refreshToken: Joi.string().required()
    });
    if (result.error) {
      return res.send(failedResponse(result.error.details[0].message));
    }
    const refreshToken = await RefreshTokenSchema.findOne({
      token  : req.body.refreshToken,
      osType : req.body.osType,
      uuid   : req.body.deviceId,
      expired: false,
    }).populate('user');
    if (!refreshToken) {
      return res.sendStatus(401);
    } else if (refreshToken.expectedExpDt < new Date()) {
      refreshToken.expired = true;
      refreshToken.expDt = refreshToken.expectedExpDt;
      await refreshToken.save();
      return res.sendStatus(401);
    }
    req.body.refreshToken = refreshToken;
    return next();
  } catch (e) {
    new APIError(e, 500, 'getNewToken in getNewToken/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};

export const accountAlreadyExists = (languageValue: string | number): string => {
  const language = +languageValue;
  switch (language) {
    case LanguageEnum.armenian : return 'Այս էլ․ փոստը զբաղված է';
    case LanguageEnum.russian  : return 'Аккаунт уже существует';
    case LanguageEnum.english  : return 'Account already exists';
    case LanguageEnum.french   : return 'Le compte existe déjà';
    default  : return 'Account already exists';
  }
};

const accountDoesNotExist = (languageValue: string): string => {
  const language = +languageValue;
  switch (language) {
    case LanguageEnum.armenian : return 'Սխալ էլ. փոստ';
    case LanguageEnum.russian  : return 'Неправильный адрес эл. почты';
    case LanguageEnum.english  : return 'Wrong email';
    case LanguageEnum.french   : return 'Adresse email invalide de courrier';
    default  : return 'Wrong email';
  }
};

const incorrectMailOrPassword = (languageValue: string): string => {
  const language = +languageValue;
  switch (language) {
    case LanguageEnum.armenian : return 'Սխալ էլ. փոստ կամ կոդ';
    case LanguageEnum.russian  : return 'Неправильный адрес эл. почты или код';
    case LanguageEnum.english  : return 'Wrong email or code';
    case LanguageEnum.french   : return 'Adresse email invalide courrier ou code';
    default  : return 'Wrong email or code';
  }
};

const incorrectEmailOrPassword = (languageValue: string): string => {
  const language = +languageValue;
  switch (language) {
    case LanguageEnum.armenian : return 'Սխալ էլ. փոստ կամ գաղտնաբառ';
    case LanguageEnum.russian  : return 'Неправильный адрес эл. почты или пароль';
    case LanguageEnum.english  : return 'Wrong email or password';
    case LanguageEnum.french   : return 'Adresse email invalide mail ou mot de passe';
    default  : return 'Wrong email or password';
  }
};

export const blockedAccount = (languageValue: string | number): string => {
  const language = +languageValue;
  switch (language) {
    case LanguageEnum.armenian : return 'Էջը արգելափակված է';
    case LanguageEnum.russian  : return 'Аккаунт заблокирован';
    case LanguageEnum.english  : return 'Account is blocked';
    case LanguageEnum.french   : return 'Le compte est bloqué';
    default  : return 'Account is blocked';
  }
};