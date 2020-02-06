import { IDevice } from '../../schemas/device/model';

export interface ISetDeviceTokenForDeviceBody {
  deviceId: string;
  deviceToken: string;
  device: IDevice;
}

export interface ISetDeviceLanguageBody {
  language: number;
  deviceId: string;
  device: IDevice;
}