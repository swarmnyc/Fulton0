import * as mongorito from 'mongorito';
import { Service } from '../framework';

interface MongoDBConfig {
  mongoURI: string
}

class MongoDB extends Service {  
  config: MongoDBConfig
  as = 'db'

  async init() {
    await  mongorito.connect(this.config.mongoURI);
    this.instance = mongorito;
    return this;
  }

  async deinit() {
    await this.instance.disconnect();
    return this;
  }
}

export = MongoDB