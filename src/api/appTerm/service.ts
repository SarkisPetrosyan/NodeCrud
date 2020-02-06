import { ISetAppTermBody } from './model';
import AppTermSchema from '../../schemas/appTerm';

export const setAppTerm = async(body: ISetAppTermBody): Promise<void> => {
  await AppTermSchema.deleteMany({ type: body.type });
  await AppTermSchema.insertMany(body.translations.map(item => {
    return {
      type: body.type,
      language: item.language,
      body: item.body
    };
  }));
};

export const getAppTerm = async(query: { language: number, type: number }): Promise<string> => {
  const appTerm = await AppTermSchema.findOne({ type: query.type, language: query.language });
  if (appTerm) return appTerm.body;
};