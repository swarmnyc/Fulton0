import ModuleLoader from './loader';
import * as fs from 'fs-extra';
import App from './app';
import { join, resolve, extname } from 'path';
import { promisify } from 'bluebird';

/**
 * Configuration Loader that reads config.ts file and returns it to the app.
 * 
 * @export
 * @class ConfigLoader
 * @extends {ModuleLoader}
 */
export class ConfigLoader extends ModuleLoader {
  path = 'config.js'

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
    const file = await this.find();
    return this.action(app, file);
  }

  /**
   * Finds config file, returning the absolute path to object on filesystem
   * 
   * @returns {string} absPath - Absolute path of the file
   * 
   * @memberOf ConfigLoader
   */
  protected async find() {
    const absPath = join(this.appRoot, this.path);
    const stat = promisify(fs.stat);
    const exists = await stat(absPath);
    
    return absPath;
  }

  protected action(app: App, filePath: string) {
    const config = require(filePath);
    return config;
  }
}

export default ConfigLoader;
