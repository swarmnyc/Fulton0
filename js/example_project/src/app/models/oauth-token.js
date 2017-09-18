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
const user_1 = require("./user");
const oauth_client_1 = require("./oauth-client");
const oauth_1 = require("../helpers/oauth");
const moment = require("moment");
const _ = require("lodash");
class OAuthToken extends fulton_1.Model {
    //implementing OAuth2AccessToken with custom getters and setters
    get access_token() {
        return this.get("accessToken");
    }
    set access_token(token) {
        this.set("accessToken", token);
    }
    get accessTokenExpiresOn() {
        return this.get("accessTokenExpiresOn");
    }
    set accessTokenExpiresOn(date) {
        this.set("accessTokenExpiresOn", date);
    }
    get client_id() {
        return this.get("clientId");
    }
    set client_id(id) {
        this.set("clientId", id);
    }
    get user_id() {
        return this.get("userId");
    }
    set user_id(id) {
        this.set("userId", id);
    }
    collection() {
        return 'oauth-tokens';
    }
    schema() {
        return {
            accessToken: { type: 'string' },
            accessTokenExpiresOn: { type: 'date', defaultValue: () => {
                    return moment().add(90, 'days').toDate();
                } },
            clientId: { type: 'ObjectId', ref: oauth_client_1.OAuthClient, required: true },
            userId: { type: 'ObjectId', ref: user_1.User, required: true }
        };
    }
    configure() {
        this.before('save', 'generateAccessToken');
    }
    generateAccessToken(next) {
        return __awaiter(this, void 0, void 0, function* () {
            let token;
            if (this.isNew() || this.changed['accessToken']) {
                token = yield oauth_1.generateAccessToken();
                this.set('accessToken', token);
            }
            yield next;
        });
    }
    toJSON() {
        let o = super.toJSON();
        o = _.mapKeys(o, (v, key) => {
            if (key === '_id') {
                return 'id';
            }
            else {
                return key;
            }
        });
        return o;
    }
}
exports.OAuthToken = OAuthToken;
exports.default = OAuthToken;
//# sourceMappingURL=oauth-token.js.map