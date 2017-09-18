import { OAuth2AccessToken, OAuth2Client, OAuth2User, OAuth2Scope } from '../lib';
export declare class OAuth2BaseModel {
    getAccessToken(token: string): Promise<OAuth2AccessToken>;
    getClient(id: string, secret: string): Promise<OAuth2Client>;
    saveToken(user: OAuth2User, client: OAuth2Client, scope?: OAuth2Scope): Promise<OAuth2AccessToken>;
    validateScope(token: OAuth2AccessToken, scope: string[] | string): Promise<boolean>;
}
