import { Response, Router } from 'express';
import jwtValidation from '../jwtValidation';

import * as Validation from './validation';
import * as Service from './service';

import { IRequest } from '../model';
import APIError from '../../services/APIError';
import { getErrorResponse, succeedResponse } from '../response';
import { avatarUpload } from '../formData';

class PartnerRoutes {

  router = Router();

  constructor() {
    this.routes();
  }

  private routes() {

    /** POST api/push - Functionality for admin to send push */
    this.router.post('/', jwtValidation.validateAdmin, Validation.sendPush, this.sendPush);
    /** POST api/push/adminList - Functionality for admin to get push list */
    this.router.post('/adminList', jwtValidation.validateAdmin, Validation.getPushListForAdmin, this.getPushListForAdmin);
    /** GET  api/push/userList - Functionality for user to get push list */
    this.router.get('/userList', jwtValidation.validateUser, Validation.getPushListForUser, this.getPushListForUser);
    /** PUT  api/push/seen - Functionality for user to set single notification seen */
    this.router.put('/seen', jwtValidation.validateUser, Validation.setUserNotificationSeen, this.setUserNotificationSeen);
    /** GET  api/push/badge - Functionality for user to get unseen notification count */
    this.router.get('/badge', jwtValidation.validateUser, this.getUserNotificationBadge);

  }

  private sendPush = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.sendPush(req.body);
      return res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'sendPush in push/service.ts');
      return res.status(500).send(getErrorResponse());
    }
  }

  private getPushListForAdmin = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.getPushListForAdmin(req.body);
      return res.send(response);
    } catch (e) {
      new APIError(e, 500, 'getPushListForAdmin in push/service.ts');
      return res.status(500).send(getErrorResponse());
    }
  }

  private getPushListForUser = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.getPushListForUser(req.query, req.user);
      return res.send(response);
    } catch (e) {
      new APIError(e, 500, 'getPushListForUser in push/service.ts');
      return res.status(500).send(getErrorResponse());
    }
  }

  private setUserNotificationSeen = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.setUserNotificationSeen(req.body.userNotification);
      return res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'setUserNotificationSeen in push/service.ts');
      return res.status(500).send(getErrorResponse());
    }
  }

  private getUserNotificationBadge = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.getUserNotificationBadge(req.user._id);
      return res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'getUserNotificationBadge in push/service.ts');
      return res.status(500).send(getErrorResponse());
    }
  }

}

export default new PartnerRoutes().router;