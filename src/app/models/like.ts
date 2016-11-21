import { Model } from 'mongorito';

export class Like extends Model {
    collection() {
        return 'likes';   
    }
}

export default Like