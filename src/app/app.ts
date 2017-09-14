import { App } from './lib';
import * as cors from 'kcors';
// Include in app middleware() to enable caching. NOTE: requires redis
//import { cache } from './lib/middlewares/cache';

class SWARMApp extends App {
    middleware() {
        return [function() { return cors() }];
    }
}

export default SWARMApp;
