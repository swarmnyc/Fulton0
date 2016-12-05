import { forEach as _forEach, get as _get, startsWith as _startsWith, take as _take } from 'lodash';
import { Model } from '../lib';

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

export async function queryHelper(model: typeof Model, query?: any) {
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
            const isDescending: boolean = key.charAt(0) === '-';
            if (!!isDescending) {
                key = key.substr(1);
            }
            sortObj[key] = (!!isDescending) ? -1 : 1;         
        });

        return sortObj;
    }

    const q: IQueryObject = {
        filter: {},
        options: {
            sort: {},
            skip: 0
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
            q.options.limit = value;
        } else if (key === 'skip') {
            q.options.skip = value;        
        } else {
            q.filter[key] = value;
        }
    });    

    let docs = model.skip(q.options.skip).limit(q.options.limit);
    

    if (q.options.sort) {
        _forEach(q.options.sort, (dir: number, key: string) => {
            console.log(key, dir);
            docs.sort(key, dir);
        });
    }

    _forEach(q.filter, (value: any, key: string) => {
        docs.where(key, value);
    });

    return docs.find();
}