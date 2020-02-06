import { Document, Model } from 'mongoose';

interface ITopicAddressDocument<T = string> extends Document {
  topic: T;
  rAddress: string;
  lat: number;
  lng: number;
  gStreet: string;
  gCity: string;
  point: {
    type: string;
    coordinates: Array<number>;
  };
}

export interface ITopicAddress<T = string> extends ITopicAddressDocument<T> {

}

export interface ITopicAddressModel extends Model<ITopicAddress<any>> {
  getNearestTopics(lat: number, lng: number, distance: number): Promise<any>;
}