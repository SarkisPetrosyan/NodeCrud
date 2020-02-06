import * as Joi from 'joi';

import { Response, NextFunction } from 'express';
import { IRequest } from '../model';
import { getErrorResponse, failedResponse } from '../response';
import APIError from '../../services/APIError';
import { ICreateStaffMemberBody, IUpdateStaffMemberBody } from './model';
import { languageCount } from '../../services/constants';
import { deleteFiles } from '../../services/utilities';
import { languageValidation, pagingValidation, idValidation } from '../validation';
import { StaffStatusEnum } from '../../services/enums';
import StaffSchema from '../../schemas/staff';

export const createStaffMember = async(req: IRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.send(failedResponse('Missing avatar'));
    }
    const body: ICreateStaffMemberBody = req.body;
    const bodyValidation = {
      translations   : Joi.array().items(Joi.string().required()).length(languageCount).required(),
      facebookAccount: Joi.string().uri().optional(),
      linkedInAccount: Joi.string().uri().optional(),
      twitterAccount : Joi.string().uri().optional()
    };
    const result = Joi.validate(body, bodyValidation);
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
      language   : languageValidation.language,
      name       : Joi.string().required(),
      occupation : Joi.string().required(),
      description: Joi.string().required()
    })).unique('language'));
    if (translationsResult.error) {
      deleteFiles([req.file.path]);
      return res.send(failedResponse(translationsResult.error.details[0].message));
    }
    req.body.translations = translations;
    return next();
  } catch (e) {
    new APIError(e, 500, 'createStaffMember in staff/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};

export const getStaffMemberListForAdmin = async(req: IRequest, res: Response, next: NextFunction) => {
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
    new APIError(e, 500, 'getStaffMemberListForAdmin in staff/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};

export const updateStaffMemberStatus = async(req: IRequest, res: Response, next: NextFunction) => {
  try {
    const result = Joi.validate(req.body, {
      ...idValidation,
      status: Joi.number().equal([ StaffStatusEnum.active, StaffStatusEnum.hidden ])
    });
    if (result.error) {
      return res.send(failedResponse(result.error.details[0].message));
    }
    const staffMember = await StaffSchema.findOne({ _id: req.body.id, status: { $ne: req.body.status } });
    if (!staffMember) {
      return failedResponse('Wrong Id');
    }
    req.body.staffMember = staffMember;
    return next();
  } catch (e) {
    new APIError(e, 500, 'updateStaffMemberStatus in staff/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};

export const deleteStaffMember = async(req: IRequest, res: Response, next: NextFunction) => {
  try {
    const result = Joi.validate(req.query, idValidation);
    if (result.error) {
      return res.send(failedResponse(result.error.details[0].message));
    }
    const staffMember = await StaffSchema.findById(req.query.id).populate('translations');
    if (!staffMember) {
      return res.send(failedResponse('Wrong Id'));
    }
    req.body.staffMember = staffMember;
    return next();
  } catch (e) {
    new APIError(e, 500, 'deleteStaffMember in staff/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};

export const getStaffMemberDetailsForAdmin = async(req: IRequest, res: Response, next: NextFunction) => {
  try {
    const result = Joi.validate(req.query, idValidation);
    if (result.error) {
      return res.send(failedResponse(result.error.details[0].message));
    }
    const staffMember = await StaffSchema.findById(req.query.id).populate('translations');
    if (!staffMember) {
      return res.send(failedResponse('Wrong Id'));
    }
    req.body.staffMember = staffMember;
    return next();
  } catch (e) {
    new APIError(e, 500, 'getStaffMemberDetailsForAdmin in staff/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};

export const updateStaffMember = async(req: IRequest, res: Response, next: NextFunction) => {
  try {
    const body: IUpdateStaffMemberBody = req.body;
    console.log(body);
    const bodyValidation = {
      ...idValidation,
      translations   : Joi.array().items(Joi.string().required()).length(languageCount).required(),
      facebookAccount: Joi.string().uri().optional(),
      linkedInAccount: Joi.string().uri().optional(),
      twitterAccount : Joi.string().uri().optional()
    };
    const result = Joi.validate(body, bodyValidation);
    if (result.error) {
      if (req.file) deleteFiles([req.file.path]);
      return res.send(failedResponse(result.error.details[0].message));
    }
    const staffMember = await StaffSchema.findById(body.id);
    if (!staffMember) {
      if (req.file) deleteFiles([req.file.path]);
      return res.send(failedResponse('Wrong translations'));
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
      language   : languageValidation.language,
      name       : Joi.string().required(),
      occupation : Joi.string().required(),
      description: Joi.string().required()
    })).unique('language'));
    if (translationsResult.error) {
      if (req.file) deleteFiles([req.file.path]);
      return res.send(failedResponse(translationsResult.error.details[0].message));
    }
    req.body.translations = translations;
    req.body.staffMember = staffMember;
    return next();
  } catch (e) {
    new APIError(e, 500, 'updateStaffMember in staff/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};

export const getStaffList = async(req: IRequest, res: Response, next: NextFunction) => {
  try {
    req.query.language = +req.headers['language'];
    const result = Joi.validate(req.query, {
      ...languageValidation,
      ...pagingValidation
    });
    if (result.error) {
      return res.send(failedResponse(result.error.details[0].message));
    }
    req.query.pageNo = +req.query.pageNo;
    req.query.limit = +req.query.limit;
    return next();
  } catch (e) {
    new APIError(e, 500, 'getStaffList in staff/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};