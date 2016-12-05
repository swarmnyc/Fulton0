import { User, OAuthToken, OAuthClient } from '../../app/models';
import { ClientGrant } from '../../app/oauth/client';
import * as _ from 'lodash';
import * as chai from 'chai';
import * as faker from 'faker';
import * as mongorito from 'mongorito';

const { assert } = chai;

describe('OAuth ClientGrant', () => {
    function factory() {
        return {
            email: faker.internet.email(),
            password: faker.internet.password()
        };
    }
    const data = {
        users: [],
        tokens: [],
        clients: [],
        originalPasswords: []
    };

    before(async () => {
        await mongorito.connect('mongodb://localhost:27017/spec-tests');
        await mongorito.db.dropDatabase();
        
        const users = _.times(25, factory);

        for (let user of users) {
            let token: OAuthToken;
            let client: OAuthClient;
            let u = new User(user);
            let unencryptedPassword = u.get('password');            
            u = await u.save();            
            client = new OAuthClient({
                userId: u,
                secret: faker.random.uuid()
            });
            client = await client.save();
            token = new OAuthToken({
                accessToken: faker.random.uuid(),
                clientId: client,
                userId: u
            });
            token = await token.save();
            data.originalPasswords.push({ userId: u.get('_id').toString(), password: unencryptedPassword });
            data.tokens.push(token);
            data.clients.push(client);
            data.users.push(u);
        }

        return;
    });

    it('should get oauth token object from accessToken', async () => {
        const cg = new ClientGrant();
        const sample = _.sample(data.tokens);        
        let o = await cg.getAccessToken(sample.get('accessToken'));

        assert.equal(o.accessToken, sample.get('accessToken'));
        assert.property(o, 'accessToken');
        return;
    });

    it('should get oauth client from oauth client and secret', async () => {
        const cg = new ClientGrant();
        const sample = _.sample(data.clients);
        let o = await cg.getClient(sample.get('_id').toString(), sample.get('secret'));

        assert.equal(o.secret, sample.get('secret'));
        assert.property(o, 'secret');
        return;
    });

    it('should return a reference to the user object from the client', async () => {
        const cg = new ClientGrant();
        const sample = _.sample(data.clients);
        const user = _.find(data.users, (user) => {
            return user.get('_id').toString() === sample.get('userId').toString();
        });
        let o = await cg.getUserFromClient(sample.get('_id').toString(), sample.get('secret'));

        assert.equal(o._id, user.get('_id').toString());
        return;
    });

    it('should save a new token on saveToken', async () => {
        const cg = new ClientGrant();
        const sample = _.sample(data.users);
        let user = sample.toJSON();        
        const client = _.find(data.clients, (client) => {
            return client.get('userId').equals(sample.get('_id'));
        }).toJSON();
        const token = { accessToken: faker.random.uuid(), accessTokenExpiresOn: faker.date.future() };
        user = _.mapKeys(user, (v: any, path: string) => {
            if (path === '_id') {
                return 'id';
            } else {
                return path;
            }
        });
        let o = await cg.saveToken(token, client, user);

        assert.equal(token.accessToken, o.accessToken);
        assert.equal(token.accessTokenExpiresOn, o.accessTokenExpiresOn);
        assert.equal(o.clientId, client.id);
        assert.equal(o['userId'], user.id.toString());
        return;
    });

});