import { OAuth2PasswordModel } from '../lib/services/oauth2/models'
import { OAuth2AccessToken, OAuth2Client, OAuth2User, OAuth2Scope } from '../lib/services/oauth2/lib';
import { User, OAuthToken, OAuthClient } from '../models';
import { comparePassword } from '../helpers/user';
import { generateAccessToken } from '../helpers/oauth';
import * as _ from 'lodash';
import * as moment from 'moment';

export class PasswordGrant extends OAuth2PasswordModel {
    usernameField() {
        return 'email';
    }

    async getAccessToken(token: string) {
        const obj = await OAuthToken.findOne({ accessToken: token });
        if (!obj) {
            return undefined;
        }

        return obj.toJSON();
    }

    async getClient(id: string, secret: string) {
        let obj = await OAuthClient.findOne({ _id: id, secret: secret });
        if (!obj) {
            return undefined;
        }

        return obj.toJSON();
    }

    async getUser(username: string, password: string) {
        const user = await User.findOne({ email: username });
        let hashPassword: string, isValidPassword: boolean;
        if (!user) {
            return undefined;
        }

        hashPassword = user.get('password');
        isValidPassword = await comparePassword(password, hashPassword);

        if (!isValidPassword) {
            return undefined;
        }

        let o = _.mapKeys(user.toJSON(), (v: any, key: string) => {
            if (key === '_id') {
                return 'id';
            } else {
                return key;
            }
        });

        return o;
    }

    async saveToken(user: OAuth2User, client: OAuth2Client, scope?: OAuth2Scope) {
        const userId = user.id;
        const obj = new OAuthToken({
            userId: user.id,
            clientId: client.id
        });
        let out: OAuth2AccessToken;
        await obj.save();
        
        obj.set('accessToken',  generateAccessToken(userId.toString(), client.id.toString(), obj.get('_id').toString()));
        obj.set('accessTokenExpiresOn', moment().add(90, 'day').toDate());
        await obj.save();
        
        out = {
            accessToken: obj.get('accessToken'),
            accessTokenExpiresOn: obj.get('accessTokenExpiresOn'),
            clientId: obj.get('clientId'),
            userId: obj.get('userId')
        };
        return out;
    }
};

export default PasswordGrant