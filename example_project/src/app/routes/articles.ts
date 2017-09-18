import { JSONAPIRouter, RelationshipType, RouterRelationship } from 'fulton';
import { Article, User } from '../models';
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

  relationships(): RouterRelationship[] {
    return [
      { type: "users", path: "user", relationshipType: RelationshipType.BELONGS_TO , Model: User }
    ]
  }
  
}

export default ArticleRouter;