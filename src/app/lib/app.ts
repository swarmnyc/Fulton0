//import * as Application from 'koa/lib/application';
import * as koa from 'koa';
import * as KoaRouter from 'koa-router';
import Router from './router';
import { Service } from './service';
import { ServiceLoader } from './service-loader';
import RequestHandler from './request-handler';
import { resolve } from 'path';
import { toArray as _toArray, map as _map, set as _set, get as _get, assign as _assign } from 'lodash';
import RouteLoader from './route-loader';
import Context from './context';
import { EventEmitter } from 'events';
import * as bodyParser from 'koa-bodyparser';
import * as conditional from 'koa-conditional-get';
import * as etag from 'koa-etag';

/**
 * Base App class
 * 
 * @export
 * @class App
 * @extends {EventEmitter}
 */
export class App extends EventEmitter {
  protected app: koa
  services: ServiceHash

  appRoot: string
  
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
    return true;
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

    this.app = new koa();
    this.services = {};
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
  didError(err: Error | string) {}

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

    app.on('error', this.didError);
        
    if (opts.loadServices === true) {
      await serviceLoader.load(this);
    }

    if (this.bodyParser() === true) {
      app.use(bodyParser());
    }

    if (this.etag() === true) {
      app.use(conditional());
      app.use(etag());
    }

    for (let middleware of this.middleware()) {
      app.use(middleware());
    }

    if (opts.loadServices === true && this.services['oauth']) {
      oauth = new KoaRouter();
      oauth.post(`/${this.services['oauth'].tokenEndpoint()}`, this.services['oauth'].token());
      app.use(oauth.routes());
    }
    
    if (opts.loadRoutes === true) {
      await routeLoader.load(this);
    }
    

    this.emit('didInit');

    return app;
  }
}

interface AppInitOptions {
  loadRoutes?: boolean
  loadServices?: boolean
}

interface ServiceHash {
  [K: string]: any
}

export default App