import { Model as MongoritoModel } from 'mongorito';
import { pickBy as _pickBy, forEach as _forEach, isNil as _isNil } from 'lodash';
import { ObjectID } from 'mongodb';
import { endsWith as _endsWith, isArray as _isArray } from 'lodash';

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
}

interface ISchema {
  [Path: string]: ISchemaPath
}

export class Model extends MongoritoModel {
  static schema(): ISchema {
    return {};
  }

  static get hasSchema() {
    return Object.keys(this.schema()).length > 0;
  }

  configure() {
    const Parent = <typeof Model>this.constructor;
    if (!!Parent.hasSchema) {
      this.before('save', 'validateRequiredPaths');
      this.before('save', 'validateTypeCasting');
      this.before('save', 'validateUniquePaths');
      this.before('save', 'validateValidators');
    }
  }

  async validateRequiredPaths(next: any) {
    const Parent = <typeof Model>this.constructor;
    const requiredPaths = Object.keys(_pickBy(Parent.schema(), (path) => {
      return path.required === true;
    }));
    for (let path of requiredPaths) {
      if (_isNil(this.get(path))) {
        throw new Error(`Missing required path ${path}`);
      }
    }

    await next;
  }

  async validateUniquePaths(next: any) {
    const Parent = <typeof Model>this.constructor;
    const uniquePaths = Object.keys(_pickBy(Parent.schema(), (path) => {
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

  async validateTypeCasting(next: any) {
    const Parent = <typeof Model>this.constructor;
    _forEach(Parent.schema(), (schemaPath: ISchemaPath, pathName: string) => {
      let isArray: boolean = _endsWith(schemaPath.type, '[]');
      let schemaPathType = isArray ? schemaPath.type.substr(0, -2) : schemaPath.type;
      let value = this.get(pathName);

      const _test = (val: any, index?: any | number) => {
        let docType = typeof val;
        if (schemaPathType !== 'ObjectId' && docType !== schemaPathType) {
          throw new Error(`Found type ${docType} at path ${pathName}, ${schemaPath.type} expected.`);        
        } else if (schemaPath.type === 'ObjectId' && ObjectID.isValid(val) === false) {
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

  async validateValidators(next: any) {
    const Parent = <typeof Model>this.constructor;
    const pathsWithValidators = _pickBy(Parent.schema(), (path) => {
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
}

export default Model