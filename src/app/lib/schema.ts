import { Model } from './model';
import * as _ from 'lodash';
import * as assert from 'assert';
import { ObjectID } from 'mongodb';
import { IAttributesHash } from 'mongorito';
import { ValidationError, UniqueError, RequiredError } from './schema-error';
import { SchemaFormatter } from './schema-formatter';
import { SchemaValidator } from './schema-validator';

export class SchemaTypes {
  static getTypeOfArray(type: string): string {
    return type.split("[]")[0];
  }
  static ToOne = "ObjectId"
  static ToMany = "ObjectId[]"
  static isRef(type: String) {
    return type == SchemaTypes.ToOne || type == SchemaTypes.ToMany
  }
  static String = "string"
  static StringArray = "string[]"
  static isString(type: String) {
    return type == SchemaTypes.String || type == SchemaTypes.StringArray
  }
  static Number = "number"
  static NumberArray = "number[]"
  static isNumber(type: String) {
    return type == SchemaTypes.Number || type == SchemaTypes.NumberArray
  }
  static Date = "date"
  static DateArray = "date[]"
  static isDate(type: String) {
    return type == SchemaTypes.Date || type == SchemaTypes.DateArray
  }
  static Boolean = "boolean"
  static BooleanArray = "boolean[]"
  static isBoolean(type: String) {
    return type == SchemaTypes.Boolean || type == SchemaTypes.BooleanArray
  }
}

export interface ISchemaPathDefinition {
  type: string
  unique?: boolean
  required?: boolean
  index?: boolean
  indexType?: string
  description?: string
  example?: string
  validator?: IValidator
  ref?: typeof Model
  defaultValue?: any
  label?: string // Can be used in routes to gain information about a class
  readonly?: boolean
}

export interface ISchemaDefinition {
  [Path: string]: ISchemaPathDefinition
}

export interface ISchemaPath extends ISchemaPathDefinition {
  pathName: string
}

export interface IValidator {
  (value: any): boolean | string
}

export type SchemaModel = typeof Model;

export class Schema {
  private _paths: ISchemaPath[];
  private _Model: SchemaModel;
  private _validationMethods = ['_removeExtraneousPaths', '_enforceReadOnlyPaths', '_validateRequiredPaths', '_assignDefaultValues', '_validateTypeCasting', '_validateUniquePaths', '_validateValidators'];

  paths(): ISchemaPath[] {
    return this._paths;
  }

  Model(): SchemaModel  {
    return this._Model;
  }

  add(pathName: string, def: ISchemaPathDefinition) {
    const schemaPath = Object.assign({}, { pathName: pathName }, def);
    this._paths.push(schemaPath);
  }

  async validate(doc: Model): Promise<Model> {
    assert(doc instanceof this.Model());
    const methods = this._validationMethods;

    for (let methodName of methods) {
      await this[methodName](doc);
    }

    return doc;
  }

  constructor(def: ISchemaDefinition, Model: SchemaModel) {
    this._Model = Model;
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
  protected async _removeExtraneousPaths(doc: Model): Promise<Model> {
    const pathNames = _.map(this.paths(), (path): string => {
      return path.pathName;
    });
    const documentPaths = _.keys(doc.attributes);

    for (let path of documentPaths) {
      if (pathNames.indexOf(path) === -1 && path !== '_id') {
        delete doc.attributes[path];
      }
    }

    return doc;
  }

  /**
   * Sets read only paths to their previous values
   * @param {Model} doc
   * @returns {Promise<Model>}
   * @protected
   * @memberOf Schema
   */
  protected async _enforceReadOnlyPaths(doc: Model) {
    function enforce(path: ISchemaPath) {
      if (doc.changed[path.pathName]) {
        doc.set(path.pathName, doc.previous[path.pathName]);
      }
    }

    const paths = this.paths();
    const readOnlyPaths = paths.filter((path) => {
       return path.readonly === true;
    });
    // Skip enforcement on document creation
    if (doc.isNew() === false) {
      readOnlyPaths.forEach(enforce);
    } 
    return doc;
  }

  /**
   * Validate model's requires paths
   * @protected
   * @param {Model} doc - Instance of Model
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
        throw new RequiredError(`Missing required path ${path.pathName}`, path.pathName);
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
      if (typeof val === "undefined") {
        continue;
      }
      q[path.pathName] = val;
      let docsWithVal = await Model.find(q);
      let notOwnDocsWithVal = docsWithVal.filter((item: Model) => {
        return !item.get('_id').equals(doc.get('_id'));
      });
      if (notOwnDocsWithVal.length > 0) {
        throw new UniqueError(`Document already exists with value "${val}" at path ${path.pathName}`, path.pathName, val);
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
  protected _validateTypeCasting(doc: Model) {
    const paths = this.paths();
    _.forEach(paths, (schemaPath: ISchemaPath) => {
      let isArray: boolean = _.endsWith(schemaPath.type, '[]');      
      let schemaPathType = isArray ? schemaPath.type.slice(0, -2) : schemaPath.type;
      let value = doc.get(schemaPath.pathName);

      if (schemaPathType === 'any' || schemaPathType === 'object') { 
        return;
      }

      if (_.isNil(value)) {
        return;
      }
      if (schemaPath.required || (typeof value !== "undefined" && _.isNaN(value) == false)) {
        SchemaValidator.runTypecastingValidator(value, schemaPath);
      }

    });
    return doc;
  }

 
  validateAndTypeCastObject(obj: IAttributesHash): IAttributesHash {
    const paths = this.paths();
    let newObj = {};
    _.forEach(paths, (schemaPath: ISchemaPath) => {
      let isArray: boolean = _.endsWith(schemaPath.type, '[]');      
      let schemaPathType = isArray ? schemaPath.type.slice(0, -2) : schemaPath.type;
      let value = obj[schemaPath.pathName];

      if (schemaPathType === 'any' || schemaPathType === 'object') { 
        return;
      }

      if (_.isNil(value)) {
        return;
      }

      
      if (schemaPath.required || (typeof value !== "undefined" && _.isNaN(value) == false)) {
        newObj[schemaPath.pathName] = SchemaFormatter.runFormatter(value, schemaPath);
      }
    });
    return newObj;
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
      return path.validator && _.isFunction(path.validator);
    });
    _.forEach(pathsWithValidators, (schemaPath: ISchemaPath) => {
      const isValid: boolean | string = schemaPath.validator.apply(doc, doc.get(schemaPath.pathName));
      if (isValid === false) {
        throw new ValidationError(`Validation failed for ${doc.get(schemaPath.pathName)} at path ${schemaPath.pathName}`, schemaPath.pathName, doc.get(schemaPath.pathName));
      } else if (typeof isValid === 'string') {
        throw new ValidationError(isValid, schemaPath.pathName, doc.get(schemaPath.pathName));
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
  protected async _assignDefaultValues(doc: Model): Promise<Model> {
    const paths = this.paths();
    const pathsWithDefaultValues = _.filter(paths, (path) => {
      return _.has(path, 'defaultValue');
    });
    _.forEach(pathsWithDefaultValues, (schemaPath: ISchemaPath) => {
      const value = doc.get(schemaPath.pathName);
      if (_.isNil(value) && typeof schemaPath.defaultValue !== 'function') {
        doc.set(schemaPath.pathName, schemaPath.defaultValue);
      } else if (typeof schemaPath.defaultValue === 'function' && _.isNil(value)) {
        doc.set(schemaPath.pathName, schemaPath.defaultValue.bind(doc)());
      }
    });

    return doc;
  }
}

export default Schema;