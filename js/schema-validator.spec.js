"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const alsatian_1 = require("alsatian");
const schema_validator_1 = require("./schema-validator");
const mongodb_1 = require("mongodb");
let createSchema = function (schemaType) {
    return {
        pathName: "key",
        type: schemaType
    };
};
let objectId = new mongodb_1.ObjectID();
let ValidatorTests = class ValidatorTests {
    testValidations(value, fakeSchema) {
        try {
            schema_validator_1.SchemaValidator.runTypecastingValidator(value, fakeSchema);
        }
        catch (error) {
            alsatian_1.Expect.fail(`error was throw ${fakeSchema.type} should have validated, type provided was ${typeof value}`);
        }
        alsatian_1.Expect(true).toBe(true);
    }
    testValidationsFail(value, fakeSchema) {
        try {
            schema_validator_1.SchemaValidator.runTypecastingValidator(value, fakeSchema);
        }
        catch (error) {
            alsatian_1.Expect(true).toBe(true);
            return;
        }
        alsatian_1.Expect.fail(`validation should not have occured for type ${fakeSchema.type}, type provided was ${typeof value}`);
    }
};
__decorate([
    alsatian_1.TestCase("testing", createSchema("string")),
    alsatian_1.TestCase(["testing", "testing", "testing"], createSchema("string[]")),
    alsatian_1.TestCase(1, createSchema("number")),
    alsatian_1.TestCase([1, 2, 3], createSchema("number[]")),
    alsatian_1.TestCase(new Date(), createSchema("date")),
    alsatian_1.TestCase([new Date(), new Date()], createSchema("date[]")),
    alsatian_1.TestCase(true, createSchema("boolean")),
    alsatian_1.TestCase([true, false], createSchema("boolean[]")),
    alsatian_1.TestCase(objectId, createSchema("ObjectId")),
    alsatian_1.TestCase([objectId, objectId], createSchema("ObjectId[]"))
], ValidatorTests.prototype, "testValidations", null);
__decorate([
    alsatian_1.TestCase(1, createSchema("string")),
    alsatian_1.TestCase([objectId, "testing"], createSchema("string[]")),
    alsatian_1.TestCase("string", createSchema("number")),
    alsatian_1.TestCase([new Date()], createSchema("number[]")),
    alsatian_1.TestCase(false, createSchema("date")),
    alsatian_1.TestCase([2], createSchema("date[]")),
    alsatian_1.TestCase(1, createSchema("boolean")),
    alsatian_1.TestCase([""], createSchema("boolean[]")),
    alsatian_1.TestCase(1, createSchema("ObjectId")),
    alsatian_1.TestCase([""], createSchema("ObjectId[]"))
], ValidatorTests.prototype, "testValidationsFail", null);
ValidatorTests = __decorate([
    alsatian_1.TestFixture("Testing schema validator")
], ValidatorTests);
exports.ValidatorTests = ValidatorTests;
//# sourceMappingURL=schema-validator.spec.js.map