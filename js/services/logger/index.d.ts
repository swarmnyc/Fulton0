import { Service } from '../../service';
import * as winston from 'winston';
export interface TransportConfig {
    [TransportName: string]: TransportConfigOptions;
}
export interface TransportConfigOptions {
    enabled?: boolean;
    level?: string;
    [OptionName: string]: any;
}
export interface LoggerConfig {
    handleExceptions?: boolean;
    transports?: TransportConfig;
}
export declare class BaseLoggerService extends Service {
    instance: winston.LoggerInstance;
    name: string;
    as(): string;
    exitOnError: boolean;
    /**
     * Event handler called when an unhandledException or unhandledRejection bubbles up through the process.
     *
     * @param {Error} err
     *
     * @memberOf Logger
     */
    onException(err: Error): void;
    /**
     * Returns an object containing the transport configuration for the logger instance.
     *
     * @returns {TransportConfig}
     *
     * @memberof Logger
     */
    transports(): TransportConfig;
    private _onException(err);
    init(): Promise<any>;
    log(level?: string, msg?: string): void;
    info(msg: string, metadata?: any): void;
    error(msg: string, metadata?: any): void;
    debug(msg: string, metadata?: any): void;
    warn(msg: string, metadata?: any): void;
    verbose(msg: string, metadata?: any): void;
    silly(msg: string, metadata?: any): void;
}
export default BaseLoggerService;
