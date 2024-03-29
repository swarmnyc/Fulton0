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
class OAuth2PasswordModel extends base_1.OAuth2BaseModel {
    usernameField() {
        return 'username';
    }
    getUser(username, password, ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            return undefined;
        });
    }
}
exports.OAuth2PasswordModel = OAuth2PasswordModel;
exports.default = OAuth2PasswordModel;
//# sourceMappingURL=password.js.map