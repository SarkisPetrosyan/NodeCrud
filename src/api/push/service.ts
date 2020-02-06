import UserNotificationSchema        from '../../schemas/userNotification';
import NotificationSchema            from '../../schemas/notification';
import NotificationTranslationSchema from '../../schemas/notificationTranslation';

import { ISendPushBody, IGetPushListForAdmin, IGetPushListForUserQuery } from './model';
import { NotificationTypeEnum, LanguageEnum } from '../../services/enums';
import { sendCustomNotification } from '../../services/pusher';
import { IResponseModel } from '../model';
import { succeedResponse, failedResponse } from '../response';
import { INotification } from '../../schemas/notification/model';
import { INotificationTranslation } from '../../schemas/notificationTranslation/model';
import { IUser } from '../../schemas/user/model';
import { IUserNotification } from '../../schemas/userNotification/model';

export const sendPush = async(body: ISendPushBody): Promise<void> => {
  const notification = new NotificationSchema({
    userCount: body.userIdList.length
  });
  notification.translations = await NotificationTranslationSchema.insertMany(body.translations.map(item => {
    return {
      notification: notification._id,
      ...item
    };
  }));
  await Promise.all([
    notification.save(),
    UserNotificationSchema.insertMany(body.userIdList.map(item => {
      return {
        type: NotificationTypeEnum.custom,
        receiver: item,
        notification: notification._id
      };
    }))
  ]);
  sendCustomNotification(notification._id, body.userIdList, body.translations).catch(e => console.log(e));
};

export const getPushListForAdmin = async(body: IGetPushListForAdmin): Promise<IResponseModel> => {
  const filter: any = {};
  if (body.search) {
    const key = body.search.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '').trim();
    const idList = await NotificationTranslationSchema.find({
      title: new RegExp(key, 'i'),
      description: new RegExp(key, 'i')
    });
    filter._id = { $in: idList };
  }
  const itemCount = await NotificationSchema.countDocuments(filter);
  if (!itemCount) return succeedResponse('Got', { itemList: [], itemCount, pageCount: 0 });
  const pageCount = Math.ceil(itemCount / body.limit);
  if (body.pageNo > pageCount) return failedResponse('Too high pageNo');
  const skip = (body.pageNo - 1) * body.limit;
  const list: Array<INotification<INotificationTranslation>> = await NotificationSchema.find(filter)
    .populate('translations')
    .sort({ createdDt: -1 })
    .skip(skip)
    .limit(body.limit);
  const itemList = await Promise.all(list.map(async item => {
    const english = item.translations.find(fItem => fItem.language === LanguageEnum.english);
    const seenCount = await UserNotificationSchema.countDocuments({ notification: item._id, seen: true });
    return {
      _id        : item._id,
      title      : english ? english.title : null,
      description: english ? english.description : null,
      seenCount,
      userCount: item.userCount,
      createdDt: item.createdDt
    };
  }));
  return succeedResponse('Got', { itemCount, itemList, pageCount });
};

export const getPushListForUser = async(query: IGetPushListForUserQuery, user: IUser): Promise<IResponseModel> => {
  const filter = { receiver: user._id };
  const itemCount = await UserNotificationSchema.countDocuments(filter);
  if (query.skip >= itemCount) return failedResponse('Too high skip');
  const list = await UserNotificationSchema.find(filter).sort({ createdDt: -1 }).skip(query.skip).limit(query.limit);
  const itemList = await Promise.all(list.map(async item => {
    let translation;
    if (item.type === NotificationTypeEnum.custom) {
      translation = await NotificationTranslationSchema.findOne({ notification: item.notification, language: query.language });
    } else {
      // TODO translation will be get from static translations of the types notifications
    }
    return {
      _id        : item._id,
      image      : item.type === NotificationTypeEnum.custom ? null : '',   // TODO Get from topic, send, etc...
      title      : translation ? translation.title : '',
      description: translation ? translation.description : '',
      seen       : item.seen,
      createdDt  : item.createdDt
    };
  }));
  UserNotificationSchema.updateMany({ _id: { $in: list.map(item => item._id) } }, { seen: true }).catch(e => console.log(e));
  return succeedResponse('Got', { itemList, pagesLeft: query.skip + query.limit < itemCount });
};

export const setUserNotificationSeen = async(userNotification: IUserNotification): Promise<void> => {
  userNotification.seen = true;
  await userNotification.save();
};

export const getUserNotificationBadge = async(userId: string): Promise<number> => {
  return await UserNotificationSchema.countDocuments({ receiver: userId, seen: false });
};