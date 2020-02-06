import * as mongoose from 'mongoose';
import { schemaReferences } from '../../services/constants';
import { IMovieModel, IMovie } from './model';

const Schema = mongoose.Schema;

const schema = new Schema({
    createdDt: {
        type: Date,
        default: Date.now
    },
    translations: [{
        type: Schema.Types.ObjectId,
        ref: schemaReferences.movieTranslation
      }]
});

schema.statics.getList = async function(skip: number, limit: number, language: number): Promise<Array<any>> {
    
    const _this: IMovieModel = this;
    const aggregation = [
      {
        $lookup: {
          from: 'movietranslations',
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
          title: '$translations.title',
          description: '$translations.description'
        }
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

const MovieSchema: IMovieModel = mongoose.model<IMovie<any>, IMovieModel>(schemaReferences.movie, schema);
export default MovieSchema;