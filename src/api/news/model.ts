import { IPaginationQuery } from '../model';
import { INews } from '../../schemas/news/model';
import { INewsTranslation } from '../../schemas/newsTranslation/model';
import { IFile } from '../../schemas/file/model';

export interface ICreateNewsBody {
  translations: Array<{
    language: number,
    name: string,
    description: string;
  }>;
  mainFile: Express.Multer.File;
  files: Array<Express.Multer.File>;
  status: number;
}

export interface IGetNewsListForAdminBody extends IPaginationQuery {
  search?: string;
}

export interface IChangeNewsStatusBody {
  id: string;
  status: number;
  news: INews;
}

export interface INewsAdminDetails {
  _id: string;
  translations: Array<{
    language: number;
    name: string;
    description: string;
  }>;
  status: number;
  files: Array<{
    _id: string;
    main: boolean;
    path: string;
    coverPath?: string;
    type: number;
  }>;
}

export interface IUpdateNewsBody {
  id: string;
  translations: Array<{
    language: number,
    name: string,
    description: string;
  }>;
  mainFile: Express.Multer.File;
  mainId: string;
  files: Array<Express.Multer.File>;
  status: number;
  deleteList: string[];
  news: INews<INewsTranslation, IFile, IFile>;
}

export interface IGetNewsListQuery extends IPaginationQuery {
  language: number;
}

export interface IGetNewsDetailsQuery {
  news: INews<INewsTranslation, IFile, IFile>;
  id: string;
  language: number;
}