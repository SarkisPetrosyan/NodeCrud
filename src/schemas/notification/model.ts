import { Model, Document } from 'mongoose';

interface INotificationDocument<NT = string> extends Document {
  translations: Array<NT>;
  status: number;
  userCount: number;
  // scheduleDt: Date;
  createdDt: Date;
}

export interface INotification<NT = string> extends INotificationDocument<NT> {

}

export interface INotificationModel extends Model<INotification<any>> {

}