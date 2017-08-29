import { AsyncTest, Expect, Test, TestCase, TestFixture } from "alsatian";
import { Model } from '../model';
import { RequestValidator, ValidationProperties } from './jsonapi-request-validator';
import { ISchemaPath, SchemaTypes } from '../schema';
class ArticleWriter extends Model {
    schema() {
        return {
            "name": { type: SchemaTypes.String }
        }
    }
}

class NewsArticle extends Model {
    schema() {
        return {
            "title": { type: SchemaTypes.String },
            "datePosted": { type: SchemaTypes.Date },
            "tags": { type: SchemaTypes.StringArray },
            "rating": { type: SchemaTypes.Number },
            "isPublic": { type: SchemaTypes.Boolean },
            "writer": { type: SchemaTypes.ToOne, ref: ArticleWriter }
        }
    }
}

let validationMap: ValidationProperties = {
    Model() {
        return NewsArticle
    },
    type() {
        return "articles"
    },
    hidePaths() {
        return []
    },
    relationships() {
        return [
            {
                type: "articleWriter",
                relationshipType: 0, // should be JSONAPIRouter.RelationshipType.BELONGS_TO, but cyclic import stops it
                path: "writer",
                Model: ArticleWriter
            }
        ]
    }
}

@TestFixture("Testing request validator")
export class TestRequestValidator {
    @TestCase({
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
    })
    @TestCase({
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
    })
    @TestCase({
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
    public testSingleObjectValidation(articleJSON: any) {
        let schema = RequestValidator.createValidatorForBody(validationMap);
        schema.validate(articleJSON, function(err, value) {
            console.log(err);
            Expect(err).toBeNull();
        })
    }

    @TestCase({
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
    })
    @TestCase({
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
    public testSingleFailValidation(articleJSON: any) {
        let schema = RequestValidator.createValidatorForBody(validationMap);
        schema.validate(articleJSON, function(err, value) {
            Expect(err).not.toBeNull()
        })
    }
    


    @TestCase([{
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
    }])
    @TestCase([{
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
    }])
    @TestCase([{
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
    public testArrayObjectValidation(articleJSON: any) {
        let schema = RequestValidator.createValidatorForArrayBody(validationMap);
        schema.validate(articleJSON, function(err, value) {
            Expect(err).toBeNull();
        })
    }

    @TestCase([{
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
    }])
    @TestCase([{
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
    public testArrayFailValidation(articleJSON: any) {
        let schema = RequestValidator.createValidatorForArrayBody(validationMap);
        schema.validate(articleJSON, function(err, value) {
            Expect(err).not.toBeNull()
        })
    }

}