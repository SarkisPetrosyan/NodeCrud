import * as mongoose from 'mongoose';
import { schemaReferences } from '../../services/constants';
import { LoginProviderTypeEnum } from '../../services/enums';
import { IUserPasswordModel, IUserPassword } from './model';

const Schema = mongoose.Schema;

const schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: schemaReferences.user,
    required: true
  },
  providerType: {
    type: Number,
    required: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  createdDt: {
    type: Date,
    default: Date.now
  }
});

const UserPasswordSchema: IUserPasswordModel = mongoose.model<IUserPassword<any>, IUserPasswordModel>(schemaReferences.userPassword, schema);
export default UserPasswordSchema;