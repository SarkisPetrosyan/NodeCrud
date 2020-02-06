import { Router, Request, Response } from 'express';

import * as Service    from './service';
import * as Validation from './validation';

import APIError from '../../services/APIError';
import { getErrorResponse, succeedResponse } from '../response';
import jwtValidation from '../jwtValidation';
import { IRequest } from '../model';

class SupportRoutes {

  public router = Router();

  constructor() {
    this.routes();
  }

  private routes() {

    /** POST api/support/message - Functionality for users and guests to send support message */
    this.router.post('/message', jwtValidation.validateGuestOrUser, Validation.sendSupportMessage, this.sendSupportMessage);
    /** POST api/support/messageList - Functionality for admins to get message list */
    this.router.post('/messageList', jwtValidation.validateAdmin, Validation.getSupportMessageList, this.getSupportMessageList);
    /** POST api/support/messageDetails - Functionality for admins to get message details */
    this.router.get('/messageDetails', jwtValidation.validateAdmin, Validation.getSupportMessage, this.getSupportMessage);
    /** POST api/support/messageImportance - Functionality for admins to reverse message importance */
    this.router.put('/messageImportance', jwtValidation.validateAdmin, Validation.getSupportMessage, this.reverseMessageImportance);
    /** GET  api/support/unseen - Functionality for admins to get unseen support message count */
    this.router.get('/unseen', jwtValidation.validateAdmin, this.getUnseenSupportMessageCount);
    /** PUT  api/support/seen - Functionality for admin to set support message seen */
    this.router.put('/seen', jwtValidation.validateAdmin, Validation.setSupportMessageSeen, this.setSupportMessageSeen);

  }

  private sendSupportMessage = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.sendSupportMessage(req.body, req.user);
      res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'sendSupportMessage in device/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

  private getSupportMessageList = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.getSupportMessageList(req.body);
      res.send(response);
    } catch (e) {
      new APIError(e, 500, 'getSupportMessageList in device/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

  private getSupportMessage = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.getSupportMessage(req.body.message);
      res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'getSupportMessage in device/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

  private reverseMessageImportance = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.reverseMessageImportance(req.body.message);
      res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'reverseMessageImportance in device/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

  private getUnseenSupportMessageCount = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.getUnseenSupportMessageCount();
      res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'getUnseenSupportMessageCount in device/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

  private setSupportMessageSeen = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.setSupportMessageSeen(req.body.message);
      res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'setSupportMessageSeen in device/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

}

export default new SupportRoutes().router;