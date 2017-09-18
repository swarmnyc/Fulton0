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
exports.hashPassword = hashPassword;
function comparePassword(candidate, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const bcryptCompare = bluebird_1.promisify(bcrypt.compare);
        return bcryptCompare(candidate, password);
    });
}
exports.comparePassword = comparePassword;
//# sourceMappingURL=user.js.map