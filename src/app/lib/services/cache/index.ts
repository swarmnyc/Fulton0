import { Service } from '../../service';
import { RedisService } from '../redis';
import { RedisClient } from 'redis';
import * as Bluebird from 'bluebird';
import * as _ from 'lodash';

export class BaseCacheService extends Service {
    private _packageData(data: any) {
        return JSON.stringify(data);
    }
    private _initData(data: string): CacheData {
        let result: CacheData;
        try {
            result = JSON.parse(data);
        } catch(e) {
            result = undefined;
        }

        return result;
    }

    cacheTimeout(): number {
        return 120000;
    }

    as(): string {
        return 'cache';
    }

    async load() {
        return this;
    }

    get redis(): RedisClient {
        return this.services['redis'];
    }

    async cache(key: string, resp: CacheData): Promise<boolean> {
        let redis = this.redis;
        let data = this._packageData(resp);
        let set = Bluebird.promisify(redis.set, { context: redis });        

        let success: boolean = !!(await set(key, data));
        redis.expire(key, this.cacheTimeout());
        return success;
    }

    async fetch(key: string): Promise<CacheData> {
        let redis = this.redis;
        let get = Bluebird.promisify(redis.get, { context: redis });
        let data: string;
        let result: CacheData;

        try {
            data = await get(key);
        } catch(e) {
            throw e;
        }

        if (!data) {
            result = undefined;
        } else {
            result = this._initData(data);
        }

        return result;
    }

    async invalidate(key: string): Promise<void> {
        let redis = this.redis;
        let del: DEL = Bluebird.promisify(redis.del, { context: redis });
        
        await !!(del(key));
        return;
    }
}

interface CacheData {
    [K: string]: any
}

interface DEL {
    (key: string): Bluebird<number>
}