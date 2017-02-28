interface ServiceCallback {
  (err?: any, instance?: Service): void
}

export class Service {
  instance: any

  /**
   * Name to use for the service in the app. Defaults to the name of the service class.
   * 
   * @returns {string}
   * 
   * @memberof Service
   */
  as(): string {
    return this.constructor.name;
  }

  /**
   * This function is called when the service is instantiated. It should return a new instance of the underlying service and apply any boot-up operations.   
   * 
   * @returns {Promise<any>}
   * @memberof Service
   */
  async init(): Promise<any> {
    return;
  }

  /**
   * 
   * 
   * 
   * @memberof Service
   */
  async load(): Promise<void> {
    this.instance = await this.init();
    return;
  }

  /**
   * Function that is called when the service is tore down. Do any clean up that needs to happen here.
   * 
   * @returns {Promise<void>}
   * 
   * @memberof Service
   */
  async deinit(): Promise<void> {
    return;
  }

  /**
   * Returns the instance of the service
   * 
   * @returns {any} - Service instance
   * 
   * @memberof Service
   */
  get() {
    return this.instance;
  }
}

export default Service
