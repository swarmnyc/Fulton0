import { Service } from '../../service';
import { RedisClient } from 'redis';
export declare class BaseRedisService extends Service {
    host: string;
    port: number;
    instance: RedisClient;
    as(): string;
    onError(e: Error): void;
    init(): Promise<RedisClient>;
    deinit(): Promise<void>;
}
