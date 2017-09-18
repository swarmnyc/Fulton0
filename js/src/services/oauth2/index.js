"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const service_1 = require("../../service");
const oauth2lib = require("./lib");
__export(require("./models"));
__export(require("./lib"));
__export(require("./grants"));
class BaseOAuth2Service extends service_1.Service {
    as() {
        return 'oauth';
    }
    tokenEndpoint() {
        return 'token';
    }
    model() {
        return undefined;
    }
    grants() {
        return ['password'];
    }
    getRouteDefinition(endpointName, tokenHandler) {
        return undefined;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const Model = this.model();
            let o = Object.assign({}, { grants: this.grants(), tokenEndpoint: this.tokenEndpoint(), model: Model });
            return new oauth2lib.OAuth2Server(o, (server) => {
                return this.getRouteDefinition(server.tokenEndpoint(), server.token());
            });
        });
    }
}
exports.BaseOAuth2Service = BaseOAuth2Service;
//# sourceMappingURL=index.js.map