"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const api_query_converter_1 = require('./api-query-converter');
const mongorito_query_creator_1 = require('./mongorito-query-creator');
function _queryHelper(model, query, method = 'find') {
    return __awaiter(this, void 0, void 0, function* () {
        let q = api_query_converter_1.default.convertQueryToQueryObject(query);
        let docs = mongorito_query_creator_1.default.createModelQuery(q, model);
        return docs[method]();
    });
}
exports._queryHelper = _queryHelper;
function queryHelper(model, query) {
    return __awaiter(this, void 0, void 0, function* () {
        return _queryHelper(model, query, 'find');
    });
}
exports.queryHelper = queryHelper;
function countHelper(model, query) {
    return __awaiter(this, void 0, void 0, function* () {
        return _queryHelper(model, query, 'count');
    });
}
exports.countHelper = countHelper;
//# sourceMappingURL=index.js.map