import { OAuth2BaseModel } from '.';
import { OAuth2User } from '../lib';

export class OAuth2ClientModel extends OAuth2BaseModel {
  async getUserFromClient(id: string, secret: string): Promise<OAuth2User> {
    return undefined;
  }
}