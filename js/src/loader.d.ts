import { App } from './app';
/**
 * ModuleLoader abstract base class. Extend to load your own modules, implemenitng your own
 * load(), find(), and action() methods.
 *
 * @class ModuleLoader
 */
export declare abstract class ModuleLoader {
    path: string;
    appRoot: string;
    extname: string;
    /**
     * Main public function that performs whatever task is required to load the modules
     *
     * @param {App} app - Instance of app
     * @returns {void}
     *
     * @memberOf ModuleLoader
     */
    load(app: App): Promise<any[]>;
    isFileValid(file: string): boolean;
    protected find(): Promise<any>;
    protected action(app: App, moduleFile: string): Promise<string>;
}
export default ModuleLoader;
