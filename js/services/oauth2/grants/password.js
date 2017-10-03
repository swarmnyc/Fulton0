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
const base_1 = require("./base");
class PasswordGrantHandler extends base_1.BaseGrantHandler {
    constructor(model) {
        super();
        this.model = model;
    }
    handle(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const usernameField = this.model.usernameField();
            const username = ctx.request.body[usernameField];
            const password = ctx.request.body.password;
            const scope = this._getScope(ctx);
            let user;
            let token;
            ctx.state.oauth.scope = scope;
            if (!username || !password) {
                this.model.errorHandler(ctx, 'bad request');
                return;
            }
            user = yield this.model.getUser(username, password, ctx);
            if (!user) {
                this.model.errorHandler(ctx, 'unauthorized');
                return;
            }
            token = yield this.model.saveToken(user, ctx.state.oauth.client, scope);
            ctx.state.oauth.accessToken = token;
            ctx.state.oauth.user = user;
            return;
        });
    }
}
exports.PasswordGrantHandler = PasswordGrantHandler;
//# sourceMappingURL=password.js.map