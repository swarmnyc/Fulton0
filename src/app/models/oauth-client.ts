import { Model } from '../framework';

export class OAuthClient extends Model {
    collection() {
        return 'oauth-clients';
    }

    static schema() {
        return {
            userId: { type: 'ObjectId', ref: 'users' },
            secret: { type: 'string' },
            redirectUris: { type: 'string[]'}
        };
    }
}

export default OAuthClient