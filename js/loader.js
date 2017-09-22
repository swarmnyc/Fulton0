"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const path_1 = require("path");
const bluebird_1 = require("bluebird");
/**
 * ModuleLoader abstract base class. Extend to load your own modules, implemenitng your own
 * load(), find(), and action() methods.
 *
 * @class ModuleLoader
 */
class ModuleLoader {
    constructor() {
        this.extname = '.js';
    }
    /**
     * Main public function that performs whatever task is required to load the modules
     *
     * @param {App} app - Instance of app
     * @returns {void}
     *
     * @memberOf ModuleLoader
     */
    load(app) {
        return __awaiter(this, void 0, void 0, function* () {
            this.appRoot = app.appRoot;
            const files = yield this.find();
            const items = [];
            for (let file of files) {
                items.push(yield this.action(app, file));
            }
            return items;
        });
    }
    isFileValid(file) {
        return path_1.extname(file) === this.extname;
    }
    find() {
        return __awaiter(this, void 0, void 0, function* () {
            function getFullFilePath(filePath) {
                return path_1.join(absPath, filePath);
            }
            const absPath = path_1.join(this.appRoot, this.path);
            const ensureDir = bluebird_1.promisify(fs.ensureDir);
            const readdir = bluebird_1.promisify(fs.readdir);
            const isFileValid = this.isFileValid.bind(this);
            let files;
            yield ensureDir(absPath);
            files = (yield readdir(absPath)).filter(isFileValid).map(getFullFilePath);
            return files;
        });
    }
    action(app, moduleFile) {
        return __awaiter(this, void 0, void 0, function* () {
            return moduleFile;
        });
    }
}
exports.ModuleLoader = ModuleLoader;
exports.default = ModuleLoader;
//# sourceMappingURL=loader.js.map