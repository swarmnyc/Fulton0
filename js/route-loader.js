"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RouteLoader {
    constructor() {
        this.path = 'routes';
    }
    load(app) {
        const Routes = app.routers();
        Routes.forEach((Route) => {
            const router = new Route();
            app.register(router);
        });
        return;
    }
}
exports.RouteLoader = RouteLoader;
exports.default = RouteLoader;
//# sourceMappingURL=route-loader.js.map