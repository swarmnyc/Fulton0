"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const KoaRouter = require("koa-joi-router");
class RouteLoader {
    constructor() {
        this.path = 'routes';
    }
    load(app) {
        const Routes = app.routers();
        Routes.forEach((Route) => {
            const router = new Route(KoaRouter(), app);
            app.register(router);
        });
        return;
    }
}
exports.RouteLoader = RouteLoader;
exports.default = RouteLoader;
//# sourceMappingURL=route-loader.js.map