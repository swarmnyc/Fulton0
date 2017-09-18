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
const _1 = require(".");
const lib_1 = require("../lib");
class AuthorizationCodeGrantHandler extends _1.BaseGrantHandler {
    constructor(model) {
        super();
        this.model = model;
    }
    _validateRequestUri(ctx, code) {
        if (!code.redirectUri) {
            return true;
        }
        const redirectUri = ctx.request['body']['redirect_uri'] || ctx.request.query['redirect_uri'];
        return (redirectUri === code.redirectUri);
    }
    handle(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const code = ctx.request['body']['code'];
            let auth;
            let isValidRequestUri;
            let token;
            if (!code) {
                return lib_1.errorHandler.call(ctx, 'bad request');
            }
            auth = yield this.model.getAuthorizationCode(code);
            isValidRequestUri = this._validateRequestUri(ctx, auth);
            if (isValidRequestUri === false) {
                return lib_1.errorHandler.call(ctx, 'bad request');
            }
            yield this.model.revokeAuthorizationCode(auth);
            token = yield this.model.saveToken(auth.user, ctx.state.oauth.client, auth.scope, auth.authorizationCode);
            ctx.state.oauth.user = auth.user;
            ctx.state.oauth.scope = auth.scope;
            ctx.state.oauth.auth = auth;
            ctx.state.oauth.token = token;
            return true;
        });
    }
}
exports.AuthorizationCodeGrantHandler = AuthorizationCodeGrantHandler;
//# sourceMappingURL=authorization-code.js.map