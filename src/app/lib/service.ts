interface ServiceConfig {
  [K: string]: any
}

interface ServiceCallback {
  (err?: any, instance?: Service): void
}

export class Service {
  config: ServiceConfig
  instance: any
  as?: string

  constructor(config: ServiceConfig) {
    this.config = config;    
  }

  async init() {
    this.instance = null;
    return this;
  }

  async deinit() {
    return this;
  }

  get() {
    return this.instance;
  }
}

export default Service
