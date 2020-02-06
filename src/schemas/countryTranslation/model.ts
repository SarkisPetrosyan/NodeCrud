import { Document, Model } from 'mongoose';

interface ICountryTranslationSchema<C = string> extends Document {
  country: C;
  language: number;
  name: string;
}

export interface ICountryTranslation<C = string> extends ICountryTranslationSchema<C> {

}

export interface ICountryTranslationModel extends Model<ICountryTranslation<any>> {

}