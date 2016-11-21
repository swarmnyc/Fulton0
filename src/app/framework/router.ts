import * as KoaRouter  from 'koa-router';
import * as Application from 'koa/lib/application';
import { get as _get, forEach as _forEach, isNil as _isNil } from 'lodash'; 

export class Router { 
  router: KoaRouter<KoaRouter.Context>
  prefix(): string {
    return null;
  };

  public routes = () => {
    const router = this.router;    
    return router.routes();
  }

  constructor() {
    if (!_isNil(this.prefix())) {
      this.router = new KoaRouter({ prefix: this.prefix()});
    } else {
      this.router = new KoaRouter();
    }
    
  }
}

export default Router;
