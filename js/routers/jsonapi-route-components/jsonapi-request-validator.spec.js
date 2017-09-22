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
const jsonapi_request_validator_1 = require("./jsonapi-request-validator");
const schema_1 = require("../../schema");
class ArticleWriter extends model_1.Model {
    schema() {
        return {
            "name": { type: schema_1.SchemaTypes.String }
        };
    }
}
class NewsArticle extends model_1.Model {
    schema() {
        return {
            "title": { type: schema_1.SchemaTypes.String },
            "datePosted": { type: schema_1.SchemaTypes.Date },
            "tags": { type: schema_1.SchemaTypes.StringArray },
            "rating": { type: schema_1.SchemaTypes.Number },
            "isPublic": { type: schema_1.SchemaTypes.Boolean },
            "writer": { type: schema_1.SchemaTypes.ToOne, ref: ArticleWriter }
        };
    }
}
let validationMap = {
    Model() {
        return NewsArticle;
    },
    type() {
        return "articles";
    },
    hidePaths() {
        return [];
    },
    relationships() {
        return [
            {
                type: "articleWriter",
                relationshipType: 0,
                path: "writer",
                Model: ArticleWriter
            }
        ];
    }
};
let TestRequestValidator = class TestRequestValidator {
    testSingleObjectValidation(articleJSON) {
        let schema = jsonapi_request_validator_1.RequestValidator.createValidatorForBody(validationMap);
        schema.validate(articleJSON, function (err, value) {
            console.log(err);
            alsatian_1.Expect(err).toBeNull();
        });
    }
    testSingleFailValidation(articleJSON) {
        let schema = jsonapi_request_validator_1.RequestValidator.createValidatorForBody(validationMap);
        schema.validate(articleJSON, function (err, value) {
            alsatian_1.Expect(err).not.toBeNull();
        });
    }
    testArrayObjectValidation(articleJSON) {
        let schema = jsonapi_request_validator_1.RequestValidator.createValidatorForArrayBody(validationMap);
        schema.validate(articleJSON, function (err, value) {
            alsatian_1.Expect(err).toBeNull();
        });
    }
    testArrayFailValidation(articleJSON) {
        let schema = jsonapi_request_validator_1.RequestValidator.createValidatorForArrayBody(validationMap);
        schema.validate(articleJSON, function (err, value) {
            alsatian_1.Expect(err).not.toBeNull();
        });
    }
};
__decorate([
    alsatian_1.TestCase({
        data: {
            type: "articles",
            attributes: {
                title: "Test",
                datePosted: "1/17/17",
                tags: ["cool tag 1, cool tag 2"],
                rating: 15,
                isPublic: false
            }
        }
    }),
    alsatian_1.TestCase({
        data: {
            type: "articles",
            attributes: {
                title: "Test",
                datePosted: "2017-08-29T14:45:52+00:00",
                tags: ["cool tag 1, cool tag 2"],
                rating: 100,
                isPublic: true
            }
        }
    }),
    alsatian_1.TestCase({
        data: {
            type: "articles",
            attributes: {
                title: "Test",
                datePosted: "2017-08-29T14:45:52+00:00",
                tags: ["cool tag 1, cool tag 2"],
                rating: 100,
                isPublic: true
            },
            relationships: {
                writer: {
                    data: {
                        type: "articleWriter",
                        id: "123342432"
                    }
                }
            }
        }
    })
], TestRequestValidator.prototype, "testSingleObjectValidation", null);
__decorate([
    alsatian_1.TestCase({
        data: {
            type: "articles",
            attributes: {
                title: "Test",
                datePosted: "1/17/17",
                tags: [1],
                rating: 15,
                isPublic: false
            }
        }
    }),
    alsatian_1.TestCase({
        data: {
            type: "not the right model",
            attributes: {
                title: "Test",
                datePosted: "1/17/17",
                tags: ["cool tag 1, cool tag 2"],
                rating: 15,
                isPublic: false
            }
        }
    })
], TestRequestValidator.prototype, "testSingleFailValidation", null);
__decorate([
    alsatian_1.TestCase([{
            data: {
                type: "articles",
                attributes: {
                    title: "Test",
                    datePosted: "1/17/17",
                    tags: ["cool tag 1, cool tag 2"],
                    rating: 15,
                    isPublic: false
                }
            }
        }]),
    alsatian_1.TestCase([{
            data: {
                type: "articles",
                attributes: {
                    title: "Test",
                    datePosted: "2017-08-29T14:45:52+00:00",
                    tags: ["cool tag 1, cool tag 2"],
                    rating: 100,
                    isPublic: true
                }
            }
        }]),
    alsatian_1.TestCase([{
            data: {
                type: "articles",
                attributes: {
                    title: "Test",
                    datePosted: "2017-08-29T14:45:52+00:00",
                    tags: ["cool tag 1, cool tag 2"],
                    rating: 100,
                    isPublic: true
                },
                relationships: {
                    writer: {
                        data: {
                            type: "articleWriter",
                            id: "123342432"
                        }
                    }
                }
            }
        }])
], TestRequestValidator.prototype, "testArrayObjectValidation", null);
__decorate([
    alsatian_1.TestCase([{
            data: {
                type: "articles",
                attributes: {
                    title: "Test",
                    datePosted: "1/17/17",
                    tags: [1],
                    rating: 15,
                    isPublic: false
                }
            }
        }]),
    alsatian_1.TestCase([{
            data: {
                type: "not the right model",
                attributes: {
                    title: "Test",
                    datePosted: "1/17/17",
                    tags: ["cool tag 1, cool tag 2"],
                    rating: 15,
                    isPublic: false
                }
            }
        }])
], TestRequestValidator.prototype, "testArrayFailValidation", null);
TestRequestValidator = __decorate([
    alsatian_1.TestFixture("Testing request validator")
], TestRequestValidator);
exports.TestRequestValidator = TestRequestValidator;
//# sourceMappingURL=jsonapi-request-validator.spec.js.map