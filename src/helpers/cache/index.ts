import { RedisClient } from 'redis';
import * as Bluebird from 'bluebird';

export class CacheHelper {
    private _packageData<T>(data: T): string {        
        return JSON.stringify({ data: data, cached_at: Date.now() });
    }
    private _initData<T>(data: string): T {
        let result: CacheData<T> = JSON.parse(data);
        return result.data;
    }
    private _redis: RedisClient;

    cacheTimeout(): number {
        return 60;
    }

    as(): string {
        return 'cache';
    }

    async init() {
        return this;
    }

    get redis(): RedisClient {
        return this._redis;
    }

    async cache<T>(key: string, resp: T): Promise<boolean> {
        let redis = this.redis;
        let data = this._packageData<T>(resp);
        let set = Bluebird.promisify<any, any, any>(redis.set, { context: redis });
        let isSuccess: boolean;
        let result: any;

        try {
            result = await set(key, data);
        } catch(e) {
            throw e;
        }
        
        isSuccess = !!(result);
        redis.expire(key, this.cacheTimeout());
        return isSuccess;
    }

    async fetch<T>(key: string): Promise<T> {
        let redis = this.redis;
        let get = Bluebird.promisify<any, any>(redis.get, { context: redis });
        let data: string;
        let result: T;

        try {
            data = await get(key);
        } catch(e) {
            throw e;
        }

        if (typeof data === 'string') {
            result = this._initData<T>(data);
        }

        return result;
    }

    async invalidate(key: string): Promise<void> {
        let redis = this.redis;
        let del: DEL = Bluebird.promisify<any, any>(redis.del, { context: redis });

        // Fail silently on invalidation fail
        try {
            await del(key);
        } catch(e) {}

        return;
    }

    constructor(redis: RedisClient) {
        this._redis = redis;
    }
}

interface CacheData<T> {
    data: T
    cached_at: Date
}

interface DEL {
    (key: string): Bluebird<number>
}