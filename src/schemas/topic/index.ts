import * as mongoose from 'mongoose';
import { schemaReferences } from '../../services/constants';
import { TopicStatusEnum } from '../../services/enums';
import { ITopicModel, ITopic } from './model';

const Schema = mongoose.Schema;

const schema = new Schema({
  status: {
    type: Number,
    default: TopicStatusEnum.pending
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: schemaReferences.topicCategory,
    required: true,
  },
  address: {
    type: Schema.Types.ObjectId,
    ref: schemaReferences.topicAddress,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    default: null
  },
  files: [{
    type: Schema.Types.ObjectId,
    ref: schemaReferences.file
  }],
  voteCount: {
    type: Number,
    default: 0
  },
  seenCount: {
    type: Number,
    default: 0
  },
  createdDt: {
    type: Date,
    default: Date.now
  },
  updatedDt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: schemaReferences.user,
    required: true
  },
  deleted: {
    type: Boolean,
    default: false
  }
});

const TopicSchema: ITopicModel = mongoose.model<ITopic<any, any, any, any>, ITopicModel>(schemaReferences.topic, schema);
export default TopicSchema;