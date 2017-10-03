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
class AuthorizationCodeGrantHandler extends _1.BaseGrantHandler {
    constructor(model) {
        super();
        this.model = model;
    }
    handle(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const code = ctx.request['body']['code'];
            if (!code) {
                return this.model.errorHandler(ctx, 'bad request');
            }
            let user;
            try {
                user = yield this.model.getUserFromCode(code, ctx);
            }
            catch (error) {
                return this.model.errorHandler(ctx, 'bad request', error);
            }
            let token;
            try {
                token = yield this.model.getTokenForUser(user, ctx.state.oauth.client);
            }
            catch (error) {
                return this.model.errorHandler(ctx, 'bad request', error);
            }
            ctx.state.oauth.user = user;
            ctx.state.oauth.token = token;
            ctx.state.oauth.accessToken = {
                accessToken: token.access_token.toString(),
                accessTokenExpiresOn: token.accessTokenExpiresOn,
                clientId: token.client_id.toString(),
                userId: token.user_id.toString()
            };
            return;
        });
    }
}
exports.AuthorizationCodeGrantHandler = AuthorizationCodeGrantHandler;
//# sourceMappingURL=authorization-code.js.map