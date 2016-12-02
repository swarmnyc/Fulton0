import { Router } from '../lib';

export class HelloWorldRouter extends Router {
  configure(router) {
    router.get('/', function* (next: any) {
      this.set('Content-Type', 'text/html');
      this.body = '<html><title>SWARM App</title><body><h1>Hello World!</h1></body></html>';
      yield next;
    });
  }
}