import { JSONAPIRelationshipData, JSONAPIRelationship, JSONAPIRelationships, JSONModel, JSONAPILinksObject, JSONAPIErrorSource, JSONAPIError, JSONAPIVersion, JSONAPIResponse} from '../jsonapi-route-components/jsonapi-types';
import { QueryParams } from '../../helpers/query/types';
import * as _ from 'lodash';

export interface QueryParamSettings {
    defaultLimit(): number
      maxLimit(): number
}

export class QueryReader {

    static getQueryParams(settings: QueryParamSettings, queryObj: any): QueryParams {
        const maxLimit = settings.maxLimit();
        let skip;
        let offset;
        let size;
        let pageNumber;
        let filter = _.mapKeys(queryObj.filter, (v: any, k:string) => {
          return k.charAt(0) !== '$' ? _.camelCase(k) : `$${_.camelCase(k)}`;
        });
        let lessThan = _.mapKeys(queryObj.lessThan, (v: any, k:string) => {
          return k.charAt(0) !== '$' ? _.camelCase(k) : `$${_.camelCase(k)}`;
        });
        let greaterThan = _.mapKeys(queryObj.greaterThan, (v: any, k:string) => {
          return k.charAt(0) !== '$' ? _.camelCase(k) : `$${_.camelCase(k)}`;
        });
        let sort;
        if (typeof queryObj.sort !== "undefined") {
          let sortKeys = [];
          const sortValues = queryObj.sort.split(",");
          for (let value of sortValues) {
            if (value.charAt(0) == "-") {
              sortKeys.push("-" + _.camelCase(value))
            } else {
              sortKeys.push(_.camelCase(value));
            }
          }
          sort = sortKeys.join(",");
        }
        let page = queryObj.page;
        let limit = settings.defaultLimit();
    
        if (page && page.offset) {
          offset = Number(page.offset);
        }
        if (page && page.skip) {
          skip = Number(page.skip)
        }
        if (page && page.page) {
          pageNumber = Number(page.page)
        }
        
    
        if (page && page.limit) {
          if (maxLimit == 0) {
            limit = Number(page.limit)
          } else {
            limit = Math.min(Number(page.limit), maxLimit);
          }
        }
    
        if (page && page.size) {
          if (maxLimit == 0) {
            size = Number(page.size)
          } else {
            size = Math.min(Number(page.size), maxLimit);
          }
        }
        
    
        let query = {
          skip: skip,
          size: size,
          page: pageNumber,
          offset: offset,
          limit: limit,
          filter: filter,
          lessThan: lessThan,
          greaterThan: greaterThan,
          sort: sort
        };

        return query
    }
}