import { Model, Document } from 'mongoose';

interface IPartnerTranslationDocument<P = string> extends Document {
  partner: P;
  language: number;
  name: string;
}

export interface IPartnerTranslation<P = string> extends IPartnerTranslationDocument<P> {

}

export interface IPartnerTranslationModel extends Model<IPartnerTranslation<any>> {

}