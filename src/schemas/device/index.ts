import  * as mongoose from 'mongoose';
import { schemaReferences } from '../../services/constants';
import { LanguageEnum, OsTypeEnum } from '../../services/enums';
import { IDeviceModel, IDevice } from './model';

const Schema = mongoose.Schema;

const schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: schemaReferences.user,
    required: true
  },
  language: {
    type: Number,
    required: true
  },
  osType: {
    type: Number,
    required: true
  },
  deviceId: {
    type: String,
    required: true
  },
  deviceToken: {
    type: String,
    default: null     // Because of firebase, may be missing when logs in
  },
  createdDt: {
    type: Date,
    default: Date.now
  }
});

const DeviceSchema: IDeviceModel = mongoose.model<IDevice<any>, IDeviceModel>(schemaReferences.device, schema);
export default DeviceSchema;