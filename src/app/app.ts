import { App } from './lib';
import * as cors from 'koa-cors';

class MyApp extends App {
    middleware() {
        return [cors()];
    }
}

export default MyApp;
