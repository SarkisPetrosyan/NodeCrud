import { Router, Request, Response } from 'express';

import * as Validation from './validation';
import * as Service    from './service';

import APIError from '../../services/APIError';
import { getErrorResponse, succeedResponse } from '../response';
import jwtValidation from '../jwtValidation';
import { IRequest } from '../model';
import { getCityNameFromMapByGoogleMaps } from '../../services/geo';
import { topicUpload } from '../formData';

class TopicRoutes {

  public router = Router();

  constructor() {
    this.routes();
  }

  private routes() {

    /** POST api/topic/category - Functionality for super admin to add new topic category */
    this.router.post('/category', jwtValidation.validateSuperAdmin, Validation.addTopicCategory, this.addTopicCategory);
    /** GET  api/topic/category/list - Functionality for super admin to get topic category list */
    this.router.get('/category/list', jwtValidation.validateSuperAdmin, this.getTopicCategoryListForAdmin);
    /** PUT  api/topic/category - Functionality for super admin to update topic category */
    this.router.put('/category', jwtValidation.validateSuperAdmin, Validation.updateTopicCategory, this.updateTopicCategory);
    /** DELETE api/topic/category - Functionality for super admin to delete topic category */
    this.router.delete('/category', jwtValidation.validateSuperAdmin, Validation.deleteTopicCategory, this.deleteTopicCategory);

    /** GET api/topic/category - Functionality for all to get available category list */
    this.router.get('/category', this.getTopicCategoryListForAll);

    /** POST api/topic - Functionality for users to add new topic */
    this.router.post('/', jwtValidation.validateUser, topicUpload, Validation.addTopic, this.addTopic);
    /** GET  api/topic/same - Functionality for users to get same topics by address */
    this.router.get('/same', jwtValidation.validateUser, Validation.getSameTopicsByAddress, this.getSameTopicsByAddress);
    /** DELETE api/topic - Functionality for users to delete rejected topic, and admins to delete any topic */
    this.router.delete('/', jwtValidation.validateUser, Validation.deleteTopic, this.deleteTopic);
    /** GET  api/topic/mine - Functionality for users to get their topic list */
    this.router.get('/list/mine', jwtValidation.validateUser, Validation.getUsersTopicList, this.getUsersTopicList);

    /** GET  api/topic/details - Functionality for users to get topic details */
    this.router.get('/details', jwtValidation.validateGuestOrUser, Validation.getTopicDetailsForAll, this.getTopicDetailsForAll);
    /** PUT  api/topic - Functionality for user to update rejected topic */
    this.router.put('/', jwtValidation.validateUser, topicUpload, Validation.updateTopic, this.updateTopic);

    /** POST api/topic/adminList - Functionality for admin to get topic list */
    // this.router.post('/adminList', jwtValidation.validateAdmin, Validation.getTopicListForAdmin, this.getTopicListForAdmin);
  }

  private addTopicCategory = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.addTopicCategory(req.body);
      res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'addTopicCategory in topic/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

  private getTopicCategoryListForAdmin = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.getTopicCategoryListForAdmin();
      res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'getTopicCategoryListForAdmin in topic/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

  private updateTopicCategory = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.updateTopicCategory(req.body);
      res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'updateTopicCategory in topic/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

  private deleteTopicCategory = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.deleteTopicCategory(req.body.category);
      res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'deleteTopicCategory in topic/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

  private getTopicCategoryListForAll = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.getTopicCategoryListForAll(+req.headers['language']);
      res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'getTopicCategoryListForAll in topic/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

  private addTopic = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.addTopic(req.body, req.user);
      res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'addTopic in topic/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

  private getSameTopicsByAddress = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.getSameTopicsByAddress(req.query);
      res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'getSameTopicsByAddress in topic/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

  private deleteTopic = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.deleteTopic(req.body.topic, req.body.isAdmin);
      res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'deleteTopic in topic/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

  private getUsersTopicList = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.getUsersTopicList(req.query, req.user);
      res.send(response);
    } catch (e) {
      new APIError(e, 500, 'getUsersTopicList in topic/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

  private getTopicDetailsForAll = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.getTopicDetailsForAll(req.query, req.body.topic, req.user);
      res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'getTopicDetailsForAll in topic/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

  private updateTopic = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.updateTopic(req.body, req.user.role);
      res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'updateTopic in topic/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

}

export default new TopicRoutes().router;