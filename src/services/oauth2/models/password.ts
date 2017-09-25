import { OAuth2BaseModel } from './base';
import { OAuth2User } from '../lib';
import { Context } from 'koa';

export class OAuth2PasswordModel extends OAuth2BaseModel {
  usernameField() {
    return 'username';
  }
  
  async getUser(username: string, password: string, ctx: Context): Promise<OAuth2User> {
    return undefined;
  }
}

export default OAuth2PasswordModel