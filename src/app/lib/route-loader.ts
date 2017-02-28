import ModuleLoader from './loader';
import App from './app';
import { forEach as _forEach } from 'lodash';
import * as Routes from '../routes';


export class RouteLoader {
  path = 'routes'

  async load(app: App) {
    _forEach(Routes, (Route) => {      
      const router = new Route();
      app.use(router.routes());  
    });
  }
}

export default RouteLoader
