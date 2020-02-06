import { Document, Model } from 'mongoose';

interface IStaffTranslationDocument<S = string> extends Document {
  staff: S;
  language: number;
  name: string;
  occupation: string;
  description: string;
}

export interface IStaffTranslation<S = string> extends IStaffTranslationDocument<S> {

}

export interface IStaffTranslationModel extends Model<IStaffTranslation<any>> {

}