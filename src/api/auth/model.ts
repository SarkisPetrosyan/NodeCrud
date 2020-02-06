import { IUser } from '../../schemas/user/model';
import { IUserPassword } from '../../schemas/userPassword/model';

export interface ISendVerificationEmailBody {
  email: string;
  role: number;
  firstName: string;
  lastName: string;
  corporateName: string;
  taxNumber: string;
  osType: number;
  user: IUser;
}

export interface ICheckAuthCodeBody {
  type: number;
  email: string;
  code: string;
  user: IUser;
}

export interface IRegisterBody {
  osType: number;
  language: number;
  deviceId?: string;
  deviceToken?: string;
  email: string;
  code: string;
  password: string;
  user: IUser;
}

export interface ILocalLoginBody {
  osType: number;
  language: number;
  deviceId?: string;
  deviceToken?: string;
  email: string;
  password: string;
  user: IUser<IUserPassword>;
}

export interface ISocialLoginBody {
  osType: number;
  provider: number;
  token: string;
  language: number;
  deviceId: string;
  deviceToken: string;
}

export interface ISendRestoreEmailBody {
  email: string;
  osType: number;
}

export interface IRestoreAccountBody {
  osType: number;
  language: number;
  deviceId?: string;
  deviceToken?: string;
  email: string;
  code: string;
  password: string;
  user: IUser<IUserPassword>;
}