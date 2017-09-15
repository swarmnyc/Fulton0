import * as bcrypt from 'bcrypt-nodejs';
import * as crypto from 'crypto';
import { promisify } from 'bluebird';

const SALT_WORK_FACTOR = 10;

export async function hashPassword(password: string) {        
    const bcryptGenSalt = promisify(bcrypt.genSalt);
    const bcryptHash = promisify<any, string, string, any>(bcrypt.hash);
    const salt = await bcryptGenSalt(SALT_WORK_FACTOR);
    
    return bcryptHash(password, salt, null);
}

export async function comparePassword(candidate: string, password: string) {
    const bcryptCompare = promisify(bcrypt.compare);
    return bcryptCompare(candidate, password);
}