import * as Joi from 'joi';
import { Response, NextFunction } from 'express';
import { IRequest } from '../model';
import { languageCount } from '../../services/constants';
import APIError from '../../services/APIError';
import { getErrorResponse, failedResponse } from '../response';
import { ICreateMovieBody } from './model';
import { languageValidation } from '../validation';

export const createMovie = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
        const body: ICreateMovieBody = req.body;

        const bodyValidationSchema = {
            
            translations: Joi.array().items(Joi.object().keys({
                language   : languageValidation.language,
                description: Joi.string().max(200).required(),
                title: Joi.string().max(200).required(),
            })).length(languageCount).unique('language').required()
        };

        const result = Joi.validate(body, bodyValidationSchema, { allowUnknown: true });
        if (result.error) {
            console.log(result.error)
          return res.send(failedResponse(result.error.details[0].message));
        }

        return next();
    }
    catch (e) {
        new APIError(e, 500, 'createMovie in movie/validation.ts');
        return res.status(500).send(getErrorResponse());
    }
}