import * as fs from 'fs';
import * as bcrypt from 'bcrypt';

import mainConfig from '../env';
import { mediaPaths } from './constants';
import CountrySchema from '../schemas/country';
import { countries } from './constants/countries';
import CountryTranslationSchema from '../schemas/countryTranslation';
import { ICountry } from '../schemas/country/model';
import { LanguageEnum, UserRoleEnum, LoginProviderTypeEnum } from './enums';
import UserSchema from '../schemas/user';
import UserPasswordSchema from '../schemas/userPassword';
import NewsSchema from '../schemas/news';
import NewsTranslationSchema from '../schemas/newsTranslation';


const runSeed = async() => {
  createMediaFolders();
  await createAdmins();
  await createCountries();
};

const createMediaFolders = () => {
  if (!fs.existsSync(mainConfig.MEDIA_PATH)) {
    fs.mkdirSync(mainConfig.MEDIA_PATH);
    console.log('Created media folder by seed');
  }
  if (!fs.existsSync(mainConfig.MEDIA_PATH + mediaPaths.files)) {
    fs.mkdirSync(mainConfig.MEDIA_PATH + mediaPaths.files);
    console.log(`Created ${mediaPaths.files} folder by seed`);
  }
  if (!fs.existsSync(mainConfig.MEDIA_PATH + mediaPaths.audios)) {
    fs.mkdirSync(mainConfig.MEDIA_PATH + mediaPaths.audios);
    console.log(`Created ${mediaPaths.audios} folder by seed`);
  }
  if (!fs.existsSync(mainConfig.MEDIA_PATH + mediaPaths.photos)) {
    fs.mkdirSync(mainConfig.MEDIA_PATH + mediaPaths.photos);
    console.log(`Created ${mediaPaths.photos} folder by seed`);
  }
  if (!fs.existsSync(mainConfig.MEDIA_PATH + mediaPaths.videos)) {
    fs.mkdirSync(mainConfig.MEDIA_PATH + mediaPaths.videos);
    console.log(`Created ${mediaPaths.videos} folder by seed`);
  }
};

const createAdmins = async() => {
  const [ adminCount, superAdminCount ] = await Promise.all([
    UserSchema.countDocuments({ role: UserRoleEnum.admin }),
    UserSchema.countDocuments({ role: UserRoleEnum.superAdmin })
  ]);
  console.log(adminCount);
  if (!adminCount) {
    const admin = await UserSchema.create({
      email: '2gather@gmail.com',
      role: UserRoleEnum.admin
    });
    const localPassword = await UserPasswordSchema.create({
      user: admin._id,
      providerType: LoginProviderTypeEnum.local,
      passwordHash: bcrypt.hashSync('Password1/', 12),
    });
    admin.passwords.push(localPassword._id);
    await admin.save();
    console.log('User with admin role created with email ineed@gmail.com');
  }
  if (!superAdminCount) {
    const superAdmin = await UserSchema.create({
      email: 'armboldmind@gmail.com',
      role: UserRoleEnum.superAdmin
    });
    const localPassword = await UserPasswordSchema.create({
      user: superAdmin._id,
      providerType: LoginProviderTypeEnum.local,
      passwordHash: bcrypt.hashSync('Password1/', 12),
    });
    superAdmin.passwords.push(localPassword._id);
    await superAdmin.save();
    console.log('User with superAdmin role created with email armboldmind@gmail.com');
  }
};

const createCountries = async() => {
  const count = await CountrySchema.countDocuments();
  if (!count) {
    await Promise.all(countries.map(async item => {
      const country: ICountry<any> = new CountrySchema({
        shortCode: item.shortCode,
        position: item.position
      });
      const translations: any = await CountryTranslationSchema.insertMany([
        {
          country: country._id,
          language: LanguageEnum.armenian,
          name: item.hy.trim()
        },
        {
          country: country._id,
          language: LanguageEnum.russian,
          name: item.ru.trim()
        },
        {
          country: country._id,
          language: LanguageEnum.english,
          name: item.en.trim()
        },
        {
          country: country._id,
          language: LanguageEnum.french,
          name: item.fr.trim()
        }
      ]);
      country.translations = translations;
      await country.save();
    }));
  }
};

export default runSeed;