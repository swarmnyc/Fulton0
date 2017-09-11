import { QueryParams, IQueryObject, IPopulateObject, IQueryOptionsObject, ISortObject } from './types';
import { forEach as _forEach } from 'lodash';
import * as _ from 'lodash';

export default class APIQueryConverter {
    static limitKey = 'limit';
    static sizeKey = 'size';
    static skipKey = "skip";
    static offsetKey = "offset";
    static pageKey = "page";


    static convertQueryToQueryObject(query?: QueryParams): IQueryObject {
        const converter = new APIQueryConverter(query);
        converter.convertQuery();
        return converter.query;
    }

    query: IQueryObject;

    constructor(private startingQuery?: QueryParams) {
        this.query = {
            filter: {},
            lessThan: this.startingQuery.lessThan || {},
            greaterThan: this.startingQuery.greaterThan || {},
            options: {
                sort: {},
                skip: 0
            }
        } 
    }
    
    convertQuery(): IQueryObject {
        this.addPaging();
        this.addSort();
        this.addFilter();
        return this.query;
    }


    addPaging() {
        let limit = this.startingQuery[APIQueryConverter.limitKey] || this.startingQuery[APIQueryConverter.sizeKey]
        if (typeof limit !== "undefined") {
            this.query.options.limit = limit;
        } else {
            return;
        }
        
        let skip = this.startingQuery[APIQueryConverter.offsetKey] || this.startingQuery[APIQueryConverter.skipKey]
        if (typeof skip == "undefined" && this.startingQuery[APIQueryConverter.pageKey] !== "undefined") {
            skip = ((parseInt(this.startingQuery[APIQueryConverter.pageKey]) - 1) * limit) //start at page 1
            if (skip < 0) {
                skip = 0
            }
        }
        if (typeof skip == "undefined" || _.isNaN(skip)) {
            skip = 0;
        }
        this.query.options.skip = skip;
    }

    addFilter() {
        let filters = this.startingQuery["filter"]
        if (typeof filters == "undefined") {
            return 
        }
        _.each(filters, function(v: any, attribute: string) {
        	if (typeof v !== "object") {
                    this.query.filter[attribute] = v;
        	} else {
                    _.each(v, function(value: any, key: string) {
                        if (key === "$gt") {
                            this.query.greaterThan[attribute] = value;
                        } else if (key === "$lt") {
                            this.query.lessThan[attribute] = value;
                        } else {
                            this.query.filter[attribute] = key;
                	}
            	}.bind(this))
	    }
        }.bind(this));
        
        return this.query
    }

    addSort() {
        function _sort(value: string) {  
            console.log(value);     
            const sortKeys = value.split(',');
            const sortObj: ISortObject = {};
            _forEach(sortKeys, (key) => {
                const isDescending: boolean = key.charAt(0) === '-';
                if (isDescending) {
                    key = key.substr(1);
                }
                sortObj[key] = (isDescending) ? -1 : 1;
            });
    
            return sortObj;
        }
        var sortValue = this.startingQuery["sort"];
        if (typeof sortValue !== "undefined") {
            this.query.options.sort = _sort(sortValue);
        }
        return this.startingQuery
    }

}