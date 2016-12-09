import { OAuth2BaseModel } from '.';
import { OAuth2AccessToken } from '../lib';

export class OAuth2RefreshTokenModel extends OAuth2BaseModel {
  async getRefreshToken(refreshToken: string): Promise<OAuth2AccessToken> {
    return undefined;
  }

  async revokeToken(token: OAuth2AccessToken): Promise<OAuth2AccessToken> {
    return undefined;
  }
}