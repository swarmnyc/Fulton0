import { OAuth2AccessToken, OAuth2Client, OAuth2User, OAuth2Scope } from '../lib';

export class OAuth2BaseModel {
    async getAccessToken(token: string): Promise<OAuth2AccessToken> {
        return undefined;
    }

    async getClient(id: string, secret: string): Promise<OAuth2Client> {
        return undefined;
    }

    async saveToken(user: OAuth2User, client: OAuth2Client, scope?: OAuth2Scope): Promise<OAuth2AccessToken> {
        return undefined;
    }

    async validateScope(token: OAuth2AccessToken, scope: string[] | string): Promise<boolean> {
        return false;
    }

}