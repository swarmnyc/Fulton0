import { ISchemaDefinition, ISchemaPath } from './schema';
import { ObjectID } from 'mongodb';
import * as _ from 'lodash';

export class SchemaFormatter {
    static runFormatter(value: any, schemaPath: ISchemaPath) {
        let isArray: boolean = _.endsWith(schemaPath.type, '[]');      
        let schemaPathType = isArray ? schemaPath.type.slice(0, -2) : schemaPath.type;
        var formatter = this[schemaPathType]
        if (typeof formatter === "undefined") {
          throw new TypeError(`Schema uses unknown type ${schemaPath.type}`)
        }
        if (isArray != _.isArray(value)) {
          throw new TypeError(`Mismatch type at path ${schemaPath.pathName}`)
        }
        return this[schemaPathType](value, schemaPath, schemaPathType);
      }


      static ObjectId(value, schemaPath) {
        var makeObjectId = function(value) {

          if ((!(value instanceof schemaPath.ref)) && typeof value !== "string" && typeof value !== "number" && typeof value !== "object") {
            throw new TypeError(`Cast to type ObjectId failed at path ${schemaPath.pathName}`);
          }
          if (value instanceof schemaPath.ref) {
            return value.get("_id");
          }
          let objectId = new ObjectID(value);
          if (typeof objectId !== "undefined") {
            return objectId
          } else {
            throw new TypeError(`Cast to type ObjectId failed at path ${schemaPath.pathName}`);
          }
        }

        if (_.isArray(value)) {
          return _.map(value, makeObjectId)
        }
        return makeObjectId(value);
      }

      static string(value, schemaPath) {
        var makeString = function(value) {
          if (typeof value !== "string") {
            throw new TypeError(`Found type ${typeof value} at path ${schemaPath.pathName} ${schemaPath.type} expected.`)
          } 
          return value;
        }
        if (_.isArray(value)) {
          return _.map(value, makeString);
        }
        return makeString(value);
      }

      static number(value, schemaPath) {
        var makeNumber = function(value) {
          let number = Number(value);
          if (typeof number !== "number" || _.isNaN(number) == true) {
            throw new TypeError(`Found type ${typeof value} at path ${schemaPath.pathName} ${schemaPath.type} expected.`)
          }
          return number;
        }
        if (_.isArray(value)) {
          return _.map(value, makeNumber);
        }
        return makeNumber(value);
      }

      static date(value, schemaPath) {
        var makeDate = function(value) {
          if (typeof value !== "number" && typeof value !== "string" && _.isDate(value) == false) {
            throw new TypeError(`Found type ${typeof value} at path ${schemaPath.pathName} ${schemaPath.type} expected.`)
          }
          if (_.isDate(value)) {
            return value;
          }
          return new Date(value);
        }
        if (_.isArray(value)) {
          return _.map(value, makeDate)
        }
        return makeDate(value);
      }

      static boolean(value, schemaPath) {
        var makeBoolean = function(value) {
          if (typeof value !== "string" && _.isBoolean(value) == false && typeof value !== "number") {
            throw new TypeError(`Found type ${typeof value} at path ${schemaPath.pathName} ${schemaPath.type} expected.`) 
          }
          if (_.isBoolean(value)) {
            return value;
          }
          return new Boolean(value)
        }
        if (_.isArray(value)) {
          return _.map(value, makeBoolean);
        }
        return makeBoolean(value);
      }
}
