import * as mongoose from 'mongoose';
import { schemaReferences } from '../../services/constants';
import { LanguageEnum } from '../../services/enums';
import { ICountryTranslationModel, ICountryTranslation } from './model';

const Schema = mongoose.Schema;

const schema = new Schema({
  country: {
    type: Schema.Types.ObjectId,
    ref: schemaReferences.country,
    required: true
  },
  language: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  }
});

const CountryTranslationSchema: ICountryTranslationModel = mongoose.model<ICountryTranslation<any>, ICountryTranslationModel>(schemaReferences.countryTranslation, schema);
export default CountryTranslationSchema;