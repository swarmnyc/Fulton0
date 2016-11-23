import { App } from './framework';
import { cors } from 'koa-cors';

class SwarmMonitorAPI extends App {
    middlewares() {
        return [cors()];
    }
}

export default SwarmMonitorAPI;
