import * as crypto from 'crypto';
import * as moment from 'moment';

export function generateAccessToken(userId: string, clientId: string, accessTokenId: string) {
    return crypto.createHmac('sha256', accessTokenId).update(`user_id=${userId}`).update(`client_id=${clientId}`).update(`created_at=${moment().valueOf()}`).digest('hex');
}