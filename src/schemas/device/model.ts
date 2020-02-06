import { Document, Model } from 'mongoose';

interface IDeviceDocument<U = string> extends Document {
  user: U;
  language: number;
  osType: number;
  deviceId: string;
  deviceToken: string;
  createdDt: Date;
}

export interface IDevice<U = string> extends IDeviceDocument<U> {

}

export interface IDeviceModel extends Model<IDevice<any>> {

}