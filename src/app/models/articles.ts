import { Model } from '../../lib';
import { User } from './user';
import { SchemaTypes, ISchemaDefinition } from '../../lib';
export class Article extends Model {
  
  collection(): string {
    return 'articles';
  }

  concurrencyControl(): boolean {
    return true
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
