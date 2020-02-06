import * as mongoose from 'mongoose';
import { schemaReferences } from '../../services/constants';
import { LanguageEnum } from '../../services/enums';
import { ITopicCategoryTranslationModel, ITopicCategoryTranslation } from './model';

const Schema = mongoose.Schema;

const schema = new Schema({
  category: {
    type: Schema.Types.ObjectId,
    ref: schemaReferences.topicCategory,
    required: true
  },
  language: {
    type: Number,
    enum: LanguageEnum,
    required: true
  },
  name: {
    type: String,
    required: true
  }
});

const TopiCategoryTranslationSchema: ITopicCategoryTranslationModel = mongoose.model<ITopicCategoryTranslation<any>, ITopicCategoryTranslationModel>(schemaReferences.topicCategoryTranslation, schema);
export default TopiCategoryTranslationSchema;