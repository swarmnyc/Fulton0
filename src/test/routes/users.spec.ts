import * as chai from 'chai';
import { App } from '../../app/lib';
import { User, OAuthClient, OAuthToken } from '../../app/models';
import { createServer, Server } from 'http';
import { JSONAPIAdapter } from '../../app/lib/adapters/jsonapi';
import * as mongorito from 'mongorito';
import * as faker from 'faker';
import * as _ from 'lodash';
import * as moment from 'moment';

interface TestData {
    users: User[]
    client: OAuthClient
    password: string
    user: User
    accessToken: OAuthToken
    expiredToken: OAuthToken
}

const chaiHttp = require('chai-http');
const { assert, expect } = chai;
let data: TestData;
let server = createServer();
let app: App;

chai.use(chaiHttp);

describe('JSON API Users Route', () => {
    class TestApp extends App {}

    function factory() {
        return {
            email: faker.internet.email(),
            password: faker.internet.password()
        };
    }

    beforeEach(async () => {
        const testUserCount = 5;
        const u = factory();
        let users: User[] = [];
        let user: User;
        let testclient: OAuthClient;
        let accesstoken: OAuthToken;
        let expiredToken: OAuthToken;

        app = new TestApp();
        user = new User(u);
        await user.save();
        testclient = new OAuthClient({
            name: 'Test Runner',
            userId: user.get('_id')
        });
        await testclient.save();
        accesstoken = new OAuthToken({
            userId: user.get('_id'),
            clientId: testclient.get('_id')
        });
        await accesstoken.save();
        expiredToken = new OAuthToken({
            userId: user.get('_id'),
            clientId: testclient.get('_id')
        });
        await expiredToken.save();
        expiredToken.set('accessTokenExpiresOn', moment().subtract(1, 'days').toDate());
        await expiredToken.save();

        for (let i = 0; i < testUserCount; i++) {
            let t = new User(factory());
            await t.save();
            users.push(t);
        }

        await app.init();
        server.on('request', app.listener());
        
        data = {
            users: users,
            password: u.password,
            user: user,
            client: testclient,
            accessToken: accesstoken,
            expiredToken: expiredToken
        };
        return;
    });

    it('should deny access without token on /api/users GET', async () => {
        let response: any;

        try {
            response = await chai['request'](server)
                .get('/api/users')
                .set('content-type', 'application/vnd.api+json');
        } catch(e) {
            response = e;
        } finally {
            assert.instanceOf(response, Error);
            assert.equal(response.message, 'Unauthorized');
            return;
        }
    });

    it('should deny access with invalid token on /api/users GET', async () => {
        let response: any;

        try {
            response = await chai['request'](server)
                .get('/api/users')
                .set('content-type', 'application/vnd.api+json')
                .set('Authorization', 'Bearer wrongtoken');
        } catch(e) {
            response = e;
        } finally {
            assert.instanceOf(response, Error);
            assert.equal(response.message, 'Unauthorized');
            return;
        }
    });

    it('should deny access with expired token on /api/users GET', async () => {
        let response: any;

        try {
            response = await chai['request'](server)
                .get('/api/users')
                .set('content-type', 'application/vnd.api+json')
                .set('Authorization', `Bearer ${data.expiredToken.get('accessToken')}`);                
        } catch(e) {
            response = e;
        } finally {
            assert.instanceOf(response, Error);
            assert.equal(response.message, 'Unauthorized');
            return;
        }
    });

    it('should return a list of users on /api/users GET', async () => {
        const response = await chai['request'](server)
            .get('/api/users')
            .set('content-type', 'application/vnd.api+json')
            .set('Authorization', `Bearer ${data.accessToken.get('accessToken')}`);
        
        expect(response).to.have['status'](200);
        expect(response.body).to.be.a('object');
        expect(response.body).to.have.property('data');
        expect(response.body.data).to.be.a('array');
        for (let user of response.body.data) {
            expect(user.type).to.equal('users');
            expect(user).to.have.property('attributes');
            expect(user.attributes).to.have.property('email');
            expect(user.attributes).to.have.property('password');
        }
        return;
    });

    it('should return a limited set of results on /api/users?limit=X GET', async () => {
        const limit: number = 5;        
        const response = await chai['request'](server)
            .get(`/api/users?limit=${limit}`)
            .set('Content-Type', 'application/vind.api+json')
            .set('Authorization', `Bearer ${data.accessToken.get('accessToken')}`);

        expect(response.body).to.have.property('data');
        expect(response.body.data.length).to.equal(5);
        return;
    });

    it('should apply pagination and include pagination object in response on /api/users?limit=X&page=X GET', async () => {
        const limit: number = 5;
        const page: number = 2;
        const rootLink: string = `/api/users?limit=${limit}&page=`;
        const userCount = await User.count();
        const lastPage = Math.ceil(userCount / limit);
        const response = await chai['request'](server)
            .get(`/api/users?limit=${limit}&page=${page}`)
            .set('Content-Type', 'application/vind.api+json')
            .set('Authorization', `Bearer ${data.accessToken.get('accessToken')}`);

        expect(response.body.links).to.have.property('self');
        expect(response.body.links).to.have.property('prev');
        expect(response.body.links).to.have.property('next');
        expect(response.body.links).to.have.property('first');
        expect(response.body.links).to.have.property('last');
        expect(response.body.links.first).to.equal(`${rootLink}1`);
        expect(response.body.links.next).to.equal(`${rootLink}3`);
        expect(response.body.links.prev).to.equal(`${rootLink}1`);
        expect(response.body.links.last).to.equal(`${rootLink}${lastPage}`);
        return;
    });

    it('should return a specific user on /api/users/:id GET', async() => {
        const user = _.sample(data.users);
        const response = await chai['request'](server)
            .get(`/api/users/${user.get('_id')}`)
            .set('Content-Type', 'application/vnd.api+json')
            .set('Authorization', `Bearer ${data.accessToken.get('accessToken')}`);

        expect(response).to.have['status'](200);
        expect(response.body).to.be.a('object');
        expect(response.body).to.have.property('data');
        expect(response.body.data).to.have.property('id');
        expect(response.body.data).to.have.property('type');
        expect(response.body.data).to.have.property('attributes');
        expect(response.body.data.id).to.equal(user.get('_id').toString());
        expect(response.body.data.type).to.equal('users');
        expect(response.body.data.attributes.email).to.equal(user.get('email'));
        return;
    });

    it('should create a new user on /api/users POST', async() => {
        const adapter = new JSONAPIAdapter({ type: 'users', namespace: 'api' });
        const user = factory();
        const payload = adapter.serialize(user);
        const response = await chai['request'](server)
            .post(`/api/users`)
            .set('Content-Type', 'application/vnd.api+json')
            .set('Authorization', `Bearer ${data.accessToken.get('accessToken')}`)
            .send(payload);
        
        expect(response).to.have['status'](201);
        expect(response.body).to.be.a('object');
        expect(response.body).to.have.property('data');
        expect(response.body.data).to.have.property('id');
        expect(response.body.data).to.have.property('type');
        expect(response.body.data).to.have.property('attributes');
        expect(response.body.data.type).to.equal('users');
        expect(response.body.data.attributes.email).to.equal(user.email);
        expect(response.body.data.attributes.password).to.not.equal(user.password); // password should be hashed
        return;
    });

    it('should update an existing user on /api/users/:id PATCH', async() => {
        const adapter = new JSONAPIAdapter({ type: 'users', namespace: 'api', idPath: '_id' });
        const user = _.sample(data.users);
        const update = user.toJSON();
        let response: any;
        let payload: any;
        let model: any;

        update['email'] = faker.internet.email();
        payload = adapter.serialize(update);

        response = await chai['request'](server)
            .patch(`/api/users/${user.get('_id').toString()}`)
            .set('Content-Type', 'application/vnd.api+json')
            .set('Authorization', `Bearer ${data.accessToken.get('accessToken')}`)
            .send(payload);

        expect(response).to.have['status'](200);
        expect(response.body).to.be.a('object');
        expect(response.body).to.have.property('data');
        expect(response.body.data.id).to.equal(user.get('_id').toString());
        expect(response.body.data.attributes.email).to.equal(update['email']);

        model = await User.findById(user.get('_id'));
        expect(model.get('email')).to.equal(update['email']);        
        return;
    });

    it('should remove a user on /api/users/:id DELETE', async () => {
        const user = _.sample(data.users);
        let model: any;
        let response: any;

        response = await chai['request'](server)
            .delete(`/api/users/${user.get('_id').toString()}`)
            .set('Authorization', `Bearer ${data.accessToken.get('accessToken')}`);
        
        expect(response).to.have['status'](204);
        expect(response.body).to.be.empty;
        model = await User.findById(user.get('_id'));
        assert.isUndefined(model);
        return;
    });
});