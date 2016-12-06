import * as crypto from 'crypto';
import { promisify } from 'bluebird';

export async function generateClientSecret() {
    const randomBytes = promisify(crypto.randomBytes);
    const str = await randomBytes(256);
    return str.toString('hex');
}