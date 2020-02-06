import { Document, Model } from 'mongoose';

interface ITopicCategoryTranslationDocument<TC = string> extends Document {
  category: TC;
  language: number;
  name: string;
}

export interface ITopicCategoryTranslation<TC = string> extends ITopicCategoryTranslationDocument<TC> {

}

export interface ITopicCategoryTranslationModel extends Model<ITopicCategoryTranslation<any>> {

}