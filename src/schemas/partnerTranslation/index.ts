import * as mongoose from 'mongoose';
import { schemaReferences } from '../../services/constants';
import { IPartnerTranslationModel, IPartnerTranslation } from './model';

const Schema = mongoose.Schema;

const schema = new Schema({
  partner: {
    type: Schema.Types.ObjectId,
    ref: schemaReferences.partner
  },
  language: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  }
});

const PartnerTranslationSchema: IPartnerTranslationModel = mongoose.model<IPartnerTranslation<any>, IPartnerTranslationModel>(schemaReferences.partnerTranslation, schema);
export default PartnerTranslationSchema;