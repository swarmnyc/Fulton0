import { Model } from '../../lib';
import { hashPassword, comparePassword } from '../helpers/user';
import { OAuthToken } from '.';
import { SchemaTypes } from '../../lib';

export class User extends Model {
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
