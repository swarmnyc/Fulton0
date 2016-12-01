import { Model } from '../lib/model';
import UserHelper from '../helpers/user';

export class User extends Model {
  collection() {
    return 'users';
  }

  configure() {
    super.configure();
    this.before('save', 'saltPasswordOnSave');
  }

  public async comparePassword(candidate: string) {
    const password = this.get('password');
    return UserHelper.comparePassword(candidate, password);
  }

  async saltPasswordOnSave(next: any) {
    if (this.isNew() || this.changed['password']) {
      const passwordHash = await UserHelper.hashPassword(this.get('password'));
      this.set('password', passwordHash);
    }

    await next;
  }

  schema() {
    return {
      email: { type: 'string', required: true, unique: true },
      password: { type: 'string', required: true }
    };
  }
}

export default User;
