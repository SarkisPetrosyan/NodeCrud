import CountrySchema from '../../schemas/country';
import UserSchema from '../../schemas/user';
import { UserRoleEnum, LanguageEnum } from '../../services/enums';
import { ICountry } from '../../schemas/country/model';
import { ICountryTranslation } from '../../schemas/countryTranslation/model';

export const getCountryList = async(language: number): Promise<Array<{ _id: string, name: string }>> => {
  const list = await CountrySchema.getList(language);
  return list;
};

export const getCountryListForUserList = async(): Promise<Array<{ _id: string, name: string }>> => {
  const userCountryList = await UserSchema.find({
    'passwords.0': { $exists: true },
    role: { $in: [ UserRoleEnum.user, UserRoleEnum.corporate ] }
  }).distinct('country');
  const list: Array<ICountry<ICountryTranslation>> = await CountrySchema.find({ _id: { $in: userCountryList } }).populate('translations');
  return list.map(item => {
    const english = item.translations.find(fItem => fItem.language === LanguageEnum.english);
    return {
      _id: item._id,
      name: english ? english.name : null
    };
  });
};