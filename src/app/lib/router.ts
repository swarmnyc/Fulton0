import * as KoaRouter  from 'koa-router';
import * as Application from 'koa/lib/application';
import { get as _get, forEach as _forEach, isNil as _isNil } from 'lodash'; 
import { RequestHandler } from './request-handler';

export class Router { 
  router: KoaRouter<KoaRouter.Context>

  protected prefix(): string {
    const namespace = this.namespace();
    return (!!namespace) ? `/${namespace}` : '';
  };

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
  configure(router: KoaRouter<KoaRouter.Context>) {   
    
  }

  constructor() {
    this.router = new KoaRouter({ prefix: this.prefix()});
    this.configure(this.router);
  }
}

export default Router;
