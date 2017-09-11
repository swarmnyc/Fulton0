# Routing

Setting up your own routes is just a matter of extending the Router class to cover your routes. Your App will automatically import all routes found in the `routes` folder and enable access to them in your app.

If you have a common API, subclass Router to create a generic template for handling a set of requests.

## Example

```
/* routes/my-route.ts */

import { Route } from '../lib'

export class MyRoute extends Router {
    namespace() {
        return 'my-route';
    }

    configure(router) {
        // router is an instance of koa-router
        // See https://github.com/alexmingoia/koa-router for complete documentation

        router.get('/', async function(ctx: Context, next: any) {
            ctx.response.body = 'This will is a plain text response!';
            await next();
            console.log('This will print after all request handlers have yielded next');
        });
    }
}
``` 


### Add Routes to routes/index.ts
Before your app will mount the route, you must export the route handler from the master route index located in `routes/index.ts`.

```
/* routes/index.ts */

import { MyRoute } from './my-route';
export default [
    MyRoute
]
```

