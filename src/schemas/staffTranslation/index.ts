import * as mongoose from 'mongoose';
import { schemaReferences } from '../../services/constants';
import { IStaffTranslationModel, IStaffTranslation } from './model';
import { LanguageEnum } from '../../services/enums';

const Schema = mongoose.Schema;

const schema = new Schema({
  staff: {
    type: Schema.Types.ObjectId,
    ref: schemaReferences.staff,
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
  occupation: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
});

const StaffTranslationSchema: IStaffTranslationModel = mongoose.model<IStaffTranslation<any>, IStaffTranslationModel>(schemaReferences.staffTranslation, schema);
export default StaffTranslationSchema;