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
var lodash_1 = require('lodash');
var ServiceLoader = (function (_super) {
    __extends(ServiceLoader, _super);
    function ServiceLoader() {
        _super.apply(this, arguments);
        this.path = 'services';
    }
    ServiceLoader.prototype.action = function (app, filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            var Service = require(filePath);
            var config = app.get("config." + Service.name);
            var service = new Service(config);
            var asName;
            yield service.init();
            asName = lodash_1.isString(service.as) ? service.as : Service.name;
            app.set("services." + asName, service.instance);
            return service;
        });
    };
    return ServiceLoader;
}(loader_1["default"]));
exports.ServiceLoader = ServiceLoader;
exports.__esModule = true;
exports["default"] = ServiceLoader;
