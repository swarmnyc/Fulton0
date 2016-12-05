import * as chai from 'chai';
import * as mongorito from 'mongorito';
import * as faker from 'faker';
import * as _ from 'lodash';
import JSONAPIRouter from '../../app/routers/jsonapi';
import { createServer } from 'http';
import { App, Model } from '../../app/lib';
import { User } from '../../app/models/user';

const chaiHttp = require('chai-http');
const { assert, expect } = chai;
chai.use(chaiHttp);

describe('JSONAPIRouter', () => {
    interface TestCollection {
        tests: any[],
        password: string,
        user: User
    }

    const data: TestCollection = {
        tests: [],
        password: undefined,
        user: undefined
    };


    class TestModel extends Model {
        collection() {
            return 'test-items';
        }

        timestamps() {
            return true;
        }

        schema() {
            return {
                name: { type: 'string', required: true },
                birthdate: { type: 'date' },
                email: { type: 'string' },
                friends: { type: 'ObjectId[]', ref: TestModel }                
            }
        }
    }

    async function appFactory() {
        const server = createServer();
        const app = new App();
        await app.init();
        server.on('request', app.listener());
        return { server: server, app: app };
    }

    function getFriend() {
        return _.sample(data.tests);
    }

    function factory() {
        return {
            name: `${faker.name.firstName()} ${faker.name.lastName()}`,
            birthdate: faker.date.past(_.random(1, 99)),
            email: faker.internet.email(),
            friends: _.compact(_.times(_.random(0, 20), getFriend))
        };
    }

    before(async () => {
        await mongorito.connect('mongodb://localhost:27017/spec-tests');
        await mongorito.db.dropDatabase();
        
        for (let i = 0; i < 100; i++) {
            let t = new TestModel(factory());
            t = await t.save();
            data.tests.push(t);
        }

        data.user = new User({
            email: faker.internet.email(),
            password: faker.internet.password()
        });
        data.password = data.user.get('password');

        data.user = await data.user.save();
        return;
    });

    it('should set default type value to collection of model', async () => {
        class TestRoute extends JSONAPIRouter {
            Model() {
                return TestModel;
            }
        }

        const test = new TestRoute();
        
        assert.equal(test.type(), 'test-items');
        return;
    });

    it('should throw a TypeError if initialized without a model', async () => {        
        class TestRoute extends JSONAPIRouter {}
        let test: any;

        try {
            test = new TestRoute();
        } catch(e) {
            test = e;
        } finally {
            assert.instanceOf(test, TypeError);
            return;
        }     
    });

    it('should grant an oauth token on /api/token', async () => {
        class TestRoute extends JSONAPIRouter {
            Model() {
                return TestModel;
            }
        }

        const s = await appFactory();
        const test = new TestRoute();
        const user = data.user;
        s.app.use(test.routes());
        const result = await chai['request'](s.server).post('/api/token').send({ username: user.get('email'), password: data.password });
        return;
    });

    it('should override namespace by returning different value from namespace()', async () => {
        class TestRoute extends JSONAPIRouter {
            Model() {
                return TestModel;
            }

            namespace() {
                return 'tests';
            }
        }

        const test = new TestRoute();
        const s = await appFactory();
        s.app.use(test.routes());
        const result = await chai['request'](s.server).get('/tests/test-items/');

        expect(result).to.have['status'](200);
        return;
    });

    it('should use oauth on /api/test-items GET', async () => {
        class TestRoute extends JSONAPIRouter {
            Model() {
                return TestModel;
            }
        }

        const test = new TestRoute();
        const s = await appFactory();

        assert.property(s, 'server');
        return;
    });
});