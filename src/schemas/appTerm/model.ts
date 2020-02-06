import { Document, Model } from 'mongoose';

interface IAppTermDocument extends Document {
  type: number;
  language: number;
  body: string;
}

export interface IAppTerm extends IAppTermDocument {

}

export interface IAppTermModel extends Model<IAppTerm> {

}