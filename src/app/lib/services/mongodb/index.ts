import * as mongorito from 'mongorito';
import { Service } from '../../service';
import { Model } from '../../model';
import { pickBy as _pickBy, forEach as _forEach } from 'lodash';
import * as Models from '../../../models';

interface MongoDBConfig {
  mongoURI: string
}

type ModelConstructor = typeof Model;

export class BaseMongoDBService extends Service {
  /**
   * Returns the URI of the mongo connection. Defaults to mongodb://localhost:27017/test. Change the return value of this method in your subclass to specify a different URI.
   * 
   * 
   * @returns {string}
   * 
   * @memberOf BaseMongoDBService
   */
  mongoUri(): string {
    return 'mongodb://localhost:27017/test';
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
    await instance.connect(this.mongoUri());
    
    _forEach(Models, (Model) => {
      this.setIndex(Model);
    });

    return mongorito;
  }

  async deinit() {
    await this.instance.disconnect();
    return;
  }

  async setIndex(ParentModel: ModelConstructor) {
    let indexPaths: any;
    let model = new ParentModel();

    if (!!model.hasSchema) {      
      indexPaths = _pickBy(model.schema, (schemaPath, pathName) => {
        return !!schemaPath.unique || !!schemaPath.index;
      });

      _forEach(indexPaths, (schemaPath, pathName) => {
        let o: any;

        if (!!schemaPath.unique) {
          ParentModel.index(pathName, { unique: true });
        } else if (schemaPath.indexType) {
          o[pathName] = schemaPath.indexType;
          ParentModel.index(o);
        } else {
          ParentModel.index(pathName);
        }
      });
    }
  }
}