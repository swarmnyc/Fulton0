import { OAuth2BaseModel } from '.';
import { OAuth2AccessToken } from '../lib';
export declare class OAuth2RefreshTokenModel extends OAuth2BaseModel {
    getRefreshToken(refreshToken: string): Promise<OAuth2AccessToken>;
    revokeToken(token: OAuth2AccessToken): Promise<OAuth2AccessToken>;
}
