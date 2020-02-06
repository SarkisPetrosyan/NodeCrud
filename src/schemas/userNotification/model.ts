import { Document, Model } from 'mongoose';

interface IUserNotificationDocument<RU = string, N = string> extends Document {
  type: number;
  receiver: RU;
  notification: N;
  seen: boolean;
  createdDt: Date;
}

export interface IUserNotification<RU = string, N = string> extends IUserNotificationDocument<RU, N> {

}

export interface IUserNotificationModel extends Model<IUserNotification<any, any>> {

}