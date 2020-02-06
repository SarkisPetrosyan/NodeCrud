import { ITopicCategory } from '../../schemas/topicCategory/model';
import { IPaginationQuery } from '../model';
import { JoiObject } from 'joi';
import { ITopic } from '../../schemas/topic/model';

export interface IUpdateTopicCategoryBody {
  translations: Array<{
    language: number;
    name: string;
  }>;
  id: string;
  category: ITopicCategory<any>;
}

export interface IAddTopicBody {
  categoryId: string;
  address: string;
  lat: number;
  lng: number;
  title: string;
  description: string;
  amount: number;
  files: Array<Express.Multer.File>;
  category: ITopicCategory;
}

export interface IUpdateTopicBody {
  id: string;
  categoryId: string;
  address: string;
  lat: number;
  lng: number;
  title: string;
  description: string;
  amount: number;
  files: Array<Express.Multer.File>;
  deleteFiles: Array<string>;
  category: ITopicCategory;
  topic: ITopic;
}

export interface IGetSameTopicsByAddressQuery {
  lat: number;
  lng: number;
  language: number;
}

export interface IGetUsersTopicListQuery extends IPaginationQuery {
  search: string;
  sortBy: number;
}

export interface IGetTopicDetailsForUserQuery {
  id: string;
  language: number;
  uniqueId: string;
  isCreator: boolean;
}

export interface IGetTopicListForAdminBody extends IPaginationQuery {
  status: number;
  search: string;
}