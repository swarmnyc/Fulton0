import * as KoaRouter  from 'koa-joi-router';
import * as Application from 'koa/lib/application';
import { RequestHandler } from './request-handler';
import { Context as AppContext } from './'

/**
 * The generic Router class. Wraps around koa-router to provide some convenience function
 * 
 * @export
 * @class Router
 */
export class Router {
  router: KoaRouter;

  prefix(): string {
    const namespace = this.namespace();
    return (!!namespace) ? `/${namespace}` : '';
  };

  isAPI(): boolean {
    return false;
  }

  name(): string {
    return this.constructor.name;
  }

  description(): string {
    return;
  }

  /**
   * Auth middleware to use on request. This middleware is called _before_ any routes in configure()
   * 
   * @returns {RequestHandler}
   * 
   * @memberof Router
   */
  auth() {
    return;
  }

  /**
   * Permissions middleware. This must be invoked manually in configure() as we can't be sure at what stage
   * of the request permissions will need to be checked.
   * 
   * @memberof Router
   */
  permissions(): IPermissionsHandler {
    return async function(ctx: Router.Context, model?: any) {
      return true;
    }
  }

  async querySet(ctx: Router.Context): Promise<any> {
    return ctx.query;
  }

  /**
   * Returns the underlying router's event listeners.
   * Used by the Route Loader to mount routes in the app.
   * 
   * @returns {KoaRouter}
   * 
   * @memberof Router
   */
  routes() {
    return this.router.middleware();
  }

  allowedMethods() {
    return this.router.allowedMethods();
  }

  /**
   * Set the namespace for the route. All defined routes will lie behind this string.
   * 
   * @returns {string}
   * 
   * @memberof Router
   */
  namespace(): string {
    return undefined;
  }

/**
 * Map your route handlers to the router object here.
 * 
 * @param {KoaRouter<KoaRouter.Context>} router
 * 
 * @memberof Router
 */
  configure(router: KoaRouter) {
  }

  constructor(router: KoaRouter = KoaRouter()) {
    this.router = router;
    this.router.prefix(this.prefix());
    if (this.auth()) {
      this.router.use(this.auth());
    }

    this.configure(this.router);
  }
}

export namespace Router {
  export type Context = AppContext
  export type Router = KoaRouter
}


interface IPermissionsHandler {
  (ctx: Router.Context, model?: any): Promise<boolean>
}

export default Router;
