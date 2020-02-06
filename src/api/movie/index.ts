import { Router, Request, Response } from 'express';

import * as Service from './service';
import * as Validation from './validation';

import APIError from '../../services/APIError';
import { getErrorResponse, succeedResponse } from '../response';
import { IRequest } from '../model';

class MoviesRoutes {

    public router = Router();

    constructor() {
        this.routes();
    }

    private routes() {

        /** POST api/news - Functionality for admins to create movie */
        this.router.post('/', Validation.createMovie, this.createMovie);
        this.router.get('/', this.getMovieList);
    }

    private createMovie = async (req: IRequest, res: Response) => {
        try {
            const response = await Service.createMovie(req.body);
            res.send(succeedResponse('ok', response));
        } catch (e) {
            new APIError(e, 500, 'createMovie in movie/service.ts');
            res.status(500).send(getErrorResponse());
        }
    }

    private getMovieList = async (req: IRequest, res: Response) => {
        try {
            const response = await Service.getMovieList(req.query);
            res.send(succeedResponse('ok', response));
        } catch (e) {
            new APIError(e, 500, 'createMovie in movie/service.ts');
            res.status(500).send(getErrorResponse());
        }
    }
}

export default new MoviesRoutes().router;