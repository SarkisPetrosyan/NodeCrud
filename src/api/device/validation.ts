import * as Joi from 'joi';

import { Response, NextFunction } from 'express';
import { IRequest } from '../model';
import { failedResponse, getErrorResponse } from '../response';
import APIError from '../../services/APIError';
import DeviceSchema from '../../schemas/device';
import { languageValidation } from '../validation';

export const setDeviceTokenForDevice = async(req: IRequest, res: Response, next: NextFunction) => {
  try {
    const body = req.body;
    const bodyValidationSchema = {
      deviceId: Joi.string().required(),
      deviceToken: Joi.string().required()
    };
    const result = Joi.validate(body, bodyValidationSchema);
    if (result.error) {
      return res.send(failedResponse(result.error.details[0].message));
    }
    const device = await DeviceSchema.findOne({ user: req.user._id, deviceId: body.deviceId });
    if (!device) return res.send(failedResponse('Wrong device Id'));
    req.body.device = device;
    return next();
  } catch (e) {
    new APIError(e, 500, 'setDeviceTokenForDevice in user/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};

export const setDeviceLanguage = async(req: IRequest, res: Response, next: NextFunction) => {
  try {
    req.body.language = +req.headers['language'];
    const body = req.body;
    const bodyValidationSchema = {
      ...languageValidation,
      deviceId: Joi.string().required()
    };
    const result = Joi.validate(body, bodyValidationSchema);
    if (result.error) {
      return res.send(failedResponse(result.error.details[0].message));
    }
    const device = await DeviceSchema.findOne({ user: req.user._id, deviceId: body.deviceId });
    if (!device) return res.send(failedResponse('Wrong device Id'));
    req.body.device = device;
    return next();
  } catch (e) {
    new APIError(e, 500, 'setDeviceTokenForDevice in user/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};