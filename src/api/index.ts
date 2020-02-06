import { Router } from 'express';

import AppTermRoutes from './appTerm';
import AuthRoutes    from './auth';
import CountryRoutes from './country';
import DeviceRoutes  from './device';
import NewsRoutes    from './news';
import UserRoutes    from './user';
import StaffRoutes   from './staff';
import SupportRoutes from './support';
import PartnerRoutes from './partner';
import PushRoutes    from './push';
import TopicRoutes   from './topic';
import MoviesRoutes  from './movie';

class Routes {
  public router = Router();

  constructor() {
    this.routes();
  }

  private routes () {
    this.router.use('/term',    AppTermRoutes);
    this.router.use('/auth',       AuthRoutes);
    this.router.use('/country', CountryRoutes);
    this.router.use('/device',   DeviceRoutes);
    this.router.use('/news',       NewsRoutes);
    this.router.use('/user',       UserRoutes);
    this.router.use('/staff',     StaffRoutes);
    this.router.use('/support', SupportRoutes);
    this.router.use('/partner', PartnerRoutes);
    this.router.use('/push',       PushRoutes);
    this.router.use('/topic',     TopicRoutes);
    this.router.use('/movie',    MoviesRoutes);
  }
}

export default new Routes().router;