import * as mongoose from 'mongoose';
import { IStaffModel, IStaff } from './model';
import { schemaReferences } from '../../services/constants';
import { StaffStatusEnum } from '../../services/enums';

const Schema = mongoose.Schema;

const schema = new Schema({
  translations: [{
    type: Schema.Types.ObjectId,
    ref: schemaReferences.staffTranslation
  }],
  image: {
    type: String,
    required: true
  },
  status: {
    type: Number,
    default: StaffStatusEnum.active
  },
  facebookAccount: {
    type: String,
    default: null
  },
  twitterAccount: {
    type: String,
    default: null
  },
  linkedInAccount: {
    type: String,
    default: null
  },
  createdDt: {
    type: Date,
    default: Date.now
  }
});

const StaffSchema: IStaffModel = mongoose.model<IStaff<any>, IStaffModel>(schemaReferences.staff, schema);
export default StaffSchema;