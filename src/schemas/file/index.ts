import * as mongoose from 'mongoose';
import { MediaTypeEnum } from '../../services/enums';
import { schemaReferences, mediaPaths } from '../../services/constants';
import { IFileModel, IFile } from './model';
import { getScreenShotFromVideo, deleteFiles } from '../../services/utilities';
import mainConfig from '../../env';

const Schema = mongoose.Schema;

const schema = new Schema({
  news: {
    type: Schema.Types.ObjectId,
    ref: schemaReferences.news,
    default: null
  },
  topic: {
    type: Schema.Types.ObjectId,
    ref: schemaReferences.topic,
    default: null
  },
  type: {
    type: Number,
    enum: MediaTypeEnum,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  coverPath: {
    type: String,
    default: null
  },
  originalName: {
    type: String,
    default: null
  }
});

schema.statics.setVideoCover = async function(id: string): Promise<void> {
  const _this: IFileModel = this;
  const file = await _this.findOne({
    _id: id,
    type: MediaTypeEnum.video
  });
  if (file) {
    const coverPath = mediaPaths.photos + `${Date.now()}-${id}`;
    await getScreenShotFromVideo(mainConfig.MEDIA_PATH + file.path, coverPath);
    file.coverPath = coverPath + '.png';
    await file.save();
  }
};

schema.statics.deleteFiles = async function(idList: string[]): Promise<void> {
  const _this: IFileModel = this;
  const filter = { _id: { $in: idList } };
  const list = await _this.find(filter);
  const deletePathList = [];
  list.forEach(item => {
    deletePathList.push(item.path);
    if (item.coverPath) deletePathList.push(item.coverPath);
  });
  deleteFiles(deletePathList, true);
  await _this.deleteMany(filter);
};

const FileSchema: IFileModel = mongoose.model<IFile<any, any>, IFileModel>(schemaReferences.file, schema);
export default FileSchema;