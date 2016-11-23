"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var Service = (function () {
    function Service(config) {
        this.config = config;
    }
    Service.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function* () {
            this.instance = null;
            return this;
        });
    };
    Service.prototype.deinit = function () {
        return __awaiter(this, void 0, void 0, function* () {
            return this;
        });
    };
    Service.prototype.get = function () {
        return this.instance;
    };
    return Service;
}());
exports.Service = Service;
exports.__esModule = true;
exports["default"] = Service;
