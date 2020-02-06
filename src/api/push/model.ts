import { IPaginationQuery, ISkipPaginationQuery } from '../model';

export interface ISendPushBody {
  filters: Array<{
    search: string;
    role: number;
    country: string;
    status: number;
  }>;
  translations: Array<{
    language: number;
    title: string;
    description: string;
  }>;
  userIdList: string[];
}

export interface IGetPushListForAdmin extends IPaginationQuery {
  search: string;
}

export interface IGetPushListForUserQuery extends ISkipPaginationQuery {
  language: number;
}