import { Router, Request, Response } from 'express';

import * as Service    from './service';
import * as Validation from './validation';

import APIError from '../../services/APIError';
import { getErrorResponse, succeedResponse } from '../response';
import jwtValidation from '../jwtValidation';
import { IRequest } from '../model';
import { avatarUpload } from '../formData';

class CountryRoutes {

  public router = Router();

  constructor() {
    this.routes();
  }

  private routes() {

    /** POST api/staff - Functionality for admin to add staff */
    this.router.post('/', jwtValidation.validateAdmin, avatarUpload, Validation.createStaffMember, this.createStaffMember);
    /** POST api/staff/adminList - Functionality for admin to get staff list */
    this.router.post('/adminList', jwtValidation.validateAdmin, Validation.getStaffMemberListForAdmin, this.getStaffMemberListForAdmin);
    /** PUT  api/staff/status - Functionality for admin to update staff member status */
    this.router.put('/status', jwtValidation.validateAdmin, Validation.updateStaffMemberStatus, this.updateStaffMemberStatus);
    /** DELETE api/staff - Functionality for admin to delete staff member */
    this.router.delete('/', jwtValidation.validateAdmin, Validation.deleteStaffMember, this.deleteStaffMember);
    /** GET api/staff/adminDetails - Functionality for admin to get staff member list */
    this.router.get('/adminDetails', jwtValidation.validateAdmin, Validation.getStaffMemberDetailsForAdmin, this.getStaffMemberDetailsForAdmin);
    /** PUT api/staff - Functionality for admin to update staff member */
    this.router.put('/', jwtValidation.validateAdmin, avatarUpload, Validation.updateStaffMember, this.updateStaffMember);

    /** GET api/staff/list - Functionality for all to get staff list */
    this.router.get('/list', Validation.getStaffList, this.getStaffList);

  }

  private createStaffMember = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.createStaffMember(req.body, req.file);
      res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'createStaffMember in staff/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

  private getStaffMemberListForAdmin = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.getStaffMemberListForAdmin(req.body);
      res.send(response);
    } catch (e) {
      new APIError(e, 500, 'getStaffMemberListForAdmin in staff/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

  private updateStaffMemberStatus = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.updateStaffMemberStatus(req.body);
      res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'updateStaffMemberStatus in staff/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

  private deleteStaffMember = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.deleteStaffMember(req.body.staffMember);
      res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'deleteStaffMember in staff/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

  private getStaffMemberDetailsForAdmin = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.getStaffMemberDetailsForAdmin(req.body.staffMember);
      res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'getStaffMemberDetailsForAdmin in staff/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

  private updateStaffMember = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.updateStaffMember(req.body, req.file);
      res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'updateStaffMember in staff/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

  private getStaffList = async(req: IRequest, res: Response) => {
    try {
      const response = await Service.getStaffList(req.query);
      res.send(succeedResponse('ok', response));
    } catch (e) {
      new APIError(e, 500, 'getStaffList in staff/service.ts');
      res.status(500).send(getErrorResponse());
    }
  }

}

export default new CountryRoutes().router;