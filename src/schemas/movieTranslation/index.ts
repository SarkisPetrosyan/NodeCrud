import * as mongoose from 'mongoose';
import { schemaReferences } from '../../services/constants';
import { LanguageEnum } from '../../services/enums';
import { number } from 'joi';

const Schema = mongoose.Schema;

const schema = new Schema({
  movie: {
    type: Schema.Types.ObjectId,
    ref: schemaReferences.movie,
    required: true
  },
  language: {
    type: Number,
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

const MovieTranslationSchema = mongoose.model(schemaReferences.movieTranslation, schema);
export default MovieTranslationSchema;