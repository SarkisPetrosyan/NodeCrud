import { Document, Model } from 'mongoose';

interface IUserPasswordDocument<U = string> extends Document {
  user: U;
  providerType: number;
  passwordHash: string;
  createdDt: Date;
}

export interface IUserPassword<U = string> extends IUserPasswordDocument<U> {

}

export interface IUserPasswordModel extends Model<IUserPassword<any>> {

}