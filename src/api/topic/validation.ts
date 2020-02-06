import * as Joi from 'joi';

import { Response, NextFunction } from 'express';
import { IRequest } from '../model';
import { failedResponse, getErrorResponse } from '../response';
import APIError from '../../services/APIError';
import { languageValidation, idValidation, latLngValidation, pagingValidation, idRegex } from '../validation';
import { languageCount } from '../../services/constants';
import TopicCategorySchema from '../../schemas/topicCategory';
import { IAddTopicBody, IGetUsersTopicListQuery, IUpdateTopicBody, IGetTopicListForAdminBody } from './model';
import { deleteFiles } from '../../services/utilities';
import TopicSchema from '../../schemas/topic';
import { TopicStatusEnum, UserTopicSortEnum, UserRoleEnum, MediaTypeEnum } from '../../services/enums';
import { ITopic } from '../../schemas/topic/model';
import { IFile } from '../../schemas/file/model';
import { IUser } from '../../schemas/user/model';
import FileSchema from '../../schemas/file';
import { ITopicAddress } from '../../schemas/topicAddress/model';

export const addTopicCategory = async(req: IRequest, res: Response, next: NextFunction) => {
  try {
    const result = Joi.validate(req.body, {
      translations: Joi.array().items(Joi.object().keys({
        ...languageValidation,
        name: Joi.string().required()
      })).length(languageCount).unique('language').required()
    });
    if (result.error) {
      return res.send(failedResponse(result.error.details[0].message));
    }
    return next();
  } catch (e) {
    new APIError(e, 500, 'addTopicCategory in topic/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};

export const updateTopicCategory = async(req: IRequest, res: Response, next: NextFunction) => {
  try {
    const result = Joi.validate(req.body, {
      ...idValidation,
      translations: Joi.array().items(Joi.object().keys({
        ...languageValidation,
        name: Joi.string().required()
      })).length(languageCount).unique('language').required()
    });
    if (result.error) {
      return res.send(failedResponse(result.error.details[0].message));
    }
    const category = await TopicCategorySchema.findOne({ _id: req.body.id, deleted: false });
    if (!category) return res.send(failedResponse('Wrong Id'));
    req.body.category = category;
    return next();
  } catch (e) {
    new APIError(e, 500, 'updateTopicCategory in topic/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};

export const deleteTopicCategory = async(req: IRequest, res: Response, next: NextFunction) => {
  try {
    const result = Joi.validate(req.query, idValidation);
    if (result.error) {
      return res.send(failedResponse(result.error.details[0].message));
    }
    const category = await TopicCategorySchema.findOne({ _id: req.query.id, deleted: false });
    if (!category) return res.send(failedResponse('Wrong Id'));
    req.body.category = category;
    return next();
  } catch (e) {
    new APIError(e, 500, 'deleteTopicCategory in topic/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};

export const addTopic = async(req: IRequest, res: Response, next: NextFunction) => {
  try {
    req.body.files = req.files;
    const body: IAddTopicBody = req.body;
    if (!body.files || !body.files.length) {
      return res.send(failedResponse('Min 1 file is required'));
    }
    const firstFileIsVideo = body.files[0].mimetype.slice(0, 5) === 'video';
    let onlyVideos = true;
    for (let i = 0; i < body.files.length; i++) {
      if (body.files[0].mimetype.slice(0, 5) === 'image') {
        onlyVideos = false;
        break;
      }
    }
    if (onlyVideos) {
      return res.send(failedResponse('Min 1 image is required'));
    }
    const bodyValidationSchema = {
      categoryId : idValidation.id,
      address    : Joi.string().required(),
      ...latLngValidation,
      title      : Joi.string().required(),
      description: Joi.string().required(),
      amount     : Joi.number().optional()
    };
    const result = Joi.validate(body, bodyValidationSchema, { allowUnknown: true });
    if (result.error) {
      deleteFiles(body.files.map(item => item.path));
      return res.send(failedResponse(result.error.details[0].message));
    }
    const category = await TopicCategorySchema.findOne({ _id: body.categoryId, deleted: false });
    if (!category) {
      deleteFiles(body.files.map(item => item.path));
      return res.send(failedResponse('Wrong category Id'));
    }
    req.body.category = category;
    if (firstFileIsVideo) {
      const firstImageIndex = body.files.findIndex(item => item.mimetype.slice(0, 5) === 'photo');
      const spliced = body.files.splice(firstImageIndex, 1);
      body.files = [ ...spliced, ...body.files ];
    }
    return next();
  } catch (e) {
    new APIError(e, 500, 'addTopic in topic/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};

export const getSameTopicsByAddress = async(req: IRequest, res: Response, next: NextFunction) => {
  try {
    req.query.language = +req.headers['language'];
    const result = Joi.validate(req.query, {
      ...latLngValidation,
      ...languageValidation
    });
    if (result.error) {
      return res.send(failedResponse(result.error.details[0].message));
    }
    req.query.lat = +req.query.lat;
    req.query.lng = +req.query.lng;
    return next();
  } catch (e) {
    new APIError(e, 500, 'getSameTopicsByAddress in topic/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};

export const deleteTopic = async(req: IRequest, res: Response, next: NextFunction) => {
  try {
    const result = Joi.validate(req.query, idValidation);
    if (result.error) {
      return res.send(failedResponse(result.error.details[0].message));
    }
    const isAdmin = req.user.role === UserRoleEnum.admin || req.user.role === UserRoleEnum.superAdmin;
    const filter: any = {
      _id: req.query.id,
      deleted: false
    };
    if (!isAdmin) {
      filter.createdBy = req.user._id;
      filter.status = TopicStatusEnum.rejected;
    }
    const topic = await TopicSchema.findOne(filter).populate('files');
    if (!topic) {
      return res.send(failedResponse('Wrong Id'));
    }
    req.body.topic = topic;
    req.body.isAdmin = isAdmin;
    return next();
  } catch (e) {
    new APIError(e, 500, 'deleteTopic in topic/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};

export const getUsersTopicList = async(req: IRequest, res: Response, next: NextFunction) => {
  try {
    const query: IGetUsersTopicListQuery = req.query;
    const queryValidationSchema = {
      ...pagingValidation,
      search: Joi.string().allow('').optional(),
      sortBy: Joi.number().allow('').equal([UserTopicSortEnum.date, UserTopicSortEnum.view, UserTopicSortEnum.vote]).optional()
    };
    const result = Joi.validate(query, queryValidationSchema);
    if (result.error) {
      return res.send(failedResponse(result.error.details[0].message));
    }
    req.query.pageNo = +req.query.pageNo;
    req.query.limit = +req.query.limit;
    return next();
  } catch (e) {
    new APIError(e, 500, 'getUsersTopicList in topic/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};

export const getTopicDetailsForAll = async(req: IRequest, res: Response, next: NextFunction) => {
  try {
    req.query.language = +req.headers['language'];
    req.query.uniqueId = req.headers['uniqueid'];
    const result = Joi.validate(req.query, {
      ...idValidation,
      ...languageValidation,
      uniqueId: Joi.string().optional() // TODO ! Change this to required()
    });
    if (result.error) {
      return res.send(failedResponse(result.error.details[0].message));
    }
    const topic: ITopic<string, ITopicAddress, IFile, IUser> = await TopicSchema.findOne({ _id: req.query.id, deleted: false }).populate('address files createdBy');
    if (!topic) {
      return res.send(failedResponse('Wrong Id'));
    }
    // Check user or guest, if guest check status
    if (!req.user && topic.status !== TopicStatusEnum.published) {
      return res.send(failedResponse('Wrong Id'));
    }
    let isCreator = false;
    if (req.user) isCreator = req.user._id.toString() === topic.createdBy._id.toString();
    if (req.user && !isCreator && topic.status !== TopicStatusEnum.published) {
      return res.send(failedResponse('Wrong Id'));
    }
    req.query.isCreator = isCreator;
    req.body.topic = topic;
    return next();
  } catch (e) {
    new APIError(e, 500, 'getTopicDetailsForAll in topic/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};

export const updateTopic = async(req: IRequest, res: Response, next: NextFunction) => {
  try {
    req.body.files = req.files;
    const body: IUpdateTopicBody = req.body;
    const bodyValidationSchema = {
      ...idValidation,
      categoryId : idValidation.id,
      address    : Joi.string().required(),
      ...latLngValidation,
      title      : Joi.string().required(),
      description: Joi.string().required(),
      amount     : Joi.number().optional(),
      deleteFiles: Joi.array().items(Joi.string().regex(idRegex)).unique().optional()
    };
    const result = Joi.validate(body, bodyValidationSchema, { allowUnknown: true });
    if (result.error) {
      if (body.files) deleteFiles(body.files.map(item => item.path));
      return res.send(failedResponse(result.error.details[0].message));
    }
    const filter: any = {
      deleted: false
    };
    if (req.user.role !== UserRoleEnum.superAdmin && req.user.role !== UserRoleEnum.superAdmin) {
      filter.status = TopicStatusEnum.rejected;
      filter.createdBy = req.user._id;
    }
    const topic = await TopicSchema.findOne(filter);
    if (!topic) {
      if (body.files) deleteFiles(body.files.map(item => item.path));
      return res.send(failedResponse('Wrong Id'));
    }
    const allDeleted = body.deleteFiles ? body.deleteFiles.length === topic.files.length : false;
    let onlyVideos = true;
    for (let i = 0; i < body.files.length; i++) {
      if (body.files[i].mimetype.slice(0, 5) === 'image') {
        onlyVideos = false;
        break;
      }
    }
    if (allDeleted) {
      if (!body.files.length || onlyVideos) {
        if (body.files) deleteFiles(body.files.map(item => item.path));
        return res.send(failedResponse('Topic must contain minimum  1 image'));
      }
    }
    if (body.deleteFiles && body.deleteFiles.length && onlyVideos) {
      const filesLeft = await FileSchema.find({ _id: { $nin: body.deleteFiles }, topic: topic._id });
      let onlyVideosLeft = true;
      for (let i = 0; i < filesLeft.length; i++) {
        if (filesLeft[i].type === MediaTypeEnum.photo) {
          onlyVideosLeft = false;
          break;
        }
      }
      if (onlyVideosLeft) {
        if (body.files) deleteFiles(body.files.map(item => item.path));
        return res.send(failedResponse('Topic must contain minimum 1 image'));
      }
    }
    const category = await TopicCategorySchema.findOne({ _id: body.categoryId, deleted: false });
    if (!category) {
      if (body.files) deleteFiles(body.files.map(item => item.path));
      return res.send(failedResponse('Wrong category Id'));
    }
    req.body.category = category;
    req.body.topic = topic;
    return next();
  } catch (e) {
    new APIError(e, 500, 'updateTopic in topic/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};

export const getTopicListForAdmin = async(req: IRequest, res: Response, next: NextFunction) => {
  try {
    const body: IGetTopicListForAdminBody = req.body;
    const bodyValidationSchema = {
      status: Joi.number().equal([TopicStatusEnum.pending, TopicStatusEnum.rejected, TopicStatusEnum.pending]).required()
    };
    return next();
  } catch (e) {
    new APIError(e, 500, 'updateTopic in topic/validation.ts');
    return res.status(500).send(getErrorResponse());
  }
};