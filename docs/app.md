# App

Apps extend the App class. The sample app stores the central app.ts file in `src/app/app.ts`. It is recommended you preserve this organization to prevent resolution errors when loading routes and services. 

The App class has a method called `init()` that loads all the routes and services exposed by `/routes/index.ts` and `/services/index.ts` and returns a standard request listener that can be used by Node's HTTP server.

## Middleware

The App class has a `middleware()` method, which returns an array of middleware functions. Requests are passed through each function in order using koa's cascading methodology. Middleware can be a custom function or any koa-compatible middleware. The sample app uses the cors module:

```
/* src/app/app.ts */

import { App } from './lib';
import { cors } from 'koa-cors';

class MyApp extends App {
    middleware() {
        return [cors]; 
    }
}
```

If you wanted to add your own function to this that alters the response headers, you could do the following, keeping in mind that koa middleware using the es6 generator function pattern:

```
class MyApp extends App {
    middleware() {
        return [
            cors,
            function * (next: any) {
                this.set('Content-Type', 'application/json');
                yield next;
            }
        ]; 
    }
}
```

The next middleware or route in the sequence will load when `yield next` is called.

### Cascading Request Pattern

koa is different from other web frameworks in that it resolves requests in a cascading pattern. This allows one middleware to both modify a request when it comes in, and the response before it goes out. This allows for some interesting possibilites.

Here's an example of how one might measure the response time of a request (more on this in the [koa guide](https://github.com/koajs/koa/blob/master/docs/guide.md)):

```
/* src/app/middleware/request-response-tracker /*

export function requestResponseTracker(options: any) {

    return function * (next: any) {
        const start = new Date();
        let responseTime: Date;

        yield next;

        responseTime = (new Date()) - start;
        console.log(`Request took ${responseTime}ms`);
    };
}
```

To use this in your app:

```
import { App } from './lib';
import { cors } from 'koa-cors';
import { requestResponseTracker } from './middleware/request-response-tracker';

export class MyApp extends App {
    middleware() {
        return [
            cors(),
            requestResponseTracker()
        ];
    }
} 
```