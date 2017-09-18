import * as KoaRouter from 'koa-joi-router';
import { Context as AppContext } from './';
export interface JoiRouterDefinition {
    method: string;
    path: string;
    validate: any;
    handler: Function | Function[];
    meta: any;
}
/**
 * The generic Router class. Wraps around koa-router to provide some convenience function
 *
 * @export
 * @class Router
 */
export declare class Router {
    router: KoaRouter;
    prefix(): string;
    isAPI(): boolean;
    name(): string;
    description(): string;
    /**
     * Auth middleware to use on request. This middleware is called _before_ any routes in configure()
     *
     * @returns {RequestHandler}
     *
     * @memberof Router
     */
    auth(): void;
    /**
     * Permissions middleware. This must be invoked manually in configure() as we can't be sure at what stage
     * of the request permissions will need to be checked.
     *
     * @memberof Router
     */
    permissions(): IPermissionsHandler;
    querySet(ctx: Router.Context): Promise<any>;
    /**
     * Returns the underlying router's event listeners.
     * Used by the Route Loader to mount routes in the app.
     *
     * @returns {KoaRouter}
     *
     * @memberof Router
     */
    routes(): any;
    allowedMethods(): any;
    /**
     * Set the namespace for the route. All defined routes will lie behind this string.
     *
     * @returns {string}
     *
     * @memberof Router
     */
    namespace(): string;
    /**
     * Map your route handlers to the router object here.
     *
     * @param {KoaRouter<KoaRouter.Context>} router
     *
     * @memberof Router
     */
    configure(router: KoaRouter): void;
    constructor(router?: KoaRouter);
}
export declare namespace Router {
    type Context = AppContext;
    type Router = KoaRouter;
}
export interface IPermissionsHandler {
    (ctx: Router.Context, model?: any): Promise<boolean>;
}
export default Router;
