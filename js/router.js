"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const KoaRouter = require('koa-joi-router');
/**
 * The generic Router class. Wraps around koa-router to provide some convenience function
 *
 * @export
 * @class Router
 */
class Router {
    constructor(router = KoaRouter()) {
        this.router = router;
        this.router.prefix(this.prefix());
        if (this.auth()) {
            this.router.use(this.auth());
        }
        this.configure(this.router);
    }
    prefix() {
        const namespace = this.namespace();
        return (!!namespace) ? `/${namespace}` : '';
    }
    ;
    isAPI() {
        return false;
    }
    name() {
        return this.constructor.name;
    }
    description() {
        return;
    }
    /**
     * Auth middleware to use on request. This middleware is called _before_ any routes in configure()
     *
     * @returns {RequestHandler}
     *
     * @memberof Router
     */
    auth() {
        return;
    }
    /**
     * Permissions middleware. This must be invoked manually in configure() as we can't be sure at what stage
     * of the request permissions will need to be checked.
     *
     * @memberof Router
     */
    permissions() {
        return function (ctx, model) {
            return __awaiter(this, void 0, void 0, function* () {
                return true;
            });
        };
    }
    querySet(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            return ctx.query;
        });
    }
    /**
     * Returns the underlying router's event listeners.
     * Used by the Route Loader to mount routes in the app.
     *
     * @returns {KoaRouter}
     *
     * @memberof Router
     */
    routes() {
        return this.router.middleware();
    }
    allowedMethods() {
        return this.router.allowedMethods();
    }
    /**
     * Set the namespace for the route. All defined routes will lie behind this string.
     *
     * @returns {string}
     *
     * @memberof Router
     */
    namespace() {
        return undefined;
    }
    /**
     * Map your route handlers to the router object here.
     *
     * @param {KoaRouter<KoaRouter.Context>} router
     *
     * @memberof Router
     */
    configure(router) {
    }
}
exports.Router = Router;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Router;
//# sourceMappingURL=router.js.map