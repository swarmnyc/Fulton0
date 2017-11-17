"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const _ = require("lodash");
class SchemaFormatter {
    static runFormatter(value, schemaPath) {
        let isArray = _.endsWith(schemaPath.type, '[]');
        let schemaPathType = isArray ? schemaPath.type.slice(0, -2) : schemaPath.type;
        var formatter = this[schemaPathType];
        if (typeof formatter === "undefined") {
            throw new TypeError(`Schema uses unknown type ${schemaPath.type}`);
        }
        if (isArray != _.isArray(value)) {
            throw new TypeError(`Mismatch type at path ${schemaPath.pathName}`);
        }
        try {
            return formatter(value, schemaPath, schemaPathType);
        }
        catch (error) {
            throw error;
        }
    }
    static ObjectId(value, schemaPath) {
        var makeObjectId = function (value) {
            if (value instanceof schemaPath.ref) {
                return value.get("_id");
            }
            let objectId;
            try {
                objectId = new mongodb_1.ObjectID(value);
            }
            catch (error) {
            }
            if (typeof objectId !== "undefined") {
                return objectId;
            }
            else {
                if ((!(value instanceof schemaPath.ref)) && typeof value !== "string" && typeof value !== "number") {
                    throw new TypeError(`Cast to type ObjectId failed at path ${schemaPath.pathName}`);
                }
                throw new TypeError(`Cast to type ObjectId failed at path ${schemaPath.pathName}`);
            }
        };
        if (_.isArray(value)) {
            return _.map(value, makeObjectId);
        }
        return makeObjectId(value);
    }
    static string(value, schemaPath) {
        var makeString = function (value) {
            let v = value.toString();
            if (typeof v !== "string") {
                throw new TypeError(`Found type ${typeof value} at path ${schemaPath.pathName} ${schemaPath.type} expected.`);
            }
            return v;
        };
        if (_.isArray(value)) {
            return _.map(value, makeString);
        }
        return makeString(value);
    }
    static number(value, schemaPath) {
        var makeNumber = function (value) {
            let number = Number(value);
            if (typeof number !== "number" || _.isNaN(number) == true) {
                throw new TypeError(`Found type ${typeof value} at path ${schemaPath.pathName} ${schemaPath.type} expected.`);
            }
            return number;
        };
        if (_.isArray(value)) {
            return _.map(value, makeNumber);
        }
        return makeNumber(value);
    }
    static date(value, schemaPath) {
        var makeDate = function (value) {
            if (typeof value !== "number" && typeof value !== "string" && _.isDate(value) == false) {
                throw new TypeError(`Found type ${typeof value} at path ${schemaPath.pathName} ${schemaPath.type} expected.`);
            }
            if (_.isDate(value)) {
                return value;
            }
            let date = new Date(value);
            if (typeof date === "undefined") {
                throw new TypeError(`Found type ${typeof value} at path ${schemaPath.pathName} ${schemaPath.type} expected.`);
            }
            console.log(date);
            return date;
        };
        if (_.isArray(value)) {
            return _.map(value, makeDate);
        }
        return makeDate(value);
    }
    static boolean(value, schemaPath) {
        var makeBoolean = function (value) {
            if (value !== "true" && value !== "false" && value !== 1 && value !== 0 && value !== true && value !== false) {
                throw new TypeError(`Found type ${typeof value} at path ${schemaPath.pathName} ${schemaPath.type} expected.`);
            }
            var booleanValue = (value === "true" || value === 1 || value === true);
            return booleanValue;
        };
        if (_.isArray(value)) {
            return _.map(value, makeBoolean);
        }
        return makeBoolean(value);
    }
    static object(value, schemaPath) {
        return value;
    }
}
exports.SchemaFormatter = SchemaFormatter;
//# sourceMappingURL=schema-formatter.js.map