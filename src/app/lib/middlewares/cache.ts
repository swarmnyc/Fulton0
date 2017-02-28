import { Context, Response } from 'koa';
import { CacheHelper } from '../helpers/cache';
import * as _ from 'lodash';

function getTokenFromAuthHeader(authHeader: string): string {
    let token: string[] = authHeader.split(' ');
    return _.last(token);
}

function* hydrateResponse(resp: PackagedResponse, ctx: Context) {
    ctx.body = resp.body;
    ctx.set('Content-Type', resp.contentType);
    ctx.set('X-Cache-Used', 'TRUE');
    ctx.status = 200;
}

function packageResponse(ctx: Context): PackagedResponse {
    return {
        body: ctx.response.body,
        contentType: ctx.response.get('Content-Type')
    };
}

export function cache() {
    return function*(next: any) {
        let invalidateMethods = ['patch', 'post', 'delete'];
        let cacheHelper = new CacheHelper(this.app.context.services.redis);
        let key: string = '';
        let resp: PackagedResponse;

        if (this.request.headers.authorization) {
            key += getTokenFromAuthHeader(this.request.headers.authorization);
        }

        key += this.request.originalUrl;

        if (invalidateMethods.indexOf(this.request.method.toLowerCase()) >= 0) {
            yield cacheHelper.invalidate(key);
            yield next;
        } else if (this.request.method.toLowerCase() === 'get') {
            resp = yield cacheHelper.fetch<PackagedResponse>(key);

            if (resp) {
                yield hydrateResponse(resp, this);
            } else {
                yield next;
                if (this.status === 200) {
                    yield cacheHelper.cache<PackagedResponse>(key, packageResponse(this));
                }                
            }

        } else {
            yield next;
        }
    };
}

interface PackagedResponse {
    body: any
    contentType: string
}