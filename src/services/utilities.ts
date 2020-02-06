import * as fs from 'fs';
import * as request from 'request';
import * as ffmpeg from 'fluent-ffmpeg';

import mainConfig from '../env';
import { mediaPaths } from './constants';

export const generateVerificationCode = (length: number, includeLetters: boolean = false) => {
  let charset = '0123456789';
  if (includeLetters) charset += 'ABCDEFGHJKLMOPQSTUVWXYZ';
  let text = '';
  for (let i = 0; i < length; i++) {
    const char = charset.charAt(Math.ceil(Math.random() * (charset.length - 1)));
    text += char;
  }
  return text;
};

export const getMimeType = (fileName: string): string => {
  const split = fileName.split('.');
  return split[split.length - 1];
};

/** Function downloads image fro the given url and gives path to image without media path(name to save in DB) */
export const downloadImageFromUrl = function(uri: string, filename: string): Promise<void> {
  return new Promise((resolve, reject) => {
    request.head(uri, function(err, res, body) {
      if (err) return reject(err);
      request(uri).pipe(fs.createWriteStream( mainConfig.MEDIA_PATH + filename)).on('close', () => {
        resolve();
      });
    });
  });
};

/**
 * Delete files
 * @param pathList Path list to delete
 * @param concat Concatenate with media folder path or not
 */
export const deleteFiles = (pathList: string[], concat: boolean = false) => {
  pathList.forEach(item => {
    const path = concat ? mainConfig.MEDIA_PATH + item : item;
    if (fs.existsSync(path)) fs.unlinkSync(path);
  });
};

/**
 * Get screenshot from video
 * @param videoPath Video path
 * @param fileName Name to save, output will be - fileName + '.png'
 * @param folder Folder where to save
 */
export const getScreenShotFromVideo = (videoPath: string, fileName: string, folder: string = mainConfig.MEDIA_PATH): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      ffmpeg(videoPath).takeScreenshots({
        count: 1,
        filename: fileName
      }, folder).on('end', () => {
        return resolve();
      });
    } catch (e) {
      console.log(e);
      reject(e);
    }
  });
};