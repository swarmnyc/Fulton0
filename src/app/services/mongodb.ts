import * as mongorito from 'mongorito';
import { Service, Model } from '../lib';
import { pickBy as _pickBy, forEach as _forEach } from 'lodash';
import * as Models from '../models';

interface MongoDBConfig {
  mongoURI: string
}

type ModelConstructor = typeof Model;

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

  async setIndex(ParentModel: ModelConstructor) {
    let indexPaths: any;
    let model = new ParentModel();

    if (!!model.hasSchema) {      
      indexPaths = _pickBy(model.schema, (schemaPath, pathName) => {
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