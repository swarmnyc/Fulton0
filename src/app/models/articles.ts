import { Model } from '../lib/model';
import { User } from './user';
import { SchemaTypes } from '../lib/schema';
export class Article extends Model {
  collection() {
    return 'articles';
  }


  schema() {
    return {
      title: { type: SchemaTypes.String, required: true },
      body: { type: SchemaTypes.String, required: true },
      user: { type: SchemaTypes.ToOne, required: true, ref: User }
    };
  }
}

export default User;
