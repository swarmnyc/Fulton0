import { comparePassword, hashPassword } from '../../app/helpers/user';
import * as chai from 'chai';

const { assert } = chai;

describe('User Helper', () => {
    it('should return true when calling comparePassword with valid password', async () => {
        const passwordHash = await hashPassword('test123');
        const isMatch = await comparePassword('test123', passwordHash);

        assert.isTrue(isMatch);
        return;
    });
});