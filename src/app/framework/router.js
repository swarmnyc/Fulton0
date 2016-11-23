"use strict";
var KoaRouter = require('koa-router');
var lodash_1 = require('lodash');
var Router = (function () {
    function Router() {
        var _this = this;
        this.routes = function () {
            var router = _this.router;
            return router.routes();
        };
        if (!lodash_1.isNil(this.prefix())) {
            this.router = new KoaRouter({ prefix: this.prefix() });
        }
        else {
            this.router = new KoaRouter();
        }
    }
    Router.prototype.prefix = function () {
        return null;
    };
    ;
    return Router;
}());
exports.Router = Router;
exports.__esModule = true;
exports["default"] = Router;
