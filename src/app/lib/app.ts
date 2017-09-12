//import * as Application from 'koa/lib/application';
import * as dotenv from 'dotenv';
dotenv.config();
import * as Koa from 'koa';
import * as KoaRouter from 'koa-joi-router';
import { Router } from './router';
import { BaseLoggerService } from './services/logger';
import { ServiceLoader } from './service-loader';
import RequestHandler from './request-handler';
import { resolve } from 'path';
import RouteLoader from './route-loader';
import { Context } from 'koa';
import { EventEmitter } from 'events';
import * as _ from 'lodash';
import * as bodyParser from 'koa-bodyparser';
import * as conditional from 'koa-conditional-get';
import * as etag from 'koa-etag';
import * as docs from 'koa-docs';

const _set = _.set;
const _get = _.get;
const { Joi } = KoaRouter;

interface AppInitOptions {
  loadRoutes?: boolean
  loadServices?: boolean
}

interface ServiceHash {
  [K: string]: any
}

/**
 * Base App class
 * 
 * @export
 * @class App
 * @extends {EventEmitter}
 */
export class App extends EventEmitter {
  protected app: Koa;
  protected _groups: APIRouter[];
  log: BaseLoggerService;
  services: ServiceHash;

  appRoot: string;
  
  /**
   * Returns an array of request handler middlewares to apply to each incoming request before passing the request off to the router.
   * 
   * @returns {RequestHandler<Context>[]}
   * 
   * @memberOf App
   */
  middleware(): RequestHandler<Context>[] { 
    const m: RequestHandler<Context>[] = [];
    return m;
  }

  /**
   * Boolean indicating whether the app should apply bodyparser middleware
   * 
   * @returns {boolean}
   * 
   * @memberof App
   */
  bodyParser() {
    return false;
  }

  /**
   * Return true if the app should apply etag middleware
   * 
   * @returns {boolean}
   * 
   * @memberof App
   */
  etag() {
    return true;
  }
  
  /**
   * Creates an instance of App.
   * 
   * @param {AppConfig} [config] - Optional configuration settings for your app
   * 
   * @memberOf App
   */
  constructor() {
    super();
    this.appRoot = resolve(`${__dirname}/..`);

    this.app = new Koa();
    this.services = {};
    this._groups = [];
    this.on('didInit', this.didInit.bind(this));
  }

  /**
   * Returns event listener of underlying koa app
   * 
   * @returns { Listener }
   * 
   * @memberOf App
   */
  listener() {
    return this.app.callback();
  }

  /**
   * Event fired after init() is called. Replace with your own function
   * to fire an event after the app is ready
   * 
   * 
   * @memberOf App
  
   */
  didInit() {}

  /**
   * Fired when there is an error bubbled up through the request middleware
   * 
   * 
   * @param {Error|string} err - Error, if any, returned by app instance
   * 
   * @memberOf App
   */
  didError(err: Error | string, ctx?: Context) {}

  /**
   * Bind a middleware to the app
   * 
   * @param {RequestHandler<Context>} handler
   * 
   * @memberOf App
   */
  use(handler: RequestHandler<Context>) {
    this.app.use(handler);
  }

  /**
   * Sets options on the underlying Koa context object for use in requests 
   * 
   * @param {string} key - Key to set the value at
   * @param {*} value - The value to set
   * 
   * @memberOf App
   */
  set(key: string, value: any) {
    _set(this.app.context, key, value);
  }

  /**
   * Returns value bound to specified key in the app's context object
   * 
   * @param {string} key
   * @returns
   * 
   * @memberOf App
   */
  get(key: string) {
    return _get(this.app.context, key);
  }

  register(router: Router) {
    if (router.isAPI() === true) {
      this._groups.push({ groupName: router.name(), description: router.description(), prefix: router.prefix(), routes: router.router.routes });
    }
    this.use(router.routes());
  }

  apiGroups() {
    return this._groups;
  }
  /**
   * Returns a new Koa app instance with routes and services loaded into the app 
   * 
   * @returns {Application}
   * 
   * @memberOf App
   */
  async init(opts: AppInitOptions = { loadRoutes: true, loadServices: true }) {
    const app = this.app;
    const serviceLoader = new ServiceLoader();
    const routeLoader = new RouteLoader();
    let oauth: any;

    app.on('error', this.didError.bind(this));
        
    if (opts.loadServices === true) {
      await serviceLoader.load(this);
    }

    if (this.bodyParser() === true) {
      app.use(bodyParser());
    }

    if (this.services['log']) {
      this.log = this.services['log'];
    }

    if (opts.loadServices === true && this.services['oauth']) {
      oauth = new KoaRouter();
      oauth.route(this.services['oauth'].getRoute());
      this._groups.push({ groupName: "Token", description: "OAuth Authentication", prefix: "", routes: oauth.routes });
      app.use(oauth.middleware());
    }

    if (this.etag() === true) {
      app.use(conditional());
      app.use(etag());
    }

    for (let middleware of this.middleware()) {
      app.use(middleware());
    }

    if (opts.loadRoutes === true) {
      routeLoader.load(this);
    }

    app.use(docs.get('/api/docs', {
      title: `${this.constructor.name} API`,
      version: `1.0.0`,
      theme: 'lumen',
      routeHandlers: 'disabled',
      groups: this.apiGroups()
    }));

    this.emit('didInit');
    return app;
  }
}

interface APIRouter {
  groupName: string
  description?: string
  prefix: string
  routes: KoaRouter
}

export default App
