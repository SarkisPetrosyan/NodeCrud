import fetch from 'node-fetch';
import { fireBaseKeys } from './constants';
import DeviceSchema from '../schemas/device';
import { LanguageEnum, OsTypeEnum, NotificationTypeEnum } from './enums';
import NotificationTranslationSchema from '../schemas/notificationTranslation';

const sendAndroidGroupNotification = (tokenList: string[], data: { title: string, description: string, type: number, id?: string }): void => {
  const objNotification = {
    registration_ids: [],
    data: data
  };
  if (tokenList.length >= 1000) {
    objNotification.registration_ids = tokenList.splice(0, 999);
    sendNotificationToFireBase(objNotification).catch(e => console.log(e));
    sendAndroidGroupNotification(tokenList.slice(0, 999), data);
  } else {
    objNotification.registration_ids = tokenList;
    sendNotificationToFireBase(objNotification).catch(e => console.log(e));
  }
};

const sendIOSGroupNotification = (tokenList: string[], data: { title: string, description: string, type: number, id?: string }): void => {
  const objNotification = {
    registration_ids: [],
    notification: {
      ...data,
      body: data.description,
      badge: 1,
      'mutable-content': 1,
      sound: 'default'
    }
  };
  if (tokenList.length >= 1000) {
    objNotification.registration_ids = tokenList.splice(0, 999);
    sendNotificationToFireBase(objNotification).catch(e => console.log(e));
    sendIOSGroupNotification(tokenList.slice(0, 999), data);
  } else {
    objNotification.registration_ids = tokenList;
    sendNotificationToFireBase(objNotification).catch(e => console.log(e));
  }
};

/**
 * This function stringifies notification json object, and requests firebase to send notification
 * @param   {*} data
 * @returns {Promise<void>}
 */
async function sendNotificationToFireBase(data: any): Promise<void> {
  const body = JSON.stringify(data);
  const res = await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'Authorization': `key=${fireBaseKeys.serverKey}`,
      'Sender': `id=${fireBaseKeys.senderId}`
    },
    body
  }).then(res => res.json());
  if (res) {
    console.log(`Send notification success: ${res.success}, failure: ${res.failure}`);
  }
}

export async function sendCustomNotification(id: string, userIdList: string[], data: Array<{ language: number, title: string, description: string }>): Promise<void> {
  const dataHy = data.find(item => item.language === LanguageEnum.armenian);
  const dataRu = data.find(item => item.language === LanguageEnum.russian);
  const dataEn = data.find(item => item.language === LanguageEnum.english);
  const dataFr = data.find(item => item.language === LanguageEnum.french);
  const [ iosHy, isoRu, iosEn, iosFr, andHy, andRu, andEn, andFr ] = await Promise.all([
    await DeviceSchema.find({ deviceToken: { $ne: null }, user: { $in: userIdList }, language: LanguageEnum.armenian, osType: OsTypeEnum.ios }).distinct('deviceToken'),
    await DeviceSchema.find({ deviceToken: { $ne: null }, user: { $in: userIdList }, language: LanguageEnum.russian, osType: OsTypeEnum.ios }).distinct('deviceToken'),
    await DeviceSchema.find({ deviceToken: { $ne: null }, user: { $in: userIdList }, language: LanguageEnum.english, osType: OsTypeEnum.ios }).distinct('deviceToken'),
    await DeviceSchema.find({ deviceToken: { $ne: null }, user: { $in: userIdList }, language: LanguageEnum.french, osType: OsTypeEnum.ios }).distinct('deviceToken'),
    await DeviceSchema.find({ deviceToken: { $ne: null }, user: { $in: userIdList }, language: LanguageEnum.armenian, osType: OsTypeEnum.android }).distinct('deviceToken'),
    await DeviceSchema.find({ deviceToken: { $ne: null }, user: { $in: userIdList }, language: LanguageEnum.russian, osType: OsTypeEnum.android }).distinct('deviceToken'),
    await DeviceSchema.find({ deviceToken: { $ne: null }, user: { $in: userIdList }, language: LanguageEnum.english, osType: OsTypeEnum.android }).distinct('deviceToken'),
    await DeviceSchema.find({ deviceToken: { $ne: null }, user: { $in: userIdList }, language: LanguageEnum.french, osType: OsTypeEnum.android }).distinct('deviceToken')
  ]);
  if (dataHy) {
    if (iosHy.length) sendIOSGroupNotification(iosHy, { id, title: dataHy.title, description: dataHy.description, type: NotificationTypeEnum.custom });
    if (andHy.length) sendAndroidGroupNotification(andHy, { id, title: dataHy.title, description: dataHy.description, type: NotificationTypeEnum.custom });
  }
  if (dataRu) {
    if (isoRu.length) sendIOSGroupNotification(isoRu, { id, title: dataRu.title, description: dataRu.description, type: NotificationTypeEnum.custom });
    if (andRu.length) sendAndroidGroupNotification(andRu, { id, title: dataRu.title, description: dataRu.description, type: NotificationTypeEnum.custom });
  }
  if (dataEn) {
    if (iosEn.length) sendIOSGroupNotification(iosEn, { id, title: dataEn.title, description: dataEn.description, type: NotificationTypeEnum.custom });
    if (andEn.length) sendAndroidGroupNotification(andEn, { id, title: dataEn.title, description: dataEn.description, type: NotificationTypeEnum.custom });
  }
  if (dataFr) {
    if (iosFr.length) sendIOSGroupNotification(iosFr, { id, title: dataFr.title, description: dataFr.description, type: NotificationTypeEnum.custom });
    if (andFr.length) sendAndroidGroupNotification(andFr, { id, title: dataFr.title, description: dataFr.description, type: NotificationTypeEnum.custom });
  }
}