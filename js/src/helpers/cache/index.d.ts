import { RedisClient } from 'redis';
export declare class CacheHelper {
    private _packageData<T>(data);
    private _initData<T>(data);
    private _redis;
    cacheTimeout(): number;
    as(): string;
    init(): Promise<this>;
    readonly redis: RedisClient;
    cache<T>(key: string, resp: T): Promise<boolean>;
    fetch<T>(key: string): Promise<T>;
    invalidate(key: string): Promise<void>;
    constructor(redis: RedisClient);
}
