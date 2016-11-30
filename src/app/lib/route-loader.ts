import ModuleLoader from './loader';
import App from './app';
import { resolve, join, basename, extname } from 'path';

export class RouteLoader extends ModuleLoader {
  path = 'routes'

  async action(app: App, filePath: string) {
    const Router = require(filePath);
    const basePath = `/${basename(filePath, extname(filePath))}`;
    const router = new Router();
    
    app.use(router.routes());
    return router;
  }
}

export default RouteLoader
