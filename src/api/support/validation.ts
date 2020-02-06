import * as Joi from 'joi';

import { Response, NextFunction } from 'express';
import { IRequest } from '../model';
import { failedResponse, getErrorResponse } from '../response';
import APIError from '../../services/APIError';
import { pagingValidation, idValidation } from '../validation';
import { ISendSupportMessageBody, IGetSupportMessageListBody } from './model';
import SupportMessageSchema from '../../schemas/supportMessage';
import { SupportMessageListTypeEnum, SupportMessageListUserTypeEnum } from '../../services/enums';

export const sendSupportMessage = async(req: IRequest, res: Response, next: NextFunction) => {
  try {
    const body: ISendSupportMessageBody = req.body;
    const bodyValidationSchema = {
      fullName   : Joi.string().required(),
      email      : Joi.string().email().required(),
      phoneNumber: Joi.string().required(),
      message    : Joi.string().min(50).required()
    };
    const result = Joi.validate(body, bodyValidationSchema, { allowUnknown: true });
    if (result.error) {
      return res.send(failedResponse(result.error.details[0].message));
    }
    return next();
  } catch (e) {
    new APIError(e, 500, 'sendSupportMessage in support/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};

export const getSupportMessageList = async(req: IRequest, res: Response, next: NextFunction) => {
  try {
    const body: IGetSupportMessageListBody = req.body;
    const bodyValidationSchema = {
      ...pagingValidation,
      search  : Joi.string().min(1).allow([null, '']).optional(),
      type    : Joi.number().equal([ SupportMessageListTypeEnum.important, SupportMessageListTypeEnum.unread ]).allow(['', null]).optional(),
      userType: Joi.number().equal([ SupportMessageListUserTypeEnum.user, SupportMessageListUserTypeEnum.corporate, SupportMessageListUserTypeEnum.notRegistered ]).allow(['', null]).optional()
    };
    const result = Joi.validate(body, bodyValidationSchema);
    if (result.error) {
      return res.send(failedResponse(result.error.details[0].message));
    }
    return next();
  } catch (e) {
    new APIError(e, 500, 'getSupportMessageList in support/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};

export const getSupportMessage = async(req: IRequest, res: Response, next: NextFunction) => {
  try {
    const result = Joi.validate(req.query, idValidation);
    if (result.error) {
      return res.send(failedResponse(result.error.details[0].message));
    }
    const message = await SupportMessageSchema.findById(req.query.id);
    if (!message) return res.send(failedResponse('Wrong Id'));
    req.body.message = message;
    return next();
  } catch (e) {
    new APIError(e, 500, 'getSupportMessage in support/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};

export const setSupportMessageSeen = async(req: IRequest, res: Response, next: NextFunction) => {
  try {
    const result = Joi.validate(req.query, idValidation);
    if (result.error) {
      return res.send(failedResponse(result.error.details[0].message));
    }
    const message = await SupportMessageSchema.findById(req.query.id);
    if (!message) return res.send(failedResponse('Wrong Id'));
    req.body.message = message;
    return next();
  } catch (e) {
    new APIError(e, 500, 'setSupportMessageSeen in support/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};