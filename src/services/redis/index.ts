import { promisify } from 'bluebird';
import { Service } from '../../service';
import { RedisClient, createClient } from 'redis';

export class BaseRedisService extends Service {
    host: string
    port: number
    instance: RedisClient

    as() {
        return 'redis';
    }

    onError(e: Error) {
        throw e;
    }

    async init() {
        this.host = process.env['REDIS_HOST'] || "localhost"
        this.port = Number(process.env['REDIS_PORT'] || 6379)
        return new Promise<RedisClient>((resolve) => {
            const instance: RedisClient = createClient({ host: this.host, port: this.port });
            instance.on('error', this.onError);
            instance.on('connect', () => {
                return resolve(instance);
            });
        });
    }

    async deinit() {
        let quit = promisify(this.instance.quit);
        await quit();
        return;
    }
}