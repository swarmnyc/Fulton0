import RequestHandler from './request-handler';
import Context from './context';

export interface IRoute {
  urlPattern: string;
  method: string;
  handler: RequestHandler<Context>;
}

export default IRoute;
