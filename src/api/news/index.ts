import { Router, Request, Response } from 'express';

import * as Service    from './service';
import * as Validation from './validation';

import APIError from '../../services/APIError';
import { getErrorResponse, succeedResponse } from '../response';
import jwtValidation from '../jwtValidation';
import { IRequest } from '../model';
import { newsUpload } from '../formData';
import mainConfig from '../../env';
import { getScreenShotFromVideo } from '../../services/utilities';

class NewsRoutes {

  public router = Router();

  constructor() {
    this.routes();
  }

  private routes() {

    /** POST api/news - Functionality for admins to create news */
    this.router.post('/', jwtValidation.validateAdmin, newsUpload, Validation.createNews, this.createNews);
    /** POST api/news/adminList - Functionality for admin to get news list */
    this.router.post('/adminList', jwtValidation.validateAdmin, Validation.getNewsListForAdmin, this.getNewsListForAdmin);
    /** PUT  api/news/status - Functionality for admin to change status */
    this.router.put('/status', jwtValidation.validateAdmin, Validation.changeNewsStatus, this.changeNewsStatus);
    /** DELETE api/news - Functionality for admin to delete news */
    this.router.delete('/', jwtValidation.validateAdmin, Validation.deleteNews, this.deleteNews);
    /** GET  api/news/adminDetails - Functionality for admin to get news details */
    this.router.get('/adminDetails', jwtValidation.validateAdmin, Validation.getNewsDetailsForAdmin, this.getNewsDetailsForAdmin);
    /** PUT  api/news - Functionality for admins to update news */
    this.router.put('/',  jwtValidation.validateAdmin, newsUpload, Validation.updateNews, this.updateNews);

    /** GET  api/news/userList - Functionality for users to get news list */
    this.router.get('/userList', Validation.getNewsList, this.getNewsList);
    /** GET  api/news/userDetails - Functionality for users to get news details */
    this.router.get('/userDetails', Validation.getNewsDetails, this.getNewsDetails);

  }

  private createNews = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.createNews(req.body);
      res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'createNews in news/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

  private getNewsListForAdmin = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.getNewsListForAdmin(req.body);
      res.send(response);
    } catch (e) {
      new APIError(e, 500, 'getNewsListForAdmin in news/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

  private changeNewsStatus = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.changeNewsStatus(req.body);
      res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'changeNewsStatus in news/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

  private deleteNews = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.deleteNews(req.body.news);
      res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'deleteNews in news/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

  private getNewsDetailsForAdmin = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.getNewsDetailsForAdmin(req.body.news);
      res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'getNewsDetailsForAdmin in news/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

  private updateNews = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.updateNews(req.body);
      res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'updateNews in news/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

  private getNewsList = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.getNewsList(req.query);
      res.send(response);
    } catch (e) {
      new APIError(e, 500, 'getNewsList in news/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

  private getNewsDetails = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.getNewsDetails(req.query);
      res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'getNewsDetails in news/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

}

export default new NewsRoutes().router;