import { Model } from '../lib/model';
import { hashPassword, comparePassword } from '../helpers/user';
import { OAuthToken } from '.';
import { SchemaTypes } from '../lib/schema';
import { OAuth2User } from '../lib/services/oauth2/lib'

export class User extends Model implements OAuth2User {
  //implementing Oauth2User with custom getters and setters
  get id() {
    return this.get("_id");
  }
  set id(id: string) {
    this.set("_id", id);
  }

  collection() {
    return 'users';
  }

  configure() {
    this.before('save', 'saltPasswordOnSave');
  }

  async saltPasswordOnSave(next: any) {
    if (this.isNew() || this.changed['password']) {
      const passwordHash = await hashPassword(this.get('password'));
      this.set('password', passwordHash);
    }

    await next;
  }

  schema() {
    return {
      email: { type: SchemaTypes.String, required: true, unique: true },
      password: { type: SchemaTypes.String, required: true },
      secret: { type: SchemaTypes.String }
    };
  }
}

export default User;
