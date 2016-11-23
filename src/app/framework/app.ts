import * as Application from 'koa/lib/application';
import * as koa from 'koa';
import Router from './router';
import CallbackFunction from './callback';
import RequestHandler from './request-handler';
import { resolve } from 'path';
import { set as _set, get as _get } from 'lodash';
import ConfigLoader from './config-loader';
import ServiceLoader from './service-loader';
import RouteLoader from './route-loader';
import Context from './context';
import { EventEmitter, Listener } from 'events';
import * as bodyParser from 'koa-bodyparser';

/**
 * Configuration object for an app instance
 * 
 * @interface AppConfig
 */
interface AppConfig {
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
  app: Application
  config: AppConfig
  appRoot: string
  middlewares() { 
    const m: RequestHandler<Context>[] = [];
    return m;
  }

  bodyParser() {
    return true;
  }
  
  /**
   * Creates an instance of App.
   * 
   * @param {AppConfig} [config]
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
   * Fired after init() is called
   * 
   * 
   * @memberOf App
  
   */
  didInit() {
    
  }

  /**
   * Fired when there is an error bubbled up through the request middleware
   * 
   * 
   * @param {*} [err] - Error, if any, returned by app instance
   * 
   * @memberOf App
   */
  onErrorRequest(err?: any) {
    console.error('Error processing request:');
    console.error(err);
  }

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
  async init() {
    console.info('app.init() called');
    const app = this.app;
    const configLoader = new ConfigLoader();
    const serviceLoader = new ServiceLoader();
    const routeLoader = new RouteLoader();

    console.info('Loading config...');
    this.set('config', await configLoader.load(this));

    console.info('Loading services...');
    await serviceLoader.load(this);

    console.info('Loading middlewares...');
    if (this.bodyParser() === true) {
      app.use(bodyParser());
    }

    for (let middleware of this.middlewares()) {
      app.use(middleware);
    }

    console.info('Loading routes...');
    await routeLoader.load(this);
    
    app.on('error', this.onErrorRequest);
    this.emit('didInit');
    return app;
  }
}

export default App
