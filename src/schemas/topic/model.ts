import { Document, Model } from 'mongoose';

interface ITopicDocument<C = string, A = string, F = string, U = string> extends Document {
  status: number;
  category: C;
  address: A;
  title: string;
  description: string;
  amount: number;
  voteCount: number;
  seenCount: number;
  files: Array<F>;
  createdDt: Date;
  updatedDt: Date;
  createdBy: U;
  deleted: boolean;
}

export interface ITopic<C = string, A = string, F = string, U = string> extends ITopicDocument<C, A, F, U> {

}

export interface ITopicModel extends Model<ITopic<any, any, any, any>> {

}