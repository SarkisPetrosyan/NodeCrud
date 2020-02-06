import * as mongoose from 'mongoose';
import { schemaReferences } from '../../services/constants';
import { LanguageEnum } from '../../services/enums';

const Schema = mongoose.Schema;

const schema = new Schema({
  news: {
    type: Schema.Types.ObjectId,
    ref: schemaReferences.news,
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
  },
  description: {
    type: String,
    required: true
  }
});

const NewsTranslationSchema = mongoose.model(schemaReferences.newsTranslation, schema);
export default NewsTranslationSchema;