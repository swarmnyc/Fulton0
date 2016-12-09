# Services

Services provide access to various libraries throughout your app. They can be accessed via routes or in your base app. Services are loaded as singletons.

## Built-In Services

There are a number of built-in services that provide various functionality for your app. To use a built-in service, export a class that extends the base service in the `/services` directory.

```
/* app/services/mongodb.ts */

import { BaseMongoDBService } from '../lib/services/mongodb';

export class MongoDB extends BaseMongoDBService {}
```

Then add the service to `/services/index.ts`:

```
export * from './mongodb';
```

You can override default configuration methods with your own to configure the service for your app:

```
/* app/services/mongodb.ts */

import { BaseMongoDBService } from '../lib/services/mongodb';

export class MongoDB extends BaseMongoDBService {
  mongoUri() {
    return 'mongodb://username:password@dx43717.mlab.com/my-database';
  }
}
```

### Built-in service list:

| Service | Base Class Name    | File path             | Mount Name* |
|---------|--------------------|-----------------------|-------------|
| MongoDB | BaseMongoDBService | /lib/services/mongodb | db          |
| Logger  | BaseLoggerService  | /lib/services/logger  | log         |
| OAuth2  | BaseOAuth2Service  | /lib/services/oauth2  | oauth       |

\* `app.services.{name}` or in a route handler `this.services.{name}`

## Accessing Services

Services are accessible either directly through the app object under `app.services` or in a route handler under `this.services`.

## Creating Services

You can create your own services by adding a files to `/services` and exporting it via `/services/index.ts`.

Services typically take an existing service library and wraps around its functions or exposes an instance of the service via the `instance` property.

These instances are created when the `init()` method is called on a service.

Here's an example of the mongodb service's init hook:

```
/* /app/lib/services/mongodb/index.ts */
import * as Models from '../../../models';
import * as mongorito from 'mongorito';

class BaseMongoDBService extends Service {
  ...

  async init() {
    const instance = mongorito;
    await mongorito.connect(this.mongoUri());

    _.forEach(Models, (Model) => {
      this.setIndex(Model);
    });

    return instance;
  }
```

The init hook above does three things:

1. Connects mongorito to a database
2. Iterates over the app's models and calls the `setIndex()` method on them
3. Returns mongorito as the instance of the service

Note that only the `instance` property is exposed to the app. Any methods added directly to the `Service` class will not be avalable. They must exist on whatever is returned by `init()`.
