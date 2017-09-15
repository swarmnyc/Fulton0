import { JSONAPIRouter } from 'fulton';
import { Article } from '../models';
import { Context } from 'fulton';
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