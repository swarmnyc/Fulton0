import { App } from './lib';
import * as cors from 'koa-cors';
import { cache } from './lib/middlewares/cache';

class MyApp extends App {
    middleware() {
        return [cors, cache];
    }
}

export default MyApp;
