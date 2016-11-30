import { Model } from './model';
import * as _ from 'lodash';
import * as assert from 'assert';
import { ObjectID } from 'mongodb';
import { ValidationError, TypecastError, UniqueError, RequiredError } from './schema-error';

export interface ISchemaPathDefinition {
  type: string
  unique?: boolean
  required?: boolean
  index?: boolean
  validator?: IValidator
  ref?: string
  defaultValue?: any
}

export interface ISchemaDefinition {
  [Path: string]: ISchemaPathDefinition
}

interface ISchemaPath extends ISchemaPathDefinition {
  pathName: string
}

interface IValidator {
  (): boolean | string
}

type SchemaModel = typeof Model;

export class Schema {
  private _paths: ISchemaPath[]
  private _collection: string
  private _Model: SchemaModel
  private _validationMethods = ['_removeExtraneousPaths', '_validateRequiredPaths', '_assignDefaultValues', '_validateTypeCasting', '_validateUniquePaths', '_validateValidators']

  paths(): ISchemaPath[] {
    return this._paths;
  }

  Model(): SchemaModel  {
    return this._Model;
  }

  collection(): string {
    return this._collection;
  }

  add(pathName: string, def: ISchemaPathDefinition) {
    const schemaPath = Object.assign({}, { pathName: pathName }, def);
    this._paths.push(schemaPath);
  }

  async validate(doc: Model) {
    assert(doc instanceof this.Model());
    const methods = this._validationMethods;

    for (let methodName of methods) {
      await this[methodName](doc);
    }

    return doc;
  }

  constructor(def: ISchemaDefinition, collection: string, Model: SchemaModel) {
    this._Model = Model;
    this._collection = collection;
    this._paths = [];
    _.forEach(def, (pathdef: ISchemaPathDefinition, pathName: string) => {
      this.add(pathName, pathdef);
    });
  }

  /**
   * Removes paths from document that are not specified in schema
   * 
   * @protected
   * @param {Model} doc - Instance of Model
   * 
   * @returns {Promise<Model>}
   * 
   * @memberOf Schema
   */
  protected async _removeExtraneousPaths(doc: Model) {
    const pathNames = _.map(this.paths(), (path): string => {
      return path.pathName;
    });
    const documentPaths = _.keys(doc.attributes);

    for (let path of documentPaths) {
      if (pathNames.indexOf(path) === -1) {
        delete doc.attributes[path];
      }
    }

    await doc;
  }

  /**
   * Validate model's requires paths
   * 
   * @protected
   * @param {Model} doc - Instance of Model
   * 
   * @returns {Promise<Model>}
   * @memberOf Schema
   */
  protected async _validateRequiredPaths(doc: Model) {
    const paths = this.paths();
    const requiredPaths = _.filter(paths, (path) => {
      return path.required === true;
    });
    
    for (let path of requiredPaths) {
      if (_.isNil(doc.get(path.pathName))) {
        throw new RequiredError(`Missing required path ${path}`);
      }
    }

    return doc;
  }

  /**
   * Validation middleware that ensures unique paths are actually unique
   * 
   * @protected
   * @param {Model} doc - Instance of Model
   * 
   * @returns {Promise<Model>}
   * @memberOf Schema
   */
  protected async _validateUniquePaths(doc: Model) {
    const Model = this.Model();
    const paths = this.paths();
    const uniquePaths = _.filter(paths, { unique: true });

    for (let path of uniquePaths) {
      let q = {};
      let val = doc.get(path.pathName);
      q[path.pathName] = val;
      let docsWithVal = await Model.count(q);
      if (docsWithVal > 0) {
        throw new UniqueError(`Document already exists with value "${val}" at path ${path.pathName}`);
      }
    }

    return doc;
  }

  /**
   * Validates typecasting on models
   * 
   * @protected
   * @param {Model} doc - Instance of Model
   * 
   * @returns {Promise<Model>}
   * 
   * @memberOf Schema
   */
  protected async _validateTypeCasting(doc: Model) {
    const paths = this.paths();
    _.forEach(paths, (schemaPath: ISchemaPath) => {
      let isArray: boolean = _.endsWith(schemaPath.type, '[]');
      let schemaPathType = isArray ? schemaPath.type.substr(0, -2) : schemaPath.type;
      let value = doc.get(schemaPath.pathName);

      const _test = (val: any, index?: any | number) => {
        let docType = typeof val;
        if (schemaPathType !== 'ObjectId' && schemaPathType !== 'date' && docType !== schemaPathType) {
          throw new TypecastError(`Found type ${docType} at path ${schemaPath.pathName}, ${schemaPath.type} expected.`);        
        } else if (schemaPathType === 'date' && !(val instanceof Date)) {
          throw new TypecastError(`Cast to type Date failed at path ${schemaPath.pathName} with ${val}`);
        } else if (schemaPathType === 'ObjectId' && ObjectID.isValid(val) === false) {
          throw new TypecastError(`Cast to type ObjectId failed at path ${schemaPath.pathName}`);
        }
      };

      if (isArray === true) {
        if (_.isArray(value) === false) {
          throw new TypecastError(`Cast to type ${schemaPath.type} failed at path ${schemaPath.pathName}`);
        }
        _.forEach(value, _test);
      } else {
        _test(value);
      }
    });

    await doc;
  }

  /**
   * Runs custom validate() hooks on schema paths
   * 
   * @protected
   * @param {Model} doc - Instance of Model
   * 
   * @returns {Promise<Model>}
   * 
   * @memberOf Schema
   */
  protected async _validateValidators(doc: Model) {
    const paths = this.paths();
    const pathsWithValidators = _.filter(paths, (path) => {
      return path.validator && typeof path.validator === 'function';
    });
    _.forEach(pathsWithValidators, (schemaPath: ISchemaPath) => {
      const isValid: boolean | string = schemaPath.validator.apply(this);
      if (isValid === false) {
        throw new ValidationError(`Validation failed for ${doc.get(schemaPath.pathName)} at path ${schemaPath.pathName}`);
      } else if (typeof isValid === 'string') {
        throw new ValidationError(isValid);
      }
    });

    await doc;
  }

  /**
   * Assigns values on undefined paths with a defaultValue specified in their schema
   * 
   * @protected
   * @param {Model} doc - Instance of Model
   * 
   * @returns {Promise<Model>}
   * 
   * @memberOf Schema
   */
  protected async _assignDefaultValues(doc: Model) {
    const paths = this.paths();
    const pathsWithDefaultValues = _.filter(paths, (path) => {
      return _.has(path, 'defaultValue');
    });
    _.forEach(pathsWithDefaultValues, (schemaPath: ISchemaPath) => {
      const value = doc.get(schemaPath.pathName);
      if (_.isNil(value) && typeof schemaPath.defaultValue !== 'function') {
        doc.set(schemaPath.pathName, schemaPath.defaultValue);
      } else if (typeof schemaPath.defaultValue === 'function' && _.isNil(value)) {
        doc.set(schemaPath.pathName, schemaPath.defaultValue.apply(this));
      }
    });

    await doc;
  }
}

export default Schema;