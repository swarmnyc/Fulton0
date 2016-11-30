import { OAuthGrants } from '../lib';
import { User, OAuthToken, OAuthClient } from '../models';

export class ClientGrant implements OAuthGrants.ClientCredentialsGrant {
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

    async getUserFromClient(id: string, secret: string) {
        const client = await OAuthClient.populate('userId', User).findOne({ id: id, secret: secret });
        let user: User;

        if (!client) {
            return undefined;
        }

        return client.get('userId').toJSON();
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
        }
        return out;
    }
}

export default ClientGrant