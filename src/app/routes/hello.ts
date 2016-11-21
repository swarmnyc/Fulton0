import { Router } from '../framework';

class HelloWorldRouter extends Router {
  prefix() {
    return '/hello';
  }
  public routes = () => {
    const router = this.router;
    router.get('/', function (next: any) {
        this.body = 'Hello World!';        
    });
    return router.routes();
  }
}

export = HelloWorldRouter