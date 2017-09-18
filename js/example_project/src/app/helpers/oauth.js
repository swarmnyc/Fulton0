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
const crypto = require("crypto");
const bluebird_1 = require("bluebird");
function generateAccessToken() {
    return __awaiter(this, void 0, void 0, function* () {
        return generateClientSecret();
    });
}
exports.generateAccessToken = generateAccessToken;
function generateClientSecret() {
    return __awaiter(this, void 0, void 0, function* () {
        const randomBytes = bluebird_1.promisify(crypto.randomBytes);
        const str = yield randomBytes(256);
        return str.toString('hex');
    });
}
exports.generateClientSecret = generateClientSecret;
//# sourceMappingURL=oauth.js.map