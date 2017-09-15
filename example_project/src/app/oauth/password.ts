import { OAuth2PasswordModel } from 'fulton'
import { OAuth2AccessToken, OAuth2Client, OAuth2User, OAuth2Scope } from 'fulton';
import { User, OAuthToken, OAuthClient } from '../models';
import { comparePassword } from '../helpers/user';
import { generateAccessToken } from '../helpers/oauth';
import * as _ from 'lodash';
import * as moment from 'moment';

export class PasswordGrant extends OAuth2PasswordModel {
    usernameField() {
        return 'email';
    }

    async getAccessToken(token: string): Promise<OAuth2AccessToken> {
        //TODO: not sure why compiler is complaining here, OauthToken conforms to Oauth2AccessToken
        let obj: OAuth2AccessToken = await OAuthToken.findOne({ accessToken: token });
        if (!obj) {
            return undefined;
        }
        return obj;
    }

    async getClient(id: string, secret: string): Promise<OAuth2Client> {
        let obj = await OAuthClient.findOne({ _id: id, secret: secret }) as OAuthClient;
        if (!obj) {
            return undefined;
        }

        return obj;
    }

    async getUser(username: string, password: string): Promise<OAuth2User> {
        const user = await User.findOne({ email: username }) as User;
        let hashPassword: string, isValidPassword: boolean;
        if (!user) {
            return undefined;
        }

        hashPassword = user.get('password');
        isValidPassword = await comparePassword(password, hashPassword);

        if (!isValidPassword) {
            return undefined;
        }

        return user;
    }

    async saveToken(user: OAuth2User, client: OAuth2Client, scope?: OAuth2Scope) {
        const userId = user.id;
        let obj = new OAuthToken({
            userId: user.id,
            clientId: client.id
        });
        obj = await obj.save()
        return {
            id: obj.get("_id"),
            access_token: obj.access_token,
            accessTokenExpiresOn: obj.accessTokenExpiresOn,
            client_id: obj.client_id.toString(),
            user_id: obj.user_id.toString()
        }
    }
};

export default PasswordGrant