import { User, OAuthToken, OAuthClient } from '../../app/models';
import { passwordGrant } from '../../app/oauth/password';
import * as _ from 'lodash';
import * as chai from 'chai';
import * as faker from 'faker';
import * as mongorito from 'mongorito';

const { assert } = chai;

describe('OAuth passwordGrant', () => {
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
        
        const users = _.times(5, factory);

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
        const pwg = passwordGrant;
        const sample = _.sample(data.tokens);        
        let o = await pwg.getAccessToken(sample.get('accessToken'));

        assert.equal(o.accessToken, sample.get('accessToken'));
        assert.property(o, 'accessToken');
        return;
    });

    it('should get oauth client from oauth client and secret', async () => {
        const pwg = passwordGrant;
        const sample = _.sample(data.clients);
        let o = await pwg.getClient(sample.get('_id').toString(), sample.get('secret'));

        assert.equal(o.secret, sample.get('secret'));
        assert.property(o, 'secret');
        return;
    });

    it('should get user from username and password', async () => {
        const pwg = passwordGrant;
        const sample = _.sample(data.users);
        const pw = _.find(data.originalPasswords, { userId: sample.get('_id').toString() }).password;
        let o = await pwg.getUser(sample.get('email'), pw);

        assert.isDefined(o);
        assert.equal(o.email, sample.get('email'));
        assert.notEqual(o.password, pw);
        return;
    });

    it('should save a new token on saveToken', async () => {
        const pwg = passwordGrant;
        const sample = _.sample(data.users);
        let user = sample.toJSON();        
        const client = _.sample(data.clients).toJSON();
        const token = { accessToken: faker.random.uuid(), accessTokenExpiresOn: faker.date.future() };
        user = _.mapKeys(user, (v: any, path: string) => {
            if (path === '_id') {
                return 'id';
            } else {
                return path;
            }
        });
        let o = await pwg.saveToken(token, client, user);

        assert.equal(token.accessToken, o.accessToken);
        assert.equal(token.accessTokenExpiresOn, o.accessTokenExpiresOn);
        assert.equal(o.clientId, client.id);
        assert.equal(o['userId'], user.id.toString());
        return;
    });

    it('should return undefined on bad password', async () => {
        const pwg = passwordGrant;
        const sample = _.sample(data.users);
        let o = await pwg.getUser(sample.get('email'), 'wrongpassword');

        assert.isUndefined(o);
        return;
    });

    it('should return undefined on bad user', async () => {
        const pwg = passwordGrant;
        let o = await pwg.getUser('notauser', 'notapassword');

        assert.isUndefined(o);
        return;
    });
});