import * as chai from 'chai';
import { App } from '../../app/lib';
import { User, OAuthClient } from '../../app/models';
import { createServer, Server } from 'http';
import * as mongorito from 'mongorito';
import * as faker from 'faker';

interface TestData {
    user: User
    client: OAuthClient
    password: string
}

const chaiHttp = require('chai-http');
const { assert, expect } = chai;
let data: TestData;

chai.use(chaiHttp);

describe('OAuthToken', () => {
    class TestApp extends App {}

    function factory() {
        return {
            email: faker.internet.email(),
            password: faker.internet.password()
        };
    }

    before(async () => {
        const u = factory();
        let user: User;
        let testclient: OAuthClient;
        await mongorito.connect('mongodb://localhost:27017/spec-tests');
                
        user = new User(u);
        user = await user.save();
        testclient = new OAuthClient({
            name: 'Test Runner'
        });
        testclient = await testclient.save();
        data = {
            password: u.password,
            user: user,
            client: testclient
        };
                        
        return;
    });

    it('should return a new token on /token POST', async () => {
        const server = createServer();
        const app = new TestApp();
        await app.init();
        server.on('request', app.listener());

        const response = await chai['request'](server)
            .post('/token')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({ username: data.user.get('email'), password: data.password, grant_type: 'password', client_id: data.client.get('_id').toString(), client_secret: data.client.get('secret') });
        
        expect(response).to.have['status'](200);
        return;
    });
});