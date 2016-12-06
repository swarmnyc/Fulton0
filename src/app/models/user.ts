import { Model } from '../lib/model';
import { hashPassword, comparePassword } from '../helpers/user';
import { OAuthToken } from '.';

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
      email: { type: 'string', required: true, unique: true },
      password: { type: 'string', required: true },
      secret: { type: 'string' }
    };
  }
}

export default User;
