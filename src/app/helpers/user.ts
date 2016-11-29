import * as bcrypt from 'bcrypt-nodejs';
import * as crypto from 'crypto';
import { promisify } from 'bluebird';

const SALT_WORK_FACTOR = 10;

export class UserHelper {
    static async hashPassword(password: string) {        
        const bcryptGenSalt = promisify(bcrypt.genSalt);
        const bcryptHash = promisify(bcrypt.hash);
        const salt = await bcryptGenSalt(SALT_WORK_FACTOR);
        
        return bcryptHash(password, salt);
    }

    static async comparePassword(candidate: string, password: string) {
        const bcryptCompare = promisify(bcrypt.compare);
        return bcryptCompare(candidate, password);
    }
}

export default UserHelper;