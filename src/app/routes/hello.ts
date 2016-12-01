import { Router } from '../lib';

class HelloWorldRouter extends Router {
  namespace() {
    return 'hello';
  }
  
  configure(router) {
    router.get('/', function (next: any) {
        this.body = 'Hello World!';
    });
    return router.routes();
  }
}

export = HelloWorldRouter