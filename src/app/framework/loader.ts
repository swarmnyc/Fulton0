import App from './app';
import * as fs from 'fs-extra';
import { resolve, join, extname, basename } from 'path';
import { promisify } from 'bluebird';

class ModuleLoader {
  path: string
  appRoot: string
  extname = '.js'

  async load(app: App) {
    this.appRoot = app.appRoot;
    const files = await this.find();

    for (let file of files) {
      await this.action(app, file);
    }

    return true;
  }

  isFileValid(file: string) {
    return extname(file) === this.extname;
  }

  async find() {
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

  async action(app: App, moduleFile: string) {
    return moduleFile;
  }
}

export default ModuleLoader;
