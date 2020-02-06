import { Document, Model } from 'mongoose';

interface ICountryDocument<CT = string> extends Document {
  shortCode: string;
  position: number;
  translations: Array<CT>;
}

export interface ICountry<CT = string> extends ICountryDocument<CT> {

}

export interface ICountryModel extends Model<ICountry<any>> {
  getList(language: number): Promise<Array<{ _id: string, name: string }>>;
}