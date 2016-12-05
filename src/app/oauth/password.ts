import { OAuthGrants } from '../lib'
import { User, OAuthToken, OAuthClient } from '../models';
import { comparePassword } from '../helpers/user';

export class PasswordGrant implements OAuthGrants.PasswordGrant {
    async getAccessToken(token: string) {
        const obj = await OAuthToken.findOne({ accessToken: token });
        if (!obj) {
            return undefined;
        }

        return obj.toJSON();
    }

    async getClient(id: string, secret: string) {
        const obj = await OAuthClient.findOne({ id: id, secret: secret });
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
            return null;
        }

        return user.toJSON();
    }

    async saveToken(token: OAuthGrants.IOAuthAccessTokenObject, client: OAuthGrants.IOAuthClientObject, user: any) {
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
}

export default PasswordGrant