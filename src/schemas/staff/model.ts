import { Document, Model } from 'mongoose';

interface IStaffDocument<T = string> extends Document {
  translations: Array<T>;
  status: number;
  image: string;
  facebookAccount: string;
  twitterAccount: string;
  linkedInAccount: string;
  createdDt: Date;
}

export interface IStaff<T = string> extends IStaffDocument<T> {

}

export interface IStaffModel extends Model<IStaff<any>> {

}