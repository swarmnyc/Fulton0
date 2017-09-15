"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const alsatian_1 = require("alsatian");
const model_1 = require("./model");
var addTimestamps = true;
class TestModel extends model_1.Model {
    timestamps() {
        return addTimestamps;
    }
    schema() {
        return {};
    }
    getHiddenSchema() {
        return this._schema;
    }
    callUpdateHook() {
        this._updateTimestamps(function () { });
    }
}
let ModelTests = class ModelTests {
    testTimestampsGetSetDuringUpdateHook(model) {
        model.callUpdateHook();
        alsatian_1.Expect(model.get("updatedAt")).toBeDefined();
        alsatian_1.Expect(model.get("createdAt")).toBeDefined();
    }
};
__decorate([
    alsatian_1.TestCase(new TestModel({}))
], ModelTests.prototype, "testTimestampsGetSetDuringUpdateHook", null);
ModelTests = __decorate([
    alsatian_1.TestFixture("Test Models")
], ModelTests);
exports.ModelTests = ModelTests;
//# sourceMappingURL=model.spec.js.map