import JSONAPIRouter from '../routers/jsonapi';
import { User } from '../models';

export class UserRouter extends JSONAPIRouter {
  Model() {
    return User;
  }
  type() {
    return 'users';
  }
}

export default UserRouter;