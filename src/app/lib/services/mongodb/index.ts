import * as mongorito from 'mongorito';
import { Service } from '../../service';
import { Model } from '../../model';
import { pickBy as _pickBy } from 'lodash';
import * as Models from '../../../models';

interface MongoDBConfig {
  mongoURI: string
}

export class BaseMongoDBService extends Service {
  uri: string = 'mongodb://localhost:27017/test'
  
  /**
   * Returns the URI of the mongo connection. Defaults to mongodb://localhost:27017/test. Change the return value of this method in your subclass to specify a different URI.
   * 
   * 
   * @returns {string}
   * 
   * @memberOf BaseMongoDBService
   */
  mongoUri(): string {
    return this.uri;
  }

  /**
   * Overrides service Mongo URI. Use only before connection is set.
   * 
   * @param {string} uri - The URI to set the service to
   *
   * @returns {void}
   */
  setMongoUri(uri: string): void {
    this.uri = uri;
  }

  /**
   * Returns a string that specifies the name the service should be mounted under in the app. Defaults to 'db'
   * 
   * @returns {string}
   * 
   * @memberOf BaseMongoDBService
   */
  as(): string {
    return 'db';
  }

  async init() {
    const instance = mongorito;
    var options = { server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } }, 
                replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } } };
    await instance.connect(this.mongoUri(), options);
    mongorito.db.on('error', console.error.bind(console, 'connection error:'));
    return mongorito;
  }

  async deinit() {
    await this.instance.disconnect();
    return;
  }
}