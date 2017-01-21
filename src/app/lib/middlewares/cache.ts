import { Context, Response } from 'koa';
import { BaseCacheService } from '../services/cache';
import * as _ from 'lodash';

function getTokenFromAuthHeader(authHeader: string): string {
    let token: string[] = authHeader.split(' ');
    return _.last(token);
}

function hydrateResponse(resp: PackagedResponse, ctx: Context) {
    ctx.body = resp.body;
    ctx.status = 200;
}

function packageResponse(response: Response): PackagedResponse {
    return {
        body: response.body
    };
}

export function* cache(next: any) {
    let invalidateMethods = ['patch', 'post', 'delete'];
    let cacheService: BaseCacheService = this.app.context.services.cache;
    let key: string = '';
    let resp: Response;

    if (this.request.headers.authorization) {
        key += getTokenFromAuthHeader(this.request.headers.authorization);
    }

    key += this.request.url;

    if (invalidateMethods.indexOf(this.request.method) >= 0) {
        yield cacheService.invalidate(key);
    }

    resp = yield cacheService.fetch(key);

    if (resp) {
      return hydrateResponse(resp, this);
    } else {
      yield next;
      cacheService.cache(key, packageResponse(this.response));
    }
}

interface PackagedResponse {
    body: any    
}