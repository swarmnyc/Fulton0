"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("./base");
class OAuth2PasswordModel extends base_1.OAuth2BaseModel {
    usernameField() {
        return 'username';
    }
    getUser(username, password) {
        return undefined;
    }
}
exports.OAuth2PasswordModel = OAuth2PasswordModel;
exports.default = OAuth2PasswordModel;
//# sourceMappingURL=password.js.map