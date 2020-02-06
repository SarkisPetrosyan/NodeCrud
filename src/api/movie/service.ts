import { ICreateMovieBody, IGetMovieListQuery } from "./model";
import MovieSchema from "../../schemas/movie";
import MovieTranslationSchema from "../../schemas/movieTranslation";
import { IResponseModel, IPaginationQuery } from "../model";
import { succeedResponse, failedResponse } from "../response";

export const createMovie = async (body: ICreateMovieBody): Promise<void> => {
    const movie = new MovieSchema({});
    movie.translations = await MovieTranslationSchema.insertMany(
        body.translations.map(item => {
            return {
                ...item,
                movie: movie._id
            };
        }));

    await movie.save();
};

export const getMovieList = async(query: IGetMovieListQuery): Promise<IResponseModel> => {
    console.log(query)   ;
    const itemCount = await MovieSchema.countDocuments();
    if (!itemCount) return succeedResponse('Got', { itemCount, itemList: [], pageCount: 0 });
    const pageCount = Math.ceil(itemCount / query.limit);
    if (query.pageNo > pageCount) return failedResponse('Too high pageNo');
    const skip = (query.pageNo - 1) * query.limit;
   
    const itemList = await MovieSchema.find().populate('translations');
    return succeedResponse('Got', { itemCount, itemList, pageCount });
  };