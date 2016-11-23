"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var koa = require('koa');
var path_1 = require('path');
var lodash_1 = require('lodash');
var config_loader_1 = require('./config-loader');
var service_loader_1 = require('./service-loader');
var route_loader_1 = require('./route-loader');
var events_1 = require('events');
var bodyParser = require('koa-bodyparser');
/**
 * Base App class
 *
 * @export
 * @class App
 * @extends {EventEmitter}
 */
var App = (function (_super) {
    __extends(App, _super);
    /**
     * Creates an instance of App.
     *
     * @param {AppConfig} [config]
     *
     * @memberOf App
     */
    function App(config) {
        _super.call(this);
        this.appRoot = path_1.resolve(__dirname + "/..");
        if (config) {
            this.config = config;
        }
        this.app = new koa();
        this.on('didInit', this.didInit.bind(this));
    }
    App.prototype.middlewares = function () {
        var m = [];
        return m;
    };
    App.prototype.bodyParser = function () {
        return true;
    };
    /**
     * Returns event listener of underlying koa app
     *
     * @returns { Listener }
     *
     * @memberOf App
     */
    App.prototype.listener = function () {
        return this.app.callback();
    };
    /**
     * Fired after init() is called
     *
     *
     * @memberOf App
    
     */
    App.prototype.didInit = function () {
    };
    /**
     * Fired when there is an error bubbled up through the request middleware
     *
     *
     * @param {*} [err] - Error, if any, returned by app instance
     *
     * @memberOf App
     */
    App.prototype.onErrorRequest = function (err) {
        console.error('Error processing request:');
        console.error(err);
    };
    /**
     * Bind a middleware to the app
     *
     * @param {RequestHandler<Context>} handler
     *
     * @memberOf App
     */
    App.prototype.use = function (handler) {
        this.app.use(handler);
    };
    /**
     * Sets options on the underlying Koa context object for use in requests
     *
     * @param {string} key - Key to set the value at
     * @param {*} value - The value to set
     *
     * @memberOf App
     */
    App.prototype.set = function (key, value) {
        lodash_1.set(this.app.context, key, value);
    };
    /**
     * Returns value bound to specified key in the app's context object
     *
     * @param {string} key
     * @returns
     *
     * @memberOf App
     */
    App.prototype.get = function (key) {
        return lodash_1.get(this.app.context, key);
    };
    /**
     * Returns a new Koa app instance with routes and services loaded into the app
     *
     * @returns {Application}
     *
     * @memberOf App
     */
    App.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function* () {
            console.info('app.init() called');
            var app = this.app;
            var configLoader = new config_loader_1["default"]();
            var serviceLoader = new service_loader_1["default"]();
            var routeLoader = new route_loader_1["default"]();
            console.info('Loading config...');
            this.set('config', yield configLoader.load(this));
            console.info('Loading services...');
            yield serviceLoader.load(this);
            console.info('Loading middlewares...');
            if (this.bodyParser() === true) {
                app.use(bodyParser());
            }
            for (var _i = 0, _a = this.middlewares(); _i < _a.length; _i++) {
                var middleware = _a[_i];
                app.use(middleware);
            }
            console.info('Loading routes...');
            yield routeLoader.load(this);
            app.on('error', this.onErrorRequest);
            this.emit('didInit');
            return app;
        });
    };
    return App;
}(events_1.EventEmitter));
exports.App = App;
exports.__esModule = true;
exports["default"] = App;
