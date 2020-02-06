import { Router, Request, Response } from 'express';

import * as Validation from './validation';
import * as Service    from './service';

import APIError from '../../services/APIError';
import { getErrorResponse, succeedResponse } from '../response';
import jwtValidation from '../jwtValidation';
import { IRequest } from '../model';
import { avatarUpload } from '../formData';

class UserRoutes {

  public router = Router();

  constructor() {
    this.routes();
  }

  private routes() {

    /** GET api/user - Functionality to get user profile details */
    this.router.get('/', jwtValidation.validateUser, Validation.getProfile, this.getProfile);
    /** PUT api/user - Functionality for user to update profile */
    this.router.put('/', jwtValidation.validateUser, avatarUpload, Validation.updateUser, this.updateUser);
    /** PUT api/user/avatar - Functionality to set new avatar of the user */
    this.router.put('/avatar', jwtValidation.validateUser, avatarUpload, Validation.setUserAvatar, this.setUserAvatar);
    /** PUT api/user/password - Functionality to set new password for the user */
    this.router.put('/password', jwtValidation.validateUser, Validation.setNewUserPassword, this.setNewUserPassword);

    /** POST api/user/adminList - Functionality for admin to get user list */
    this.router.post('/adminList', jwtValidation.validateAdmin, Validation.getUserListForAdmin, this.getUserListForAdmin);
    /** PUT  api/user/block - Functionality for admin to block / unBlock user */
    this.router.put('/block', jwtValidation.validateAdmin, Validation.blockOrUnBlockUser, this.blockOrUnBlockUser);
    /** POST api/user/count - Functionality for admin to get user count by filters */
    this.router.post('/count', jwtValidation.validateAdmin, Validation.getUserCountByFilters, this.getUserCountByFilters);

    /** GET  api/user/adminDetails - Functionality for admin to get user details */
    this.router.get('/adminDetails', jwtValidation.validateAdmin, Validation.getUserDetailsForAdmin, this.getUserDetailsForAdmin);

  }

  private getProfile = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.getProfile(req.user, +req.headers['language']);
      res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'getProfile in user/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

  private setUserAvatar = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.setUserAvatar(req.user, req.file);
      res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'setUserAvatar in user/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

  private updateUser = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.updateUser(req.user, req.body);
      res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'updateUser in user/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

  private setNewUserPassword = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.setNewUserPassword(req.user, req.body);
      res.send(response);
    } catch (e) {
      new APIError(e, 500, 'setNewUserPassword in user/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

  private getUserListForAdmin = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.getUserListForAdmin(req.body);
      res.send(response);
    } catch (e) {
      new APIError(e, 500, 'getUserListForAdmin in user/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

  private blockOrUnBlockUser = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.blockOrUnBlockUser(req.body.user);
      res.send(response);
    } catch (e) {
      new APIError(e, 500, 'blockOrUnBlockUser in user/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

  private getUserCountByFilters = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.getUserCountByFilters(req.body);
      res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'getUserCountByFilters in user/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

  private getUserDetailsForAdmin = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.getUserDetailsForAdmin(req.body.user);
      res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'getUserDetailsForAdmin in user/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

}

export default new UserRoutes().router;