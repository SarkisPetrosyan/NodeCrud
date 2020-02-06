import * as express from 'express';
import * as cors from 'cors';
import * as morgan from 'morgan';
import * as helmet from 'helmet';
import * as methodOverride from 'method-override';
import * as swaggerUi from 'swagger-ui-express';

import APIError from './services/APIError';
import mainConfig from './env';
import { getErrorResponse } from './api/response';

import routes from './api';

import PhotoRoutes from './api/photos';
import VideoRoutes from './api/videos';

class Server {
  public app = express();

  constructor() {
    this.config();
    this.routes();
  }

  private config () {

    this.app.use(cors());

    this.app.use(morgan('dev'));

    this.app.use(express.json(), (err, req: express.Request, res: express.Response, next: express.NextFunction) => {
      // Handling wrong json
      if (err && err.status === 400) return res.status(400).send(err.type);
    });

    this.app.use(express.urlencoded({ extended: true }));

    this.app.use(methodOverride());

    this.app.use(helmet());

    this.app.use('/', express.static(mainConfig.MEDIA_PATH));
    this.app.use('/photos', PhotoRoutes);
    this.app.use('/videos', VideoRoutes);

    const swaggerDoc = require('../swagger.json');
    this.app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

  }

  private routes () {

    this.app.get('/', (req: express.Request, res: express.Response) => {
      res.send('ok from 2Gather ' + mainConfig.NODE_ENV);
    });

    this.app.use('/api', routes);

    this.app.use((err, req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (!(err instanceof APIError)) {
        new APIError(err, 500, 'Unknown error');
      }
      res.status(500).send(getErrorResponse());
    });

    this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
      res.status(404).json({
        success: false,
        message: 'API not found'
      });
    });

  }

}

export default new Server().app;