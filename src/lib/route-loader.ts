import App from './app';

export class RouteLoader {
  path = 'routes';

  load(app: App) {
    const Routes = app.routers()
    Routes.forEach((Route) => {
      const router = new Route();
      app.register(router);
    });
    return;
  }
}

export default RouteLoader
