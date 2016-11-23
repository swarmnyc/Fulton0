"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var fs = require('fs-extra');
var path_1 = require('path');
var bluebird_1 = require('bluebird');
var ModuleLoader = (function () {
    function ModuleLoader() {
        this.extname = '.js';
    }
    ModuleLoader.prototype.load = function (app) {
        return __awaiter(this, void 0, void 0, function* () {
            this.appRoot = app.appRoot;
            var files = yield this.find();
            for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
                var file = files_1[_i];
                yield this.action(app, file);
            }
            return true;
        });
    };
    ModuleLoader.prototype.isFileValid = function (file) {
        return path_1.extname(file) === this.extname;
    };
    ModuleLoader.prototype.find = function () {
        return __awaiter(this, void 0, void 0, function* () {
            function getFullFilePath(filePath) {
                return path_1.join(absPath, filePath);
            }
            var absPath = path_1.join(this.appRoot, this.path);
            var ensureDir = bluebird_1.promisify(fs.ensureDir);
            var readdir = bluebird_1.promisify(fs.readdir);
            var isFileValid = this.isFileValid.bind(this);
            var files;
            yield ensureDir(absPath);
            files = (yield readdir(absPath)).filter(isFileValid).map(getFullFilePath);
            return files;
        });
    };
    ModuleLoader.prototype.action = function (app, moduleFile) {
        return __awaiter(this, void 0, void 0, function* () {
            return moduleFile;
        });
    };
    return ModuleLoader;
}());
exports.__esModule = true;
exports["default"] = ModuleLoader;
