import { JSONAPIRouter, RelationshipType, RouterRelationship } from 'fulton';
import { Article, User } from '../models';
import { Context } from 'fulton';
export class ArticleRouter extends JSONAPIRouter {

  Model() {
    return Article;
  }

  auth() {
    return false
  }
  
}

export default ArticleRouter;