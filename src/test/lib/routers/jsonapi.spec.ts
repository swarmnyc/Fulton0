import * as chai from 'chai';
import { App } from '../../../app/lib';
import { JSONAPIRouter } from '../../../app/lib/routers/jsonapi';
import { Model } from '../../../app/lib/model';
import * as mongorito from 'mongorito';
import * as faker from 'faker';
import * as _ from 'lodash';

interface TestData {
    items: any[]
}

const chaiHttp = require('chai-http');
const { assert, expect } = chai;
let data: TestData; 
let app: App;

chai.use(chaiHttp);

describe('JSON API Router', () => {
    class TestModel extends Model {
        collection() {
            return 'test-items';
        }

        schema() {
            return {
                name: { type: 'string' },
                motto: { type: 'string' },
                age: { type: 'number'},
                friends: { type: 'ObjectId[]', ref: TestModel }
            };
        }
    }

    function factory() {
        return {
            name: `${faker.name.firstName()} ${faker.name.lastName()}`,
            motto: faker.lorem.words(),
            age: _.random(1, 99)
        };
    }

    before(async () => {
        const testModelCount = 25;
        await mongorito.connect('mongodb://localhost:27017/spec-tests');
        await mongorito.db.dropDatabase();
        app = new App();

        data = {
            items: []
        };
        

        for (let i = 0; i < testModelCount; i++) {
            let t = new TestModel(factory());
            let friends: TestModel[];
            if (i > 1) {
                friends = _.sampleSize(data.items, _.random(0, i));
                t.set('friends', _.map(friends, (f) => {
                    return f.get('_id');
                }));
            }
            await t.save();
            data.items.push(t);
        }

        return;
    });

    it('should return included documents on /api/test-items?include=friends GET', async () => {
        class Route extends JSONAPIRouter {
            Model() {
                return TestModel;
            }

            relationships() {
                return [{
                    router: Route,
                    path: 'friends',
                }];
            }
        }
        let route = new Route();
        let response: any;
        app.use(route.routes());
        await app.init();
        response = await chai['request'](app.listener())
            .get(`/api/test-items?include=friends`);
        
        expect(response).to.have['status'](200);
        expect(response).to.be['json'];
        expect(response.body).to.have.property('data');
        expect(response.body).to.have.property('included');
        for (let include of response.body.included) {
            expect(include).to.have.property('id');
            expect(include).to.have.property('type');
            expect(include).to.have.property('links');
            expect(include.type).to.equal('test-items');
        }
        return;
    });
});