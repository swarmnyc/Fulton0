"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const bluebird_1 = require('bluebird');
const service_1 = require('../../service');
const redis_1 = require('redis');
class BaseRedisService extends service_1.Service {
    as() {
        return 'redis';
    }
    onError(e) {
        throw e;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.host = process.env['REDIS_HOST'] || "localhost";
            this.port = Number(process.env['REDIS_PORT'] || 6379);
            return new Promise((resolve) => {
                const instance = redis_1.createClient({ host: this.host, port: this.port });
                instance.on('error', this.onError);
                instance.on('connect', () => {
                    return resolve(instance);
                });
            });
        });
    }
    deinit() {
        return __awaiter(this, void 0, void 0, function* () {
            let quit = bluebird_1.promisify(this.instance.quit);
            yield quit();
            return;
        });
    }
}
exports.BaseRedisService = BaseRedisService;
//# sourceMappingURL=index.js.map