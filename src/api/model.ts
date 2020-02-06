import { Request } from 'express';
import { IUser } from '../schemas/user/model';

export interface IResponseModel {
  success: boolean;
  message: string;
  data: any;
}

export interface IRequest extends Request {
  user?: IUser;
}

export interface IIdInQuery {
  id: string;
}

export interface IPaginationQuery {
  pageNo: number;
  limit: number;
}

export interface ISkipPaginationQuery {
  skip: number;
  limit: number;
}

export interface ILanguageInQuery {
  language: number;
}

export interface IRequestFilesItem {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: string;
}