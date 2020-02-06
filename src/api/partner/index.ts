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

    /** POST api/partner - Functionality for admin to add partner */
    this.router.post('/', jwtValidation.validateAdmin, avatarUpload, Validation.addPartner, this.addPartner);
    /** PUT  api/partner - Functionality for admin to update partner */
    this.router.put('/', jwtValidation.validateAdmin, avatarUpload, Validation.updatePartner, this.updatePartner);
    /** POST api/partner/adminList - Functionality for admin to get partner list */
    this.router.post('/adminList', jwtValidation.validateAdmin, Validation.getPartnerListForAdmin, this.getPartnerListForAdmin);
    /** DELETE api/partner - Functionality for admin to delete partner */
    this.router.delete('/', jwtValidation.validateAdmin, Validation.deletePartner, this.deletePartner);
    /** GET api/partner - Functionality for admin to get partner details */
    this.router.get('/', jwtValidation.validateAdmin, Validation.getPartnerDetails, this.getPartnerDetails);

  }

  private addPartner = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.addPartner(req.body);
      return res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'addPartner in partner/service.ts');
      return res.status(500).send(getErrorResponse());
    }
  }

  private updatePartner = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.updatePartner(req.body);
      return res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'updatePartner in partner/service.ts');
      return res.status(500).send(getErrorResponse());
    }
  }

  private getPartnerListForAdmin = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.getPartnerListForAdmin(req.body);
      return res.send(response);
    } catch (e) {
      new APIError(e, 500, 'getPartnerListForAdmin in partner/service.ts');
      return res.status(500).send(getErrorResponse());
    }
  }

  private deletePartner = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.deletePartner(req.body.partner);
      return res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'deletePartner in partner/service.ts');
      return res.status(500).send(getErrorResponse());
    }
  }

  private getPartnerDetails = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.getPartnerDetails(req.body.partner);
      return res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'getPartnerDetails in partner/service.ts');
      return res.status(500).send(getErrorResponse());
    }
  }

}

export default new PartnerRoutes().router;