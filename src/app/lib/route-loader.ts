import App from './app';
import Routes from '../routes';


export class RouteLoader {
  path = 'routes';

  load(app: App) {
    Routes.forEach((Route) => {
      const router = new Route();
      app.register(router);
    });
    return;
  }
}

export default RouteLoader
