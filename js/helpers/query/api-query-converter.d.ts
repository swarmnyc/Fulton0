import { QueryParams, IQueryObject } from './types';
export default class APIQueryConverter {
    private startingQuery;
    static limitKey: string;
    static sizeKey: string;
    static skipKey: string;
    static offsetKey: string;
    static pageKey: string;
    static convertQueryToQueryObject(query?: QueryParams): IQueryObject;
    query: IQueryObject;
    constructor(startingQuery?: QueryParams);
    convertQuery(): IQueryObject;
    addPaging(): void;
    addFilter(): IQueryObject;
    addSort(): QueryParams;
}
