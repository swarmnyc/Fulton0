import { Model } from '../..';
import { QueryParams } from './types';
export declare function _queryHelper(model: typeof Model, query?: QueryParams, method?: string): Promise<any>;
export declare function queryHelper(model: typeof Model, query?: any): Promise<Model[]>;
export declare function countHelper(model: typeof Model, query?: any): Promise<any>;
