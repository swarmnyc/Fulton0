//import * as Application from 'koa/lib/application';
import * as koa from 'koa';
import * as KoaRouter from 'koa-router';
import Router from './router';
import { Service } from './service';
import RequestHandler from './request-handler';
import { resolve } from 'path';
import { set as _set, get as _get, assign as _assign } from 'lodash';
import ConfigLoader from './config-loader';
import ServiceLoader from './service-loader';
import RouteLoader from './route-loader';
import Context from './context';
import { EventEmitter } from 'events';
import * as bodyParser from 'koa-bodyparser';

/**
 * Configuration object for an app instance
 * 
 * @interface AppConfig
 */
interface AppConfig {
  [K: string]: any
}

interface AppInitOptions {
  loadRoutes?: boolean
  loadServices?: boolean
  loadConfig?: boolean
}

interface ServiceHash {
  [N: string]: any
}

/**
 * Base App class
 * 
 * @export
 * @class App
 * @extends {EventEmitter}
 */
export class App extends EventEmitter {
  protected app: koa
  protected config: AppConfig
  services: ServiceHash

  appRoot: string
  
  middleware(): RequestHandler<Context>[] { 
    const m: RequestHandler<Context>[] = [];
    return m;
  }

  bodyParser() {
    return true;
  }
  
  /**
   * Creates an instance of App.
   * 
   * @param {AppConfig} [config] - Optional configuration settings for your app
   * 
   * @memberOf App
   */
  constructor(config?: AppConfig) {
    super();
    this.appRoot = resolve(`${__dirname}/..`);

    if (config) {
      this.config = config;
    }

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
  async init(opts: AppInitOptions = { loadConfig: true, loadRoutes: true, loadServices: true }) {
    const app = this.app;
    const configLoader = new ConfigLoader();
    const serviceLoader = new ServiceLoader();
    const routeLoader = new RouteLoader();
    let config: AppConfig;
    let oauth: any;

    app.on('error', this.didError);

    if (opts.loadConfig === true) {
      config = await configLoader.load(this);
      if (this.config) {
        this.config = _assign(this.config, config);
      } else { 
        this.config = config;
      }
      this.set('config', this.config);
    }
    
    if (opts.loadServices === true) {
      await serviceLoader.load(this);
    }

    if (this.bodyParser() === true) {
      app.use(bodyParser());
    }

    for (let middleware of this.middleware()) {
      app.use(middleware());
    }

    if (opts.loadServices === true && !!_get(this.config, 'OAuth.enabled') && !!this.services['oauth']) {
      oauth = new KoaRouter();
      oauth.post(`/${_get(this.config, 'OAuth.tokenEndpoint') || 'token'}`, this.services['oauth'].grant());
      app.use(oauth.routes());
    }
    
    if (opts.loadRoutes === true) {
      await routeLoader.load(this);
    }
    

    this.emit('didInit');

    return app;
  }
}

export default App
