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
class OAuth2BaseModel {
    errorHandler(ctx, mesg, err) {
        const code = this._getCode(mesg);
        // TODO: Review this for later
        // CORS option should get from app, set to * for now.
        const properties = { headers: { 'access-control-allow-origin': '*' } };
        const body = { errors: [{ status: code, title: mesg }] };
        return ctx.throw(code, JSON.stringify(body), properties);
    }
    _getCode(mesg) {
        let code;
        switch (mesg) {
            case 'bad request':
                code = 400;
                break;
            case 'unauthorized':
                code = 401;
                break;
            case 'forbidden':
                code = 403;
                break;
            default:
                code = 500;
                break;
        }
        return code;
    }
    getAccessToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            return undefined;
        });
    }
    getClient(id, secret) {
        return __awaiter(this, void 0, void 0, function* () {
            return undefined;
        });
    }
    saveToken(user, client, scope) {
        return __awaiter(this, void 0, void 0, function* () {
            return undefined;
        });
    }
    validateScope(token, scope) {
        return __awaiter(this, void 0, void 0, function* () {
            return false;
        });
    }
}
exports.OAuth2BaseModel = OAuth2BaseModel;
//# sourceMappingURL=base.js.map