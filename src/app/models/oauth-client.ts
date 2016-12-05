import * as _ from 'lodash';
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

    toJSON() {
        let o = super.toJSON();
        o = _.mapKeys(o, (v: any, key: string) => {
            if (key === '_id') {
                return 'id';
            } else {
                return key;
            }
        });

        return o;
    }
}
