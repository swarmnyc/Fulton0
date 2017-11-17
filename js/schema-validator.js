"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
class SchemaValidator {
    static runTypecastingValidator(value, schemaPath) {
        let isArray = _.endsWith(schemaPath.type, '[]');
        let schemaPathType = isArray ? schemaPath.type.slice(0, -2) : schemaPath.type;
        var formatter = this[schemaPathType];
        if (typeof formatter === "undefined") {
            throw new TypeError(`Schema uses unknown type ${schemaPath.type}`);
        }
        if (isArray != _.isArray(value)) {
            throw new TypeError(`Mismatch type at path ${schemaPath.pathName}`);
        }
        return this[schemaPathType](value, schemaPath, schemaPathType);
    }
    static ObjectId(value, schemaPath) {
        var validateObjectId = function (value) {
            if (typeof value.getTimestamp === "undefined" || typeof value.toHexString === "undefined") {
                throw new TypeError(`Cast to type ObjectId failed at path ${schemaPath.pathName}`);
            }
            return;
        };
        if (_.isArray(value)) {
            return _.map(value, validateObjectId);
        }
        return validateObjectId(value);
    }
    static object(value, schemaPath) {
        return;
    }
    static string(value, schemaPath) {
        var validateString = function (value) {
            if (typeof value !== "string") {
                throw new TypeError(`Found type ${typeof value} at path ${schemaPath.pathName} ${schemaPath.type} expected.`);
            }
            return;
        };
        if (_.isArray(value)) {
            return _.map(value, validateString);
        }
        return validateString(value);
    }
    static number(value, schemaPath) {
        var validateNumber = function (value) {
            if (typeof value !== "number" || _.isNaN(value) == true) {
                throw new TypeError(`Found type ${typeof value} at path ${schemaPath.pathName} ${schemaPath.type} expected.`);
            }
            return;
        };
        if (_.isArray(value)) {
            return _.map(value, validateNumber);
        }
        return validateNumber(value);
    }
    static date(value, schemaPath) {
        var validateDate = function (value) {
            if (!_.isDate(value)) {
                throw new TypeError(`Found type ${typeof value} at path ${schemaPath.pathName} ${schemaPath.type} expected.`);
            }
            return;
        };
        if (_.isArray(value)) {
            return _.map(value, validateDate);
        }
        return validateDate(value);
    }
    static boolean(value, schemaPath) {
        var validateBoolean = function (value) {
            if (!_.isBoolean(value)) {
                throw new TypeError(`Found type ${typeof value} at path ${schemaPath.pathName} ${schemaPath.type} expected.`);
            }
            return;
        };
        if (_.isArray(value)) {
            return _.map(value, validateBoolean);
        }
        return validateBoolean(value);
    }
}
exports.SchemaValidator = SchemaValidator;
//# sourceMappingURL=schema-validator.js.map