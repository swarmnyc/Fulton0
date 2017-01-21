import { BaseCacheService } from '../../../app/lib/services/cache';
import { RedisService } from '../../../app/lib/services/redis';
import * as chai from 'chai';
import * as faker from 'faker';

const { assert } = chai;

let cache: BaseCacheService;
let key: string;
let data: TestData;

function keyFactory() {
    return faker.random.uuid();
}

function dataFactory(): TestData {
    return {
        name: faker.commerce.productName(),
        price: faker.commerce.price(),
        quantity: faker.random.number({ min: 1, max: 100 })
    }
}

interface TestData {
    name: string
    price: string
    quantity: number
}

describe('BaseCacheService', () => {
    before(async () => {
        let services: any = {};
        let redis = new RedisService();
        await redis.load();
        services.redis = redis.instance;
        cache = new BaseCacheService(services);
        return;
    });

    it('should return undefined when fetching an uncached key', async () => {
        let results: any = await cache.fetch(keyFactory());
        assert.isUndefined(results);
        return;
    });

    it('should store data into cache on cache.cache(key)', async() => {
        key = keyFactory();
        data = dataFactory();

        let results: boolean = await cache.cache(key, data);
        assert.isOk(results);
        return;
    });

    it('should retrieve data from cache on cache.fetch(key)', async() => {
        let results: TestData = <TestData>await cache.fetch(key);

        assert.equal(results.name, data.name);
        assert.equal(results.price, data.price);
        assert.equal(results.quantity, data.quantity);

        return;
    });
});