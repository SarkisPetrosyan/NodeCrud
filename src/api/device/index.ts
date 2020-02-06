import { Router, Request, Response } from 'express';

import * as Service    from './service';
import * as Validation from './validation';

import APIError from '../../services/APIError';
import { getErrorResponse, succeedResponse } from '../response';
import jwtValidation from '../jwtValidation';
import { IRequest } from '../model';

class DeviceRoutes {

  public router = Router();

  constructor() {
    this.routes();
  }

  private routes() {

    /** PUT api/device - Functionality for users to set device token for device country list */
    this.router.put('/', jwtValidation.validateUser, Validation.setDeviceTokenForDevice, this.setDeviceTokenForDevice);
    /** PUT api/device/language - Functionality for users to set device language */
    this.router.put('/language', jwtValidation.validateUser, Validation.setDeviceLanguage, this.setDeviceLanguage);

  }

  private setDeviceTokenForDevice = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.setDeviceTokenForDevice(req.body);
      res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'setDeviceTokenForDevice in device/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

  private setDeviceLanguage = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.setDeviceLanguage(req.body);
      res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'setDeviceLanguage in device/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

}

export default new DeviceRoutes().router;