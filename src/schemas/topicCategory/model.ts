import { Model, Document } from 'mongoose';

interface ITopicCategoryDocument<T = string> extends Document {
  translations: Array<T>;
  topicCount: number;
  createdDt: Date;
  deleted: boolean;
}

export interface ITopicCategory<T = string> extends ITopicCategoryDocument<T> {

}

export interface ITopicCategoryModel extends Model<ITopicCategory<any>> {
  getAvailableList(language: number): Promise<Array<{ id: string; name: string }>>;
}