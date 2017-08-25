import { Model as MongoritoModel } from 'mongorito';
import { IAttributesHash } from 'mongorito';
import * as _ from 'lodash';
import { ISchemaDefinition, Schema } from './schema';
import { ValidationError, UniqueError, RequiredError } from './schema-error';
import { ObjectID } from 'mongodb';


export class Model extends MongoritoModel {
  static ValidationError = ValidationError;
  static UniqueError = UniqueError;
  static RequiredError = RequiredError;
  static ObjectID = ObjectID;
  static appliedIndex: boolean;
  collectionName: string;

  get changedKeys() {
    let changedKeys = this.changed;
    return _.omitBy(changedKeys, function(value) {
      return value === false;
    });
  }
  /**
   * Define a schema for your model here.
   * 
   * @returns {ISchemaDefinition}
   * 
   * @memberOf Model
   */
  schema(): ISchemaDefinition {
    return undefined;
  }

  static schema(): ISchemaDefinition {
    return new this().schema();
  }
  
  static isSchemaKeyRelationship(key: string): boolean {
    let schema = this.schema();
    const schemaEntry = schema[key];
    if (typeof schemaEntry !== "undefined") {
      return typeof schemaEntry["ref"] !== "undefined"
    }
    return false;
  }
  
  static isSchemaKeyArray(key: string): boolean {
    let schema = this.schema();
    const schemaEntry = schema[key];
    if (typeof schemaEntry !== "undefined") {
      let typeSplit: string[] = schemaEntry.type.split('[');
      let type = typeSplit[0];
      let isArray: boolean = typeSplit.length > 1;
      return isArray;
    }
    return false
  }

  protected _schema: Schema
  protected _isNew: boolean

  /**
   * Returns true if constructor has a schema attached to it
   * 
   * @readonly
   * @protected
   * @static
   * 
   * @memberOf Model
   */
  get hasSchema() {
    return Object.keys(this.schema()).length > 0;
  }

  protected _getParent() {
    return <typeof Model>this.constructor;
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
    return this._isNew;
  }

  async setAndValidate(newAttr: any): Promise<Model> {
    let newAttributes: IAttributesHash = this.validateAndTypecastAttributes(newAttr);
    this.set(newAttributes);
    return this.validate();
  }

 validateAndTypecastAttributes(attrs: IAttributesHash): IAttributesHash {
    return this._schema.validateAndTypeCastObject(attrs);
  }

  /**
   * Validates the model against its schema. Setup a catch on the returned Promise to catch validation errors.
   * 
   * @returns {Promise<Model>} 
   * 
   * @memberof Model
   */
  async validate(): Promise<Model> {
    if (!this._schema) {
      throw new ReferenceError('Called validate on model with no schema');
    }
    return this._schema.validate(this);
  }

  /**
   * Register middleware hooks for your model here. For schema support, do not forget to call
   * super.configure() or else schema will not be validated.
   * 
   * 
   * @memberOf Model
   */
  configure() {}

  protected async _validate(next: any) {
    return this._schema.validate(this);
  }

  protected _setTimestampPaths() {
    const schema = this._schema;
    schema.add('createdAt', { type: 'date', defaultValue: Date.now });
    schema.add('updatedAt', { type: 'date', defaultValue: Date.now });    
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
    const timestamp = new Date();
    if (_.isNil(this.get('createdAt'))) {
      this.set('createdAt', timestamp);
    }
    this.set('updatedAt', timestamp);

    await next;
  }

  protected async _setIsNew(next: any) {
    this._isNew = false;
    await next;
  }

  async setIndex() {
    let indexPaths: any;
    let ParentModel = this._getParent();
    ParentModel.appliedIndex = true;

    indexPaths = _.pickBy(this.schema(), (schemaPath, pathName) => {
      return !!schemaPath.unique || !!schemaPath.index;
    });

    _.forEach(indexPaths, (schemaPath, pathName) => {
      let o: any = {};

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

  constructor(attr?: any, opts?: any) {    
    super(attr, opts);

    const Parent = this._getParent();
    const schema = this.schema();
    const collection = this.collection;

    this._isNew = (!_.get(attr, '_id'));

    // The underlying mongorito class constructor overrides the collection() function with a string
    if (typeof collection === 'string') {
      this.collectionName = collection;
    } else if (_.isFunction(collection)) {
      this.collectionName = collection();
    }

    // Register schema hooks BEFORE any registered middleware handlers
    if (schema) {
      this._schema = new Schema(schema, Parent);            
      this._hooks.before.save.unshift(this._validate);
      this.after('save', '_setIsNew');

      if (this.timestamps() === true) {
        this._hooks.before.save.unshift(this._updateTimestamps);
        this._setTimestampPaths();
      }
      if (!Parent.appliedIndex) {
        this.setIndex();
      }
    }
  }
}

export default Model