import * as Joi from 'joi';

import { Response, NextFunction } from 'express';
import { IRequest } from '../model';
import { failedResponse, getErrorResponse } from '../response';
import APIError from '../../services/APIError';
import { ISendPushBody } from './model';
import { UserRoleEnum, UserStatusEnum } from '../../services/enums';
import { idRegex, languageValidation, pagingValidation, skipPagingValidation, idValidation } from '../validation';
import { languageCount } from '../../services/constants';
import { getUserIdListByFilters } from '../user/service';
import UserNotificationSchema from '../../schemas/userNotification';


export const sendPush = async(req: IRequest, res: Response, next: NextFunction) => {
  try {
    const body: ISendPushBody = req.body;
    const bodyValidationSchema = {
      filters: Joi.array().items(Joi.object().keys({
        search : Joi.string().allow([null, '']).optional(),
        role   : Joi.number().equal([UserRoleEnum.user, UserRoleEnum.corporate]).allow([null, '']).optional(),
        country: Joi.string().regex(idRegex).allow([null, '']).optional(),
        status : Joi.number().equal([UserStatusEnum.active, UserStatusEnum.blocked]).allow([null, '']).optional()
      })).required(),
      translations: Joi.array().items(Joi.object().keys({
        ...languageValidation,
        title: Joi.string().required(),
        description: Joi.string().required()
      })).length(languageCount).unique('language')
    };
    const result = Joi.validate(body, bodyValidationSchema);
    if (result.error) {
      return res.send(failedResponse(result.error.details[0].message));
    }
    const userIdList = await getUserIdListByFilters(body.filters);
    if (!userIdList.length) return failedResponse('0 users matched the filters');
    req.body.userIdList = userIdList;
    return next();
  } catch (e) {
    new APIError(e, 500, 'sendPush in push/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};

export const getPushListForAdmin = async(req: IRequest, res: Response, next: NextFunction) => {
  try {
    const result = Joi.validate(req.body, {
      ...pagingValidation,
      search: Joi.string().allow('').optional()
    });
    if (result.error) {
      return res.send(failedResponse(result.error.details[0].message));
    }
    return next();
  } catch (e) {
    new APIError(e, 500, 'getPushListForAdmin in push/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};

export const getPushListForUser = async(req: IRequest, res: Response, next: NextFunction) => {
  try {
    req.query.language = +req.headers['language'];
    const result = Joi.validate(req.query, {
      ...skipPagingValidation,
      ...languageValidation
    });
    if (result.error) {
      return res.send(failedResponse(result.error.details[0].message));
    }
    req.query.skip = +req.query.skip;
    req.query.limit = +req.query.limit;
    return next();
  } catch (e) {
    new APIError(e, 500, 'getPushListForUser in push/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};

export const setUserNotificationSeen = async(req: IRequest, res: Response, next: NextFunction) => {
  try {
    const result = Joi.validate(req.query, idValidation);
    if (result.error) {
      return res.send(failedResponse(result.error.details[0].message));
    }
    const userNotification = await UserNotificationSchema.findOne({ receiver: req.user._id, _id: req.query.id });
    if (!userNotification) {
      return res.send(failedResponse('Wrong Id'));
    }
    req.body.userNotification = userNotification;
    return next();
  } catch (e) {
    new APIError(e, 500, 'setUserNotificationSeen in push/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};