import { Model } from '../framework';

export class User extends Model {
  uniquePaths() {
    return ['email'];
  }

  requiredPaths() {
    return ['email', 'password'];
  }

  collection() {
    return 'users';
  }

  static schema() {
    return {
      email: { type: 'string', required: true, unique: true },
      password: { type: 'string', required: true }
    };
  }
}

export default User;
