import * as mongoose from 'mongoose';
import { NotificationTypeEnum } from '../../services/enums';
import { schemaReferences } from '../../services/constants';
import { IUserNotificationModel, IUserNotification } from './model';

const Schema = mongoose.Schema;

const schema = new Schema({
  type: {
    type: Number,
    required: true,
    enum: NotificationTypeEnum
  },
  receiver: {
    type: Schema.Types.ObjectId,
    ref: schemaReferences.user,
    default: null
  },
  notification: {
    type: Schema.Types.ObjectId,
    ref: schemaReferences.notification,
    default: null // Exists when custom notification was sent
  },
  seen: {
    type: Boolean,
    default: false
  },
  createdDt: {
    type: Date,
    default: Date.now
  }
});

const UserNotificationSchema: IUserNotificationModel = mongoose.model<IUserNotification<any, any>, IUserNotificationModel>(schemaReferences.userNotification, schema);
export default UserNotificationSchema;