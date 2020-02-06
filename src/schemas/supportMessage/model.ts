import { Document, Model } from 'mongoose';

interface ISupportMessageDocument<U = string> extends Document {
  user: U;
  userType: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  message: string;
  seen: boolean;
  important: boolean;
  createdDt: Date;
}

export interface ISupportMessage<U = string> extends ISupportMessageDocument<U> {

}

export interface ISupportMessageModel extends Model<ISupportMessage<any>> {

}