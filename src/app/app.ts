import { App } from './lib';
import * as cors from 'koa-cors';
// Include in app middleware() to enable caching. NOTE: requires redis
//import { cache } from './lib/middlewares/cache';

class SWARMApp extends App {
    middleware() {
        return [cors];
    }
}

export default SWARMApp;
