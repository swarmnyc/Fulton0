import { IQueryObject } from './types';
import { Model as MongoritoModel } from 'mongorito';
import { Model } from '../..';
import { ISchemaDefinition } from '../..';
import { ObjectID } from 'mongodb';
export default class MongoritoQueryCreator {
    static straightReturn: (value: any) => any;
    static ObjectIDCreator: (value: any) => ObjectID;
    static booleanCheck: (value: any) => boolean;
    static createModelQuery(query: IQueryObject, model: typeof Model): typeof MongoritoModel;
    query: IQueryObject;
    model: typeof MongoritoModel;
    queryModel: typeof MongoritoModel;
    schema: ISchemaDefinition;
    constructor(query: IQueryObject, model: typeof MongoritoModel);
    createInitialQuery(): void;
    addSorts(): void;
    addFilters(): void;
    _queryCreator(docs: any, key: string, value: any, valueConverter: Function): any;
    addLessThanGreaterThan(): void;
}
