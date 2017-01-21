import { BaseCacheService } from '../lib/services/cache';

export class CacheService extends BaseCacheService {
    host: string = 'localhost'
    port: number = 6379
}
