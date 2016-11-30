import { Model } from '../lib';

export class OAuthToken extends Model {
    collection() {
        return 'oauth-tokens';
    }

    
    static schema() {
        return {
            accessToken: { type: 'string' },
            accessTokenExpiresOn: { type: 'date' },
            clientId: { type: 'ObjectId', ref: 'oauth-clients' },
            userId: { type: 'ObjectId', ref: 'users' }
        };
    }
}

export default OAuthToken;