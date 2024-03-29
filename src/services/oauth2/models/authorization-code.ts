import { OAuth2BaseModel } from '.';
import { OAuth2AuthorizationCode, OAuth2User, OAuth2Client, OAuth2Scope, OAuth2AccessToken } from '../lib';
import { Context } from 'koa';

export class OAuth2CodeModel extends OAuth2BaseModel {
  async getUserFromCode(code: string, ctx: Context): Promise<OAuth2User> {
        return undefined
    }

  async getTokenForUser(user: OAuth2User, client: OAuth2Client): Promise<OAuth2AccessToken> {
    return undefined;
  }
}