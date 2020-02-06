import { Document, Model } from 'mongoose';

interface INewsTranslationDocument<N = string> extends Document {
  news: N;
  language: number;
  name: string;
  description: string;
}

export interface INewsTranslation<N = string> extends INewsTranslationDocument<N> {

}

export interface INewsTranslationModel extends Model<INewsTranslation<any>> {

}