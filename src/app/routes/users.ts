import { JSONAPIRouter } from '../lib/routers/jsonapi';
import { User } from '../models';

export class UserRouter extends JSONAPIRouter {

  Model() {
    return User;
  }

  type() {
    return 'users';
  }

  auth() {
    return function*(next: any) {
      const oauth = this.app.context.services.oauth.authenticate(); // get authenticate middleware from oauth service 
      yield oauth.call(this, next); // use call to preserve context
    };
  }
  
}

export default UserRouter;