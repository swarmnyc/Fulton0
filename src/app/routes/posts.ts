import JSONAPIRouter from '../routers/jsonapi';
import Post from '../models/post';

class LikeRouter extends JSONAPIRouter {
  Model() {
    return Post;
  }
  type() {
    return 'posts';
  }

  relationships() {
      return [{
          type: 'users',
          path: 'author'
      }];
  }
}

export = LikeRouter;