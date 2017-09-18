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
const fulton_1 = require("fulton");
const models_1 = require("../models");
const user_1 = require("../helpers/user");
const _ = require("lodash");
class PasswordGrant extends fulton_1.OAuth2PasswordModel {
    usernameField() {
        return 'email';
    }
    getAccessToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const obj = yield models_1.OAuthToken.findOne({ accessToken: token });
            if (!obj) {
                return undefined;
            }
            return obj.toJSON();
        });
    }
    getClient(id, secret) {
        return __awaiter(this, void 0, void 0, function* () {
            let obj = yield models_1.OAuthClient.findOne({ _id: id, secret: secret });
            if (!obj) {
                return undefined;
            }
            return obj.toJSON();
        });
    }
    getUser(username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield models_1.User.findOne({ email: username });
            let hashPassword, isValidPassword;
            if (!user) {
                return undefined;
            }
            hashPassword = user.get('password');
            isValidPassword = yield user_1.comparePassword(password, hashPassword);
            if (!isValidPassword) {
                return undefined;
            }
            let o = _.mapKeys(user.toJSON(), (v, key) => {
                if (key === '_id') {
                    return 'id';
                }
                else {
                    return key;
                }
            });
            return o;
        });
    }
    saveToken(user, client, scope) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = user.id;
            const obj = new models_1.OAuthToken({
                userId: user.id,
                clientId: client.id
            });
            let out;
            yield obj.save();
            out = {
                access_token: obj.get('accessToken'),
                accessTokenExpiresOn: obj.get('accessTokenExpiresOn'),
                client_id: obj.get('clientId'),
                user_id: obj.get('userId')
            };
            return out;
        });
    }
}
exports.PasswordGrant = PasswordGrant;
;
exports.default = PasswordGrant;
//# sourceMappingURL=password.js.map