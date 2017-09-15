import { App, Service, Router } from 'fulton';
import * as Services from './services';
import * as Routers from './routes';
import * as cors from 'kcors';
// Include in app middleware() to enable caching. NOTE: requires redis
//import { cache } from './lib/middlewares/cache';

class SWARMApp extends App {
    middleware() {
        return [function() { return cors() }];
    }
    services(): typeof Service[] {
        return Services.default
    }
    routers(): typeof Router[] {
        return Routers.default as typeof Router[]
    }
}

export default SWARMApp;
