import { Router, Context } from '../../lib';

export class HelloWorldRouter extends Router {
  configure(router) {
    router.get('/', async function(ctx: Context, next: any) {
      ctx.response.set('Content-Type', 'text/html');
      ctx.response.body = '<html><title>SWARM App</title><body><h1>Hello World!</h1></body></html>';
      await next();
    });
  }
}