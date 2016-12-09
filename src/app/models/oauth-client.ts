import { generateClientSecret } from '../helpers/oauth';
import { Model } from '../lib/model';
import { User } from './user';
import * as _ from 'lodash';

export class OAuthClient extends Model {
    collection() {
        return 'oauth-clients';
    }

    schema() {
        return {
            name: { type: 'string', index: true },
            secret: { type: 'string', index: true },
            userId: { type: 'ObjectId', ref: User }
        };
    }

    configure() {
        this.before('save', 'generateClientSecret');
    }

    async generateClientSecret(next: any) {
        let secret: string;

        if (this.isNew() || this.changed['secret']) {
            secret = await generateClientSecret();
            this.set('secret', secret);
        }
        
        await next;
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

export default OAuthClient