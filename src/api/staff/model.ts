import { IStaff } from '../../schemas/staff/model';

export interface ICreateStaffMemberBody {
  translations: Array<{
    language: number;
    name: string;
    occupation: string;
    description: string;
  }>;
  facebookAccount: string;
  twitterAccount: string;
  linkedInAccount: string;
}

export interface IUpdateStaffMemberStatusBody {
  id: string;
  status: number;
  staffMember: IStaff;
}

export interface IUpdateStaffMemberBody extends ICreateStaffMemberBody {
  id: string;
  staffMember: IStaff;
}