import { BaseOAuth2Service } from '../../lib';
import { PasswordGrant } from '../oauth/password';

export class OAuth2 extends BaseOAuth2Service {
  model() {
    return PasswordGrant;
  }
}