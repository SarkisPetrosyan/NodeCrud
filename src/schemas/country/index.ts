import * as mongoose from 'mongoose';
import { schemaReferences } from '../../services/constants';
import { ICountryModel, ICountry } from './model';

const Schema = mongoose.Schema;

const schema = new Schema({
  shortCode: {
    type: String
  },
  position: {
    type: Number,
    default: null
  },
  translations: [{
    type: Schema.Types.ObjectId,
    ref: schemaReferences.countryTranslation
  }]
});

schema.statics.getList = async function(language: number): Promise<Array<{ _id: string, name: string }>> {
  const _this: ICountryModel = this;
  const aggregation = [
    {
      $lookup: {
        from: 'countrytranslations',
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
        _id: 1,
        name: '$translations.name',
        position: 1
      }
    },
    {
      $sort: { position: -1, name: 1 }
    },
    {
      $project: {
        _id: 1,
        name: 1
      }
    }
  ];
  const list = await _this.aggregate(aggregation);
  return list;
};

const CountrySchema: ICountryModel = mongoose.model<ICountry<any>, ICountryModel>(schemaReferences.country, schema);
export default CountrySchema;