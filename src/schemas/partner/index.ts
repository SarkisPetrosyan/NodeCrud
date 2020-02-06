import * as mongoose from 'mongoose';
import { schemaReferences } from '../../services/constants';
import { IPartnerModel, IPartner } from './model';

const Schema = mongoose.Schema;

const schema = new Schema({
  translations: [{
    type: Schema.Types.ObjectId,
    ref: schemaReferences.partnerTranslation
  }],
  image: {
    type: String,
    required: true
  },
  contactPerson: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    default: null
  },
  createdDt: {
    type: Date,
    default: Date.now
  },
  deleted: {
    type: Boolean,
    default: false
  }
});

const PartnerSchema: IPartnerModel = mongoose.model<IPartner<any>, IPartnerModel>(schemaReferences.partner, schema);
export default PartnerSchema;