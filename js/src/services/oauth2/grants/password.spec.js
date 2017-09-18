"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const alsatian_1 = require("alsatian");
const password_1 = require("./password");
const moment = require("moment");
const mongodb_1 = require("mongodb");
const password_2 = require("../../../../example_project/src/app/oauth/password");
const models_1 = require("../../../../example_project/src/app/models");
const bcrypt = require("bcrypt-nodejs");
const bluebird_1 = require("bluebird");
const SALT_WORK_FACTOR = 10;
function hashPassword(password) {
    return __awaiter(this, void 0, void 0, function* () {
        const bcryptGenSalt = bluebird_1.promisify(bcrypt.genSalt);
        const bcryptHash = bluebird_1.promisify(bcrypt.hash);
        const salt = yield bcryptGenSalt(SALT_WORK_FACTOR);
        return bcryptHash(password, salt, null);
    });
}
let PasswordGrantTest = class PasswordGrantTest {
    constructor() {
        this.passwordGrant = new password_2.PasswordGrant();
        this.calledThrow = false;
    }
    getFakeRequestContext(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            var self = this;
            this.calledThrow = false;
            // ignore typescript issue, we don't need the full Context object
            let ctx = {
                request: {
                    body: {
                        email: email,
                        password: password,
                        scope: []
                    }
                },
                state: {
                    oauth: {
                        client: yield models_1.OAuthClient.findOne()
                    }
                },
                response: {
                    set: function () {
                    }
                },
                throw: function () {
                    self.calledThrow = true;
                }
            };
            return ctx;
        });
    }
    testValidLogin() {
        return __awaiter(this, void 0, void 0, function* () {
            this.spoofMongoRequests();
            this.passwordHandler = new password_1.PasswordGrantHandler(this.passwordGrant);
            let ctx = yield this.getFakeRequestContext("email email email", "password");
            yield this.passwordHandler.handle(ctx);
            alsatian_1.Expect(ctx.state.oauth.accessToken).toBeDefined();
            alsatian_1.Expect(ctx.state.oauth.user).toBeDefined();
        });
    }
    testInvalidLogin() {
        return __awaiter(this, void 0, void 0, function* () {
            this.spoofMongoRequests();
            this.passwordHandler = new password_1.PasswordGrantHandler(this.passwordGrant);
            let ctx = yield this.getFakeRequestContext("email email email", "wrong password");
            yield this.passwordHandler.handle(ctx);
            alsatian_1.Expect(ctx.state.oauth.accessToken).not.toBeDefined();
            alsatian_1.Expect(ctx.state.oauth.user).not.toBeDefined();
            alsatian_1.Expect(this.calledThrow).toBe(true);
        });
    }
    spoofMongoRequests() {
        let userId = new mongodb_1.ObjectID();
        models_1.OAuthToken.findOne = function (query) {
            return __awaiter(this, void 0, void 0, function* () {
                let token = new models_1.OAuthToken({
                    accessToken: "123456",
                    accessTokenExpiresOn: moment().add(90, 'days').toDate(),
                    clientId: "clientId",
                    userId: userId
                });
                return token;
            });
        };
        models_1.OAuthToken.prototype.save = function () {
            return __awaiter(this, void 0, void 0, function* () {
                return this;
            });
        };
        models_1.OAuthClient.findOne = function (query) {
            return __awaiter(this, void 0, void 0, function* () {
                let token = new models_1.OAuthClient({
                    _id: new mongodb_1.ObjectID(),
                    name: "client name",
                    secret: "client secret",
                    userId: userId
                });
                return token;
            });
        };
        models_1.User.findOne = function (query) {
            return __awaiter(this, void 0, void 0, function* () {
                let token = new models_1.User({
                    _id: new mongodb_1.ObjectID(),
                    email: "email email email",
                    password: yield hashPassword("password"),
                    secret: "secret"
                });
                return token;
            });
        };
    }
};
__decorate([
    alsatian_1.AsyncTest("test valid login")
], PasswordGrantTest.prototype, "testValidLogin", null);
__decorate([
    alsatian_1.AsyncTest("test invvalid login")
], PasswordGrantTest.prototype, "testInvalidLogin", null);
PasswordGrantTest = __decorate([
    alsatian_1.TestFixture("Testing OAuth Password Grant")
], PasswordGrantTest);
exports.PasswordGrantTest = PasswordGrantTest;
//# sourceMappingURL=password.spec.js.map