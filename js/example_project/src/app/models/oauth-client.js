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
const oauth_1 = require("../helpers/oauth");
const fulton_1 = require("fulton");
const user_1 = require("./user");
const _ = require("lodash");
class OAuthClient extends fulton_1.Model {
    collection() {
        return 'oauth-clients';
    }
    schema() {
        return {
            name: { type: 'string', index: true },
            secret: { type: 'string', index: true },
            userId: { type: 'ObjectId', ref: user_1.User }
        };
    }
    configure() {
        this.before('save', 'generateClientSecret');
    }
    generateClientSecret(next) {
        return __awaiter(this, void 0, void 0, function* () {
            let secret;
            if (this.isNew() || this.changed['secret']) {
                secret = yield oauth_1.generateClientSecret();
                this.set('secret', secret);
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
exports.OAuthClient = OAuthClient;
exports.default = OAuthClient;
//# sourceMappingURL=oauth-client.js.map