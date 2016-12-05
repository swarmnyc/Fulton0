import * as mongorito from 'mongorito';
import { User } from '../../app/models/user';
import * as chai from 'chai';

const { assert } = chai;

describe('User Model', () => {
    before(async () => {
        await mongorito.connect('mongodb://localhost:27017/spec-tests');
        return mongorito.db.dropDatabase();
    });

    it('should return users as the collection', async () => {
        const user = new User();
        const collection: string = user.collection();

        assert.equal(collection, 'users');
        return;
    });

    it('should run saltPasswordOnSave', async () => {
        let user = new User({
            email: 'user@example.com',
            password: 'test123'
        });

        user = await user.save();
        assert.notEqual(user.get('password'), 'test123');
        return;
    });
});