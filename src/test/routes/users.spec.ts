import * as chai from 'chai';
import { App } from '../../app/lib';
import { User, OAuthClient, OAuthToken } from '../../app/models';
import { createServer, Server } from 'http';
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

    before(async () => {
        const testUserCount = 30;
        const u = factory();
        let users: User[] = [];
        let user: User;
        let testclient: OAuthClient;
        let accesstoken: OAuthToken;
        let expiredToken: OAuthToken;
        await mongorito.connect('mongodb://localhost:27017/spect-tests');

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
});