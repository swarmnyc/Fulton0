import { forEach as _forEach } from 'lodash';
import { Model } from '../..';
import * as _ from 'lodash';
import { ObjectID } from 'mongodb';
import { QueryParams, IQueryObject, IPopulateObject, IQueryOptionsObject, ISortObject } from './types';
import APIQueryConverter from './api-query-converter';
import MongoritoQueryCreator from './mongorito-query-creator';

export async function _queryHelper(model: typeof Model, query?: QueryParams, method = 'find') {
    let q = APIQueryConverter.convertQueryToQueryObject(query);
    let docs = MongoritoQueryCreator.createModelQuery(q, model);
    return docs[method]();
}

export async function queryHelper(model: typeof Model, query?: any): Promise<Model[]> {
    return _queryHelper(model, query, 'find');
}

export async function countHelper(model: typeof Model, query?: any) {
    return _queryHelper(model, query, 'count');
}