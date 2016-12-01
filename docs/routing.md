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
                
        router.get('/', function * (next: any) {
            this.body = 'This will is a plain text response!';
            yield next;
            console.log('This will print after all request handlers have yielded next');
        });
    }
}
``` 

### Generator Functions
koa uses es6 generator functions for request handlers. These are similar to the async/await pattern used elsewhere in the framework. Just think of the `*` character as the same as the `async` keyword and the `yield` keyword in the place of `await`.

Calling `yield next` will move on to the next piece of middleware in the route, and any code after will be run once all next functions have been called. For more information, see [koa's docs](http://koajs.com/).

### Handler Context and Value of this
koa relies heavily on context. That is why the `function` keyword is used in place of fat arrow functions. This allows koa to control the context, and ensure that `this` is always pointing to the right object.

For complete documentation on koa and methods available, check out the [koa website](http://koajs.com/).

### Add Routes to routes/index.ts
Before your app will mount the route, you must export the route handler from the master route index located in `routes/index.ts`.

```
/* routes/index.ts */

export { MyRoute } from './my-route';
```

