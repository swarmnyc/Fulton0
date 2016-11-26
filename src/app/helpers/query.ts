import { forEach as _forEach, get as _get, startsWith as _startsWith } from 'lodash';
import { Model } from 'mongorito';

interface IQueryObject {
  filter?: any;
  options?: IQueryOptionsObject;
}

interface IPopulateObject {
  [PathName: string]: Model 
}

interface IQueryOptionsObject {
  sort?: ISortObject,
  limit?: number
  skip?: number
  populate?: IPopulateObject
}

interface ISortObject {
  [K: string]: number
}

interface IQueryHelperOptions {
    queryIgnorePaths?: string[]
}

export class QueryHelper {
    constructor(opts?: IQueryHelperOptions) {
        if (!!opts.queryIgnorePaths) {
            this.queryIgnorePaths = opts.queryIgnorePaths;
        }
    }

    queryIgnorePaths: string[]

    exec = (query: any) => {
        function _filter(key: string) {
        const re = new RegExp(/filter\[([a-z0-9]+)\]/, 'i');
        let assoc: string;
        let matches: string[] = key.match(re);

        if (matches.length >= 2) {
            assoc = matches[1];
        }

        return assoc;
        }

        function _sort(value: string) {       
            const sortKeys = value.split(',');
            const sortObj: ISortObject = {};
            _forEach(sortKeys, (key) => {
                sortObj[key] = (key.charAt(0) === '-') ? -1 : 1;         
            });

            return sortObj;
        }
        
        const ignorePaths: string[] = this.queryIgnorePaths;
        const q: IQueryObject = {
        filter: {},
        options: {
            sort: {}
        }
        };
        _forEach(query, (value: any, key: string) => {
        let filter: string;      
        if(_startsWith(key, 'filter')) {
            filter = _filter(key);
            q.filter[filter] = value;
        } else if (key === 'sort') {
            q.options.sort = _sort(value);
        } else if (key === 'limit') {
            q.options['limit'] = value;
        } else if (key === 'skip') {
            q.options['skip'] = value;
        } else if (ignorePaths.indexOf(key) >= 0) {
            // skip
            return;
        } else {
            q.filter[key] = value;
        }
        });    
        return q;
    }
}

export default QueryHelper;