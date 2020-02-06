import { IUserPassword } from '../../schemas/userPassword/model';
import { IPaginationQuery } from '../model';

export interface IUpdateUserBody {
  firstName: string; // User
  lastName: string;  // User
  birthDate: Date;   // User
  gender: number;    // User
  fullName: string;        // Corporate
  taxNumber: string;       // Corporate
  contactPerson: string;   // Corporate
  phoneNumber: string; // Both
  countryId: string;   // Both
  deleteAvatar: boolean; // Both
  avatar: Express.Multer.File;
  language: number;
}

export interface IChangePasswordBody {
  oldPassword: string;
  newPassword: string;
  localPassword: IUserPassword;
}

export interface IGetUserListForAdminBody extends IPaginationQuery {
  search: string;
  role: number;
  country: string;
  status: number;
}

export interface IGetUserCountByFilters {
  filters: Array<{
    search: string;
    role: number;
    country: string;
    status: number;
  }>;
}