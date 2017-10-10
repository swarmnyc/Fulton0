import { JSONAPIRouter, Context, BaseContext } from 'fulton';
import { User } from '../models';
import { SWARMApp } from '../app'
import { authTokenMiddleware } from '../middlewares/token-auth'

export class UserRouter extends JSONAPIRouter {

  Model() {
    return User;
  }

  auth() {
    return authTokenMiddleware(['GET'])
  }
  
}

export default UserRouter;