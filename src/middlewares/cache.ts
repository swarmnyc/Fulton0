import { Context } from 'koa';
import { CacheHelper } from '../helpers/cache';
import { RedisClient } from 'redis';

import * as _ from 'lodash';

function getTokenFromAuthHeader(authHeader: string): string {
    let token: string[] = authHeader.split(' ');
    return _.last(token);
}

async function hydrateResponse(resp: PackagedResponse, ctx: Context) {
  ctx.set('Content-Type', resp.contentType);
  ctx.set('X-Cache-Used', 'TRUE');
  ctx.status = 200;
  ctx.body = resp.body;
}

function packageResponse(ctx: Context): PackagedResponse {
    return {
        body: ctx.response.body,
        contentType: ctx.response.get('Content-Type')
    };
}

function encodeKey(str: string): string {
  let buf = new Buffer(str, 'utf8');
  return buf.toString('base64');
}

export function cache() {
    return async function(ctx: Context, next: Function) {
        const log = ctx.app.context['services'].log;
        let invalidateMethods = ['patch', 'put', 'post', 'delete'];
        const redis = _.get(ctx.app, 'context.services.redis') as RedisClient;
        let cacheHelper = new CacheHelper(redis);
        let key: string = '';
        let resp: PackagedResponse;
        let isCacheable: boolean = false;

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
            await next();
        } else if (ctx.request.method.toLowerCase() === 'get') {
            log.debug(`searching cache key ${key}`);
            resp = await cacheHelper.fetch<PackagedResponse>(key);

            if (resp) {
                log.debug(`found cache key ${key}. hydrating...`);
                return hydrateResponse(resp, ctx);
            } else {
                log.debug(`cache key ${key} not found. bypassing...`);
                await next();
                log.debug(`storing value in cache for key ${key}`);
                isCacheable = ['json', 'html','text', 'application/vnd.api+json'].filter((type) => {
                  return ctx.response.is(type);
                }).length > 0;

                if (ctx.status === 200 && isCacheable) {
                  await cacheHelper.cache<PackagedResponse>(key, packageResponse(ctx));
                }
            }

        } else {
            log.debug(`bypassing cache key ${key}`);
            await next();
        }
    };
}

interface PackagedResponse {
    body: any
    contentType: string
}