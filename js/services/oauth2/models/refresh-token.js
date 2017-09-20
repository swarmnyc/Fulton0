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
class OAuth2RefreshTokenModel extends _1.OAuth2BaseModel {
    getRefreshToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            return undefined;
        });
    }
    revokeToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            return undefined;
        });
    }
}
exports.OAuth2RefreshTokenModel = OAuth2RefreshTokenModel;
//# sourceMappingURL=refresh-token.js.map