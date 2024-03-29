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
const qs = require("qs");
function queryStringMiddleware() {
    return function (ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let parsed = qs.parse(ctx.request.querystring);
            ctx.app.context['services'].log.debug(parsed);
            // koa 2.0 does not allow overwriting ctx.request.query
            // so we have to assign it to the state object
            ctx.state.query = parsed;
            return next();
        });
    };
}
exports.queryStringMiddleware = queryStringMiddleware;
exports.default = queryStringMiddleware;
//# sourceMappingURL=qs.js.map