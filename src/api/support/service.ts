import { ISendSupportMessageBody, IGetSupportMessageListBody } from './model';
import { IUser } from '../../schemas/user/model';
import SupportMessageSchema from '../../schemas/supportMessage';
import { IResponseModel } from '../model';
import { ISupportMessage } from '../../schemas/supportMessage/model';
import { SupportMessageListTypeEnum, SupportMessageListUserTypeEnum, UserRoleEnum } from '../../services/enums';
import { deflateRaw } from 'zlib';

export const sendSupportMessage = async(body: ISendSupportMessageBody, user: IUser): Promise<void> => {
  const message = new SupportMessageSchema(body);
  if (user) {
    message.user = user._id;
    message.userType = user.role;
  }
  await message.save();
};

export const getSupportMessageList = async(body: IGetSupportMessageListBody): Promise<IResponseModel> => {
  const filter: any = {};
  if (body.type === SupportMessageListTypeEnum.important) {
    filter.important = true;
  } else if (body.type === SupportMessageListTypeEnum.unread) {
    filter.seen = false;
  }
  switch (body.userType) {
    case SupportMessageListUserTypeEnum.user: {
      filter.userType = UserRoleEnum.user;
      break;
    }
    case SupportMessageListUserTypeEnum.corporate: {
      filter.userType = UserRoleEnum.corporate;
      break;
    }
    case SupportMessageListUserTypeEnum.notRegistered: {
      filter.userType = null;
      break;
    }
    default: break;
  }
  if (body.search) {
    const key = body.search.trim();
    filter.$or = [
      { fullName: new RegExp(key, 'i') },
      { email: new RegExp(key, 'i') },
      { phoneNumber: new RegExp(key, 'i') },
      { message: new RegExp(key, 'i') },
    ];
  }
  const itemCount = await SupportMessageSchema.countDocuments(filter);
  if (!itemCount) return {
    success: true,
    message: 'got',
    data: { itemCount, itemList: [], pageCount: 0 }
  };
  const pageCount = Math.ceil(itemCount / body.limit);
  if (body.pageNo > pageCount) return {
    success: false,
    message: 'Too high',
    data: null
  };
  const skip = (body.pageNo - 1) * body.limit;
  const itemList = await SupportMessageSchema.find(filter).sort({ createdDt: -1 }).skip(skip).limit(body.limit).select({
    _id: 1,
    userType: 1,
    fullName: 1,
    email: 1,
    user: 1,
    phoneNumber: 1,
    createdDt: 1,
    seen: 1,
    important: 1
  });
  return {
    success: true,
    message: 'got',
    data: { itemCount, itemList, pageCount }
  };
};

export const getSupportMessage = async(message: ISupportMessage): Promise<any> => {
  message.seen = true;
  await message.save();
  return {
    _id: message._id,
    fullName: message.fullName,
    email: message.email,
    phoneNumber: message.phoneNumber,
    message: message.message,
    important: message.important,
    createdDt: message.createdDt
  };
};

export const reverseMessageImportance = async(message: ISupportMessage): Promise<void> => {
  message.important = !message.important;
  await message.save();
};

export const getUnseenSupportMessageCount = async(): Promise<number> => {
  return await SupportMessageSchema.countDocuments({ seen: false });
};

export const setSupportMessageSeen = async(supportMessage: ISupportMessage): Promise<void> => {
  supportMessage.seen = true;
  await supportMessage.save();
};