import * as KoaRouter  from 'koa-router';
import * as Application from 'koa/lib/application';
import { get as _get, forEach as _forEach, isNil as _isNil } from 'lodash'; 
import { RequestHandler } from './request-handler';

export class Router {
  router: KoaRouter

  protected prefix(): string {
    const namespace = this.namespace();
    return (!!namespace) ? `/${namespace}` : '';
  };

    /**
   * Auth middleware to use on request
   * 
   * @returns {RequestHandler}
   * 
   * @memberof Router
   */
  auth() {
    return function*(next: any) {
      yield next;
    }
  }

  /**
   * Returns the underlying router's event listeners.
   * Used by the Route Loader to mount routes in the app.
   * 
   * @returns {KoaRouter}
   * 
   * @memberOf Router
   */
  routes() {
    return this.router.routes();
  }

  allowedMethods() {
    return this.router.allowedMethods();
  }

  /**
   * Set the namespace for the route. All defined routes will lie behind this string.
   * 
   * @returns {string}
   * 
   * @memberOf Router
   */
  namespace(): string {
    return undefined;
  }

/**
 * Map your route handlers to the router object here.
 * 
 * @param {KoaRouter<KoaRouter.Context>} router
 * 
 * @memberOf Router
 */
  configure(router: KoaRouter) {}

  constructor() {
    this.router = new KoaRouter({ prefix: this.prefix()});
    this.router.use(this.auth());
    this.configure(this.router);
  }
}

export default Router;
