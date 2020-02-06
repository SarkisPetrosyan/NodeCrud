import { Document, Model } from 'mongoose';

interface IPartnerDocument<T = string> extends Document {
  translations: Array<T>;
  image: string;
  contactPerson: string;
  phone: string;
  createdDt: Date;
  deleted: boolean;
}

export interface IPartner<T = string> extends IPartnerDocument<T> {

}

export interface IPartnerModel extends Model<IPartner<any>> {

}