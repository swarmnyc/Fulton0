"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const alsatian_1 = require("alsatian");
const model_1 = require("../../model");
const jsonapi_errors_1 = require("./jsonapi-errors");
let TestRequestValidator = class TestRequestValidator {
    errorCode422(err) {
        let errorResp = jsonapi_errors_1.onRequestError(err);
        alsatian_1.Expect(errorResp.code).toBe(422);
        alsatian_1.Expect(errorResp.source.pointer).toBeDefined();
    }
    errorCode409(err) {
        let errorResp = jsonapi_errors_1.onRequestError(err);
        alsatian_1.Expect(errorResp.code).toBe(409);
    }
};
__decorate([
    alsatian_1.TestCase(new model_1.Model.ValidationError("error validating model", "path", false)),
    alsatian_1.TestCase(new model_1.Model.RequiredError("error validating model", "path")),
    alsatian_1.TestCase(new TypeError("error! at path path"))
], TestRequestValidator.prototype, "errorCode422", null);
__decorate([
    alsatian_1.TestCase(new model_1.Model.UniqueError("already exists", "unique", "unique"))
], TestRequestValidator.prototype, "errorCode409", null);
TestRequestValidator = __decorate([
    alsatian_1.TestFixture("Testing request validator")
], TestRequestValidator);
exports.TestRequestValidator = TestRequestValidator;
//# sourceMappingURL=jsonapi-errors.spec.js.map