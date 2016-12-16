import * as chai from 'chai';
import { App } from '../../../app/lib';
import { JSONAPIRouter } from '../../../app/lib/routers/jsonapi';
import { JSONAPIAdapter } from '../../../app/lib/adapters/jsonapi';
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

chai.use(chaiHttp);

describe('JSON API Router', () => {
    class TestModel extends Model {
        collection() {
            return 'test-items';
        }

        schema() {
            return {
                name: { type: 'string', unique: true },
                motto: { type: 'string', required: true },
                age: { type: 'number'},
                friends: { type: 'ObjectId[]', ref: TestModel }
            };
        }
    }

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

    class TestApp extends App {}

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

        let route = new Route();
        let response: any;
        let app = new TestApp();
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

    it('should return code 422 and error object on including wrong type on /api/test-items POST', async () => {        
        let testData = {
            name: `${faker.name.firstName()} ${faker.name.lastName()}`,
            age: 'Cool',
            motto: faker.lorem.words()
        };
        
        let adapter = new JSONAPIAdapter({ type: 'test-items', namespace: 'api', idPath: '_id' });
        let app = new TestApp();
        let route = new Route();
        let response: any;
        let payload = adapter.serialize(testData);
        
        await app.init();
        app.use(route.routes());

        try { 
            response = await chai['request'](app.listener())
                .post('/api/test-items')
                .set('Content-Type', 'application/vnd.api+json')
                .send(payload);
        } catch(e) {
            response = e;
        } finally {

            expect(response).to.have['status'](422);
            expect(response.response).to.be['json'];
            expect(response.response.body).to.have.property('errors');
            expect(response.response.body.errors).to.be.a('array');
            expect(response.response.body.errors.length).to.equal(1);
            expect(response.response.body.errors[0].title).to.equal('TypeError');
            expect(response.response.body.errors[0].source.pointer).to.equal('/data/attributes/age');
            return;
        }
    });

    it('should return code 409 on duplicate unique properties on /api/test-items POST', async () => {
        let duplicateData = factory();
        let testData = _.sample(data.items);
        duplicateData['name'] = testData.get('name');

        let adapter = new JSONAPIAdapter({ type: 'test-items', namespace: 'api' });
        let app = new TestApp();
        let route = new Route();
        let response: any;
        let payload = adapter.serialize(duplicateData);

        await app.init();
        app.use(route.routes());

        try {
            response = await chai['request'](app.listener())
                .post('/api/test-items')
                .set('Content-Type', 'application/vnd.api+json')
                .send(payload);            
        } catch(e) {
            response = e;
        } finally {
            expect(response).to.have['status'](409);
            expect(response.response).to.be['json'];
            expect(response.response.body).to.have.property('errors');
            expect(response.response.body.errors).to.be.a('array');
            expect(response.response.body.errors.length).to.equal(1);
            expect(response.response.body.errors[0].title).to.equal('UniqueError');
            expect(response.response.body.errors[0].source.pointer).to.equal('/data/attributes/name');
            return;
        }
    });

    it('should return code 422 on missing required property on /api/test-items POST', async () => {
        let testData = factory();
        delete testData.motto;

        let adapter = new JSONAPIAdapter({ type: 'test-items', namespace: 'api' });
        let app = new TestApp();
        let route = new Route();
        let response: any;
        let payload = adapter.serialize(testData);

        await app.init();
        app.use(route.routes());

        try {
            response = await chai['request'](app.listener())
                .post('/api/test-items')
                .set('Content-Type', 'application/vnd.api+json')
                .send(payload);            
        } catch(e) {
            response = e;
        } finally {
            expect(response).to.have['status'](422);
            expect(response.response).to.be['json'];
            expect(response.response.body).to.have.property('errors');
            expect(response.response.body.errors).to.be.a('array');
            expect(response.response.body.errors.length).to.equal(1);
            expect(response.response.body.errors[0].title).to.equal('RequiredError');
            expect(response.response.body.errors[0].source.pointer).to.equal('/data/attributes/motto');
            return;
        }
    });

        it('should return code 422 and error object on including wrong type on /api/test-items/:id PATCH', async () => {        
        let testData = _.sample(data.items);
        testData.set('age', 'Cool');
        
        let adapter = new JSONAPIAdapter({ type: 'test-items', namespace: 'api', idPath: '_id' });
        let app = new TestApp();
        let route = new Route();
        let response: any;
        let payload = adapter.serialize(testData.toJSON());
        
        await app.init();
        app.use(route.routes());

        try { 
            response = await chai['request'](app.listener())
                .patch(`/api/test-items/${testData.get('_id')}`)
                .set('Content-Type', 'application/vnd.api+json')
                .send(payload);
        } catch(e) {
            response = e;
        } finally {

            expect(response).to.have['status'](422);
            expect(response.response).to.be['json'];
            expect(response.response.body).to.have.property('errors');
            expect(response.response.body.errors).to.be.a('array');
            expect(response.response.body.errors.length).to.equal(1);
            expect(response.response.body.errors[0].title).to.equal('TypeError');
            expect(response.response.body.errors[0].source.pointer).to.equal('/data/attributes/age');
            return;
        }
    });

    it('should return code 409 on duplicate unique properties on /api/test-items/:id PATCH', async () => {
        let testData = _.sample(data.items);
        let dupeName = _.sample(data.items).get('name');

        testData.set('name', dupeName);

        let adapter = new JSONAPIAdapter({ type: 'test-items', namespace: 'api' });
        let app = new TestApp();
        let route = new Route();
        let response: any;
        let payload = adapter.serialize(testData.toJSON());

        await app.init();
        app.use(route.routes());

        try {
            response = await chai['request'](app.listener())
                .patch(`/api/test-items/${testData.get('_id')}`)
                .set('Content-Type', 'application/vnd.api+json')
                .send(payload);            
        } catch(e) {
            response = e;
        } finally {
            expect(response).to.have['status'](409);
            expect(response.response).to.be['json'];
            expect(response.response.body).to.have.property('errors');
            expect(response.response.body.errors).to.be.a('array');
            expect(response.response.body.errors.length).to.equal(1);
            expect(response.response.body.errors[0].title).to.equal('UniqueError');
            expect(response.response.body.errors[0].source.pointer).to.equal('/data/attributes/name');
            return;
        }
    });

    it('should return code 422 on missing required property on /api/test-items/:id PATCH', async () => {
        let testData = _.sample(data.items);
        delete testData.attributes.motto;

        let adapter = new JSONAPIAdapter({ type: 'test-items', namespace: 'api' });
        let app = new TestApp();
        let route = new Route();
        let response: any;
        let payload = adapter.serialize(testData.toJSON());

        await app.init();
        app.use(route.routes());

        try {
            response = await chai['request'](app.listener())
                .patch(`/api/test-items/${testData.get('_id')}`)
                .set('Content-Type', 'application/vnd.api+json')
                .send(payload);            
        } catch(e) {
            response = e;
        } finally {
            expect(response).to.have['status'](422);
            expect(response.response).to.be['json'];
            expect(response.response.body).to.have.property('errors');
            expect(response.response.body.errors).to.be.a('array');
            expect(response.response.body.errors.length).to.equal(1);
            expect(response.response.body.errors[0].title).to.equal('RequiredError');
            expect(response.response.body.errors[0].source.pointer).to.equal('/data/attributes/motto');
            return;
        }
    });
});