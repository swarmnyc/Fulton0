import * as koaRouter  from 'koa-router';
import * as Application from 'koa/lib/application';
import { get as _get, forEach as _forEach } from 'lodash'; 
import RequestHandler from './request-handler';
import Route from './route';
import Context from './context';

interface RouterOptions {
  prefix: string
}

export class Router {
  router: koaRouter<koaRouter.Context>
  beforeAll() {
    const r: RequestHandler<Context>[] = [];
    return r;
  }
  routes() {
    const router = this.router;
    const _this = this;    
    return router.routes();
  }

  constructor(options?: RouterOptions) {
    this.router = new koaRouter(options);
  }

  setRoute(route: Route) {
    let handlers: RequestHandler<Context>[];
    let premiddleware: RequestHandler<Context>[];
    let method = route.method.toLowerCase();
    let beforeMiddleware = this.beforeAll();

    console.info(`Initializing route ${route.urlPattern} on ${route.method}`);

    if (beforeMiddleware && beforeMiddleware.length) {
      premiddleware = beforeMiddleware.slice().reverse();
    }

    if (Array.isArray(route.handler)) {
      handlers = route.handler;
    } else {
      handlers = [route.handler];
    }

    if (premiddleware && premiddleware.length > 0) {
      premiddleware.forEach((pm) => {
        handlers.unshift(pm);
      });
    }

    switch (method) {
      case 'get':
        this.router.get(route.urlPattern, route.handler);
        break;

      case 'put':
        this.router.put(route.urlPattern, route.handler);
        break;

      case 'patch':
        this.router.patch(route.urlPattern, route.handler);
        break;

      case 'post':
        this.router.post(route.urlPattern, route.handler);
        break;

      case 'delete':
        this.router.del(route.urlPattern, route.handler);
        break;

      default:
        throw new Error(`Unrecognized method for route: ${method}`);
    }    
  }
}

export default Router;
