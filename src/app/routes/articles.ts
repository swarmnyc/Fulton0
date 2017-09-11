import { JSONAPIRouter } from '../lib/routers/jsonapi';
import { Article } from '../models';
import { Context } from '../lib';
export class ArticleRouter extends JSONAPIRouter {

  Model() {
    return Article;
  }

  type() {
    return 'articles';
  }

  auth() {
    return false
  }
  
}

export default ArticleRouter;