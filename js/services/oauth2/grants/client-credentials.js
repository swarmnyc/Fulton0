"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const _1 = require('.');
class ClientCredentialsGrantHandler extends _1.BaseGrantHandler {
    constructor(model) {
        super();
        this.model = model;
    }
    handle(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const scope = this._getScope(ctx);
            const user = yield this.model.getUserFromClient(ctx.state.oauth.client.id, ctx.state.oauth.client.secret);
            const token = yield this.model.saveToken(user, ctx.state.oauth.client, scope);
            ctx.state.oauth.user = user;
            ctx.state.oauth.token = token;
            ctx.state.oauth.scope = scope;
            return;
        });
    }
}
exports.ClientCredentialsGrantHandler = ClientCredentialsGrantHandler;
//# sourceMappingURL=client-credentials.js.map