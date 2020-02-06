import { IPaginationQuery } from "../model";

export interface ICreateMovieBody {
    translations: Array<ICreateModel>;      
}

export interface ICreateModel {
    language: number,
    title: string;
    description: string;
}

export interface IGetMovieListQuery extends IPaginationQuery {
    language: number;
  }