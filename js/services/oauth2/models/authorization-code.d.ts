import { OAuth2BaseModel } from '.';
import { OAuth2AuthorizationCode, OAuth2User, OAuth2Client, OAuth2Scope, OAuth2AccessToken } from '../lib';
export declare class OAuth2CodeModel extends OAuth2BaseModel {
    getAuthorizationCode(code: string): Promise<any>;
    revokeAuthorizationCode(code: OAuth2AuthorizationCode): Promise<any>;
    saveToken(user: OAuth2User, client: OAuth2Client, scope?: OAuth2Scope, authorizationCode?: string): Promise<OAuth2AccessToken>;
}
