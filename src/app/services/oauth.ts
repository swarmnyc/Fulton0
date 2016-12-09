import { OAuth2 } from '../lib/services/oauth2';
import { PasswordGrant } from '../oauth/password';

export class OAuth extends OAuth2 {
  model() {
    return PasswordGrant;
  }
}