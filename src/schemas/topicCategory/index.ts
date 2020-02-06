import * as mongoose from 'mongoose';
import { schemaReferences } from '../../services/constants';
import { ITopicCategoryModel, ITopicCategory } from './model';

const Schema = mongoose.Schema;

const schema = new Schema({
  translations: [{
    type: Schema.Types.ObjectId,
    ref: schemaReferences.topicCategoryTranslation,
  }],
  topicCount: {
    type: Number,
    default: 0
  },
  createdDt: {
    type: Date,
    default: Date.now
  },
  deleted: {
    type: Boolean,
    default: false
  }
});

schema.statics.getAvailableList = async function(language: number): Promise<Array<{ id: string; name: string }>> {
  const _this: ITopicCategoryModel = this;
  return await _this.aggregate([
    {
      $match: { deleted: false }
    },
    {
      $lookup: {
        from: 'topiccategorytranslations',
        localField: 'translations',
        foreignField: '_id',
        as: 'translations'
      }
    },
    {
      $unwind: '$translations'
    },
    {
      $match: {
        'translations.language': language
      }
    },
    {
      $project: {
        _id: 0,
        id: '$_id',
        name: '$translations.name'
      }
    },
    {
      $sort: { name: 1 }
    }
  ]);
};

const TopicCategorySchema: ITopicCategoryModel = mongoose.model<ITopicCategory<any>, ITopicCategoryModel>(schemaReferences.topicCategory, schema);
export default TopicCategorySchema;