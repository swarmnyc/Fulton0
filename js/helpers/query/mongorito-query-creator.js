"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../..");
const mongodb_1 = require("mongodb");
class MongoritoQueryCreator {
    constructor(query, model) {
        this.query = query;
        this.model = model;
        this.schema = model.schema();
    }
    static createModelQuery(query, model) {
        let queryCreator = new MongoritoQueryCreator(query, model);
        queryCreator.createInitialQuery();
        queryCreator.addSorts();
        queryCreator.addFilters();
        queryCreator.addLessThanGreaterThan();
        return queryCreator.queryModel;
    }
    createInitialQuery() {
        this.queryModel = this.model.skip(this.query.options.skip).limit(this.query.options.limit);
    }
    addSorts() {
        for (let key of Object.keys(this.query.options.sort)) {
            let direction = this.query.options.sort[key];
            let sortObj = {};
            sortObj[key] = direction;
            this.queryModel = this.queryModel.sort(sortObj);
        }
    }
    addFilters() {
        let schema = this.schema;
        for (let key of Object.keys(this.query.filter)) {
            let value = this.query.filter[key];
            if (this.model.isSchemaKeyRelationship(key)) {
                this.queryModel = this._queryCreator(this.queryModel, key, value, MongoritoQueryCreator.ObjectIDCreator);
            }
            else if (__1.SchemaTypes.isString(schema[key].type)) {
                this.queryModel = this.queryModel.where(key, new RegExp(value, "i"));
            }
            else if (__1.SchemaTypes.isNumber(schema[key].type)) {
                this.queryModel = this._queryCreator(this.queryModel, key, value, Number);
            }
            else if (__1.SchemaTypes.isBoolean(schema[key].type)) {
                this.queryModel = this._queryCreator(this.queryModel, key, value, MongoritoQueryCreator.booleanCheck);
            }
            else {
                this.queryModel = this._queryCreator(this.queryModel, key, value, MongoritoQueryCreator.straightReturn);
            }
        }
    }
    _queryCreator(docs, key, value, valueConverter) {
        var values = value.split(",");
        if (values.length > 1) {
            var queries = [];
            values.forEach(function (val) {
                let query = {};
                query[key] = valueConverter(val);
                queries.push(query);
            });
            return docs.or(queries);
        }
        else {
            return docs.where(key, valueConverter(value));
        }
    }
    addLessThanGreaterThan() {
        let schema = this.schema;
        var groupLessThanGreaterThan = {};
        var addLessThanQuery = function (key, value) {
            if (typeof this.query.greaterThan[key] === "undefined") {
                let query = [];
                query[key] = {
                    "$lt": value
                };
                this.queryModel = this.queryModel.where(query);
            }
            else {
                groupLessThanGreaterThan[key] = {};
                groupLessThanGreaterThan[key].lessThan = value;
            }
        };
        for (let key of Object.keys(this.query.lessThan)) {
            let value = this.query.lessThan[key];
            if (schema[key].type === "number") {
                addLessThanQuery.bind(this)(key, Number(value));
            }
            else if (schema[key].type === "date") {
                var date = new Date(value);
                if (typeof date !== "undefined") {
                    addLessThanQuery.bind(this)(key, date);
                }
            }
        }
        var addGreaterThanQuery = function (key, value) {
            if (typeof groupLessThanGreaterThan[key] !== "undefined") {
                let query = {};
                query[key] = {
                    "$gt": value,
                    "$lt": groupLessThanGreaterThan[key].lessThan
                };
                this.queryModel = this.queryModel.where(query);
            }
            else {
                let query = {};
                query[key] = {
                    "$gt": value
                };
                this.queryModel = this.queryModel.where(query);
            }
        };
        for (let key of Object.keys(this.query.greaterThan)) {
            let value = this.query.greaterThan[key];
            if (schema[key].type === "number") {
                addGreaterThanQuery.bind(this)(key, Number(value));
            }
            else if (schema[key].type == "date") {
                var date = new Date(value);
                if (typeof date !== "undefined") {
                    addGreaterThanQuery.bind(this)(key, date);
                }
            }
        }
    }
}
MongoritoQueryCreator.straightReturn = function (value) {
    return value;
};
MongoritoQueryCreator.ObjectIDCreator = function (value) {
    return new mongodb_1.ObjectID(value);
};
MongoritoQueryCreator.booleanCheck = function (value) {
    return (value === 'true');
};
exports.default = MongoritoQueryCreator;
//# sourceMappingURL=mongorito-query-creator.js.map