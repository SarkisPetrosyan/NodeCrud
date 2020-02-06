import { IPartner } from '../../schemas/partner/model';

export interface IAddPartnerBody {
  avatar: Express.Multer.File;
  contactPerson: string;
  phone: string;
  translations: Array<{
    language: number;
    name: string;
  }>;
}

export interface IUpdatePartnerBody extends IAddPartnerBody {
  id: string;
  partner: IPartner;
}