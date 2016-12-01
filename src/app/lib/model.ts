import { Model as MongoritoModel } from 'mongorito';
import { keys as _keys, pickBy as _pickBy, forEach as _forEach, isNil as _isNil, has as _has, endsWith as _endsWith, isArray as _isArray  } from 'lodash';
import { ISchemaDefinition, Schema } from './schema';
import { ValidationError, UniqueError, RequiredError } from './schema-error';
import { ObjectID } from 'mongodb';

export class Model extends MongoritoModel {
  static ValidationError = ValidationError
  static UniqueError = UniqueError
  static RequiredError = RequiredError
  static ObjectID = ObjectID 

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

  protected _schema: Schema

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
    return _isNil(this.get('_id'));
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
    if (_isNil(this.get('createdAt'))) {
      this.set('createdAt', timestamp);
    }
    this.set('updatedAt', timestamp);

    await next;
  }

  constructor(attr?: any, opts?: any) {    
    super(attr, opts);

    const Parent = this._getParent();
    const parentSchema = this.schema();
    const collection = this._collection;

    if (parentSchema) {
      this._schema = new Schema(parentSchema, collection, Parent);            

      if (this.timestamps() === true) {
        this.before('save', '_updateTimestamps');
        this._setTimestampPaths();
      }

      this.before('save', '_validate');
    }
  }
}