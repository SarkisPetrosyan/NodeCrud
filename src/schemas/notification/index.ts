import * as mongoose from 'mongoose';
import { UserRoleEnum, NotificationStatusEnum } from '../../services/enums';
import { schemaReferences } from '../../services/constants';
import { INotification, INotificationModel } from './model';
import { NotBeforeError } from 'jsonwebtoken';

const Schema = mongoose.Schema;

const schema = new Schema({
  translations: [{    // If type is system, translations are empty, reading from code
    type: Schema.Types.ObjectId,
    ref: schemaReferences.notificationTranslation
  }],
  status: {
    type: Number,
    enum: NotificationStatusEnum,
    default: NotificationStatusEnum.sent
  },
  userCount: {
    type: Number,
    required: true
  },
  // scheduleDt: {
  //   type: Date,
  //   default: Date.now // If schedule date is not provided means notification was sent, when created
  // },
  createdDt: {
    type: Date,
    default: Date.now
  }
});

const NotificationSchema: INotificationModel = mongoose.model<INotification<any>, INotificationModel>(schemaReferences.notification, schema);
export default NotificationSchema;