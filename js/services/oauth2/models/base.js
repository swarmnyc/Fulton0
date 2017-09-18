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