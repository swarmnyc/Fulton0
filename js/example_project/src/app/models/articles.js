"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fulton_1 = require("fulton");
const user_1 = require("./user");
const fulton_2 = require("fulton");
class Article extends fulton_1.Model {
    collection() {
        return 'articles';
    }
    concurrencyControl() {
        return true;
    }
    schema() {
        return {
            title: { type: fulton_2.SchemaTypes.String, required: true },
            body: { type: fulton_2.SchemaTypes.String, required: true },
            user: { type: fulton_2.SchemaTypes.ToOne, required: false, ref: user_1.User }
        };
    }
}
exports.Article = Article;
exports.default = Article;
//# sourceMappingURL=articles.js.map