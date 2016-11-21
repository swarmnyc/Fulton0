import { Model } from 'mongorito';

export class Post extends Model {
    collection() {
        return 'posts';   
    }
}

export default Post