import {  Document, Model } from 'mongoose';

interface IUserDocument<UP = string, C = string> extends Document {
  email: string;
  role: number;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar: string;
  birthDate: Date;
  country: C;
  taxNumber: string;
  verificationCode: string;
  restoreCode: string;
  gender: number;
  phoneNumber: string;
  passwords: Array<UP>;
  registeredDt: Date;
  contactPerson: string;
  createdDt: Date;
  blocked: boolean;
}

export interface IUser<UP = string, C = string> extends IUserDocument<UP, C> {

}

export interface IUserModel extends Model<IUser<any, any>> {

}