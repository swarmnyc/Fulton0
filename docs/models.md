# Models & DB

The default model class is a wrapper for the lightweight [mongorito](http://mongorito.com/) ORM.

The model class adds support for schema's, indexing, required paths, validation functions and other features provided by more robust ORM libraries.

### Defining a Model
Schemas are optional (though recommended). All you need to define a model is provide a collection name.

```
/* models/post.ts */

import { Model } from '../lib/model';

export class Post extends Model {
    collection() {
        return 'posts';
    }
}
```

Then add your model to `models/index.ts`:

```
/* models/index.ts */

export * from './post';
```

### Schema

Schemas add structure to your models, making it possible to validate data, assign defaults, and describe the types of data and relationships that exist in a model.

To use a schema with your model, define a schema method in your model.

```
/* models/post.ts */

import { Model } from '../lib/model';
import { User } from './user';

export class Post extends Model {
    collection() {
        return 'posts';
    }

    schema() {
        return {
            title: { type: 'string', required: true, unique: true, index: true },
            content: { type: 'string', defaultValue: 'Your content here' },
            createdBy: { type: 'ObjectId', ref: typeof User },
            comments: { type: 'string[]' },            
            likes: { type: 'number' }
        };
    }
}
```

That's about it.

#### Schema types
The type paramater is the only required property on a schema path. It accepts a string matching any JavaScript primitive type (`boolean`, `string`, `number`) with `[]` to indicate an array of values (e.g. `string[]`).

There are also two special types: `ObjectId` to refer to another document and `date` to refer to a JavaScript Date object.

**ObjectId and the ref property**

If using the `ObjectId` type on a path, you must also specify a model in the `ref` property (see example above). This is to ensure the right kind of documents are assigned to this path. Unlike mongoose, ref actually doesn't play a role in population (yet).

**Validator functions**

Validator functions can be assigned to the `validator` property of a schema path. This function will be called before a document is saved. Returning `false` or a string containing a custom validator error message will result in a `ValidationError` being thrown and the save operation aborted.

```
/* models/post.ts /*

schema() {
    return {
        title: { type: 'string', validator: function(value: string) {
            if (value === 'Unacceptable Title') {
                // Results in Validation Error
                return 'This title is unacceptable!';
            } else {
                return true;
            }
        }}
    }
}

/* helpers/post.ts */

import { Post } from '../models';

export class PostHelper {
    async unacceptablePostFactory() {
        const post = new Post({
            title: 'Unacceptable Title'
        });

        try {
            await post.save();
        } catch(e) {
            if (e instanceof Post.ValidationError) {
                console.log(e.message) // 'This title is unacceptable!' 
            }
        }
    }
}

```

**Other schema properties: required, unique, index**

Setting any of these properties to `true` will set that path to either be required (any undefined or null values in the path will throw an error). Unique will throw an error if that value already exists in another document of the same collection. Finally, index tells the MongoDB service that the path should be indexed. Indexes are loaded at launch by the MongoDB service.

### get/set

Models use the `.get()` and the `.set()` methods to modify the underlying object.

```
import { Post } from '..models/post';

const post = new Post({
    title: 'Awesome'
});

let title: string = post.get('title');

console.log(title); // 'Awesome'

post.set('title', 'Cool');
title = post.get('title);

console.log(post.get('title')); // 'Cool'
```

### Queries

Models use the Mongorito query API and the async/await pattern for handling asynchronous requests. Check their [docs](http://mongorito.com/) for more details, but here are the basics.

```
/* helpers/post.ts */

import { Post } from '../models';

type ObjectID = Post.ObjectID;

export async function findAwesomePosts() {
    const awesomePost = await Post.findOne({ title: 'Awesome' });

    console.log(awesomePost.get('title')); // 'Awesome'

    return awesomePost;
}

export async function findPosts(query?: any) {
    const results = await Post.find(query);

    results.forEach((post) => {
        console.log(post.get('title')); // Each title's post
    });

    return results;
}

export async function findPostById(id: ObjectID | string) {
    const post = await Post.findById(id);
    return post;
}
```

**Population**

To populate documents referenced within a Model, call the `popluate()` method:

```
const author = new Author({
    name: 'Bob'
});

await author.save();

const post = new Post({
    title: 'Example Post',
    author: author
});

await post.save();

/* Later... */

const results = await Post.populate('author', Author).find();

results.forEach((post) => {
    console.log(post.get('author.name')); // Bob
});
```