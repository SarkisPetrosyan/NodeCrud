import * as http from 'http';
import * as mongoose from 'mongoose';
import * as bluebird from 'bluebird';

import app from './app';
import mainConfig from './env';
import runSeed from './services/seed';

bluebird.promisifyAll(mongoose);
(<any>mongoose).Promise = bluebird;

mongoose.connect(mainConfig.MONGO_URL, { useNewUrlParser: true }, () => {
  console.log('Mongodb connected on port 27017');
  runSeed();
});

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

http.createServer(app).listen(mainConfig.PORT, () => {
  console.log('Server started on port ' + mainConfig.PORT + ` in ${mainConfig.NODE_ENV} mode`);
});