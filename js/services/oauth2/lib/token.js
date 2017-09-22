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
const grants = require("../grants");
function token(model, grants) {
    return function (ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            ctx.state.oauth = {};
            const grantType = _getGrantType(ctx);
            const client = yield _getClient(ctx, model);
            if (grants.indexOf(grantType) === -1) {
                return _1.errorHandler(ctx, 'bad request');
            }
            ctx.state.oauth.client = client;
            switch (grantType) {
                case 'password':
                    yield _handlePasswordGrant(ctx, model);
                    break;
                case 'authorization_code':
                    yield _handleAuthorizationGrant(ctx, model);
                    break;
                case 'client_credentials':
                    yield _handleClientCredentialsGrant(ctx, model);
                    break;
            }
            ctx.body = ctx.state.oauth.accessToken;
            ctx.status = 200;
            ctx.response.set('Cache-Control', 'no-store');
            ctx.response.set('Pragma', 'no-cache');
            yield next();
        });
    };
}
exports.token = token;
function _getGrantType(ctx) {
    return ctx.request.body['grant_type'];
}
function _getClientFromHeader(authHeader) {
    let buf;
    let encoded;
    let decoded;
    let arr;
    let manifest = {
        clientId: null,
        clientSecret: null
    };
    let splitHeader;
    if (!authHeader) {
        return manifest;
    }
    splitHeader = authHeader.split(' ');
    // Indecipherable auth header
    if (splitHeader.length <= 1) {
        return manifest;
    }
    encoded = splitHeader[1];
    buf = new Buffer(splitHeader[1], 'base64');
    decoded = buf.toString('utf8');
    arr = decoded.split(':');
    manifest.clientId = arr[0];
    manifest.clientSecret = arr.length > 1 ? arr[1] : null;
    return manifest;
}
function _getClient(ctx, model) {
    return __awaiter(this, void 0, void 0, function* () {
        let clientId = ctx.request.body.client_id;
        let clientSecret = ctx.request.body.client_secret;
        let client;
        let manifest;
        // If no clientId in body, check for base64 encoded clientId/secret in auth header
        if (!clientId) {
            manifest = _getClientFromHeader(ctx.headers.authorization);
            clientId = manifest.clientId;
            clientSecret = manifest.clientSecret;
        }
        // Missing client ID, byebye
        if (!clientId) {
            return ctx.throw(401);
        }
        // Fetch client from oauth2 model
        client = yield model.getClient(clientId, clientSecret);
        // No client, see ya later
        if (!client) {
            return ctx.throw(401);
        }
        // Return client to handler
        return client;
    });
}
function _handlePasswordGrant(ctx, model) {
    return __awaiter(this, void 0, void 0, function* () {
        const grant = new grants.PasswordGrantHandler(model);
        return grant.handle(ctx);
    });
}
function _handleAuthorizationGrant(ctx, model) {
    return __awaiter(this, void 0, void 0, function* () {
        const grant = new grants.AuthorizationCodeGrantHandler(model);
        return grant.handle(ctx);
    });
}
function _handleClientCredentialsGrant(ctx, model) {
    return __awaiter(this, void 0, void 0, function* () {
        const grant = new grants.ClientCredentialsGrantHandler(model);
        return grant.handle(ctx);
    });
}
//# sourceMappingURL=token.js.map