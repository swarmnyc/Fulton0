import { App } from './app';
import * as KoaRouter  from 'koa-joi-router';

export class RouteLoader {
  path = 'routes';

  load(app: App) {
    const Routes = app.routers()
    Routes.forEach((Route) => {
      const router = new Route(KoaRouter(), app);
      app.register(router);
    });
    return;
  }
}

export default RouteLoader
