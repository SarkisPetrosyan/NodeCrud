import * as mongoose from 'mongoose';
import { schemaReferences } from '../../services/constants';
import { LanguageEnum, AppTermTypeEnum } from '../../services/enums';
import { IAppTermModel, IAppTerm } from './model';

const Schema = mongoose.Schema;

const schema = new Schema({
  type: {
    type: Number,
    enum: AppTermTypeEnum,
    required: true
  },
  language: {
    type: Number,
    enum: LanguageEnum,
    required: true
  },
  body: {
    type: String,
    required: true
  }
});

const AppTermSchema: IAppTermModel = mongoose.model<IAppTerm, IAppTermModel>(schemaReferences.appTerm, schema);
export default AppTermSchema;