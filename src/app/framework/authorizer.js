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
var events_1 = require('events');
var Authorizer = (function (_super) {
    __extends(Authorizer, _super);
    function Authorizer() {
        var _this = this;
        _super.apply(this, arguments);
        this.authorize = function () {
            return __awaiter(this, void 0, void 0, function* () {
            });
        };
        this.auth = function () {
            var authorize = _this.authorize;
            return authorize;
        };
    }
    return Authorizer;
}(events_1.EventEmitter));
exports.Authorizer = Authorizer;
exports.__esModule = true;
exports["default"] = Authorizer;
