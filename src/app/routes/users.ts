import JSONAPIRouter from '../lib/api-router';
import User from '../models/user';

class UserRouter extends JSONAPIRouter {
  Model() {
    return User;
  }
}

export = UserRouter;