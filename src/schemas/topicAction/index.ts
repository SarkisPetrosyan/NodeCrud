import * as mongoose from 'mongoose';
import { schemaReferences } from '../../services/constants';
import { TopicActionTypeEnum } from '../../services/enums';
import { ITopicActionModel, ITopicAction } from './model';

const Schema = mongoose.Schema;

const schema = new Schema({
  topic: {
    type: Schema.Types.ObjectId,
    ref: schemaReferences.topic,
    required: true
  },
  type: {
    type: Number,
    enum: TopicActionTypeEnum,
    required: true
  },
  user: {                       // If type is vote, then user is required
    type: Schema.Types.ObjectId,
    ref: schemaReferences.user,
    default: null
  },
  uniqueId: {
    type: String,
    default: null
  },
  createdDt: {
    type: Date,
    default: Date.now
  }
});

const TopicActionSchema: ITopicActionModel = mongoose.model<ITopicAction<any, any>, ITopicActionModel>(schemaReferences.topicAction, schema);
export default TopicActionSchema;