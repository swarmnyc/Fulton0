import { App } from './lib';
import * as cors from 'koa-cors';

class MyApp extends App {
    middlewares() {
        return [cors];
    }
}

export default MyApp;
