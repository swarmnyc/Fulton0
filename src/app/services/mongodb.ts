import * as mongorito from 'mongorito';
import { Service } from '../lib/service';
import { Model } from '../lib/model';
import { pickBy as _pickBy, forEach as _forEach } from 'lodash';
import * as Models from '../models';

interface MongoDBConfig {
  mongoURI: string
}

type ModelConstructor = typeof Model;

export class MongoDB extends Service {  
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