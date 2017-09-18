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
const oauth2lib = require(".");
const moment = require("moment");
function authenticate(model, scope) {
    return function (ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            ctx.state.oauth = {};
            const bearerToken = _getTokenFromRequest(ctx);
            let token;
            let isValidToken;
            let isValidScope;
            if (!bearerToken) {
                return oauth2lib.errorHandler(ctx, 'unauthorized');
            }
            token = yield model.getAccessToken(bearerToken);
            if (!token) {
                return oauth2lib.errorHandler(ctx, 'unauthorized');
            }
            isValidToken = _validateAccessToken(token);
            if (isValidToken === false) {
                return oauth2lib.errorHandler(ctx, 'unauthorized');
            }
            if (scope) {
                isValidScope = yield model.validateScope(token, scope);
                if (isValidScope === false) {
                    return oauth2lib.errorHandler(ctx, 'unauthorized');
                }
                ctx.set('X-Accepted-OAuth-Scopes', scope);
                ctx.set('X-OAuth-Scopes', token.scope);
            }
            ctx.state.oauth.accessToken = token;
            return;
        });
    };
}
exports.authenticate = authenticate;
function _getTokenFromRequest(ctx) {
    let token;
    let arr;
    if (ctx.request.headers['authorization']) {
        arr = ctx.request.headers['authorization'].split(' ');
        if (arr.length > 1) {
            token = arr[1];
        }
        else {
            ctx.throw(401);
            return "";
        }
    }
    else if (ctx.request.body['access_token']) {
        token = ctx.request.body['access_token'];
    }
    else if (ctx.request.query['access_token']) {
        token = ctx.request.query['access_token'];
    }
    return token;
}
function _validateAccessToken(token) {
    return (moment(token.accessTokenExpiresOn).isAfter(moment()));
}
//# sourceMappingURL=authenticate.js.map