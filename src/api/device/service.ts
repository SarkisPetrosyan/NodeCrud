import { ISetDeviceTokenForDeviceBody, ISetDeviceLanguageBody } from './model';

export const setDeviceTokenForDevice = async(body: ISetDeviceTokenForDeviceBody): Promise<void> => {
  body.device.deviceToken = body.deviceToken;
  await body.device.save();
};

export const setDeviceLanguage = async(body: ISetDeviceLanguageBody): Promise<void> => {
  body.device.language = body.language;
  await body.device.save();
};