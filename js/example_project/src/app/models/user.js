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
const user_1 = require("../helpers/user");
const fulton_2 = require("fulton");
class User extends fulton_1.Model {
    collection() {
        return 'users';
    }
    configure() {
        this.before('save', 'saltPasswordOnSave');
    }
    saltPasswordOnSave(next) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isNew() || this.changed['password']) {
                const passwordHash = yield user_1.hashPassword(this.get('password'));
                this.set('password', passwordHash);
            }
            yield next;
        });
    }
    schema() {
        return {
            email: { type: fulton_2.SchemaTypes.String, required: true, unique: true },
            password: { type: fulton_2.SchemaTypes.String, required: true },
            secret: { type: fulton_2.SchemaTypes.String }
        };
    }
}
exports.User = User;
exports.default = User;
//# sourceMappingURL=user.js.map