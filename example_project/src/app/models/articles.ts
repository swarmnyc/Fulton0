import { Model } from 'fulton';
import { User } from './user';
import { SchemaTypes, ISchemaDefinition } from 'fulton';
export class Article extends Model {
  
  collection(): string {
    return 'articles';
  }

  schema(): ISchemaDefinition {
    return {
      title: { type: SchemaTypes.String, required: true },
      body: { type: SchemaTypes.String, required: true },
      user: { type: SchemaTypes.ToOne, required: false, ref: User }
    };
  }

}

export default Article;
