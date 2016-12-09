import { OAuth2BaseModel } from '.';
import { OAuth2AuthorizationCode, OAuth2User, OAuth2Client, OAuth2Scope, OAuth2AccessToken } from '../lib';

export class OAuth2CodeModel extends OAuth2BaseModel {
  async getAuthorizationCode(code: string) {
    return undefined;
  }

  async revokeAuthorizationCode(code: OAuth2AuthorizationCode) {
    return undefined;
  }

  async saveToken(user: OAuth2User, client: OAuth2Client, scope?: OAuth2Scope, authorizationCode?: string): Promise<OAuth2AccessToken> {
    return undefined;
  }
}