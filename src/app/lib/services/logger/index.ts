import { Service } from '../../service';
import * as winston from 'winston';
import * as _ from 'lodash';

interface TransportConfig {
    [TransportName: string]: TransportConfigOptions
}

// See https://github.com/winstonjs/winston/blob/master/docs/transports.md for options
interface TransportConfigOptions {
    enabled?: boolean
    level?: string
    [OptionName: string]: any
}

interface LoggerConfig {
    handleExceptions?: boolean
    transports?: TransportConfig
}

export class BaseLoggerService extends Service {
    instance: winston.LoggerInstance
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
    onException(err: Error) {
        this.instance.error(err.message, err);
    }

    /**
     * Returns an object containing the transport configuration for the logger instance.
     * 
     * @returns {TransportConfig}
     * 
     * @memberof Logger
     */
    transports(): TransportConfig {
      return undefined;
    }

    private _onException(err: Error) {
      this.onException(err);
      process.exit(1);
    }

    async init() {
        const transports: TransportConfig = this.transports();
        const instance = new winston.Logger();        
        _.forEach(transports, (settings: TransportConfigOptions, name: string) => {
            if (settings.enabled === false) {
                return;
            }

            const ts = _.omit(settings, 'enabled');
            if (winston.transports[_.upperFirst(name)]) {
                instance.add(winston.transports[_.upperFirst(name)], ts);
            }
        });

        process.on('unhandledException', this._onException.bind(this));
        process.on('unhandledRejection', this._onException.bind(this));

        return instance;
    }

    log(level?: string, msg?: string) {
        if (arguments.length === 1) {
            msg = level;
            level = 'info';
        }
        this.instance.log(level, msg);
    }

    info(msg: string, metadata?: any) {
        this.instance.info(msg, metadata);
    }

    error(msg: string, metadata?: any) {
        this.instance.error(msg, metadata);
    }

    debug(msg: string, metadata?: any) {
        this.instance.debug(msg, metadata);
    }

    warn(msg: string, metadata?: any) {
        this.instance.warn(msg, metadata);
    }

    verbose(msg: string, metadata?: any) {
        this.instance.verbose(msg, metadata);
    }

    silly(msg: string, metadata?: any) {
        this.instance.silly(msg, metadata);
    }
}

export default BaseLoggerService