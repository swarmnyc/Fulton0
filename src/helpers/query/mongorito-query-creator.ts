import { IQueryObject, IPopulateObject, IQueryOptionsObject, ISortObject } from './types';
import { forEach as _forEach } from 'lodash';
import * as _ from 'lodash';
import { Model as MongoritoModel, IQuery } from 'mongorito';
import { Model } from '../..';
import { ISchemaDefinition, Schema, SchemaTypes } from '../..';
import { ObjectID } from 'mongodb';
export default class MongoritoQueryCreator {
    static straightReturn = function(value) {
        return value
    }

    static ObjectIDCreator = function(value) {
        return new ObjectID(value);
    }

    static booleanCheck = function(value) {
        return (value === 'true')
    }

    static createModelQuery(query: IQueryObject, model: typeof Model): typeof MongoritoModel {
        let queryCreator = new MongoritoQueryCreator(query, model);
        queryCreator.createInitialQuery();
        queryCreator.addSorts();
        queryCreator.addFilters();
        queryCreator.addLessThanGreaterThan();
        return queryCreator.queryModel
    }

    query: IQueryObject
    model: typeof MongoritoModel
    queryModel: typeof MongoritoModel
    schema: ISchemaDefinition
    constructor(query: IQueryObject, model: typeof MongoritoModel) {
        this.query = query;
        this.model = model;
        this.schema = (model as typeof Model).schema();
    }

    createInitialQuery() {
        this.queryModel = this.model.skip(this.query.options.skip).limit(this.query.options.limit);
    }

    addSorts() {
        for (let key of Object.keys(this.query.options.sort)) {
            let direction = this.query.options.sort[key];
            let sortObj = {}
            sortObj[key] = direction
            this.queryModel = this.queryModel.sort(sortObj);
        }
    }

    addFilters() {
        let schema = this.schema
        for (let key of Object.keys(this.query.filter)) {
            let value = this.query.filter[key];
            if ((this.model as typeof Model).isSchemaKeyRelationship(key)) {
                this.queryModel = this._queryCreator(this.queryModel, key, value, MongoritoQueryCreator.ObjectIDCreator)
            } else if (SchemaTypes.isString(schema[key].type)) {
                this.queryModel = this.queryModel.where(key, new RegExp(value,"i"));
            } else if (SchemaTypes.isNumber(schema[key].type)) {
                this.queryModel = this._queryCreator(this.queryModel, key, value, Number)
            } else if (SchemaTypes.isBoolean(schema[key].type)) {
                 this.queryModel = this._queryCreator(this.queryModel, key, value, MongoritoQueryCreator.booleanCheck)
            } else {
                 this.queryModel = this._queryCreator(this.queryModel, key, value, MongoritoQueryCreator.straightReturn)
            }
        }
    }
    
    

    _queryCreator(docs: any, key: string, value: any, valueConverter: Function) {
        var values = value.split(",");
        if (values.length > 1) {
            var queries: any[] = [];
            values.forEach(function(val) {
                let query = {};
                query[key] = valueConverter(val);
                queries.push(query);
            })
            return docs.or(queries);
        } else {
            return docs.where(key, valueConverter(value));
        }
    }

    addLessThanGreaterThan() {
        let schema = this.schema;

        var groupLessThanGreaterThan = {};
        
        var addLessThanQuery = function(key, value) {
            if (typeof this.query.greaterThan[key] === "undefined") {
                let query: any = []
                query[key] = {
                    "$lt": value
                };
                this.queryModel = this.queryModel.where(query);
            } else {
                groupLessThanGreaterThan[key] = {};
                groupLessThanGreaterThan[key].lessThan = value;
            }
        }

        for (let key of Object.keys(this.query.lessThan)) {
            let value = this.query.lessThan[key];
            if (schema[key].type === "number") {
                addLessThanQuery.bind(this)(key, Number(value));
            } else if (schema[key].type === "date") {
                var date = new Date(value)
                if (typeof date !== "undefined") {
                    addLessThanQuery.bind(this)(key, date);
                }
            }
        }

        var addGreaterThanQuery = function(key, value) {
            if (typeof groupLessThanGreaterThan[key] !== "undefined") {
                let query: any = {};
                query[key] = {
                    "$gt": value,
                    "$lt": groupLessThanGreaterThan[key].lessThan
                }
                this.queryModel = this.queryModel.where(query);
            } else {
                let query: any = {}
                query[key] = {
                    "$gt": value
                }
                
                this.queryModel = this.queryModel.where(query)
            }
        }
    
        for (let key of Object.keys(this.query.greaterThan)) {
            let value = this.query.greaterThan[key];
            if (schema[key].type === "number") {
                addGreaterThanQuery.bind(this)(key, Number(value))
            } else if (schema[key].type == "date") {
                var date = new Date(value)
                if (typeof date !== "undefined") {
                    addGreaterThanQuery.bind(this)(key, date);
                }
            }
        }
    }





}