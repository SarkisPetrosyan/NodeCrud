import * as Joi from 'joi';

import { Response, NextFunction } from 'express';
import { IRequest } from '../model';
import APIError from '../../services/APIError';
import { getErrorResponse, failedResponse } from '../response';
import { IAddPartnerBody, IUpdatePartnerBody } from './model';
import { languageCount } from '../../services/constants';
import { deleteFiles } from '../../services/utilities';
import { languageValidation, pagingValidation, idValidation } from '../validation';
import PartnerSchema from '../../schemas/partner';

export const addPartner = async(req: IRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.send(failedResponse('Missing image'));
    }
    const body: IAddPartnerBody = req.body;
    body.avatar = req.file;
    const bodyValidationSchema = {
      contactPerson: Joi.string().allow([null, '']).optional(),
      phone        : Joi.string().allow([null, '']).optional(),
      translations : Joi.array().items(Joi.string().required()).length(languageCount).required()
    };
    const result = Joi.validate(body, bodyValidationSchema, { allowUnknown: true });
    if (result.error) {
      deleteFiles([req.file.path]);
      return res.send(failedResponse(result.error.details[0].message));
    }
    const translations = [];
    const oldTranslations: any = body.translations;
    try {
      for (let i = 0; i < oldTranslations.length; i++) {
        translations.push(new Object(JSON.parse(oldTranslations[i])));
      }
    } catch (e) {
      deleteFiles([req.file.path]);
      return res.send(failedResponse('Wrong translations'));
    }
    const translationsResult = Joi.validate(translations, Joi.array().items(Joi.object().keys({
      ...languageValidation,
      name: Joi.string().required()
    })).unique('language'));
    if (translationsResult.error) {
      deleteFiles([req.file.path]);
      return res.send(failedResponse(translationsResult.error.details[0].message));
    }
    body.translations = translations;
    return next();
  } catch (e) {
    new APIError(e, 500, 'addPartner in partner/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};

export const updatePartner = async(req: IRequest, res: Response, next: NextFunction) => {
  try {
    const body: IUpdatePartnerBody = req.body;
    body.avatar = req.file;
    const bodyValidationSchema = {
      contactPerson: Joi.string().allow([null, '']).optional(),
      phone        : Joi.string().allow([null, '']).optional(),
      translations : Joi.array().items(Joi.string().required()).length(languageCount).required()
    };
    const result = Joi.validate(body, bodyValidationSchema, { allowUnknown: true });
    if (result.error) {
      if (req.file) deleteFiles([req.file.path]);
      return res.send(failedResponse(result.error.details[0].message));
    }
    const translations = [];
    const oldTranslations: any = body.translations;
    try {
      for (let i = 0; i < oldTranslations.length; i++) {
        translations.push(new Object(JSON.parse(oldTranslations[i])));
      }
    } catch (e) {
      if (req.file) deleteFiles([req.file.path]);
      return res.send(failedResponse('Wrong translations'));
    }
    const translationsResult = Joi.validate(translations, Joi.array().items(Joi.object().keys({
      ...languageValidation,
      name: Joi.string().required()
    })).unique('language'));
    if (translationsResult.error) {
      if (req.file) deleteFiles([req.file.path]);
      return res.send(failedResponse(translationsResult.error.details[0].message));
    }
    const partner = await PartnerSchema.findOne({ _id: body.id, deleted: false });
    if (!partner) {
      if (req.file) deleteFiles([req.file.path]);
      return res.send(failedResponse('Wrong Id'));
    }
    req.body.partner = partner;
    body.translations = translations;
    return next();
  } catch (e) {
    new APIError(e, 500, 'updatePartner in partner/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};

export const getPartnerListForAdmin = async(req: IRequest, res: Response, next: NextFunction) => {
  try {
    const result = Joi.validate(req.body, {
      ...pagingValidation,
      search: Joi.string().allow([null, '']).optional()
    });
    if (result.error) {
      return res.send(failedResponse(result.error.details[0].message));
    }
    return next();
  } catch (e) {
    new APIError(e, 500, 'getPartnerListForAdmin in partner/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};

export const deletePartner = async(req: IRequest, res: Response, next: NextFunction) => {
  try {
    const result = Joi.validate(req.query, idValidation);
    if (result.error) {
      return res.send(failedResponse(result.error.details[0].message));
    }
    const partner = await PartnerSchema.findOne({
      _id: req.query.id,
      deleted: false
    });
    if (!partner) {
      return res.send(failedResponse('Wrong Id'));
    }
    req.body.partner = partner;
    return next();
  } catch (e) {
    new APIError(e, 500, 'deletePartner in partner/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};

export const getPartnerDetails = async(req: IRequest, res: Response, next: NextFunction) => {
  try {
    const result = Joi.validate(req.query, idValidation);
    if (result.error) {
      return res.send(failedResponse(result.error.details[0].message));
    }
    const partner = await PartnerSchema.findOne({
      _id: req.query.id,
      deleted: false
    }).populate('translations');
    if (!partner) {
      return res.send(failedResponse('Wrong Id'));
    }
    req.body.partner = partner;
    return next();
  } catch (e) {
    new APIError(e, 500, 'getPartnerDetails in partner/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};