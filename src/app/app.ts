import { App } from './framework';
import cors = require('koa-cors');

class SwarmMonitorAPI extends App {
    middlewares() {
        return [cors()];
    }
}

export default SwarmMonitorAPI;
