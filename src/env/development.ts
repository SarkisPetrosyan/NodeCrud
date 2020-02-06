import * as path from 'path';
import { IMainConfig } from '.';

const config: IMainConfig = {
  NODE_ENV: 'development',
  PORT: 4003,
  BASE_URL: 'http://localhost:4003/',
  MONGO_URL: 'mongodb://localhost:27017/2gatherDEV',
  JWT_SECRET: 's%4^3paraSAd346vc*-asd5Ddox8A$D!#',
  MEDIA_PATH: path.resolve(__dirname, '..', '..', 'media') + '/',
  CRYPTO_SECRET_KEY: '%4^3paraSineed6vc*-asd5Ditdox8A',
  WEB_CLIENT_BASE_URL: 'http://127.0.0.1:3000/',
  ADMIN_CLIENT_BASE_URL: 'http://localhost:4200/'
};

export default config;