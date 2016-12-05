import { Model } from '../lib/model';
import { User } from './user';

export class OAuthClient extends Model {
    collection() {
        return 'oauth-clients';
    }

    schema() {
        return {
            userId: { type: 'ObjectId', ref: User },
            secret: { type: 'string' },
            redirectUris: { type: 'string[]'}
        };
    }
}
