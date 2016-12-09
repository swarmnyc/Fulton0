import { OAuth2BaseModel } from './base';
import { OAuth2User } from '../lib';

export class OAuth2PasswordModel extends OAuth2BaseModel {
  usernameField() {
    return 'username';
  }
  
  getUser(username: string, password: string) {
    return undefined;
  }
}

export default OAuth2PasswordModel