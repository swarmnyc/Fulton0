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
var path_1 = require('path');
var RouteLoader = (function (_super) {
    __extends(RouteLoader, _super);
    function RouteLoader() {
        _super.apply(this, arguments);
        this.path = 'routes';
    }
    RouteLoader.prototype.action = function (app, filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            var Router = require(filePath);
            var basePath = "/" + path_1.basename(filePath, path_1.extname(filePath));
            var router = new Router();
            console.info("Mounting route to " + router.prefix() + "...");
            app.use(router.routes());
            return router;
        });
    };
    return RouteLoader;
}(loader_1["default"]));
exports.RouteLoader = RouteLoader;
exports.__esModule = true;
exports["default"] = RouteLoader;
