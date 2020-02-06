import { Document, Model } from 'mongoose';

interface IFileDocument<N = string, T = string> extends Document {
  news: N;
  topic: T;
  type: number;
  path: string;
  coverPath: string;
  originalName: string;
}

export interface IFile<N = string, T = string> extends IFileDocument<N, T> {

}

export interface IFileModel extends Model<IFile<any, any>> {
  setVideoCover(id: string): Promise<void>;
  deleteFiles(idList: string[]): Promise<void>;
}