import { Router } from '../framework';

class HelloWorldRouter extends Router {
  routes() {
    const router = this.router;
    const _this = this;
    router.get('/', function *(next: any) {
        console.info('Hello');
        yield next;
        console.info('World');
    });
    return router.routes();
  }
}

export = HelloWorldRouter