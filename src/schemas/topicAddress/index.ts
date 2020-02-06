import * as mongoose from 'mongoose';
import { schemaReferences } from '../../services/constants';
import { ITopicAddressModel, ITopicAddress } from './model';

const Schema = mongoose.Schema;

const schema = new Schema({
  topic: {
    type: Schema.Types.ObjectId,
    ref: schemaReferences.topic,
    required: true
  },
  rAddress: {
    type: String,
    required: true
  },
  lat: {
    type: Number,
    required: true
  },
  lng: {
    type: Number,
    required: true
  },
  gStreet: {
    type: String,
    default: null
  },
  gCity: {
    type: String,
    default: null
  },
  point: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number] }
  }
});

schema.index({ 'point': '2dsphere' });

schema.statics.getNearestTopics = async function(lat: number, lng: number, distance: number): Promise<any> {
  const _this: ITopicAddressModel = this;
  const aggregation = [
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lng, lat] },
        key: 'point',
        distanceField: 'dist',
        spherical: true
      }
    },
    {
      $match: { dist: { $lte: distance } }
    }
  ];
  const list = await _this.aggregate(aggregation);
  return list.map(item => item.topic);
};

const TopicAddressSchema: ITopicAddressModel = mongoose.model<ITopicAddress<any>, ITopicAddressModel>(schemaReferences.topicAddress, schema);
export default TopicAddressSchema;