import * as Joi from 'joi';
import { LanguageEnum, OsTypeEnum } from '../services/enums';

export const idRegex = /^[0-9a-fA-F]{24}$/;
export const numberRegex = /^\d+$/;

export const idValidation = {
  id: Joi.string().regex(idRegex).required()
};

export const pagingValidation = {
  pageNo : Joi.number().min(1).required(),
  limit  : Joi.number().min(1).required()
};

export const skipPagingValidation = {
  skip  : Joi.number().min(0).required(),
  limit : Joi.number().min(1).required()
};

export const languageValidation = {
  language: Joi.number().equal([LanguageEnum.armenian, LanguageEnum.russian, LanguageEnum.english, LanguageEnum.french]).required()
};

export const osTypeValidation = {
  osType: Joi.number().equal([OsTypeEnum.android, OsTypeEnum.ios, OsTypeEnum.web])
};

export const latLngValidation = {
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required()
};