"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var loader_1 = require('./loader');
var fs = require('fs-extra');
var path_1 = require('path');
var bluebird_1 = require('bluebird');
var ConfigLoader = (function (_super) {
    __extends(ConfigLoader, _super);
    function ConfigLoader() {
        _super.apply(this, arguments);
        this.path = 'config.js';
    }
    ConfigLoader.prototype.load = function (app) {
        return __awaiter(this, void 0, void 0, function* () {
            this.appRoot = app.appRoot;
            var file = yield this.find();
            return this.action(app, file);
        });
    };
    ConfigLoader.prototype.find = function () {
        return __awaiter(this, void 0, void 0, function* () {
            var absPath = path_1.join(this.appRoot, this.path);
            var stat = bluebird_1.promisify(fs.stat);
            var exists = yield stat(absPath);
            return absPath;
        });
    };
    ConfigLoader.prototype.action = function (app, filePath) {
        var config = require(filePath);
        return config;
    };
    return ConfigLoader;
}(loader_1["default"]));
exports.ConfigLoader = ConfigLoader;
exports.__esModule = true;
exports["default"] = ConfigLoader;
