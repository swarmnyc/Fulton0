import * as mongorito from 'mongorito';
import { Service, Model } from '../framework';
import { pickBy as _pickBy, forEach as _forEach } from 'lodash';
import * as Models from '../models';

interface MongoDBConfig {
  mongoURI: string
}

class MongoDB extends Service {  
  config: MongoDBConfig
  as = 'db'

  async init() {
    await  mongorito.connect(this.config.mongoURI);
    this.instance = mongorito;
    _forEach(Models, (Model) => {
      this.setIndex(Model);
    });
    return this;
  }

  async deinit() {
    await this.instance.disconnect();
    return this;
  }

  async setIndex(ParentModel = <typeof Model>Model.constructor) {
    let indexPaths: any;    

    if (!!ParentModel.hasSchema) {      
      indexPaths = _pickBy(ParentModel.schema(), (schemaPath, pathName) => {
        return !!schemaPath.unique || !!schemaPath.index;
      });

      _forEach(indexPaths, (schemaPath, pathName) => {
        if (!!schemaPath.unique) {
          ParentModel.index(pathName, { unique: true });
        } else {
          ParentModel.index(pathName);
        }
      });
    }
  }
}

export = MongoDB