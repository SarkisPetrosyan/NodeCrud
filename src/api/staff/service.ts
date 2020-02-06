import * as fs from 'fs';

import { ICreateStaffMemberBody, IUpdateStaffMemberStatusBody, IUpdateStaffMemberBody } from './model';
import StaffSchema from '../../schemas/staff';
import StaffTranslationSchema from '../../schemas/staffTranslation';
import { getMimeType, deleteFiles } from '../../services/utilities';
import mainConfig from '../../env';
import { mediaPaths } from '../../services/constants';
import { IResponseModel } from '../model';
import { succeedResponse, failedResponse } from '../response';
import { IStaff } from '../../schemas/staff/model';
import { IStaffTranslation } from '../../schemas/staffTranslation/model';
import { LanguageEnum, StaffStatusEnum } from '../../services/enums';

export const createStaffMember = async(body: ICreateStaffMemberBody, file: Express.Multer.File): Promise<void> => {
  const staffMember = new StaffSchema({
    twitterAccount : body.twitterAccount || null,
    facebookAccount: body.facebookAccount || null,
    linkedInAccount: body.linkedInAccount || null,
  });
  staffMember.translations = await StaffTranslationSchema.insertMany(body.translations.map(item => {
    return {
      language: item.language,
      name: item.name,
      occupation: item.occupation,
      description: item.description,
      staff: staffMember._id
    };
  }));
  const fileName = `${mediaPaths.photos}${Date.now()}-${staffMember._id}.${getMimeType(file.originalname)}`;
  fs.renameSync(file.path, mainConfig.MEDIA_PATH + fileName);
  staffMember.image = fileName;
  await staffMember.save();
};

export const getStaffMemberListForAdmin = async(body: { pageNo: number, limit: number, search: string }): Promise<IResponseModel> => {
  const filter: any = {};
  if (body.search) {
    const idList = await StaffTranslationSchema.find({
      $or: [
        { name: new RegExp(body.search, 'i') },
        { occupation: new RegExp(body.search, 'i') },
        { description: new RegExp(body.search, 'i') }
      ]
    }).distinct('staff');
    filter._id = { $in: idList };
  }
  const itemCount = await StaffSchema.countDocuments(filter);
  if (!itemCount) return succeedResponse('Got', { itemList: [], itemCount, pageCount: 0 });
  const pageCount = Math.ceil(itemCount / body.limit);
  if (body.pageNo > pageCount) return failedResponse('Too high pageNo');
  const skip = (body.pageNo - 1) * body.limit;
  const list: Array<IStaff<IStaffTranslation>> = await StaffSchema.find(filter).populate('translations').sort('-createdDt').skip(skip).limit(body.limit);
  const itemList = list.map(item => {
    const translation = item.translations.find(fItem => fItem.language === LanguageEnum.english);
    return {
      _id            : item._id,
      name           : translation ? translation.name : null,
      occupation     : translation ? translation.occupation : null,
      description    : translation ? translation.description : null,
      image          : mainConfig.BASE_URL + item.image,
      status         : item.status,
      facebookAccount: item.facebookAccount,
      twitterAccount : item.twitterAccount,
      linkedInAccount: item.linkedInAccount,
      createdDt      : item.createdDt
    };
  });
  return succeedResponse('Got', { itemList, itemCount, pageCount });
};

export const updateStaffMemberStatus = async(body: IUpdateStaffMemberStatusBody): Promise<void> => {
  body.staffMember.status = body.status;
  await body.staffMember.save();
};

export const deleteStaffMember = async(staffMember: IStaff<IStaffTranslation>): Promise<void> => {
  deleteFiles([staffMember.image], true);
  await Promise.all([
    StaffTranslationSchema.deleteMany({ _id: staffMember.translations }),
    staffMember.remove()
  ]);
};

export const getStaffMemberDetailsForAdmin = async(staffMember: IStaff<IStaffTranslation>) => {
  return {
    _id: staffMember._id,
    image: mainConfig.BASE_URL + staffMember.image,
    facebookAccount: staffMember.facebookAccount,
    twitterAccount: staffMember.twitterAccount,
    linkedInAccount: staffMember.linkedInAccount,
    translations: staffMember.translations.map(item => {
      return {
        language   : item.language,
        name       : item.name,
        occupation : item.occupation,
        description: item.description,
      };
    })
  };
};

export const updateStaffMember = async(body: IUpdateStaffMemberBody, file: Express.Multer.File): Promise<void> => {
  const staffMember = body.staffMember;
  if (file) {
    deleteFiles([staffMember.image], true);
    if (fs.existsSync(file.path)) {
      const fileName = `${mediaPaths.photos}${Date.now()}-${staffMember._id}.${getMimeType(file.originalname)}`;
      fs.renameSync(file.path, mainConfig.MEDIA_PATH + fileName);
      staffMember.image = fileName;
    }
  }
  await StaffTranslationSchema.deleteMany({ _id: { $in: staffMember.translations } });
  const translations: any = await StaffTranslationSchema.insertMany(body.translations.map(item => {
    return {
      staff: staffMember._id,
      language: item.language,
      name: item.name,
      occupation: item.occupation,
      description: item.description
    };
  }));
  staffMember.translations = translations;
  staffMember.twitterAccount = body.twitterAccount || null;
  staffMember.facebookAccount = body.facebookAccount || null;
  staffMember.linkedInAccount = body.linkedInAccount || null;
  await staffMember.save();
};

export const getStaffList = async(query: { language: number, limit: number, pageNo: number }): Promise<IResponseModel> => {
  const filter = {
    status: StaffStatusEnum.active
  };
  const itemCount = await StaffSchema.countDocuments(filter);
  if (!itemCount) return succeedResponse('Got', { itemList: [], itemCount, pageCount: 0 });
  const pageCount = Math.ceil(itemCount / query.limit);
  if (query.pageNo > pageCount) return failedResponse('Too high pageNo');
  const skip = (query.pageNo - 1) * query.limit;
  const list: Array<IStaff<IStaffTranslation>> = await StaffSchema.find(filter).populate('translations').sort('-createdDt').skip(skip).limit(query.limit);
  const itemList = list.map(item => {
    const translation = item.translations.find(fItem => fItem.language === query.language);
    return {
      _id            : item._id,
      name           : translation ? translation.name : null,
      occupation     : translation ? translation.occupation : null,
      description    : translation ? translation.description : null,
      image          : mainConfig.BASE_URL + item.image,
      facebookAccount: item.facebookAccount,
      twitterAccount : item.twitterAccount,
      linkedInAccount: item.linkedInAccount
    };
  });
  return succeedResponse('Got', { itemList, itemCount, pageCount });
};