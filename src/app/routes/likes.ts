import JSONAPIRouter from '../routers/jsonapi';
import Like from '../models/like';

class LikeRouter extends JSONAPIRouter {
  Model() {
    return Like;
  }
  
  type() {
    return 'likes';
  }

  relationships() {
      return [{
          type: 'users',
          path: 'user'
      }, {
          type: 'posts',
          path: 'post'
      }];
  }
}

export = LikeRouter;