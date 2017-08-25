import { Model } from '../..';

export interface IQueryObject {
    __base?: any
    filter?: any;
    lessThan?: any;
    greaterThan?: any;
    options?: IQueryOptionsObject;
  }
  
  export interface IPopulateObject {
    [PathName: string]: Model 
  }
  
  export interface IQueryOptionsObject {
    sort?: ISortObject,
    limit?: number
    skip?: number
    populate?: IPopulateObject
  }
  
  export interface ISortObject {
    [K: string]: number
  }

export interface QueryParams {
  __base?: any
  limit?: number
  offset?: number
  page?: number
  skip?: number
  [K: string]: any
}