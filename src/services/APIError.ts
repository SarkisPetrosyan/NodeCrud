// import Slack from './slacker';
import mainConfig from '../env';

class ExtendableError extends Error {

  public status: number;
  public info: string;

  constructor(message, status, info) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    this.status = status;
    this.info = info;
    Error.captureStackTrace(this);
  }
}

class APIError extends ExtendableError {
  constructor(message, status = 500, info = null) {
    super(message, status, info);
    if (this.status !== 400 && this.status !== 401 && this.status !== 404) {
      console.error(this.info);
      console.error(this.message);
    }
    if (this.status !== 400 && this.status !== 401 && this.status !== 404 && mainConfig.NODE_ENV === 'production') {
      // new Slack(this.message);
    }
  }
}

export default APIError;