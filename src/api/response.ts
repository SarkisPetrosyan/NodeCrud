import { IResponseModel } from './model';

export const succeedResponse = (message: string, data: any = null): IResponseModel => {
  const response: IResponseModel = { success: true, message, data };
  return response;
};

export const failedResponse = (message: string, data: any = null): IResponseModel => {
  const response: IResponseModel = { success: false, message, data };
  return response;
};

export const getErrorResponse = (): IResponseModel => {
  const response: IResponseModel = { success: false, message: 'Something went wrong', data: null };
  return response;
};