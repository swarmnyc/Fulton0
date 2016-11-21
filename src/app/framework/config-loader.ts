import ModuleLoader from './loader';
import * as fs from 'fs-extra';
import CallbackFunction from './callback';
import App from './app';
import { join, resolve, extname } from 'path';
import { promisify } from 'bluebird';

export class ConfigLoader extends ModuleLoader {
  path = 'config.js'

  async load(app: App) {
    this.appRoot = app.appRoot;
    const file = await this.find();
    return this.action(app, file);
  }

  async find() {
    const absPath = join(this.appRoot, this.path);
    const stat = promisify(fs.stat);
    const exists = await stat(absPath);
    
    return absPath;
  }

  action(app: App, filePath: string) {
    const config = require(filePath);
    return config;
  }
}

export default ConfigLoader;
