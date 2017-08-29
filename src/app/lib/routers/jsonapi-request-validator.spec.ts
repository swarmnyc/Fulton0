import { AsyncTest, Expect, Test, TestCase, TestFixture } from "alsatian";
import { Model } from '../model';
import { ValidateRequest, ValidationMap } from './jsonapi-request-validator';
import { ISchemaPath, SchemaTypes } from '../schema';

class NewsArticle extends Model {
    schema() {
        return {
            "title": { type: SchemaTypes.String },
            "datePosted": { type: SchemaTypes.Date },
            "tags": { type: SchemaTypes.StringArray },
            "rating": { type: SchemaTypes.Number },
            "isPublic": { type: SchemaTypes.Boolean } 
        }
    }
}

let validationMap: ValidationMap = {
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
        return []
    }
}

@TestFixture("Testing request validator")
export class RequestValidator {
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
    public testSingleObjectValidation(articleJSON: any) {
        let schema = ValidateRequest.createValidatorForBody(validationMap);
        schema.validate(articleJSON, function(err, value) {
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
        let schema = ValidateRequest.createValidatorForBody(validationMap);
        schema.validate(articleJSON, function(err, value) {
            Expect(err).not.toBeNull()
        })
    }
    

}