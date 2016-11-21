import JSONAPIRouter from '../routers/jsonapi';
import User from '../models/user';

class UserRouter extends JSONAPIRouter {
  Model() {
    return User;
  }
  type() {
    return 'users';
  }
}

export = UserRouter;