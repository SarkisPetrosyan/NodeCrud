import { Model, Document } from 'mongoose';

interface IRefreshTokenDocument<U = string> extends Document {
  user: U;
  token: string;
  provider: number;
  osType: number;
  uuid: string;
  updatedCount: number;
  expectedExpDt: Date;
  expDt: Date;
  expired: boolean;
  createdDt: Date;
  updatedDt: Date;
}

export interface IRefreshToken<U = string> extends IRefreshTokenDocument<U> {

}

export interface IRefreshTokenModel extends Model<IRefreshToken<any>> {
  assign(userId: string, userRole: number, osType: number, uuid: string): Promise<string>;
}