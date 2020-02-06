import * as fs from 'fs';

import TopicCategorySchema from '../../schemas/topicCategory';
import TopiCategoryTranslationSchema from '../../schemas/topicCategoryTranslation';
import { ITopicCategory } from '../../schemas/topicCategory/model';
import { ITopicCategoryTranslation } from '../../schemas/topicCategoryTranslation/model';
import { LanguageEnum, MediaTypeEnum, TopicStatusEnum, UserTopicSortEnum, TopicActionTypeEnum, UserRoleEnum } from '../../services/enums';
import { IUpdateTopicCategoryBody, IAddTopicBody, IGetUsersTopicListQuery, IGetTopicDetailsForUserQuery, IUpdateTopicBody } from './model';
import TopicSchema from '../../schemas/topic';
import { IUser } from '../../schemas/user/model';
import TopicAddressSchema from '../../schemas/topicAddress';
import { getCityNameFromMapByGoogleMaps } from '../../services/geo';
import { getMimeType, deleteFiles } from '../../services/utilities';
import { mediaPaths } from '../../services/constants';
import mainConfig from '../../env';
import FileSchema from '../../schemas/file';
import { ITopic } from '../../schemas/topic/model';
import { IFile } from '../../schemas/file/model';
import { IResponseModel } from '../model';
import { succeedResponse, failedResponse } from '../response';
import TopicActionSchema from '../../schemas/topicAction';
import { ITopicAddress } from '../../schemas/topicAddress/model';

export const addTopicCategory = async(body: { translations: Array<{ name: string, language: number }> }): Promise<void> => {
  const category = new TopicCategorySchema();
  category.translations = await TopiCategoryTranslationSchema.insertMany(body.translations.map(item => {
    return {
      ...item,
      category
    };
  }));
  await category.save();
};

export const getTopicCategoryListForAdmin = async(): Promise<Array<{ _id: string, name: string, topicCount: number }>> => {
  const list: Array<ITopicCategory<ITopicCategoryTranslation>> = await TopicCategorySchema.find({ deleted: false }).populate('translations');
  return list.map(item => {
    const en = item.translations.find(fItem => fItem.language === LanguageEnum.english);
    return {
      _id: item._id,
      topicCount: item.topicCount,
      name: en ? en.name : ''
    };
  });
};

export const updateTopicCategory = async(body: IUpdateTopicCategoryBody): Promise<void> => {
  await TopiCategoryTranslationSchema.deleteMany({ category: body.category._id });
  body.category.translations = await TopiCategoryTranslationSchema.insertMany(body.translations.map(item => {
    return {
      ...item,
      category: body.category._id
    };
  }));
  await body.category.save();
};

export const deleteTopicCategory = async(category: ITopicCategory): Promise<void> => {
  category.deleted = true;
  await category.save();
};

export const getTopicCategoryListForAll = async(language: number): Promise<Array<{ id: string, name: string }>> => {
  let languageValue = language;
  if (isNaN(languageValue)) languageValue = LanguageEnum.english;
  return await TopicCategorySchema.getAvailableList(languageValue);
};

export const addTopic = async(body: IAddTopicBody, user: IUser): Promise<void> => {
  const { category } = body;
  category.topicCount++;
  const newTopic = new TopicSchema({
    category   : body.category._id,
    title      : body.title,
    description: body.description,
    amount     : body.amount || null,
    createdBy  : user._id
  });
  const { address, city } = await getCityNameFromMapByGoogleMaps(body.lat, body.lng);
  const topicAddress = new TopicAddressSchema({
    topic   : newTopic._id,
    rAddress: body.address,
    lat     : body.lat,
    lng     : body.lng,
    gStreet : address,
    gCity   : city,
    point   : {
      coordinates: [body.lng, body.lat]
    }
  });
  newTopic.address = topicAddress._id;
  newTopic.files = await setTopicFiles(newTopic._id, body.files);
  await Promise.all([
    category.save(),
    topicAddress.save(),
    newTopic.save()
  ]);
};

export const getSameTopicsByAddress = async(query: { language: number, lat: number, lng: number }): Promise<any> => {
  const { city, address } = await getCityNameFromMapByGoogleMaps(query.lat, query.lng);
  console.log(city + ', ' + address);
  const filter: any = {
    // status: TopicStatusEnum.published
  };
  if (city === 'Yerevan' || city === 'Gyumri' || city === 'Vanadzor') {
    const distance = 1000; // meters
    const idList = await TopicAddressSchema.getNearestTopics(query.lat, query.lng, distance);
    if (address) {
      filter.$or = [
        { gAddress: address, city },
        { _id: { $in: idList } }
      ];
    } else {
      filter._id = { $in: idList };
    }
  } else {
    const idList = await TopicAddressSchema.find({ gCity: city }).distinct('topic');
    filter._id = { $in: idList };
  }
  const list: Array<ITopic<string, string, IFile, string>> = await TopicSchema.find(filter).populate('files').sort({ voteCount: -1 });
  const itemList = list.map(item => {
    return {
      _id: item._id,
      title: item.title,
      image: mainConfig.BASE_URL + item.files[0].path,
      date: item.updatedDt
    };
  });
  return itemList;
};

export const deleteTopic = async(topic: ITopic<string, string, IFile, string>, isAdmin: boolean): Promise<void> => {
  // Decrement category, Delete address, Delete files
  // ! TODO Add comment deleting here when ready
  // ! TODO Send notification when admin deletes topic
  const deleteList = [];
  topic.files.map(item => {
    deleteList.push(item.path);
    if (item.coverPath) deleteList.push(item.coverPath);
  });
  deleteFiles(deleteList, true);
  await Promise.all([
    topic.remove(),
    TopicAddressSchema.deleteOne({ topic: topic._id }),
    TopicCategorySchema.updateOne({ _id: topic.category }, { $inc: { topicCount: -1 } })
  ]);
};

export const getUsersTopicList = async(query: IGetUsersTopicListQuery, user: IUser): Promise<IResponseModel> => {
  const filter = {
    createdBy: user._id
  };
  let sort;
  const itemCount = await TopicSchema.countDocuments(filter);
  if (!itemCount) return succeedResponse('Got', { itemList: [], itemCount, pageCount: 0 });
  const pageCount = Math.ceil(itemCount / query.limit);
  if (query.pageNo > pageCount) return failedResponse('Too high page No');
  const skip = (query.pageNo - 1) * query.limit;
  if (!query.sortBy || query.sortBy === UserTopicSortEnum.date) {
    sort = { updatedDt: - 1 };
  } else if (query.sortBy === UserTopicSortEnum.view) {
    sort = { seenCount: - 1, updatedDt: -1 };
  } else {
    sort = { voteCount: - 1, updatedDt: -1 };
  }
  const list: Array<ITopic<string, string, IFile, string>> = await TopicSchema.find(filter).sort(sort).skip(skip).limit(query.limit).populate('files');
  const itemList = list.map(item => {
    return {
      _id         : item._id,
      image       : mainConfig.BASE_URL + item.files[0].path,
      title       : item.title,
      description : item.description,
      status      : item.status,
      seenCount   : item.seenCount,
      voteCount   : item.voteCount,
      amount      : item.amount,
      commentCount: 0, // ! TODO Change this
      date        : item.updatedDt
    };
  });
  return succeedResponse('Got', { itemList, itemCount, pageCount });
};

export const getTopicDetailsForAll = async(query: IGetTopicDetailsForUserQuery, topic: ITopic<string, ITopicAddress, IFile, IUser>, user?: IUser) => {
  const { isCreator } = query;
  const details = {
    _id  : topic._id,
    files: topic.files.map(item => {
      return {
        _id      : item._id,
        type     : item.type,
        path     : mainConfig.BASE_URL + item.path,
        coverPath: item.coverPath ? mainConfig.BASE_URL + item.coverPath : null
      };
    }),
    creator: {
      id    : topic.createdBy._id,
      name  : topic.createdBy.fullName,
      avatar: topic.createdBy.avatar ? mainConfig.BASE_URL + topic.createdBy.avatar : null
    },
    address     : topic.address.rAddress,
    lat         : topic.address.lat,
    lng         : topic.address.lng,
    date        : topic.updatedDt,
    title       : topic.title,
    categoryId  : topic.category,
    categoryName: '',
    description : topic.description,
    voteCount   : topic.voteCount,
    seenCount   : topic.seenCount,
    commentCount: 0 // ! TODO Change this
  };
  const categoryTranslation = await TopiCategoryTranslationSchema.findOne({ category: topic.category, language: query.language });
  if (categoryTranslation) details.categoryName = categoryTranslation.name;
  const permissions = {
    delete: false,
    edit  : false,
    vote  : false
  };
  if (isCreator) {
    if (topic.status === TopicStatusEnum.pending) permissions.delete = true;
    else if (topic.status === TopicStatusEnum.rejected) {
      permissions.delete = true;
      permissions.edit = true;
    }
  } else if (user) {
    const voted = await TopicActionSchema.findOne({ user: user._id, type: TopicActionTypeEnum.vote, topic: topic._id });
    if (!voted) permissions.vote = true;
  }
  // Setting View count update
  if (topic.status === TopicStatusEnum.published) {
    if (user && !isCreator) {
      const view = await TopicActionSchema.findOne({ user: user._id, type: TopicActionTypeEnum.view, topic: topic._id });
      if (!view) {
        topic.seenCount++;
        await Promise.all([
          TopicActionSchema.create({ user: user._id, type: TopicActionTypeEnum.view, topic: topic._id }),
          topic.save()
        ]);
      }
    } else if (query.uniqueId && !user) {
      const view = await TopicActionSchema.findOne({ uniqueId: query.uniqueId, type: TopicActionTypeEnum.view, topic: topic._id });
      if (!view) {
        topic.seenCount++;
        await Promise.all([
          TopicActionSchema.create({ uniqueId: query.uniqueId, type: TopicActionTypeEnum.view, topic: topic._id }),
          topic.save()
        ]);
      }
    }
  }
  return { details, permissions };
};

export const updateTopic = async(body: IUpdateTopicBody, userRole: number): Promise<void> => {
  const { topic, category } = body;
  const [ { address, city } ] = await Promise.all([
    getCityNameFromMapByGoogleMaps(body.lat, body.lng),
    TopicCategorySchema.updateOne({ _id: topic.category }, { $inc: { topicCount: -1 } }),
    TopicAddressSchema.deleteOne({ _id: topic.address })
  ]);
  category.topicCount++;
  topic.category = body.category._id;
  topic.title = body.title;
  topic.description = body.description;
  topic.amount = body.amount || null;
  let fileIdList = topic.files.map(item => item.toString());
  if (body.deleteFiles) {
    const deleteIdList = [];
    body.deleteFiles.forEach(item => {
      const index = fileIdList.indexOf(item);
      if (index > -1) {
        fileIdList.splice(index, 1);
        deleteIdList.push(item);
      }
    });
    FileSchema.deleteFiles(deleteIdList).catch(e => console.log(e));
  }
  if (body.files) {
    const idList = await setTopicFiles(topic._id, body.files);
    fileIdList = fileIdList.concat(idList);
  }
  // If first media file is not image, get first image, set it as first item of the files array, replace id list and save
  const firstFile = await FileSchema.findById(fileIdList[0]);
  if (firstFile.type !== MediaTypeEnum.photo) {
    const foundFirstImage = await FileSchema.findOne({ _id: { $in: fileIdList }, type: MediaTypeEnum.photo });
    const index = fileIdList.indexOf(foundFirstImage._id.toString());
    fileIdList.splice(index, 1);
    topic.files = [ foundFirstImage._id, ...fileIdList ];
  } else {
    topic.files = fileIdList;
  }
  // If userRole is not admin, change status to pending
  if (userRole !== UserRoleEnum.admin && userRole !== UserRoleEnum.superAdmin) {
    topic.status = TopicStatusEnum.pending;
  }
  const topicAddress = new TopicAddressSchema({
    topic   : topic._id,
    rAddress: body.address,
    lat     : body.lat,
    lng     : body.lng,
    gStreet : address,
    gCity   : city,
    point   : {
      coordinates: [body.lng, body.lat]
    }
  });
  topic.address = topicAddress._id;
  await Promise.all([
    category.save(),
    topic.save(),
    topicAddress.save()
  ]);
};

async function setTopicFiles(topicId: string, files: Array<Express.Multer.File>): Promise<string[]> {
  const idList = [];
  await Promise.all(files.map(async (item, index) => {
    const mimeType = item.mimetype.slice(0, 5);
    let fileName = `${index}${Date.now()}-${topicId}.${getMimeType(item.originalname)}`;
    let mediaType;
    if (mimeType === 'video') {
      mediaType = MediaTypeEnum.video;
      fileName = mediaPaths.videos + fileName;
    } else {
      mediaType = MediaTypeEnum.photo;
      fileName = mediaPaths.photos + fileName;
    }
    fs.renameSync(item.path, mainConfig.MEDIA_PATH + fileName);
    const file = new FileSchema({
      topic       : topicId,
      type        : mediaType,
      originalName: item.originalname,
      path        : fileName
    });
    idList.push(file._id);
    await file.save();
    if (mediaType === MediaTypeEnum.video) {
      FileSchema.setVideoCover(file._id).catch(e => console.log(e));
    }
  }));
  return idList;
}