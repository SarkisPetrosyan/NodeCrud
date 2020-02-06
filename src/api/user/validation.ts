import * as Joi from 'joi';

import { Response, NextFunction } from 'express';
import { IRequest } from '../model';
import { failedResponse, getErrorResponse } from '../response';
import APIError from '../../services/APIError';
import { UserRoleEnum, GenderTypeEnum, LoginProviderTypeEnum, UserStatusEnum } from '../../services/enums';
import { idRegex, languageValidation, pagingValidation, idValidation } from '../validation';
import { IUpdateUserBody, IGetUserListForAdminBody, IGetUserCountByFilters } from './model';
import CountrySchema from '../../schemas/country';
import { deleteFiles } from '../../services/utilities';
import UserPasswordSchema from '../../schemas/userPassword';
import UserSchema from '../../schemas/user';

export const getProfile = async(req: IRequest, res: Response, next: NextFunction) => {
  try {
    const result = Joi.validate(+req.headers['language'], languageValidation.language);
    if (result.error) {
      return res.send(failedResponse(result.error.details[0].message));
    }
    return next();
  } catch (e) {
    new APIError(e, 500, 'getProfile in user/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};

export const setUserAvatar = async(req: IRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) return res.send(failedResponse('Missing image'));
    return next();
  } catch (e) {
    new APIError(e, 500, 'setUserAvatar in user/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};

export const updateUser = async(req: IRequest, res: Response, next: NextFunction) => {
  try {
    req.body.language = +req.headers['language'];
    const body: IUpdateUserBody = req.body;
    if (req.user.role === UserRoleEnum.user) {
      const result = Joi.validate(body, {
        ...languageValidation,
        firstName  : Joi.string().required(),
        lastName   : Joi.string().required(),
        birthDate  : Joi.date().optional(),
        gender     : Joi.number().equal([ GenderTypeEnum.male, GenderTypeEnum.female ]).optional(),
        phoneNumber: Joi.string().optional(),
        countryId  : Joi.string().regex(idRegex).optional()
      }, { allowUnknown: true });
      if (result.error) {
        if (req.file) deleteFiles([req.file.path]);
        return res.send(failedResponse(result.error.details[0].message));
      }
    } else if (req.user.role === UserRoleEnum.corporate) {
      const result = Joi.validate(body, {
        ...languageValidation,
        fullName  : Joi.string().required(),
        taxNumber   : Joi.string().required(),
        contactPerson  : Joi.string().optional(),
        phoneNumber: Joi.string().optional(),
        countryId  : Joi.string().regex(idRegex).optional()
      }, { allowUnknown: true });
      if (result.error) {
        if (req.file) deleteFiles([req.file.path]);
        return res.send(failedResponse(result.error.details[0].message));
      }
    }
    if (body.countryId) {
      const country = await CountrySchema.findById(body.countryId);
      if (!country) {
        if (req.file) deleteFiles([req.file.path]);
        return res.send(failedResponse('Wrong country Id'));
      }
    }
    if (req.file) body.avatar = req.file;
    return next();
  } catch (e) {
    new APIError(e, 500, 'updateUser in user/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};

export const setNewUserPassword = async(req: IRequest, res: Response, next: NextFunction) => {
  try {
    const result = Joi.validate(req.body, {
      oldPassword: Joi.string().min(6).allow([null, '']).optional(),
      newPassword: Joi.string().min(6).required(),
    }, { allowUnknown: true });
    if (result.error) {
      return res.send(failedResponse(result.error.details[0].message));
    }
    const localPassword = await UserPasswordSchema.findOne({ user: req.user._id, providerType: LoginProviderTypeEnum.local });
    if (localPassword && !req.body.oldPassword) {
      return res.send(failedResponse('Missing old password'));
    }
    req.body.localPassword = localPassword;
    return next();
  } catch (e) {
    new APIError(e, 500, 'setNewUserPassword in user/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};

export const getUserListForAdmin = async(req: IRequest, res: Response, next: NextFunction) => {
  try {
    const body: IGetUserListForAdminBody = req.body;
    const bodyValidationSchema = {
      ...pagingValidation,
      search : Joi.string().allow([null, '']).optional(),
      role   : Joi.number().equal([UserRoleEnum.user, UserRoleEnum.corporate]).allow([null, '']).optional(),
      country: Joi.string().regex(idRegex).allow([null, '']).optional(),
      status : Joi.number().equal([UserStatusEnum.active, UserStatusEnum.blocked]).allow([null, '']).optional(),
    };
    const result = Joi.validate(body, bodyValidationSchema);
    if (result.error) {
      return res.send(failedResponse(result.error.details[0].message));
    }
    return next();
  } catch (e) {
    new APIError(e, 500, 'getUserListForAdmin in user/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};

export const blockOrUnBlockUser = async(req: IRequest, res: Response, next: NextFunction) => {
  try {
    const result = Joi.validate(req.query, idValidation);
    if (result.error) {
      return failedResponse(result.error.details[0].message);
    }
    const user = await UserSchema.findOne({
      _id: req.query.id,
      'passwords.0': { $exists: true },
      role: { $in: [UserRoleEnum.user, UserRoleEnum.corporate] }
    });
    if (!user) {
      return failedResponse('Wrong Id');
    }
    req.body.user = user;
    return next();
  } catch (e) {
    new APIError(e, 500, 'blockOrUnBlockUser in user/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};

export const getUserCountByFilters = async(req: IRequest, res: Response, next: NextFunction) => {
  try {
    const body: IGetUserCountByFilters = req.body;
    const bodyValidationSchema = {
      filters: Joi.array().items(Joi.object().keys({
        search : Joi.string().allow([null, '']).optional(),
        role   : Joi.number().equal([UserRoleEnum.user, UserRoleEnum.corporate]).allow([null, '']).optional(),
        country: Joi.string().regex(idRegex).allow([null, '']).optional(),
        status : Joi.number().equal([UserStatusEnum.active, UserStatusEnum.blocked]).allow([null, '']).optional()
      })).required()
    };
    const result = Joi.validate(body, bodyValidationSchema);
    if (result.error) {
      return res.send(failedResponse(result.error.details[0].message));
    }
    return next();
  } catch (e) {
    new APIError(e, 500, 'getUserCountByFilters in user/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};

export const getUserDetailsForAdmin = async(req: IRequest, res: Response, next: NextFunction) => {
  try {
    const result = Joi.validate(req.query, idValidation);
    if (result.error) {
      return res.send(failedResponse(result.error.details[0].message));
    }
    const user = await UserSchema.findOne({
      _id: req.query.id,
      'passwords.0': { $exists: true }
    });
    if (!user) return res.send(failedResponse('Wrong Id'));
    req.body.user = user;
    return next();
  } catch (e) {
    new APIError(e, 500, 'getUserDetailsForAdmin in user/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};