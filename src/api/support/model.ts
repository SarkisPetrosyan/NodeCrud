import { IPaginationQuery } from '../model';

export interface ISendSupportMessageBody {
  fullName: string;
  email: string;
  phoneNumber: string;
  message: string;
}

export interface IGetSupportMessageListBody extends IPaginationQuery {
  search: string;
  type: number;
  userType: number;
}