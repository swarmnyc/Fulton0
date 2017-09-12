import { Model } from '../lib/model';
import { User } from './user';
import { OAuthClient } from './oauth-client';
import { OAuth2AccessToken } from '../lib/services/oauth2/lib'

import { generateAccessToken } from '../helpers/oauth';
import * as moment from 'moment';
import * as _ from 'lodash';

export class OAuthToken extends Model implements OAuth2AccessToken {
    //implementing OAuth2AccessToken with custom getters and setters
    get access_token() {
        return this.get("accessToken");
    }
    set access_token(token: string) {
        this.set("accessToken", token);
    }

    get accessTokenExpiresOn() {
        return this.get("accessTokenExpiresOn");
    }
    set accessTokenExpiresOn(date: Date) {
        this.set("accessTokenExpiresOn", date);
    }

    get client_id() {
        return this.get("clientId");
    }
    set client_id(id: string) {
        this.set("clientId", id);
    }

    get user_id() {
        return this.get("userId");
    }
    set user_id(id: string) {
        this.set("userId", id);
    }


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