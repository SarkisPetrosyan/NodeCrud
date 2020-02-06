import { ICreateNewsBody, INewsAdminDetails, IGetNewsListForAdminBody, IChangeNewsStatusBody, IUpdateNewsBody, IGetNewsListQuery, IGetNewsDetailsQuery } from './model';
import NewsSchema from '../../schemas/news';
import NewsTranslationSchema from '../../schemas/newsTranslation';
import { NewsStatusEnum, MediaTypeEnum, LanguageEnum } from '../../services/enums';
import FileSchema from '../../schemas/file';
import { getMimeType, getScreenShotFromVideo, deleteFiles } from '../../services/utilities';

import * as fs from 'fs';
import mainConfig from '../../env';
import { mediaPaths } from '../../services/constants';
import { INews } from '../../schemas/news/model';
import { INewsTranslation } from '../../schemas/newsTranslation/model';
import { IFile } from '../../schemas/file/model';
import { IResponseModel } from '../model';
import { succeedResponse, failedResponse } from '../response';

export const createNews = async(body: ICreateNewsBody): Promise<void> => {
  const news = new NewsSchema({
    status: body.status,
    publishDt: body.status == NewsStatusEnum.active ? new Date() : null
  });
  news.translations = await NewsTranslationSchema.insertMany(body.translations.map(item => {
    return {
      ...item,
      news: news._id
    };
  }));
  // Files
  const mainFileName = mediaPaths.photos + `${Date.now()}-${news._id}.${getMimeType(body.mainFile.originalname)}`;
  fs.renameSync(body.mainFile.path, mainConfig.MEDIA_PATH + mainFileName);
  const mainFile = new FileSchema({
    news        : news._id,
    type        : MediaTypeEnum.photo,
    originalName: body.mainFile.originalname,
    path        : mainFileName
  });
  news.mainImage = mainFile._id;
  const files = [];
  await Promise.all(body.files.map(async (item, index) => {
    const mimeType = item.mimetype.slice(0, 5);
    let fileName = `${index}${Date.now()}-${news._id}.${getMimeType(item.originalname)}`;
    let mediaType = mimeType === 'video' ? MediaTypeEnum.video : MediaTypeEnum.photo;
    if (mimeType === 'video') {
      mediaType = MediaTypeEnum.video;
      fileName = mediaPaths.videos + fileName;
    } else {
      mediaType = MediaTypeEnum.photo;
      fileName = mediaPaths.photos + fileName;
    }
    fs.renameSync(item.path, mainConfig.MEDIA_PATH + fileName);
    const file = new FileSchema({
      news        : news._id,
      type        : mediaType,
      originalName: item.originalname,
      path        : fileName
    });
    files.push(file._id);
    await file.save();
    if (mediaType === MediaTypeEnum.video) {
      FileSchema.setVideoCover(file._id).catch(e => console.log(e));
    }
  }));
  news.files = files;
  await Promise.all([
    news.save(),
    mainFile.save()
  ]);
};

export const getNewsListForAdmin = async(body: IGetNewsListForAdminBody): Promise<IResponseModel> => {
  const filter: any = {};
  if (body.search) {
    const key = body.search.trim();
    if (key) {
      const idList = await NewsTranslationSchema.find({
        $or: [
          { name: new RegExp(key, 'i') },
          { description: new RegExp(key, 'i') }
        ]
      }).distinct('news');
      filter._id = { $in: idList };
    }
  }
  const itemCount = await NewsSchema.countDocuments(filter);
  if (!itemCount) return succeedResponse('Got', { itemList: [], itemCount, pageCount: 0 });
  const pageCount = Math.ceil(itemCount / body.limit);
  if (body.pageNo > pageCount) return failedResponse('Too high page no');
  const skip = (body.pageNo - 1) * body.limit;
  const list: Array<INews<INewsTranslation, string, string>> = await NewsSchema.find(filter).sort({ createdDt: -1 }).populate('translations').skip(skip).limit(body.limit);
  const itemList = list.map(item => {
    const english = item.translations.find(fItem => fItem.language === LanguageEnum.english);
    return {
      _id: item._id,
      name: english ? english.name : null,
      publishDt: item.publishDt,
      viewCount: item.viewCount,
      status: item.status
    };
  });
  return succeedResponse('Got', { itemList, itemCount, pageCount });
};

export const changeNewsStatus = async(body: IChangeNewsStatusBody): Promise<void> => {
  if (body.status === NewsStatusEnum.active && !body.news.publishDt) {
    body.news.publishDt = new Date();
  }
  body.news.status = body.status;
  await body.news.save();
};

export const deleteNews = async(news: INews<INewsTranslation, IFile, IFile>): Promise<void> => {
  const pathList = [news.mainImage.path];
  news.files.forEach(item => {
    pathList.push(item.path);
    if (item.coverPath) pathList.push(item.coverPath);
  });
  deleteFiles(pathList);
  await Promise.all([
    NewsTranslationSchema.deleteMany({ news: news._id }),
    FileSchema.deleteMany({ news: news._id }),
    news.remove()
  ]);
};

export const getNewsDetailsForAdmin = (news: INews<INewsTranslation, IFile, IFile>): INewsAdminDetails => {
  const details: INewsAdminDetails = {
    _id: news._id,
    status: news.status,
    translations: news.translations.map(item => {
      return {
        language   : item.language,
        name       : item.name,
        description: item.description
      };
    }),
    files: [{
      _id      : news.mainImage._id,
      main     : true,
      type     : MediaTypeEnum.photo,
      path     : mainConfig.BASE_URL + news.mainImage.path,
      coverPath: null
    }]
  };
  news.files.forEach(file => {
    details.files.push({
      _id      : file.id,
      main     : false,
      type     : file.type,
      path     : mainConfig.BASE_URL + file.path,
      coverPath: file.coverPath ? mainConfig.BASE_URL + file.coverPath : null
    });
  });
  return details;
};

export const updateNews = async(body: IUpdateNewsBody): Promise<void> => {
  const news = body.news;
  if (body.status === NewsStatusEnum.active) {
    news.status = body.status;
    if (!news.publishDt) news.publishDt = new Date();
  }
  await NewsTranslationSchema.deleteMany({ news: news._id });
  const translations: any = await NewsTranslationSchema.insertMany(body.translations.map(item => {
    return {
      language   : item.language,
      name       : item.name,
      description: item.description,
      news       : news._id
    };
  }));
  news.translations = translations;
  const newsFileIdList = news.files.map(item => item._id.toString());
  if (body.mainFile) {
    const oldMainFile = news.mainImage;
    if (body.deleteList && body.deleteList.includes(oldMainFile._id.toString())) {
      deleteFiles([oldMainFile.path], true);
      await oldMainFile.remove();
    } else {
      newsFileIdList.push(oldMainFile._id);
    }
    const mainFileName = mediaPaths.photos + `${Date.now()}-${news._id}.${getMimeType(body.mainFile.originalname)}`;
    fs.renameSync(body.mainFile.path, mainConfig.MEDIA_PATH + mainFileName);
    const mainFile = new FileSchema({
      news        : news._id,
      type        : MediaTypeEnum.photo,
      originalName: body.mainFile.originalname,
      path        : mainFileName
    });
    await mainFile.save();
    news.mainImage = mainFile._id;
  } else {
    // Main file id is given
    const changed = body.mainId !== news.mainImage._id.toString();
    if (changed) {
      const index = newsFileIdList.indexOf(body.mainId);
      if (body.deleteList && body.deleteList.includes(news.mainImage._id.toString())) {
        deleteFiles([news.mainImage.path], true);
        await news.mainImage.remove();
      } else {
        newsFileIdList.push(news.mainImage._id);
      }
      news.mainImage = news.files[index];
      newsFileIdList.splice(index, 1);
    }
  }
  const deletePathList = [];
  if (body.deleteList) {
    for (let i = 0; i < body.deleteList.length; i++) {
      const index = newsFileIdList.indexOf(body.deleteList[i]);
      if (index > -1) {
        const file = news.files[index];
        deletePathList.push(file.path);
        if (file.coverPath) deletePathList.push(file.coverPath);
        await file.remove();
        newsFileIdList.splice(index, 1);
      }
    }
  }
  deleteFiles(deletePathList, true);
  await Promise.all(body.files.map(async (item, index) => {
    const mimeType = item.mimetype.slice(0, 5);
    let fileName = `${index}${Date.now()}-${news._id}.${getMimeType(item.originalname)}`;
    let mediaType = mimeType === 'video' ? MediaTypeEnum.video : MediaTypeEnum.photo;
    if (mimeType === 'video') {
      mediaType = MediaTypeEnum.video;
      fileName = mediaPaths.videos + fileName;
    } else {
      mediaType = MediaTypeEnum.photo;
      fileName = mediaPaths.photos + fileName;
    }
    fs.renameSync(item.path, mainConfig.MEDIA_PATH + fileName);
    const file = new FileSchema({
      news        : news._id,
      type        : mediaType,
      originalName: item.originalname,
      path        : fileName
    });
    if (mediaType === MediaTypeEnum.video) {
      const coverPath = mediaPaths.photos + `${Date.now()}-${file._id}`;
      await getScreenShotFromVideo(mainConfig.MEDIA_PATH + file.path, coverPath);
      file.coverPath = coverPath + '.png';
    }
    newsFileIdList.push(file._id);
    await file.save();
  }));
  news.files = newsFileIdList;
  await news.save();
};

export const getNewsList = async(query: IGetNewsListQuery): Promise<IResponseModel> => {
  const filter = {
    status: NewsStatusEnum.active
  };
  const itemCount = await NewsSchema.countDocuments(filter);
  if (!itemCount) return succeedResponse('Got', { itemCount, itemList: [], pageCount: 0 });
  const pageCount = Math.ceil(itemCount / query.limit);
  if (query.pageNo > pageCount) return failedResponse('Too high pageNo');
  const skip = (query.pageNo - 1) * query.limit;
  const itemList = await NewsSchema.getList(skip, query.limit, query.language);
  return succeedResponse('Got', { itemCount, itemList, pageCount });
};

export const getNewsDetails = (query: IGetNewsDetailsQuery) => {
  const news = query.news;
  const translation = news.translations.find(item => item.language === query.language);
  const details = {
    _id        : news._id,
    name       : translation.name,
    description: translation.description,
    publishDt  : news.publishDt,
    files: [{
      type: MediaTypeEnum.photo,
      coverPath: null,
      path: mainConfig.BASE_URL + news.mainImage.path
    }]
  };
  news.files.forEach(item => {
    details.files.push({
      type: item.type,
      coverPath: item.coverPath ? mainConfig.BASE_URL + item.coverPath : null,
      path: mainConfig.BASE_URL + item.path
    });
  });
  return details;
};