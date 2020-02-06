import { Document, Model } from 'mongoose';

interface INewsDocument<NT = string, CF = string, F = string> extends Document {
  translations: Array<NT>;
  mainImage: CF;
  files: Array<F>;
  status: number;
  viewCount: number;
  publishDt: Date;
  createdDt: Date;
}

export interface INews<NT = string, CF = string, F = string> extends INewsDocument<NT, CF, F> {

}

export interface INewsModel extends Model<INews<any, any, any>> {
  getList(skip: number, limit: number, language: number): Promise<Array<any>>;
}