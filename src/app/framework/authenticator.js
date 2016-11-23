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
// Implements oauth2 node-style api for use with koa
// https://github.com/oauthjs/node-oauth2-server/wiki/Model-specification
var events_1 = require('events');
var Authenticator = (function (_super) {
    __extends(Authenticator, _super);
    function Authenticator() {
        _super.apply(this, arguments);
    }
    Authenticator.prototype.getAccessToken = function () {
        return __awaiter(this, void 0, void 0, function* () {
            return true;
        });
    };
    Authenticator.prototype.getAuthorizationCode = function () {
        return __awaiter(this, void 0, void 0, function* () {
            return true;
        });
    };
    Authenticator.prototype.getClient = function () {
        return __awaiter(this, void 0, void 0, function* () {
            return true;
        });
    };
    Authenticator.prototype.getUser = function () {
        return __awaiter(this, void 0, void 0, function* () {
            return true;
        });
    };
    Authenticator.prototype.revokeAuthorizationCode = function () {
        return __awaiter(this, void 0, void 0, function* () {
            return true;
        });
    };
    Authenticator.prototype.saveAuthorizationCode = function () {
        return __awaiter(this, void 0, void 0, function* () {
            return true;
        });
    };
    Authenticator.prototype.validateScope = function () {
        return __awaiter(this, void 0, void 0, function* () {
            return true;
        });
    };
    return Authenticator;
}(events_1.EventEmitter));
exports.Authenticator = Authenticator;
exports.__esModule = true;
exports["default"] = Authenticator;
