"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const alsatian_1 = require("alsatian");
const model_1 = require('./model');
var addTimestamps = true;
class TestModel extends model_1.Model {
    timestamps() {
        return addTimestamps;
    }
    schema() {
        return {};
    }
    concurrencyControl() {
        return true;
    }
    getHiddenSchema() {
        return this._schema;
    }
    callUpdateHook() {
        this._updateTimestamps(function () { });
    }
}
exports.TestModel = TestModel;
let ModelTests = class ModelTests {
    testTimestampsGetSetDuringUpdateHook(model) {
        model.callUpdateHook();
        alsatian_1.Expect(model.get("updatedAt")).toBeDefined();
        alsatian_1.Expect(model.get("createdAt")).toBeDefined();
    }
    testIsAllowedToSave(model) {
        let canSave = model.canUpdateBasedOnConcurrencyControl({ "version": 0 });
        alsatian_1.Expect(canSave).toEqual(true);
    }
    testIsNotAllowedToSave(model) {
        let canSave = model.canUpdateBasedOnConcurrencyControl({ "version": 0 });
        alsatian_1.Expect(canSave).toEqual(false);
    }
    testVersionIsIncrementedProperly(attr) {
        let model = new TestModel();
        let newAttr = model.updateVersion(attr);
        alsatian_1.Expect(newAttr["version"]).toEqual(1);
    }
    testSavingModel() {
        return __awaiter(this, void 0, void 0, function* () {
            addTimestamps = false;
            TestModel.prototype.save = function () {
                return __awaiter(this, void 0, void 0, function* () {
                    return this;
                });
            };
            let model = new TestModel();
            model = yield model.validate(); //will add the default version value
            console.log(model.schema());
            alsatian_1.Expect(model.get("version")).toEqual(0);
            model = yield model.setAndValidate({ "version": 0 }); //should update version to 1
            alsatian_1.Expect(model.get("version")).toEqual(1);
        });
    }
    testInitialSetAndValidate() {
        return __awaiter(this, void 0, void 0, function* () {
            let model = new TestModel();
            model = yield model.setAndValidate({ "what": "what" });
            alsatian_1.Expect(model.get("version")).toEqual(0);
        });
    }
    testSavingModelFail() {
        return __awaiter(this, void 0, void 0, function* () {
            addTimestamps = false;
            TestModel.prototype.save = function () {
                return __awaiter(this, void 0, void 0, function* () {
                    return this;
                });
            };
            let model = new TestModel();
            model = yield model.validate(); //will add the default version value
            console.log(model.schema());
            alsatian_1.Expect(model.get("version")).toEqual(0);
            model.set({ "version": 1 }); //fake an update
            let e;
            try {
                model = yield model.setAndValidate({ "version": 0 }); //should update version to 1
            }
            catch (error) {
                e = error;
            }
            alsatian_1.Expect(e).toBeDefined();
        });
    }
};
__decorate([
    alsatian_1.TestCase(new TestModel({}))
], ModelTests.prototype, "testTimestampsGetSetDuringUpdateHook", null);
__decorate([
    alsatian_1.TestCase(new TestModel({ "version": 0 }))
], ModelTests.prototype, "testIsAllowedToSave", null);
__decorate([
    alsatian_1.TestCase(new TestModel({ "version": 1 }))
], ModelTests.prototype, "testIsNotAllowedToSave", null);
__decorate([
    alsatian_1.TestCase({ "version": 0 })
], ModelTests.prototype, "testVersionIsIncrementedProperly", null);
__decorate([
    alsatian_1.AsyncTest("Saving Concurrency Controlled Model")
], ModelTests.prototype, "testSavingModel", null);
__decorate([
    alsatian_1.AsyncTest("Test allows setAndValidate for first time")
], ModelTests.prototype, "testInitialSetAndValidate", null);
__decorate([
    alsatian_1.AsyncTest("Savimg Concurrency Controlled Model That Has Been Updated")
], ModelTests.prototype, "testSavingModelFail", null);
ModelTests = __decorate([
    alsatian_1.TestFixture("Test Models")
], ModelTests);
exports.ModelTests = ModelTests;
//# sourceMappingURL=model.spec.js.map