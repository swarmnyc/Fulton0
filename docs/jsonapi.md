# JSON API Router

The sample app comes with a custom router for handling json api routes. It accepts a Mongorito model and automatically maps it to the json-api compliant routes. There is also an adapter class that provides a deserializer/serializer.

## Setting Up Your Router

```
import { JSONAPIRouter } from '../routers/jsonapi';
import { User } from '../models/user';

export class UserRoute extends JSONAPIRouter {
    Model() {
        return User;
    }
}
```

Don't forget to add `export * from './user';` to `routes/index.ts`!

## Authentication

By default, the JSONAPIRouter class uses oauth authentication provided via `koa-oauth-server` to authenticate requests. Specifically, it uses the `ClientGrant` class to authorize oauth tokens. Tweak `/src/app/oauth/client.ts` to fit your needs or modify either classes to authenticate requests as you like.

## Defining Relationships

So the router knows how models are related to each other when handling requests, definitions need to be defined in the JSONAPIRouter class. This is done via the `relationships()` method, which returns an array of relationships objects:

```
/* routes/user.ts */

export class UserRoute extends JSONAPIRouter {
    relationships() {
        return [
            { type: 'users', path: 'friends' }
        ];
    }
}
```

Then in your model schema:

```
/* models/user.ts */

export class User extends Model {
    schema() {
        return {
            username: { type: 'string', required: true, unique: true },
            friends: { type: 'ObjectId[]', ref: User }
        };
    }
}
```

