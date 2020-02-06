import { Router, Request, Response } from 'express';

import * as Service    from './service';

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

    /** GET api/country - Functionality to get country list */
    this.router.get('/', this.getCountryList);
    /** GET api/country/adminUser - Functionality for admins to get user category list */
    this.router.get('/adminUser', jwtValidation.validateAdmin, this.getCountryListForUserList);

  }

  private getCountryList = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.getCountryList(+req.headers['language']);
      res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'getCountryList in auth/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

  private getCountryListForUserList = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.getCountryListForUserList();
      res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'getCountryListForUserList in auth/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

}

export default new CountryRoutes().router;