import * as mongoose from 'mongoose';
import { schemaReferences } from '../../services/constants';
import { ISupportMessageModel, ISupportMessage } from './model';
import { IGetSupportMessageListBody } from '../../api/support/model';

const Schema = mongoose.Schema;

const schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: schemaReferences.user,
    default: null
  },
  userType: {
    type: Number,
    default: null
  },
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  seen: {
    type: Boolean,
    default: false
  },
  important: {
    type: Boolean,
    default: false
  },
  createdDt: {
    type: Date,
    default: Date.now
  }
});

const SupportMessageSchema: ISupportMessageModel = mongoose.model<ISupportMessage<any>, ISupportMessageModel>(schemaReferences.supportMessage, schema);
export default SupportMessageSchema;