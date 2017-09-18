import { generateClientSecret } from '../helpers/oauth';
import { Model, OAuth2Client } from 'fulton';
import { User } from './user';
import * as _ from 'lodash';

export class OAuthClient extends Model implements OAuth2Client {
    //implementing OAuth2Client with custom getters and setters for each property
    get id(): string {
        return this.get("_id")
    }
    set id(id: string) {
        this.set("_id", id)
    }

    get secret(): string {
        return this.get("secret")
    }
    set secret(secret: string) {
        this.set("secret", secret)
    }

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