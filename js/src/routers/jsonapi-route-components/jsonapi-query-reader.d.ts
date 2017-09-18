import { QueryParams } from '../../helpers/query/types';
export interface QueryParamSettings {
    defaultLimit(): number;
    maxLimit(): number;
}
export declare class QueryReader {
    static getQueryParams(settings: QueryParamSettings, queryObj: any): QueryParams;
}
