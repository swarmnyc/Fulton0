import * as crypto from 'crypto';
import * as moment from 'moment';
import { promisify } from 'bluebird';

export function generateAccessToken(userId: string | number, clientId: string | number, accessTokenId: string) {
    return crypto.createHmac('sha256', accessTokenId).update(`user_id=${userId}`).update(`client_id=${clientId}`).update(`created_at=${moment().valueOf()}`).digest('hex');
}

export async function generateClientSecret() {
    const randomBytes = promisify(crypto.randomBytes);
    const str = await randomBytes(256);
    return str.toString('hex');
}