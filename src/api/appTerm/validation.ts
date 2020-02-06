import * as Joi from 'joi';

import { Response, NextFunction } from 'express';
import { IRequest } from '../model';
import { getErrorResponse, failedResponse } from '../response';
import APIError from '../../services/APIError';
import { ISetAppTermBody } from './model';
import { AppTermTypeEnum } from '../../services/enums';
import { languageCount } from '../../services/constants';
import { languageValidation } from '../validation';

export const setAppTerm = async(req: IRequest, res: Response, next: NextFunction) => {
  try {
    const body: ISetAppTermBody = req.body;
    const bodyValidationSchema = {
      type: Joi.number().equal([AppTermTypeEnum.terms, AppTermTypeEnum.policy]).required(),
      translations: Joi.array().items(Joi.object().keys({
        ...languageValidation,
        body: Joi.string().required()
      })).length(languageCount).required()
    };
    const result = Joi.validate(body, bodyValidationSchema);
    if (result.error) {
      return res.send(failedResponse(result.error.details[0].message));
    }
    return next();
  } catch (e) {
    new APIError(e, 500, 'setAppTerm in appTerm/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};

export const getAppTerm = async(req: IRequest, res: Response, next: NextFunction) => {
  try {
    req.query.language = +req.headers['language'];
    const result = Joi.validate(req.query, {
      ...languageValidation,
      type: Joi.number().equal([AppTermTypeEnum.terms, AppTermTypeEnum.policy])
    });
    if (result.error) {
      return res.send(failedResponse(result.error.details[0].message));
    }
    req.query.type = +req.query.type;
    return next();
  } catch (e) {
    new APIError(e, 500, 'getAppTerm in appTerm/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};