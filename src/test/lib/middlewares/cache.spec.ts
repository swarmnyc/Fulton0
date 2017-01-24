import { Server, createServer } from 'http';
import * as chai from 'chai';
import * as faker from 'faker';
import * as _ from 'lodash';
import { RedisClient } from 'redis';
import { App, Router } from '../../../app/lib';
import { BaseRedisService } from '../../../app/lib/services/redis';
import { cache } from '../../../app/lib/middlewares/cache';
import { CacheHelper } from '../../../app/lib/helpers/cache';

const chaiHttp = require('chai-http');
const { expect, assert } = chai;
chai.use(chaiHttp);

let app: App;
let server: Server;
let router: Router;
let redisSvc: BaseRedisService;
let cacheHelper: CacheHelper;
let services: ServiceHash;
let data: TestData[] = [];

describe('cache middleware', () => {
    function factory(): TestData {
        return {
            name: faker.commerce.productName(),
            rank: faker.random.number(10000),
            createdAt: faker.date.past()
        }
    }

    before(async() => {
        app = new TestApp();
        router = new TestRouter();        
        await app.init({ loadRoutes: false, loadServices: false });
        app.use(router.routes());
        redisSvc = new BaseRedisService();
        await redisSvc.load();
        services = { redis: redisSvc.instance };
        cacheHelper = new CacheHelper(redisSvc.instance);
        app.services = services;
        app.set('services', services);
        server = createServer(app.listener());
        data = _.times(100, factory);
        return;
    });

    it('should return cached results on /test-cache GET', async () => {
        // First invalidate cache
        await cacheHelper.invalidate('/test-cache');
        let firstResults = await chai['request'](server)
            .get('/test-cache')
            .set('Content-Type', 'application/json');

        let secondResults = await chai['request'](server)
            .get('/test-cache')
            .set('Content-Type', 'application/json');

        expect(secondResults).to.be['json'];
        expect(firstResults.headers).to.not.have.property('x-cache-used');
        expect(secondResults.headers).to.have.property('x-cache-used', 'TRUE');
        expect(secondResults.body).to.be.a('array');
        expect(secondResults.body.length).to.equal(firstResults.body.length);
        for (let result of secondResults.body) {
            assert.property(result, 'name');
            assert.property(result, 'rank');
            assert.property(result, 'createdAt');
            assert.isString(result.name);
            assert.isNumber(result.rank);
            assert.isString(result.createdAt);
        }
        return;
    });
});

interface ServiceHash {
    redis: RedisClient
}

interface TestData {
    name: string
    rank: number
    createdAt: Date
}

class TestApp extends App {
    middleware() {
        return [cache];
    }
}

class TestRouter extends Router {
    returnResults() {
        return function*(next: any) {
            this.set('Content-Type', 'application/json');
            this.body = JSON.stringify(data);
        };
    }

    configure(router: Router.KoaRouter) {
        router.get('/test-cache', this.returnResults());
    }
}