import { Model as MongoritoModel } from 'mongorito';
import { pickBy as _pickBy, forEach as _forEach, isNil as _isNil, has as _has, endsWith as _endsWith, isArray as _isArray  } from 'lodash';
import { ObjectID } from 'mongodb';

interface IValidator {
  (): boolean | string
}

interface ISchemaPath {
  type: string
  unique?: boolean
  required?: boolean
  index?: boolean
  validator?: IValidator
  ref?: string
  defaultValue?: any
}

interface ISchema {
  [Path: string]: ISchemaPath
}

export class Model extends MongoritoModel {
  /**
   * Define a schema for your model here.
   * 
   * @static
   * @returns {ISchema}
   * 
   * @memberOf Model
   */
  static schema(): ISchema {
    return {};
  }

  /**
   * Returns true if constructor has a schema attached to it
   * 
   * @readonly
   * @protected
   * @static
   * 
   * @memberOf Model
   */
  static get hasSchema() {
    return Object.keys(this.schema()).length > 0;
  }

  protected _getParent() {
    return <typeof Model>this.constructor;
  }

  protected _getSchema() {
    const Parent = <typeof Model>this.constructor;
    return Parent.schema();
  }

  /**
   * Return true to automatically add an updatedAt and createdAt path to a model.
   * 
   * @returns {boolean}
   * 
   * @memberOf Model
   */
  timestamps() {
    return false;
  }

  /**
   * Check if a document is a newly created document.
   * 
   * @returns {boolean} isNew - True if the document has not been saved to the db
   * 
   * @memberOf Model
   */
  isNew() {
    return _isNil(this.get('_id'));
  }

  /**
   * Register middleware hooks for your model here. For schema support, do not forget to call
   * super.configure() or else schema will not be validated.
   * 
   * 
   * @memberOf Model
   */
  configure() {
    const Parent = this._getParent();

    if (this.timestamps() === true) {
      this.before('save', '_updateTimestamps');
    }

    if (!!Parent.hasSchema) {
      this.before('save', '_removeExtraneousPaths');
      this.before('save', '_validateRequiredPaths');
      this.before('save', '_assignDefaultValues');
      this.before('save', '_validateTypeCasting');
      this.before('save', '_validateUniquePaths');
      this.before('save', '_validateValidators');
    }
  }
  /**
   * Sets timestamp paths if model.timestamps() returns true
   * 
   * @protected
   * @param {*} next
   * 
   * @memberOf Model
   */
  protected async _updateTimestamps(next: any) {
    if (_isNil(this.get('createdAt'))) {
      this.set('createdAt', Date.now());
    }
    this.set('updatedAt', Date.now());

    await next;
  }

  protected async _removeExtraneousPaths(next: any) {
    const schema = this._getSchema();
    const documentPaths = Object.keys(this.toJSON());
    let schemaPaths = Object.keys(schema);

    if (this.timestamps() === true) {
      schemaPaths = schemaPaths.concat(['updatdAt', 'createdAt']);
    }

    for (let path in documentPaths) {
      if (schemaPaths.indexOf(path) === -1) {
        this.set(path, undefined);
      }
    }

    await next;
  } 

  /**
   * Validate model's requires paths
   * 
   * @protected
   * @param {*} next
   * 
   * @memberOf Model
   */
  protected async _validateRequiredPaths(next: any) {
    const schema = this._getSchema();
    const requiredPaths = Object.keys(_pickBy(schema, (path) => {
      return path.required === true;
    }));
    for (let path of requiredPaths) {
      if (_isNil(this.get(path))) {
        throw new Error(`Missing required path ${path}`);
      }
    }

    await next;
  }

  protected async _validateUniquePaths(next: any) {
    const Parent = this._getParent();
    const schema = this._getSchema();
    const uniquePaths = Object.keys(_pickBy(schema, (path) => {
      return path.unique === true;
    }));    

    for (let path of uniquePaths) {
      let q = {};
      let val = this.get(path);
      q[path] = val;
      let docsWithVal = await Parent.count(q);
      if (docsWithVal > 0) {
        throw new Error(`Document already exists with value "${val}" at path ${path}`);
      }
    }

    await next;
  }

  protected async _validateTypeCasting(next: any) {
    const schema = this._getSchema();
    _forEach(schema, (schemaPath: ISchemaPath, pathName: string) => {
      let isArray: boolean = _endsWith(schemaPath.type, '[]');
      let schemaPathType = isArray ? schemaPath.type.substr(0, -2) : schemaPath.type;
      let value = this.get(pathName);

      const _test = (val: any, index?: any | number) => {
        let docType = typeof val;
        if (schemaPathType !== 'ObjectId' && schemaPathType !== 'date' && docType !== schemaPathType) {
          throw new Error(`Found type ${docType} at path ${pathName}, ${schemaPath.type} expected.`);        
        } else if (schemaPathType === 'date' && !(val instanceof Date)) {
          throw new Error(`Cast to type Date failed at path ${pathName}`);
        } else if (schemaPathType === 'ObjectId' && ObjectID.isValid(val) === false) {
          throw new Error(`Cast to type ObjectId failed at path ${pathName}`);
        }
      };

      if (isArray === true) {
        if (_isArray(value) === false) {
          throw new Error(`Cast to type ${schemaPath.type} failed at path ${pathName}`);
        }
        _forEach(value, _test);
      } else {
        _test(value);
      }
    });

    await next;
  }

  protected async _validateValidators(next: any) {
    const schema = this._getSchema();
    const pathsWithValidators = _pickBy(schema, (path) => {
      return path.validator && typeof path.validator === 'function';
    });
    _forEach(pathsWithValidators, (schemaPath: ISchemaPath, pathName: string) => {
      const isValid: boolean | string = schemaPath.validator.apply(this);
      if (isValid === false) {
        throw new Error(`Validation failed for ${this.get(pathName)} at path ${pathName}`);
      } else if (typeof isValid === 'string') {
        throw new Error(isValid);
      }
    });

    await next;
  }

  protected async _assignDefaultValues(next: any) {
    const schema = this._getSchema();
    const pathsWithDefaultValues = _pickBy(schema, (path) => {
      return _has(path, 'defaultValue');
    });
    _forEach(pathsWithDefaultValues, (schemaPath: ISchemaPath, pathName: string) => {
      const value = this.get(pathName);
      if (_isNil(value)) {
        this.set(pathName, schemaPath.defaultValue);
      }
    });

    await next;
  }
}

export default Model