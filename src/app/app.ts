import { App } from './framework/index';
import { cors } from 'koa-cors';

class SwarmMonitorAPI extends App {
    middlewares() {
        return [cors()];
    }
}

export default SwarmMonitorAPI;
