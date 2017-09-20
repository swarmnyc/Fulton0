"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const service_1 = require('../../service');
const winston = require('winston');
const _ = require('lodash');
class BaseLoggerService extends service_1.Service {
    constructor() {
        super(...arguments);
        this.name = 'app';
        this.exitOnError = true;
    }
    as() {
        return 'log';
    }
    /**
     * Event handler called when an unhandledException or unhandledRejection bubbles up through the process.
     *
     * @param {Error} err
     *
     * @memberOf Logger
     */
    onException(err) {
        this.instance.error(err.message, err);
    }
    /**
     * Returns an object containing the transport configuration for the logger instance.
     *
     * @returns {TransportConfig}
     *
     * @memberof Logger
     */
    transports() {
        return undefined;
    }
    _onException(err) {
        this.onException(err);
        //process.exit(1);
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const transports = this.transports();
            let instance;
            try {
                instance = winston.loggers.add(this.name, { exitOnError: this.exitOnError });
            }
            catch (e) {
                instance = winston.loggers.get(this.name);
            }
            _.forEach(transports, (settings, name) => {
                if (settings.enabled === false) {
                    return;
                }
                const ts = _.omit(settings, 'enabled');
                if (winston.transports[_.upperFirst(name)]) {
                    try {
                        instance.add(winston.transports[_.upperFirst(name)], ts);
                    }
                    catch (e) {
                    }
                }
            });
            //process.on('unhandledException', this._onException.bind(this));
            //process.on('unhandledRejection', this._onException.bind(this));
            return instance;
        });
    }
    log(level, msg) {
        if (arguments.length === 1) {
            msg = level;
            level = 'info';
        }
        this.instance.log(level, msg);
    }
    info(msg, metadata) {
        this.instance.info(msg, metadata);
    }
    error(msg, metadata) {
        this.instance.error(msg, metadata);
    }
    debug(msg, metadata) {
        this.instance.debug(msg, metadata);
    }
    warn(msg, metadata) {
        this.instance.warn(msg, metadata);
    }
    verbose(msg, metadata) {
        this.instance.verbose(msg, metadata);
    }
    silly(msg, metadata) {
        this.instance.silly(msg, metadata);
    }
}
exports.BaseLoggerService = BaseLoggerService;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BaseLoggerService;
//# sourceMappingURL=index.js.map