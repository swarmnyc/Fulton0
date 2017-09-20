"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const _ = require('lodash');
const assert = require('assert');
const schema_error_1 = require('./schema-error');
const schema_formatter_1 = require('./schema-formatter');
const schema_validator_1 = require('./schema-validator');
class SchemaTypes {
    static getTypeOfArray(type) {
        return type.split("[]")[0];
    }
    static isRef(type) {
        return type == SchemaTypes.ToOne || type == SchemaTypes.ToMany;
    }
    static isString(type) {
        return type == SchemaTypes.String || type == SchemaTypes.StringArray;
    }
    static isNumber(type) {
        return type == SchemaTypes.Number || type == SchemaTypes.NumberArray;
    }
    static isDate(type) {
        return type == SchemaTypes.Date || type == SchemaTypes.DateArray;
    }
    static isBoolean(type) {
        return type == SchemaTypes.Boolean || type == SchemaTypes.BooleanArray;
    }
}
SchemaTypes.ToOne = "ObjectId";
SchemaTypes.ToMany = "ObjectId[]";
SchemaTypes.String = "string";
SchemaTypes.StringArray = "string[]";
SchemaTypes.Number = "number";
SchemaTypes.NumberArray = "number[]";
SchemaTypes.Date = "date";
SchemaTypes.DateArray = "date[]";
SchemaTypes.Boolean = "boolean";
SchemaTypes.BooleanArray = "boolean[]";
exports.SchemaTypes = SchemaTypes;
class Schema {
    constructor(def, Model) {
        this._validationMethods = ['_removeExtraneousPaths', '_enforceReadOnlyPaths', '_validateRequiredPaths', '_assignDefaultValues', '_validateTypeCasting', '_validateUniquePaths', '_validateValidators'];
        this._Model = Model;
        this._paths = [];
        _.forEach(def, (pathdef, pathName) => {
            this.add(pathName, pathdef);
        });
    }
    paths() {
        return this._paths;
    }
    Model() {
        return this._Model;
    }
    add(pathName, def) {
        const schemaPath = Object.assign({}, { pathName: pathName }, def);
        this._paths.push(schemaPath);
    }
    validate(doc) {
        return __awaiter(this, void 0, void 0, function* () {
            assert(doc instanceof this.Model());
            const methods = this._validationMethods;
            for (let methodName of methods) {
                yield this[methodName](doc);
            }
            return doc;
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
    _removeExtraneousPaths(doc) {
        return __awaiter(this, void 0, void 0, function* () {
            const pathNames = _.map(this.paths(), (path) => {
                return path.pathName;
            });
            const documentPaths = _.keys(doc.attributes);
            for (let path of documentPaths) {
                if (pathNames.indexOf(path) === -1 && path !== '_id') {
                    delete doc.attributes[path];
                }
            }
            return doc;
        });
    }
    /**
     * Sets read only paths to their previous values
     * @param {Model} doc
     * @returns {Promise<Model>}
     * @protected
     * @memberOf Schema
     */
    _enforceReadOnlyPaths(doc) {
        return __awaiter(this, void 0, void 0, function* () {
            function enforce(path) {
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
        });
    }
    /**
     * Validate model's requires paths
     * @protected
     * @param {Model} doc - Instance of Model
     * @returns {Promise<Model>}
     * @memberOf Schema
     */
    _validateRequiredPaths(doc) {
        return __awaiter(this, void 0, void 0, function* () {
            const paths = this.paths();
            const requiredPaths = _.filter(paths, (path) => {
                return path.required === true;
            });
            for (let path of requiredPaths) {
                if (_.isNil(doc.get(path.pathName))) {
                    throw new schema_error_1.RequiredError(`Missing required path ${path.pathName}`, path.pathName);
                }
            }
            return doc;
        });
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
    _validateUniquePaths(doc) {
        return __awaiter(this, void 0, void 0, function* () {
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
                let docsWithVal = yield Model.find(q);
                let notOwnDocsWithVal = docsWithVal.filter((item) => {
                    return !item.get('_id').equals(doc.get('_id'));
                });
                if (notOwnDocsWithVal.length > 0) {
                    throw new schema_error_1.UniqueError(`Document already exists with value "${val}" at path ${path.pathName}`, path.pathName, val);
                }
            }
            return doc;
        });
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
    _validateTypeCasting(doc) {
        const paths = this.paths();
        _.forEach(paths, (schemaPath) => {
            let isArray = _.endsWith(schemaPath.type, '[]');
            let schemaPathType = isArray ? schemaPath.type.slice(0, -2) : schemaPath.type;
            let value = doc.get(schemaPath.pathName);
            if (schemaPathType === 'any' || schemaPathType === 'object') {
                return;
            }
            if (_.isNil(value)) {
                return;
            }
            if (schemaPath.required || (typeof value !== "undefined" && _.isNaN(value) == false)) {
                schema_validator_1.SchemaValidator.runTypecastingValidator(value, schemaPath);
            }
        });
        return doc;
    }
    validateAndTypeCastObject(obj) {
        const paths = this.paths();
        let newObj = {};
        _.forEach(paths, (schemaPath) => {
            let isArray = _.endsWith(schemaPath.type, '[]');
            let schemaPathType = isArray ? schemaPath.type.slice(0, -2) : schemaPath.type;
            let value = obj[schemaPath.pathName];
            if (schemaPathType === 'any' || schemaPathType === 'object') {
                return;
            }
            if (_.isNil(value)) {
                newObj[schemaPath.pathName] = null;
                return;
            }
            if (schemaPath.required || (typeof value !== "undefined" && _.isNaN(value) == false)) {
                newObj[schemaPath.pathName] = schema_formatter_1.SchemaFormatter.runFormatter(value, schemaPath);
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
    _validateValidators(doc) {
        return __awaiter(this, void 0, void 0, function* () {
            const paths = this.paths();
            const pathsWithValidators = _.filter(paths, (path) => {
                return path.validator && _.isFunction(path.validator);
            });
            _.forEach(pathsWithValidators, (schemaPath) => {
                const isValid = schemaPath.validator.apply(doc, doc.get(schemaPath.pathName));
                if (isValid === false) {
                    throw new schema_error_1.ValidationError(`Validation failed for ${doc.get(schemaPath.pathName)} at path ${schemaPath.pathName}`, schemaPath.pathName, doc.get(schemaPath.pathName));
                }
                else if (typeof isValid === 'string') {
                    throw new schema_error_1.ValidationError(isValid, schemaPath.pathName, doc.get(schemaPath.pathName));
                }
            });
            yield doc;
        });
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
    _assignDefaultValues(doc) {
        return __awaiter(this, void 0, void 0, function* () {
            const paths = this.paths();
            const pathsWithDefaultValues = _.filter(paths, (path) => {
                return _.has(path, 'defaultValue');
            });
            _.forEach(pathsWithDefaultValues, (schemaPath) => {
                const value = doc.get(schemaPath.pathName);
                if (_.isNil(value) && typeof schemaPath.defaultValue !== 'function') {
                    doc.set(schemaPath.pathName, schemaPath.defaultValue);
                }
                else if (typeof schemaPath.defaultValue === 'function' && _.isNil(value)) {
                    doc.set(schemaPath.pathName, schemaPath.defaultValue.bind(doc)());
                }
            });
            return doc;
        });
    }
}
exports.Schema = Schema;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Schema;
//# sourceMappingURL=schema.js.map