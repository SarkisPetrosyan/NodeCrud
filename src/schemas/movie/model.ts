import { Document, Model } from 'mongoose';

interface IMovieDocument<NT = string> extends Document {
  translations: Array<NT>; 
  createdDt: Date;
}

export interface IMovie<NT = string> extends IMovieDocument<NT> {

}

export interface IMovieModel extends Model<IMovie<any>> {
  getList(skip: number, limit: number, language: number): Promise<Array<any>>;
}