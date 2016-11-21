import { Model } from 'mongorito';

export class User extends Model {
  collection() {
    return 'users';
  }
}

export default User;
