import * as fs from 'fs';

import { IAddPartnerBody, IUpdatePartnerBody } from './model';
import PartnerSchema from '../../schemas/partner';
import PartnerTranslationSchema from '../../schemas/partnerTranslation';
import { mediaPaths, languageCount } from '../../services/constants';
import { getMimeType, deleteFiles } from '../../services/utilities';
import mainConfig from '../../env';
import { IResponseModel } from '../model';
import { succeedResponse, failedResponse } from '../response';
import { IPartner } from '../../schemas/partner/model';
import { IPartnerTranslation } from '../../schemas/partnerTranslation/model';
import { LanguageEnum } from '../../services/enums';

export const addPartner = async(body: IAddPartnerBody): Promise<void> => {
  const partner = new PartnerSchema();
  partner.phone = body.phone || null;
  partner.contactPerson = body.contactPerson || null;
  partner.translations = await PartnerTranslationSchema.insertMany(body.translations.map(item => {
    return {
      partner : partner._id,
      language: item.language,
      name    : item.name
    };
  }));
  if (fs.existsSync(body.avatar.path)) {
    const fileName = `${mediaPaths.photos}${Date.now()}-${partner._id}.${getMimeType(body.avatar.originalname)}`;
    fs.renameSync(body.avatar.path, mainConfig.MEDIA_PATH + fileName);
    partner.image = fileName;
  }
  await partner.save();
};

export const updatePartner = async(body: IUpdatePartnerBody): Promise<void> => {
  const partner = body.partner;
  await PartnerTranslationSchema.deleteMany({ partner: partner._id });
  partner.phone = body.phone || null;
  partner.contactPerson = body.contactPerson || null;
  const translations: any = await PartnerTranslationSchema.insertMany(body.translations.map(item => {
    return {
      partner: partner._id,
      language: item.language,
      name: item.name
    };
  }));
  partner.translations = translations;
  if (body.avatar && fs.existsSync(body.avatar.path)) {
    deleteFiles([partner.image], true);
    const fileName = `${mediaPaths.photos}${Date.now()}-${partner._id}.${getMimeType(body.avatar.originalname)}`;
    fs.renameSync(body.avatar.path, mainConfig.MEDIA_PATH + fileName);
    partner.image = fileName;
  }
  await partner.save();
};

export const getPartnerListForAdmin = async(body: { pageNo: number, limit: number, search: string }): Promise<IResponseModel> => {
  const filter: any = {
    deleted: false
  };
  if (body.search) {
    const idList = await PartnerTranslationSchema.find({ name: new RegExp(body.search, 'i') }).distinct('partner');
    filter.$or = [
      { _id: { $in: idList } },
      { phone: new RegExp(body.search, 'i') },
      { contactPerson: new RegExp(body.search, 'i') }
    ];
  }
  const itemCount = await PartnerSchema.countDocuments(filter);
  if (!itemCount) return succeedResponse('Got', { itemList: [], itemCount, pageCount: 0 });
  const pageCount = Math.ceil(itemCount / body.limit);
  if (body.pageNo > pageCount) return failedResponse('Too high pageNo');
  const skip = (body.pageNo - 1) * body.limit;
  const list: Array<IPartner<IPartnerTranslation>> = await PartnerSchema.find(filter).sort({ createdDt: -1 }).skip(skip).limit(body.limit).populate('translations');
  const itemList = list.map(item => {
    const english = item.translations.find(fItem => fItem.language === LanguageEnum.english);
    return {
      _id          : item._id,
      name         : english ? english.name          : null,
      avatar       : mainConfig.BASE_URL + item.image,
      phone        : item.phone,
      contactPerson: item.contactPerson,
      initiator    : 0                                        // TODO
    };
  });
  return succeedResponse('Got', { itemList, itemCount, pageCount });
};

export const deletePartner = async(partner: IPartner): Promise<void> => {
  partner.deleted = true;
  await partner.save();
};

export const getPartnerDetails = (partner: IPartner<IPartnerTranslation>): any => {
  return {
    avatar: mainConfig.BASE_URL + partner.image,
    contactPerson: partner.contactPerson,
    phone: partner.phone,
    translations: partner.translations.map(item => {
      return {
        language: item.language,
        name: item.name
      };
    })
  };
};