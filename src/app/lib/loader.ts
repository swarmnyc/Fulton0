import App from './app';
import * as fs from 'fs-extra';
import { resolve, join, extname, basename } from 'path';
import { promisify } from 'bluebird';

/**
 * ModuleLoader abstract base class. Extend to load your own modules, implemenitng your own
 * load(), find(), and action() methods.
 * 
 * @class ModuleLoader
 */
export abstract class ModuleLoader {
  path: string
  appRoot: string
  extname = '.js'

  /**
   * Main public function that performs whatever task is required to load the modules
   * 
   * @param {App} app - Instance of app
   * @returns {void}
   * 
   * @memberOf ModuleLoader
   */
  async load(app: App) {
    this.appRoot = app.appRoot;
    const files = await this.find();
    const items = [];
    for (let file of files) {
      items.push(await this.action(app, file));
    }

    return items;
  }

  isFileValid(file: string) {
    return extname(file) === this.extname;
  }

  protected async find() {
    function getFullFilePath(filePath: string) {
      return join(absPath, filePath);
    }
    const absPath = join(this.appRoot, this.path);
    const ensureDir = promisify(fs.ensureDir);
    const readdir: any = promisify(fs.readdir);
    const isFileValid = this.isFileValid.bind(this);
    let files: any;

    await ensureDir(absPath);
    files = (await readdir(absPath)).filter(isFileValid).map(getFullFilePath);

    return files;
  }

  protected async action(app: App, moduleFile: string) {
    return moduleFile;
  }
}

export default ModuleLoader;
