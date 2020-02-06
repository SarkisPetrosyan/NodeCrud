import * as mongoose from 'mongoose';
import { UserRoleEnum, GenderTypeEnum } from '../../services/enums';
import { schemaReferences } from '../../services/constants';
import { IUserModel, IUser } from './model';

const Schema = mongoose.Schema;

const schema = new Schema({
  email: {
    type    : String,
    required: true,
    unique  : true
  },
  role: {
    type    : Number,
    required: true
  },
  firstName: {
    type: String,
    default: null
  },
  lastName: {
    type: String,
    default: null
  },
  fullName: {       // For user it is concatenated firstName & lastName, for company it is name
    type: String,
    default: null
  },
  avatar: {         // Path to user avatar
    type: String,
    default: null
  },
  birthDate: {
    type: Date,
    default: null
  },
  gender: {
    type: Number,
    enum: GenderTypeEnum,
    default: null
  },
  phoneNumber: {
    type: String,
    default: null
  },
  country: {        // Refs to country table
    type: Schema.Types.ObjectId,
    ref: schemaReferences.country,
    default: null
  },
  taxNumber: {      // Field only for corporate type users
    type: String,
    default: null
  },
  contactPerson: { // Field for corporate type users
    type: String,
    default: null
  },
  verificationCode: { // Code sent to email for registration
    type: String,
    default: null
  },
  restoreCode: {    // Code sent to email for restoring password, sets null after successful restore
    type: String,
    default: null
  },
  passwords: [{
    type: Schema.Types.ObjectId,
    ref: schemaReferences.userPassword
  }],
  registeredDt: {
    type: Date,
    default: null
  },
  createdDt: {
    type: Date,
    default: Date.now
  },
  blocked: {
    type: Boolean,
    default: false
  }
});

const UserSchema: IUserModel = mongoose.model<IUser<any, any>, IUserModel>(schemaReferences.user, schema);
export default UserSchema;