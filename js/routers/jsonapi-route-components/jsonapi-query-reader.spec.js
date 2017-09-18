"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const alsatian_1 = require("alsatian");
const jsonapi_query_reader_1 = require("./jsonapi-query-reader");
let settings = {
    maxLimit() {
        return 10;
    },
    defaultLimit() {
        return 5;
    }
};
let unlimitedLimitSettings = {
    maxLimit() {
        return 0;
    },
    defaultLimit() {
        return 10;
    }
};
let TestQueryReader = class TestQueryReader {
    testSizeIsSet(query) {
        let q = jsonapi_query_reader_1.QueryReader.getQueryParams(settings, query);
        alsatian_1.Expect(q.limit).toBe(10);
    }
    testFilters(query) {
        let q = jsonapi_query_reader_1.QueryReader.getQueryParams(settings, query);
        alsatian_1.Expect(q.filter.title.$gt).toBeDefined();
        alsatian_1.Expect(q.filter.title.te).toBeDefined();
    }
    testPaging(query) {
        let q = jsonapi_query_reader_1.QueryReader.getQueryParams(unlimitedLimitSettings, query);
        alsatian_1.Expect(q.limit).toBe(10);
        alsatian_1.Expect(q.skip).toBe(5);
        alsatian_1.Expect(q.size).toBe(15);
        alsatian_1.Expect(q.page).toBe(2);
    }
};
__decorate([
    alsatian_1.TestCase({
        page: {
            limit: 10
        }
    }),
    alsatian_1.TestCase({
        page: {
            limit: 1000000 //will ignore this and use the max limit (10)
        }
    })
], TestQueryReader.prototype, "testSizeIsSet", null);
__decorate([
    alsatian_1.TestCase({
        filter: {
            title: {
                $gt: "t",
                te: true
            }
        }
    })
], TestQueryReader.prototype, "testFilters", null);
__decorate([
    alsatian_1.TestCase({
        page: {
            limit: 10,
            size: 15,
            page: 2,
            skip: 5
        }
    })
], TestQueryReader.prototype, "testPaging", null);
TestQueryReader = __decorate([
    alsatian_1.TestFixture("Testing Query Reader")
], TestQueryReader);
exports.TestQueryReader = TestQueryReader;
//# sourceMappingURL=jsonapi-query-reader.spec.js.map