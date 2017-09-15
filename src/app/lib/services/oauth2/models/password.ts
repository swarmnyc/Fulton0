import { OAuth2BaseModel } from './base';
import { OAuth2User } from '../lib';

export class OAuth2PasswordModel extends OAuth2BaseModel {
  usernameField() {
    return 'username';
  }
  
  async getUser(username: string, password: string): Promise<OAuth2User> {
    return undefined;
  }
}

export default OAuth2PasswordModel