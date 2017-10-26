import * as mongorito from 'mongorito';
import { Service } from '../../service';
export declare class BaseMongoDBService extends Service {
    uri: string;
    /**
     * Returns the URI of the mongo connection. Defaults to mongodb://localhost:27017/test. Change the return value of this method in your subclass to specify a different URI.
     *
     *
     * @returns {string}
     *
     * @memberOf BaseMongoDBService
     */
    mongoUri(): string;
    /**
     * Overrides service Mongo URI. Use only before connection is set.
     *
     * @param {string} uri - The URI to set the service to
     *
     * @returns {void}
     */
    setMongoUri(uri: string): void;
    /**
     * Returns a string that specifies the name the service should be mounted under in the app. Defaults to 'db'
     *
     * @returns {string}
     *
     * @memberOf BaseMongoDBService
     */
    as(): string;
    init(): Promise<typeof mongorito>;
    deinit(): Promise<void>;
}
