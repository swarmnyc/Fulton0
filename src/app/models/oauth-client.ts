import { Model } from '../lib/model';

export class OAuthClient extends Model {
    collection() {
        return 'oauth-clients';
    }

    schema() {
        return {
            userId: { type: 'ObjectId', ref: 'users' },
            secret: { type: 'string' },
            redirectUris: { type: 'string[]'}
        };
    }
}
