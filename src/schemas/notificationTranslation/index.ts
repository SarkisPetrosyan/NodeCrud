import * as mongoose from 'mongoose';
import { schemaReferences } from '../../services/constants';
import { LanguageEnum } from '../../services/enums';
import { INotificationTranslationModel, INotificationTranslation } from './model';

const Schema = mongoose.Schema;

const schema = new Schema({
  notification: {
    type: Schema.Types.ObjectId,
    ref: schemaReferences.notification,
    required: true
  },
  language: {
    type: Number,
    enum: LanguageEnum,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
});

const NotificationTranslationSchema: INotificationTranslationModel = mongoose.model<INotificationTranslation<any>, INotificationTranslationModel>(schemaReferences.notificationTranslation, schema);
export default NotificationTranslationSchema;