"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const alsatian_1 = require("alsatian");
const schema_formatter_1 = require('./schema-formatter');
const mongodb_1 = require('mongodb');
class Model {
    get(string) {
        return new mongodb_1.ObjectID();
    }
}
let createSchema = function (schemaType) {
    return {
        pathName: "key",
        type: schemaType,
        ref: Model
    };
};
let objectId = new mongodb_1.ObjectID();
let FormatterTests = class FormatterTests {
    testFormatters(value, fakeSchema) {
        try {
            schema_formatter_1.SchemaFormatter.runFormatter(value, fakeSchema);
        }
        catch (error) {
            alsatian_1.Expect.fail(`error was throw ${fakeSchema.type} should have validated, type provided was ${typeof value}`);
        }
        alsatian_1.Expect(true).toBe(true);
    }
    testFormattersFail(value, fakeSchema) {
        try {
            schema_formatter_1.SchemaFormatter.runFormatter(value, fakeSchema);
        }
        catch (error) {
            alsatian_1.Expect(true).toBe(true);
            return;
        }
        alsatian_1.Expect.fail(`error should have been thrown for type ${fakeSchema.type}, type provided was ${typeof value}`);
    }
};
__decorate([
    alsatian_1.TestCase(1, createSchema("string")),
    alsatian_1.TestCase(["testing", 1, "testing"], createSchema("string[]")),
    alsatian_1.TestCase("10", createSchema("number")),
    alsatian_1.TestCase([1, "10", 3], createSchema("number[]")),
    alsatian_1.TestCase("2017-08-25T16:16:39.620Z", createSchema("date")),
    alsatian_1.TestCase(["7/21/1993", new Date()], createSchema("date[]")),
    alsatian_1.TestCase("true", createSchema("boolean")),
    alsatian_1.TestCase([true, "false"], createSchema("boolean[]")),
    alsatian_1.TestCase("59a04ea482302276af044f34", createSchema("ObjectId")),
    alsatian_1.TestCase([objectId, new Model()], createSchema("ObjectId[]"))
], FormatterTests.prototype, "testFormatters", null);
__decorate([
    alsatian_1.TestCase("hello", createSchema("number")),
    alsatian_1.TestCase([1, "what", 3], createSchema("number[]")),
    alsatian_1.TestCase("trUee", createSchema("boolean")),
    alsatian_1.TestCase([true, "ffaalse"], createSchema("boolean[]")),
    alsatian_1.TestCase("59a04ea402276af044f34", createSchema("ObjectId")),
    alsatian_1.TestCase(["499sd", objectId], createSchema("ObjectId[]"))
], FormatterTests.prototype, "testFormattersFail", null);
FormatterTests = __decorate([
    alsatian_1.TestFixture("Testing schema formatter")
], FormatterTests);
exports.FormatterTests = FormatterTests;
//# sourceMappingURL=schema-formatter.spec.js.map