import * as fs from 'fs-extra';
import App from './app';
import { join, resolve, extname } from 'path';
import { promisify } from 'bluebird';
import { assign, spread } from 'lodash';

/**
 * Configuration Loader that reads config.ts file and returns it to the app.
 * 
 * @export
 * @class ConfigLoader
 */
export class ConfigLoader {
  path: string
  defaultPath = 'config.js'
  appRoot: string

  constructor() {
    const env = process.env['NODE_ENV'] || '';
    this.path = 'config' + (env ? `.${env}` : '') + `.js`;
  }

  /**
   * Loads config file
   * 
   * @param {App} app
   * @returns {any} config - AppConfig object
   * 
   * @memberOf ConfigLoader
   */
  async load(app: App) {
    this.appRoot = app.appRoot;
    const files = await this.find();
    return this.action(app, files);
  }

  /**
   * Finds config file, returning the absolute path to object on filesystem
   * 
   * @returns {string} absPath - Absolute path of the file
   * 
   * @memberOf ConfigLoader
   */
  protected async find() {
    const stat = promisify(fs.stat);
    const configs: string[] = [];
    const searchPaths: string[] = [this.path, this.defaultPath];
    const appRoot: string = this.appRoot;
    async function _find(path) {
      const absPath = join(appRoot, path);
      let exists: boolean;
      
      try {
        exists = !!await stat(absPath);
      } catch(e) {
        exists = false;
      }

      return exists === true ? absPath : undefined;
    }

    if (this.path === this.defaultPath) {
      searchPaths.shift();
    }

    for (let path of searchPaths) {
      let absPath: string = await _find(path);
      if (absPath) {
        configs.push(absPath);
      }
    }

    return configs;
  }

  protected async action(app: App, filePaths: string[]) {
    const configs: any[] = [];

    for (let path of filePaths) {
      configs.push(require(path));
    }

    configs.unshift({});

    const _assign = spread(assign);

    return _assign(configs);
  }
}

export default ConfigLoader;
