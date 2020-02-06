import * as mongoose from 'mongoose';
import { schemaReferences } from '../../services/constants';
import { INewsModel, INews } from './model';
import { NewsStatusEnum } from '../../services/enums';
import mainConfig from '../../env';

const Schema = mongoose.Schema;

const schema = new Schema({
  translations: [{
    type: Schema.Types.ObjectId,
    ref: schemaReferences.newsTranslation
  }],
  mainImage: {
    type: Schema.Types.ObjectId,
    ref: schemaReferences.file,
    required: true
  },
  files: [{
    type: Schema.Types.ObjectId,
    ref: schemaReferences.file
  }],
  status: {
    type: Number,
    enum: NewsStatusEnum,
    required: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  publishDt: {
    type: Date,
    default: null
  },
  createdDt: {
    type: Date,
    default: Date.now
  }
});

schema.statics.getList = async function(skip: number, limit: number, language: number): Promise<Array<any>> {
  const _this: INewsModel = this;
  const aggregation = [
    {
      $match: {
        status: NewsStatusEnum.active
      }
    },
    {
      $lookup: {
        from: 'newstranslations',
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
      $lookup: {
        from: 'files',
        localField: 'mainImage',
        foreignField: '_id',
        as: 'mainImage'
      }
    },
    {
      $unwind: '$mainImage'
    },
    {
      $project: {
        _id: 1,
        name: '$translations.name',
        description: '$translations.description',
        cover: { $concat: [ mainConfig.BASE_URL, '$mainImage.path'] },
        publishDt: 1
      }
    },
    {
      $sort: { publishDt: -1 }
    },
    {
      $skip: skip
    },
    {
      $limit: limit
    }
  ];
  const list = await _this.aggregate(aggregation);
  return list;
};

const NewsSchema: INewsModel = mongoose.model<INews<any, any, any>, INewsModel>(schemaReferences.news, schema);
export default NewsSchema;