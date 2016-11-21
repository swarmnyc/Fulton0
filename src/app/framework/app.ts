import * as Application from 'koa/lib/application';
import * as koa from 'koa';
import Router from './router';
import CallbackFunction from './callback';
import RequestHandler from './request-handler';
import * as async from 'async';
import { resolve } from 'path';
import { set as _set, get as _get } from 'lodash';
import ConfigLoader from './config-loader';
import ServiceLoader from './service-loader';
import RouteLoader from './route-loader';
import Context from './context';
import { EventEmitter } from 'events';

interface AppConfig {
  [K: string]: any
}

export class App extends EventEmitter {
  app: Application
  config: AppConfig
  appRoot: string
  get middlewares() { 
    const m: RequestHandler<Context>[] = [];
    return m;
  }

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

  set(key: string, value: any) {
    _set(this.app.context, key, value);
  }

  get(key: string) {
    return _get(this.app.context, key);
  }

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
    for (let middleware of this.middlewares) {
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
