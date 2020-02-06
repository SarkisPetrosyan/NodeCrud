import { Router, Request, Response } from 'express';

import * as Validation from './validation';
import * as Service    from './service';

import APIError from '../../services/APIError';
import { getErrorResponse, succeedResponse } from '../response';
import jwtValidation from '../jwtValidation';

class AuthRoutes {

  public router = Router();

  constructor() {
    this.routes();
  }

  private routes() {

    /** POST api/auth/email - Functionality to send verification code */
    this.router.post('/email', Validation.sendVerificationEmail, this.sendVerificationEmail);
    /** POST api/auth/check - Functionality to check email and verification or restore code for register or restore */
    this.router.post('/check', Validation.checkAuthCode, this.checkAuthCode);
    /** POST api/auth/register - Functionality to register */
    this.router.post('/register', Validation.register, this.register);
    /** POST api/auth/login - Functionality to log in */
    this.router.post('/login', Validation.login, this.login);
    /** POST api/auth/socialLogin - Functionality for user to login with social media */
    this.router.post('/socialLogin', Validation.socialLogin, this.socialLogin);
    /** POST api/auth/restore/email - Functionality for users to send restore email */
    this.router.post('/restore/email', Validation.sendRestoreEmail, this.sendRestoreEmail);
    /** POST api/auth/restore - Functionality for users to restore account */
    this.router.post('/restore', Validation.restoreAccount, this.restoreAccount);

    /** POST api/auth/logout - Functionality for users to logout */
    this.router.post('/logout', jwtValidation.validateUser, Validation.logout, this.logout);
    /** POST api/auth/refresh - Functionality for all to get new token by refresh token */
    this.router.post('/refresh', jwtValidation.validateUser, Validation.getNewToken, this.getNewToken);

  }

  private sendVerificationEmail = async(req: Request, res: Response) => {
    try {
      const response = await Service.sendVerificationEmail(req.body);
      res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'sendVerificationEmail in auth/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

  private checkAuthCode = async(req: Request, res: Response) => {
    try {
      const response = await Service.checkAuthCode(req.body, +req.headers['language']);
      res.send(response);
    } catch (e) {
      new APIError(e, 500, 'checkAuthCode in auth/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

  private register = async(req: Request, res: Response) => {
    try {
      const response = await Service.register(req.body);
      res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'register in auth/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

  private login = async(req: Request, res: Response) => {
    try {
      const response = await Service.login(req.body);
      res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'login in auth/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

  private socialLogin = async(req: Request, res: Response) => {
    try {
      const response = await Service.socialLogin(req.body);
      res.send(response);
    } catch (e) {
      new APIError(e, 500, 'socialLogin in auth/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

  private sendRestoreEmail = async(req: Request, res: Response) => {
    try {
      const response = await Service.sendRestoreEmail(req.body);
      res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'sendRestoreEmail in auth/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

  private restoreAccount = async(req: Request, res: Response) => {
    try {
      const response = await Service.restoreAccount(req.body);
      res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'restoreAccount in auth/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

  private logout = async(req: Request, res: Response) => {
    try {
      const response = await Service.logout(req.query.deviceId);
      res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'logout in auth/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

  private getNewToken = async(req: Request, res: Response) => {
    try {
      const response = await Service.getNewToken(req.body.refreshToken);
      res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'getNewToken in auth/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

}

export default new AuthRoutes().router;