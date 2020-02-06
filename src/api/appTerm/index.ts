import { Router, Request, Response } from 'express';

import * as Service    from './service';
import * as Validation from './validation';

import APIError from '../../services/APIError';
import { getErrorResponse, succeedResponse } from '../response';
import jwtValidation from '../jwtValidation';
import { IRequest } from '../model';

class CountryRoutes {

  public router = Router();

  constructor() {
    this.routes();
  }

  private routes() {

    /** PUT api/term - Functionality for admin to set term */
    this.router.put('/', jwtValidation.validateAdmin, Validation.setAppTerm, this.setAppTerm);
    /** GET api/term - Functionality for all to get app terms */
    this.router.get('/', Validation.getAppTerm, this.getAppTerm);

  }

  private setAppTerm = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.setAppTerm(req.body);
      res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'setAppTerm in appTerm/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

  private getAppTerm = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.getAppTerm(req.query);
      res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'getAppTerm in appTerm/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

}

export default new CountryRoutes().router;