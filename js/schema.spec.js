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
const schema_1 = require('./schema');
const mongodb_1 = require('mongodb');
const model_1 = require('./model');
let primitiveOnlyFindReturn;
class PrimitiveOnlyModel extends model_1.Model {
    static find(query, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return [primitiveOnlyFindReturn];
        });
    }
    setIsNewToFalse() {
        this._isNew = false;
    }
    schema() {
        return {
            "number": { type: schema_1.SchemaTypes.Number },
            "requiredNumber": { type: schema_1.SchemaTypes.Number, required: true },
            "string": { type: schema_1.SchemaTypes.String },
            "readOnly": { type: schema_1.SchemaTypes.String, defaultValue: "testing", readonly: true },
            "uniqueKey": { type: schema_1.SchemaTypes.Number, unique: true },
            "defaultValueFromFunction": { type: schema_1.SchemaTypes.String, defaultValue: function () {
                    return "Testing value 123";
                } }
        };
    }
}
let SchemaTest = class SchemaTest {
    testValidation() {
        return __awaiter(this, void 0, void 0, function* () {
            let testValidation = function (model) {
                return __awaiter(this, void 0, void 0, function* () {
                    let schema = new schema_1.Schema(model.schema(), PrimitiveOnlyModel);
                    try {
                        yield schema.validate(model);
                    }
                    catch (error) {
                        alsatian_1.Expect.fail("failed with error " + error);
                    }
                    return model;
                });
            };
            //testing required path
            let testValidationFails = function (model) {
                return __awaiter(this, void 0, void 0, function* () {
                    let schema = new schema_1.Schema(model.schema(), PrimitiveOnlyModel);
                    try {
                        yield schema.validate(model);
                    }
                    catch (error) {
                        alsatian_1.Expect(true).toBe(true);
                        return;
                    }
                    alsatian_1.Expect.fail("Should have failed validation");
                });
            };
            let testCase1 = new PrimitiveOnlyModel({
                "number": 1,
                "requiredNumber": 2,
            });
            let testCase2 = new PrimitiveOnlyModel({
                "string": "test",
                "number": 2,
            });
            let validated1 = yield testValidation(testCase1);
            let validated2 = yield testValidationFails(testCase2);
        });
    }
    stripFields() {
        return __awaiter(this, void 0, void 0, function* () {
            let validationTest = function (model) {
                return __awaiter(this, void 0, void 0, function* () {
                    let schema = new schema_1.Schema(model.schema(), PrimitiveOnlyModel);
                    let validatedModel;
                    try {
                        validatedModel = yield schema["_removeExtraneousPaths"](model);
                    }
                    catch (error) {
                        alsatian_1.Expect.fail("validation should not have failed");
                        return;
                    }
                    alsatian_1.Expect(validatedModel.attributes.extraField).not.toBeDefined();
                    alsatian_1.Expect(validatedModel.attributes.string).toBe("test");
                    alsatian_1.Expect(validatedModel.attributes.requiredNumber).toBe(2);
                });
            };
            let extraFieldsModel = new PrimitiveOnlyModel({
                "string": "test",
                "requiredNumber": 2,
                "extraField": "extra"
            });
            yield validationTest(extraFieldsModel);
        });
    }
    testReadOnlyFields() {
        return __awaiter(this, void 0, void 0, function* () {
            let testValidation = function (model) {
                return __awaiter(this, void 0, void 0, function* () {
                    let schema = new schema_1.Schema(model.schema(), PrimitiveOnlyModel);
                    let attributesBeforeReadOnly;
                    let validatedModel;
                    try {
                        validatedModel = yield schema.validate(model);
                        validatedModel.setIsNewToFalse();
                        attributesBeforeReadOnly = validatedModel.attributes;
                        validatedModel.set("readOnly", "should not change to this!");
                        validatedModel = yield schema["_enforceReadOnlyPaths"](model);
                    }
                    catch (error) {
                        alsatian_1.Expect.fail("validation should not have failed");
                        return;
                    }
                    alsatian_1.Expect(validatedModel.get("readOnly")).toBe("testing");
                    alsatian_1.Expect(validatedModel.attributes).toBe(attributesBeforeReadOnly);
                });
            };
            let model = new PrimitiveOnlyModel({
                "string": "test",
                "requiredNumber": 2,
                "readOnly": "testing"
            });
            yield testValidation(model);
        });
    }
    testUniqueValidation() {
        return __awaiter(this, void 0, void 0, function* () {
            primitiveOnlyFindReturn = new PrimitiveOnlyModel({
                "_id": new mongodb_1.ObjectID(),
                "uniqueKey": 2
            });
            let testValidation = function (model) {
                return __awaiter(this, void 0, void 0, function* () {
                    let schema = new schema_1.Schema(model.schema(), PrimitiveOnlyModel);
                    let validatedModel;
                    try {
                        validatedModel = yield schema["_validateUniquePaths"](model);
                    }
                    catch (error) {
                        alsatian_1.Expect(true).toBe(true);
                        return;
                    }
                    alsatian_1.Expect.fail("validation should have failed");
                });
            };
            let testModel = new PrimitiveOnlyModel({
                "_id": new mongodb_1.ObjectID(),
                "string": "test",
                "requiredNumber": 1,
                "uniqueKey": 2
            });
            console.log(testModel.attributes);
            yield testValidation(testModel);
        });
    }
    testDefaultValues() {
        return __awaiter(this, void 0, void 0, function* () {
            let model = new PrimitiveOnlyModel({
                "_id": new mongodb_1.ObjectID(),
                "string": "test",
                "requiredNumber": 1,
                "uniqueKey": 2
            });
            let schema = new schema_1.Schema(model.schema(), PrimitiveOnlyModel);
            model.attributes.readOnly = undefined;
            model = yield schema["_assignDefaultValues"](model);
            alsatian_1.Expect(model.attributes.readOnly).toBe("testing");
            alsatian_1.Expect(model.attributes.defaultValueFromFunction).toBe("Testing value 123");
        });
    }
};
__decorate([
    alsatian_1.AsyncTest("Test Schema Validation")
], SchemaTest.prototype, "testValidation", null);
__decorate([
    alsatian_1.AsyncTest("Test Extra Fields are Stripped on Validation")
], SchemaTest.prototype, "stripFields", null);
__decorate([
    alsatian_1.AsyncTest("Test that ready only fields cannot be changed")
], SchemaTest.prototype, "testReadOnlyFields", null);
__decorate([
    alsatian_1.AsyncTest("Test unique field validation")
], SchemaTest.prototype, "testUniqueValidation", null);
__decorate([
    alsatian_1.AsyncTest("Test add default values")
], SchemaTest.prototype, "testDefaultValues", null);
SchemaTest = __decorate([
    alsatian_1.TestFixture("Testing schema validator")
], SchemaTest);
exports.SchemaTest = SchemaTest;
//# sourceMappingURL=schema.spec.js.map