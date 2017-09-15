import { Model } from 'fulton';
import { User } from './user';
import { OAuthClient } from './oauth-client';
import { generateAccessToken } from '../helpers/oauth';
import * as moment from 'moment';
import * as _ from 'lodash';

export class OAuthToken extends Model {
    collection() {
        return 'oauth-tokens';
    }

    
    schema() {
        return {
            accessToken: { type: 'string' },
            accessTokenExpiresOn: { type: 'date', defaultValue: () => {
                return moment().add(90, 'days').toDate();
            }},
            clientId: { type: 'ObjectId', ref: OAuthClient, required: true },
            userId: { type: 'ObjectId', ref: User, required: true }
        };
    }

    configure() {
        this.before('save', 'generateAccessToken');
    }

    async generateAccessToken(next: any) {
        let token: string;
        if (this.isNew() || this.changed['accessToken']) {
            token = await generateAccessToken();
            this.set('accessToken', token);
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

export default OAuthToken;