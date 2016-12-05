import { Model } from '../lib/model';
import { User } from './user';
import { OAuthClient } from './oauth-client';

export class OAuthToken extends Model {
    collection() {
        return 'oauth-tokens';
    }

    
    schema() {
        return {
            accessToken: { type: 'string' },
            accessTokenExpiresOn: { type: 'date' },
            clientId: { type: 'ObjectId', ref: OAuthClient },
            userId: { type: 'ObjectId', ref: User }
        };
    }
}

export default OAuthToken;