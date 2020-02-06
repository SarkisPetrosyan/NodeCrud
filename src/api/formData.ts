import * as multer from 'multer';
import mainConfig from '../env';
import { mediaPaths } from '../services/constants';
import { failedResponse } from './response';

export const avatarUpload = (req, res, next) => {
  const uploadAvatar = multer({
    storage: multer.diskStorage({
      destination: `${mainConfig.MEDIA_PATH}${mediaPaths.photos}`,
      filename: (req, file, cb) => {
        cb(null, `${Date.now()}${file.originalname}`);
      }
    }),
    fileFilter: function (req, file, cb) {
      console.log(file);
      const isValid = /[^\\]*\.(\w+)$/.test(file.originalname);
      if (!isValid) {
        return cb(null, false);
      }
      const mimeType = file.mimetype.slice(0, 5);
      if (mimeType !== 'image') {
        return cb(null, false);
      } else {
        return cb(null, true);
      }
    }
  }).single('avatar');
  uploadAvatar(req, res, err => {
    if (err) return res.send(failedResponse('Wrong key'));
    return next();
  });
};

export const newsUpload = (req, res, next) => {
  const uploadNews = multer({
    storage: multer.diskStorage({
      destination: `${mainConfig.MEDIA_PATH}${mediaPaths.photos}`,
      filename: (req, file, cb) => {
        cb(null, `${Date.now()}${file.originalname}`);
      }
    }),
    fileFilter: function (req, file, cb) {
      const isValid = /[^\\]*\.(\w+)$/.test(file.originalname);
      if (!isValid) {
        return cb(null, false);
      }
      const mimeType = file.mimetype.slice(0, 5);
      if (mimeType !== 'image' && mimeType !== 'video') cb(null, false);
      if (file.fieldname !== 'file' && file.fieldname !== 'main') cb(null, false);
      if (file.fieldname === 'main' && mimeType !== 'image') cb(null, false);
      else cb(null, true);
    }
  }).any();
  uploadNews(req, res, err => {
    if (err) return res.send(failedResponse('Wrong key'));
    return next();
  });
};

export const topicUpload = (req, res, next) => {
  const uploadTopic = multer({
    storage: multer.diskStorage({
      destination: `${mainConfig.MEDIA_PATH}${mediaPaths.photos}`,
      filename: (req, file, cb) => {
        cb(null, `${Date.now()}${file.originalname}`);
      }
    }),
    fileFilter: function (req, file, cb) {
      console.log(file);
      const isValid = /[^\\]*\.(\w+)$/.test(file.originalname);
      if (!isValid) {
        return cb(null, false);
      }
      const mimeType = file.mimetype.slice(0, 5);
      if (mimeType !== 'image' && mimeType !== 'video') cb(null, false);
      else cb(null, true);
    }
  }).array('file');
  uploadTopic(req, res, err => {
    if (err) return res.send(failedResponse('Wrong key'));
    return next();
  });
};