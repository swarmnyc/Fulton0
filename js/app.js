"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
//import * as Application from 'koa/lib/application';
const dotenv = require("dotenv");
dotenv.config();
const Koa = require("koa");
const KoaRouter = require("koa-joi-router");
const service_loader_1 = require("./service-loader");
const path_1 = require("path");
const route_loader_1 = require("./route-loader");
const events_1 = require("events");
const _ = require("lodash");
const bodyParser = require("koa-bodyparser");
const conditional = require("koa-conditional-get");
const etag = require("koa-etag");
const docs = require("koa-docs");
const _set = _.set;
const _get = _.get;
const { Joi } = KoaRouter;
/**
 * Base App class
 *
 * @export
 * @class App
 * @extends {EventEmitter}
 */
class App extends events_1.EventEmitter {
    routers() {
        return [];
    }
    services() {
        return [];
    }
    oauthModels() {
        return [];
    }
    /**
     * Returns an array of request handler middlewares to apply to each incoming request before passing the request off to the router.
     *
     * @returns {RequestHandler<Context>[]}
     *
     * @memberOf App
     */
    middleware() {
        const m = [];
        return m;
    }
    /**
     * Boolean indicating whether the app should apply bodyparser middleware
     *
     * @returns {boolean}
     *
     * @memberof App
     */
    bodyParser() {
        return true;
    }
    /**
     * Return true if the app should apply etag middleware
     *
     * @returns {boolean}
     *
     * @memberof App
     */
    etag() {
        return true;
    }
    /**
     * Creates an instance of App.
     *
     * @param {AppConfig} [config] - Optional configuration settings for your app
     *
     * @memberOf App
     */
    constructor() {
        super();
        this.appRoot = path_1.resolve(`${__dirname}/..`);
        this.app = new Koa();
        this._services = {};
        this._groups = [];
        this.on('didInit', this.didInit.bind(this));
    }
    /**
     * Returns event listener of underlying koa app
     *
     * @returns { Listener }
     *
     * @memberOf App
     */
    listener() {
        return this.app.callback();
    }
    /**
     * Event fired after init() is called. Replace with your own function
     * to fire an event after the app is ready
     *
     *
     * @memberOf App
    
     */
    didInit() { }
    /**
     * Fired when there is an error bubbled up through the request middleware
     *
     *
     * @param {Error|string} err - Error, if any, returned by app instance
     *
     * @memberOf App
     */
    didError(err, ctx) { }
    /**
     * Bind a middleware to the app
     *
     * @param {RequestHandler<Context>} handler
     *
     * @memberOf App
     */
    use(handler) {
        this.app.use(handler);
    }
    /**
     * Sets options on the underlying Koa context object for use in requests
     *
     * @param {string} key - Key to set the value at
     * @param {*} value - The value to set
     *
     * @memberOf App
     */
    set(key, value) {
        _set(this.app.context, key, value);
    }
    /**
     * Returns value bound to specified key in the app's context object
     *
     * @param {string} key
     * @returns
     *
     * @memberOf App
     */
    get(key) {
        return _get(this.app.context, key);
    }
    register(router) {
        if (router.isAPI() === true) {
            this._groups.push({ groupName: router.name(), description: router.description(), prefix: router.prefix(), routes: router.router.routes });
        }
        this.use(router.routes());
    }
    apiGroups() {
        return this._groups;
    }
    customSetUp(app) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    /**
     * Returns a new Koa app instance with routes and services loaded into the app
     *
     * @returns {Application}
     *
     * @memberOf App
     */
    init(opts = { loadRoutes: true, loadServices: true }) {
        return __awaiter(this, void 0, void 0, function* () {
            const app = this.app;
            const serviceLoader = new service_loader_1.ServiceLoader();
            const routeLoader = new route_loader_1.default();
            let oauth;
            app.on('error', this.didError.bind(this));
            if (this.bodyParser() === true) {
                app.use(bodyParser());
            }
            if (opts.loadServices === true) {
                yield serviceLoader.load(this);
            }
            if (this._services['log']) {
                this.log = this._services['log'];
            }
            if (this.etag() === true) {
                app.use(conditional());
                app.use(etag());
            }
            for (let middleware of this.middleware()) {
                app.use(middleware());
            }
            if (opts.loadRoutes === true) {
                routeLoader.load(this);
            }
            yield this.customSetUp(app);
            app.use(docs.get('/api/docs', {
                title: `${this.constructor.name} API`,
                version: `1.0.0`,
                theme: 'lumen',
                routeHandlers: 'disabled',
                groups: this.apiGroups()
            }));
            this.emit('didInit');
            return app;
        });
    }
}
exports.App = App;
exports.default = App;
//# sourceMappingURL=app.js.map