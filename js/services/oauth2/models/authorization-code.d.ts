import { OAuth2BaseModel } from '.';
import { OAuth2User, OAuth2Client, OAuth2AccessToken } from '../lib';
export declare class OAuth2CodeModel extends OAuth2BaseModel {
    getUserFromCode(code: string): Promise<OAuth2User>;
    getTokenForUser(user: OAuth2User, client: OAuth2Client): Promise<OAuth2AccessToken>;
}
