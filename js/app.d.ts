/// <reference types="node" />
import * as Koa from 'koa';
import * as KoaRouter from 'koa-joi-router';
import { Router } from './router';
import { BaseLoggerService } from './services/logger';
import RequestHandler from './request-handler';
import { Service } from './service';
import { Context } from 'koa';
import { EventEmitter } from 'events';
export interface AppInitOptions {
    loadRoutes?: boolean;
    loadServices?: boolean;
}
export interface ServiceHash {
    [K: string]: any;
}
/**
 * Base App class
 *
 * @export
 * @class App
 * @extends {EventEmitter}
 */
export declare class App extends EventEmitter {
    protected app: Koa;
    _groups: APIRouter[];
    log: BaseLoggerService;
    _services: ServiceHash;
    appRoot: string;
    routers(): typeof Router[];
    services(): typeof Service[];
    oauthModels(): typeof Service[];
    /**
     * Returns an array of request handler middlewares to apply to each incoming request before passing the request off to the router.
     *
     * @returns {RequestHandler<Context>[]}
     *
     * @memberOf App
     */
    middleware(): RequestHandler<Context>[];
    /**
     * Boolean indicating whether the app should apply bodyparser middleware
     *
     * @returns {boolean}
     *
     * @memberof App
     */
    bodyParser(): boolean;
    /**
     * Return true if the app should apply etag middleware
     *
     * @returns {boolean}
     *
     * @memberof App
     */
    etag(): boolean;
    /**
     * Creates an instance of App.
     *
     * @param {AppConfig} [config] - Optional configuration settings for your app
     *
     * @memberOf App
     */
    constructor();
    /**
     * Returns event listener of underlying koa app
     *
     * @returns { Listener }
     *
     * @memberOf App
     */
    listener(): Function;
    /**
     * Event fired after init() is called. Replace with your own function
     * to fire an event after the app is ready
     *
     *
     * @memberOf App
    
     */
    didInit(): void;
    /**
     * Fired when there is an error bubbled up through the request middleware
     *
     *
     * @param {Error|string} err - Error, if any, returned by app instance
     *
     * @memberOf App
     */
    didError(err: Error | string, ctx?: Context): void;
    /**
     * Bind a middleware to the app
     *
     * @param {RequestHandler<Context>} handler
     *
     * @memberOf App
     */
    use(handler: RequestHandler<Context>): void;
    /**
     * Sets options on the underlying Koa context object for use in requests
     *
     * @param {string} key - Key to set the value at
     * @param {*} value - The value to set
     *
     * @memberOf App
     */
    set(key: string, value: any): void;
    /**
     * Returns value bound to specified key in the app's context object
     *
     * @param {string} key
     * @returns
     *
     * @memberOf App
     */
    get(key: string): {};
    register(router: Router): void;
    apiGroups(): APIRouter[];
    customSetUp(app: Koa): Promise<void>;
    /**
     * Returns a new Koa app instance with routes and services loaded into the app
     *
     * @returns {Application}
     *
     * @memberOf App
     */
    init(opts?: AppInitOptions): Promise<Koa>;
}
export interface APIRouter {
    groupName: string;
    description?: string;
    prefix: string;
    routes: KoaRouter;
}
export default App;
