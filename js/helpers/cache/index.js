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
const Bluebird = require("bluebird");
class CacheHelper {
    _packageData(data) {
        return JSON.stringify({ data: data, cached_at: Date.now() });
    }
    _initData(data) {
        let result = JSON.parse(data);
        return result.data;
    }
    cacheTimeout() {
        return 60;
    }
    as() {
        return 'cache';
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            return this;
        });
    }
    get redis() {
        return this._redis;
    }
    cache(key, resp) {
        return __awaiter(this, void 0, void 0, function* () {
            let redis = this.redis;
            let data = this._packageData(resp);
            let set = Bluebird.promisify(redis.set, { context: redis });
            let isSuccess;
            let result;
            try {
                result = yield set(key, data);
            }
            catch (e) {
                throw e;
            }
            isSuccess = !!(result);
            redis.expire(key, this.cacheTimeout());
            return isSuccess;
        });
    }
    fetch(key) {
        return __awaiter(this, void 0, void 0, function* () {
            let redis = this.redis;
            let get = Bluebird.promisify(redis.get, { context: redis });
            let data;
            let result;
            try {
                data = yield get(key);
            }
            catch (e) {
                throw e;
            }
            if (typeof data === 'string') {
                result = this._initData(data);
            }
            return result;
        });
    }
    invalidate(key) {
        return __awaiter(this, void 0, void 0, function* () {
            let redis = this.redis;
            let del = Bluebird.promisify(redis.del, { context: redis });
            // Fail silently on invalidation fail
            try {
                yield del(key);
            }
            catch (e) { }
            return;
        });
    }
    constructor(redis) {
        this._redis = redis;
    }
}
exports.CacheHelper = CacheHelper;
//# sourceMappingURL=index.js.map