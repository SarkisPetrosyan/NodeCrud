import * as Joi from 'joi';

import { Response, NextFunction } from 'express';
import { IRequest } from '../model';
import { failedResponse, getErrorResponse } from '../response';
import APIError from '../../services/APIError';
import { ICreateNewsBody, IChangeNewsStatusBody, IUpdateNewsBody } from './model';
import { deleteFiles } from '../../services/utilities';
import { languageCount } from '../../services/constants';
import { languageValidation, idValidation, pagingValidation, idRegex } from '../validation';
import { NewsStatusEnum } from '../../services/enums';
import NewsSchema from '../../schemas/news';
import { INews } from '../../schemas/news/model';
import { INewsTranslation } from '../../schemas/newsTranslation/model';
import { IFile } from '../../schemas/file/model';

export const createNews = async(req: IRequest, res: Response, next: NextFunction) => {
  try {
    const body: ICreateNewsBody = req.body;
    body.files = [];
    const files: any = req.files;
    const reqFiles: Express.Multer.File[] = files;
    const filePath = [];
    reqFiles.forEach(item => {
      if (item.fieldname === 'main') body.mainFile = item;
      else if (item.fieldname === 'file') body.files.push(item);
      filePath.push(item.path);
    });
    if (!body.mainFile) {
      deleteFiles(filePath);
      return res.send(failedResponse('Missing main image'));
    }
    const bodyValidationSchema = {
      translations: Joi.array().items(Joi.string().required()).length(languageCount).required(),
      status: Joi.number().equal([NewsStatusEnum.active, NewsStatusEnum.hidden]).required()
    };
    const result = Joi.validate(body, bodyValidationSchema, { allowUnknown: true });
    if (result.error) {
      deleteFiles(filePath);
      return res.send(failedResponse(result.error.details[0].message));
    }
    const translations = [];
    const oldTranslations: any = body.translations;
    try {
      for (let i = 0; i < oldTranslations.length; i++) {
        translations.push(new Object(JSON.parse(oldTranslations[i])));
      }
    } catch (e) {
      deleteFiles(filePath);
      return res.send(failedResponse('Wrong translations'));
    }
    const translationsResult = Joi.validate(translations, Joi.array().items(Joi.object().keys({
      language   : languageValidation.language,
      name       : Joi.string().required(),
      description: Joi.string().min(200).required()
    })).unique('language'));
    if (translationsResult.error) {
      deleteFiles(filePath);
      return res.send(failedResponse(translationsResult.error.details[0].message));
    }
    req.body.translations = translations;
    return next();
  } catch (e) {
    new APIError(e, 500, 'createNews in news/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};

export const getNewsListForAdmin = async(req: IRequest, res: Response, next: NextFunction) => {
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
    new APIError(e, 500, 'getNewsListForAdmin in news/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};

export const changeNewsStatus = async(req: IRequest, res: Response, next: NextFunction) => {
  try {
    const body: IChangeNewsStatusBody = req.body;
    const result = Joi.validate(body, {
      ...idValidation,
      status: Joi.number().equal([NewsStatusEnum.active, NewsStatusEnum.hidden])
    });
    if (result.error) {
      return res.send(failedResponse(result.error.details[0].message));
    }
    const news = await NewsSchema.findOne({
      _id: body.id,
      status: body.status === NewsStatusEnum.active ? NewsStatusEnum.hidden : NewsStatusEnum.active
    });
    if (!news) {
      return res.send(failedResponse('Wrong Id'));
    }
    req.body.news = news;
    return next();
  } catch (e) {
    new APIError(e, 500, 'changeNewsStatus in news/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};

export const deleteNews = async(req: IRequest, res: Response, next: NextFunction) => {
  try {
    const result = Joi.validate(req.query, idValidation);
    if (result.error) {
      return res.send(failedResponse(result.error.details[0].message));
    }
    const news = await NewsSchema.findById(req.query.id).populate('translations mainImage files');
    if (!news) {
      return res.send(failedResponse('Wrong Id'));
    }
    req.body.news = news;
    return next();
  } catch (e) {
    new APIError(e, 500, 'deleteNews in news/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};

export const getNewsDetailsForAdmin = async(req: IRequest, res: Response, next: NextFunction) => {
  try {
    const result = Joi.validate(req.query, idValidation);
    if (result.error) {
      return res.send(failedResponse(result.error.details[0].message));
    }
    const news = await NewsSchema.findById(req.query.id).populate('translations mainImage files');
    if (!news) {
      return res.send(failedResponse('Wrong Id'));
    }
    req.body.news = news;
    return next();
  } catch (e) {
    new APIError(e, 500, 'getNewsDetailsForAdmin in news/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};

export const updateNews = async(req: IRequest, res: Response, next: NextFunction) => {
  try {
    const body: IUpdateNewsBody = req.body;
    body.files = [];
    const files: any = req.files;
    const reqFiles: Express.Multer.File[] = files;
    const filePath = [];
    reqFiles.forEach(item => {
      if (item.fieldname === 'main') body.mainFile = item;
      else if (item.fieldname === 'file') body.files.push(item);
      filePath.push(item.path);
    });
    if (!body.mainFile && !body.mainId) {
      deleteFiles(filePath);
      return res.send(failedResponse('Missing main image'));
    }
    const bodyValidationSchema = {
      ...idValidation,
      mainId: Joi.string().regex(idRegex).optional(),
      deleteList: Joi.array().items(idValidation.id).min(1).optional(),
      translations: Joi.array().items(Joi.string().required()).length(languageCount).required(),
      status: Joi.number().equal([NewsStatusEnum.active, NewsStatusEnum.hidden]).required()
    };
    const result = Joi.validate(body, bodyValidationSchema, { allowUnknown: true });
    if (result.error) {
      deleteFiles(filePath);
      return res.send(failedResponse(result.error.details[0].message));
    }
    const translations = [];
    const oldTranslations: any = body.translations;
    try {
      for (let i = 0; i < oldTranslations.length; i++) {
        translations.push(new Object(JSON.parse(oldTranslations[i])));
      }
    } catch (e) {
      deleteFiles(filePath);
      return res.send(failedResponse('Wrong translations'));
    }
    const translationsResult = Joi.validate(translations, Joi.array().items(Joi.object().keys({
      language   : languageValidation.language,
      name       : Joi.string().required(),
      description: Joi.string().min(200).required()
    })).unique('language'));
    if (translationsResult.error) {
      deleteFiles(filePath);
      return res.send(failedResponse(translationsResult.error.details[0].message));
    }
    req.body.translations = translations;
    const news: INews<INewsTranslation, IFile, IFile> = await NewsSchema.findById(body.id).populate('translations mainImage files');
    if (!news) {
      return res.send(failedResponse('Wrong Id'));
    }
    if (body.mainId && body.mainId !== news.mainImage._id.toString()) {
      const fileIdList = news.files.map(item => item._id.toString());
      if (!fileIdList.includes(body.mainId)) {
        return res.send(failedResponse('Wrong mainId'));
      }
    }
    req.body.news = news;
    return next();
  } catch (e) {
    new APIError(e, 500, 'updateNews in news/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};

export const getNewsList = async(req: IRequest, res: Response, next: NextFunction) => {
  try {
    req.query.language = +req.headers['language'];
    const queryValidationSchema = {
      ...pagingValidation,
      ...languageValidation
    };
    const result = Joi.validate(req.query, queryValidationSchema);
    if (result.error) {
      return res.send(failedResponse(result.error.details[0].message));
    }
    req.query.pageNo = +req.query.pageNo;
    req.query.limit = +req.query.limit;
    return next();
  } catch (e) {
    new APIError(e, 500, 'getNewsList in news/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};

export const getNewsDetails = async(req: IRequest, res: Response, next: NextFunction) => {
  try {
    req.query.language = +req.headers['language'];
    const queryValidationSchema = {
      ...idValidation,
      ...languageValidation
    };
    const result = Joi.validate(req.query, queryValidationSchema);
    if (result.error) {
      return res.send(failedResponse(result.error.details[0].message));
    }
    const news = await NewsSchema.findOne({
      _id: req.query.id,
      status: NewsStatusEnum.active
    }).populate('translations mainImage files');
    if (!news) {
      return res.send(failedResponse('Wrong Id'));
    }
    req.query.news = news;
    return next();
  } catch (e) {
    new APIError(e, 500, 'getNewsDetails in news/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};