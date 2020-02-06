import { Document, Model } from 'mongoose';

interface ITopicActionDocument<T = string, U = string> extends Document {
  topic: T;
  type: number;
  user: U;
  uniqueId: string;
  createdDt: Date;
}

export interface ITopicAction<T = string, U = string> extends ITopicActionDocument<T, U> {

}

export interface ITopicActionModel extends Model<ITopicAction<any, any>> {

}