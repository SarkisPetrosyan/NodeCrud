import { Document, Model } from 'mongoose';

interface IMovieTranslationDocument<M = string> extends Document {
    movie: M;
    language: number;
    title: string;
    description: string;
}

export interface IMovieTranslation<M = string> extends IMovieTranslationDocument<M> {

}

export interface IMovieTranslationModel extends Model<IMovieTranslation<any>> {

}