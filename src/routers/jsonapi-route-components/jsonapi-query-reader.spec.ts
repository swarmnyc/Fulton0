import { AsyncTest, Expect, Test, TestCase, TestFixture } from "alsatian";
import { Model } from '../../model';
import { QueryReader, QueryParamSettings } from './jsonapi-query-reader';
import { ISchemaPath, SchemaTypes } from '../../schema';


let settings: QueryParamSettings = {
    maxLimit() {
        return 10
    },
    defaultLimit() {
        return 5
    }
}

let unlimitedLimitSettings: QueryParamSettings = {
    maxLimit() {
        return 0
    },
    defaultLimit() {
        return 10
    }
}

@TestFixture("Testing Query Reader")
export class TestQueryReader {

    @TestCase({
        page: {
            limit: 10
        }
    })
    @TestCase({
        page: {
            limit: 1000000 //will ignore this and use the max limit (10)
        }
    })
    public testSizeIsSet(query: any) {
        let q = QueryReader.getQueryParams(settings, query);
        Expect(q.limit).toBe(10);
    }

    @TestCase({
        filter: {
            title: {
                $gt: "t",
                te: true
            }
        }
    })
    public testFilters(query: any) {
        let q = QueryReader.getQueryParams(settings, query);
        Expect(q.filter.title.$gt).toBeDefined();
        Expect(q.filter.title.te).toBeDefined();
    }

    @TestCase({
        page: {
            limit: 10,
            size: 15,
            page: 2,
            skip: 5
        }
    })
    public testPaging(query: any) {
        let q = QueryReader.getQueryParams(unlimitedLimitSettings, query);
        Expect(q.limit).toBe(10);
        Expect(q.skip).toBe(5);
        Expect(q.size).toBe(15);
        Expect(q.page).toBe(2);
    }

    

}