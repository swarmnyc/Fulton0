import { Model } from '../lib/model';

export class OAuthToken extends Model {
    collection() {
        return 'oauth-tokens';
    }

    
    schema() {
        return {
            accessToken: { type: 'string' },
            accessTokenExpiresOn: { type: 'date' },
            clientId: { type: 'ObjectId', ref: 'oauth-clients' },
            userId: { type: 'ObjectId', ref: 'users' }
        };
    }
}

export default OAuthToken;