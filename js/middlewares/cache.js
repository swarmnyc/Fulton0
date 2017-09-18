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
const cache_1 = require("../helpers/cache");
const _ = require("lodash");
function getTokenFromAuthHeader(authHeader) {
    let token = authHeader.split(' ');
    return _.last(token);
}
function hydrateResponse(resp, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        ctx.set('Content-Type', resp.contentType);
        ctx.set('X-Cache-Used', 'TRUE');
        ctx.status = 200;
        ctx.body = resp.body;
    });
}
function packageResponse(ctx) {
    return {
        body: ctx.response.body,
        contentType: ctx.response.get('Content-Type')
    };
}
function encodeKey(str) {
    let buf = new Buffer(str, 'utf8');
    return buf.toString('base64');
}
function cache() {
    return function (ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const log = ctx.app.context['services'].log;
            let invalidateMethods = ['patch', 'put', 'post', 'delete'];
            const redis = _.get(ctx.app, 'context.services.redis');
            let cacheHelper = new cache_1.CacheHelper(redis);
            let key = '';
            let resp;
            let isCacheable = false;
            log.debug('cache middleware');
            if (ctx.request.get('authorization')) {
                key += getTokenFromAuthHeader(ctx.request.get('authorization'));
            }
            key += `:${ctx.request.originalUrl}:${ctx.request.querystring}`;
            key = encodeKey(key);
            if (invalidateMethods.indexOf(ctx.request.method.toLowerCase()) >= 0) {
                log.debug(`invalidating cache key ${key}`);
                let invalidated = cacheHelper.invalidate(key);
                log.debug(`cache key invalidated`);
                yield next();
            }
            else if (ctx.request.method.toLowerCase() === 'get') {
                log.debug(`searching cache key ${key}`);
                resp = yield cacheHelper.fetch(key);
                if (resp) {
                    log.debug(`found cache key ${key}. hydrating...`);
                    return hydrateResponse(resp, ctx);
                }
                else {
                    log.debug(`cache key ${key} not found. bypassing...`);
                    yield next();
                    log.debug(`storing value in cache for key ${key}`);
                    isCacheable = ['json', 'html', 'text', 'application/vnd.api+json'].filter((type) => {
                        return ctx.response.is(type);
                    }).length > 0;
                    if (ctx.status === 200 && isCacheable) {
                        yield cacheHelper.cache(key, packageResponse(ctx));
                    }
                }
            }
            else {
                log.debug(`bypassing cache key ${key}`);
                yield next();
            }
        });
    };
}
exports.cache = cache;
//# sourceMappingURL=cache.js.map