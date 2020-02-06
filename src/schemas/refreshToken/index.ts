import * as mongoose from 'mongoose';
import * as cryptoRandomString from 'crypto-random-string';
import { schemaReferences, refreshExpiration } from '../../services/constants';
import { OsTypeEnum, UserRoleEnum, LoginProviderTypeEnum } from '../../services/enums';
import { IRefreshTokenModel, IRefreshToken } from './model';

const Schema = mongoose.Schema;

const schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: schemaReferences.user,
    required: true
  },
  token: {             // Regenerated every time when used
    type: String,
    required: true
  },
  osType: {
    type: Number,
    enum: OsTypeEnum,
    required: true
  },
  provider: {
    type: Number,
    enum: LoginProviderTypeEnum,
    required: true
  },
  uuid: {              // This will be fingerprint for browsers, and deviceId for apps
    type: String,
    default: null
  },
  expectedExpDt: {     // When token expected to be expired
    type: Date,
    required: true
  },
  updatedCount: {
    type: Number,
    default: 0
  },
  expDt: {             // When token expired actually
    type: Date,        // Is expired when user is blocked, or logged out, or expiration day is accessed
    default: null
  },
  expired: {
    type: Boolean,
    default: false
  },
  createdDt: {
    type: Date,
    default: Date.now
  },
  updatedDt: {
    type: Date,
    default: Date.now
  }
});

schema.index({ 'token': -1 });

schema.statics.assign = async function(userId: string, userRole: number, osType: number, uuid: string, provider: number): Promise<string> {
  const _this: IRefreshTokenModel = this;
  const token = getUniqueToken();
  let expDt = null;
  if (osType in [OsTypeEnum.android, OsTypeEnum.ios]) {
    expDt = new Date(Date.now() + refreshExpiration.app);
  } else {
    if (userRole in [UserRoleEnum.corporate, UserRoleEnum.user]) {
      expDt = new Date(Date.now() + refreshExpiration.web);
    } else {
      expDt = new Date(Date.now() + refreshExpiration.admin);
    }
  }
  await _this.updateMany({ uuid }, { expired: true, expDt: new Date() });
  await _this.create({
    user: userId,
    token,
    provider,
    osType,
    uuid,
    expectedExpDt: expDt
  });
  return token;
};


const RefreshTokenSchema: IRefreshTokenModel = mongoose.model<IRefreshToken<any>, IRefreshTokenModel>(schemaReferences.refreshToken, schema);
export default RefreshTokenSchema;

export async function getUniqueToken() {
  const code = cryptoRandomString({ length: 15 });
  const exists = await RefreshTokenSchema.findOne({ code, deleted: false });
  if (exists) {
    return getUniqueToken();
  }
  return code;
}