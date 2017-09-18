export declare class Service {
    instance: any;
    /**
     * Name to use for the service in the app. Defaults to the name of the service class.
     *
     * @returns {string}
     *
     * @memberof Service
     */
    as(): string;
    /**
     * This function is called when the service is instantiated. It should return a new instance of the underlying service and apply any boot-up operations.
     *
     * @returns {Promise<any>}
     * @memberof Service
     */
    init(): Promise<any>;
    /**
     *
     *
     *
     * @memberof Service
     */
    load(): Promise<void>;
    /**
     * Function that is called when the service is tore down. Do any clean up that needs to happen here.
     *
     * @returns {Promise<void>}
     *
     * @memberof Service
     */
    deinit(): Promise<void>;
    /**
     * Returns the instance of the service
     *
     * @returns {any} - Service instance
     *
     * @memberof Service
     */
    get(): any;
}
export default Service;
