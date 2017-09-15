"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongorito_1 = require("mongorito");
const _ = require("lodash");
const schema_1 = require("./schema");
const schema_error_1 = require("./schema-error");
const mongodb_1 = require("mongodb");
class Model extends mongorito_1.Model {
    constructor(attr, opts) {
        super(attr, opts);
        const Parent = this._getParent();
        const schema = this.schema();
        const collection = this.collection;
        this._isNew = (!_.get(attr, '_id'));
        // The underlying mongorito class constructor overrides the collection() function with a string
        if (typeof collection === 'string') {
            this.collectionName = collection;
        }
        else if (_.isFunction(collection)) {
            this.collectionName = collection();
        }
        // Register schema hooks BEFORE any registered middleware handlers
        if (schema) {
            this._schema = new schema_1.Schema(schema, Parent);
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
    get changedKeys() {
        let changedKeys = this.changed;
        return _.omitBy(changedKeys, function (value) {
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
    schema() {
        return undefined;
    }
    static schema() {
        return new this().schema();
    }
    static isSchemaKeyRelationship(key) {
        let schema = this.schema();
        const schemaEntry = schema[key];
        if (typeof schemaEntry !== "undefined") {
            return typeof schemaEntry["ref"] !== "undefined";
        }
        return false;
    }
    static isSchemaKeyArray(key) {
        let schema = this.schema();
        const schemaEntry = schema[key];
        if (typeof schemaEntry !== "undefined") {
            let typeSplit = schemaEntry.type.split('[');
            let type = typeSplit[0];
            let isArray = typeSplit.length > 1;
            return isArray;
        }
        return false;
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
    get hasSchema() {
        return Object.keys(this.schema()).length > 0;
    }
    _getParent() {
        return this.constructor;
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
    setAndValidate(newAttr) {
        return __awaiter(this, void 0, void 0, function* () {
            let newAttributes = this.validateAndTypecastAttributes(newAttr);
            this.set(newAttributes);
            return this.validate();
        });
    }
    validateAndTypecastAttributes(attrs) {
        return this._schema.validateAndTypeCastObject(attrs);
    }
    /**
     * Validates the model against its schema. Setup a catch on the returned Promise to catch validation errors.
     *
     * @returns {Promise<Model>}
     *
     * @memberof Model
     */
    validate() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._schema) {
                throw new ReferenceError('Called validate on model with no schema');
            }
            return this._schema.validate(this);
        });
    }
    /**
     * Register middleware hooks for your model here. For schema support, do not forget to call
     * super.configure() or else schema will not be validated.
     *
     *
     * @memberOf Model
     */
    configure() { }
    _validate(next) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._schema.validate(this);
        });
    }
    _setTimestampPaths() {
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
    _updateTimestamps(next) {
        return __awaiter(this, void 0, void 0, function* () {
            const timestamp = new Date();
            if (_.isNil(this.get('createdAt'))) {
                this.set('createdAt', timestamp);
            }
            this.set('updatedAt', timestamp);
            yield next;
        });
    }
    _setIsNew(next) {
        return __awaiter(this, void 0, void 0, function* () {
            this._isNew = false;
            yield next;
        });
    }
    setIndex() {
        return __awaiter(this, void 0, void 0, function* () {
            let indexPaths;
            let ParentModel = this._getParent();
            ParentModel.appliedIndex = true;
            indexPaths = _.pickBy(this.schema(), (schemaPath, pathName) => {
                return !!schemaPath.unique || !!schemaPath.index;
            });
            _.forEach(indexPaths, (schemaPath, pathName) => {
                let o = {};
                if (!!schemaPath.unique) {
                    ParentModel.index(pathName, { unique: true });
                }
                else if (schemaPath.indexType) {
                    o[pathName] = schemaPath.indexType;
                    ParentModel.index(o);
                }
                else {
                    ParentModel.index(pathName);
                }
            });
        });
    }
}
Model.ValidationError = schema_error_1.ValidationError;
Model.UniqueError = schema_error_1.UniqueError;
Model.RequiredError = schema_error_1.RequiredError;
Model.ObjectID = mongodb_1.ObjectID;
exports.Model = Model;
exports.default = Model;
//# sourceMappingURL=model.js.map