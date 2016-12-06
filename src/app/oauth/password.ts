import { OAuthGrants } from '../lib'
import { User, OAuthToken, OAuthClient } from '../models';
import { comparePassword } from '../helpers/user';
import * as _ from 'lodash';

export const passwordGrant = {
    getAccessToken: async function(token: string) {
        const obj = await OAuthToken.findOne({ accessToken: token });
        if (!obj) {
            return undefined;
        }

        return obj.toJSON();
    },

    getClient: async function (id: string, secret: string) {
        let obj = await OAuthClient.findOne({ _id: id, secret: secret });
        if (!obj) {
            return undefined;
        }

        return obj.toJSON();
    },

    getUser: async function (username: string, password: string) {
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
    },

    saveToken: async function(token: OAuthGrants.IOAuthAccessTokenDefinition, client: OAuthGrants.IOAuthClientObject, user: any) {
        const obj = new OAuthToken({
            userId: user.id,
            accessToken: token.accessToken,
            accessTokenExpiresOn: token.accessTokenExpiresOn,
            clientId: client.id
        });
        let out: OAuthGrants.IOAuthAccessTokenObject;

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

export default passwordGrant