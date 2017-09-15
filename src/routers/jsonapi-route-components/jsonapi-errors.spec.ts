import { AsyncTest, Expect, Test, TestCase, TestFixture } from "alsatian";
import { Model } from '../../model';
import { onRequestError } from './jsonapi-errors';
import { ISchemaPath, SchemaTypes } from '../../schema';


@TestFixture("Testing request validator")
export class TestRequestValidator {
    @TestCase(new Model.ValidationError("error validating model", "path", false))
    @TestCase(new Model.RequiredError("error validating model", "path"))
    @TestCase(new TypeError("error! at path path"))
    public errorCode422(err: Error) {
        let errorResp = onRequestError(err);
        Expect(errorResp.code).toBe(422);
        Expect(errorResp.source.pointer).toBeDefined();
    }

    @TestCase(new Model.UniqueError("already exists", "unique", "unique"))
    public errorCode409(err: Error) {
        let errorResp = onRequestError(err);
        Expect(errorResp.code).toBe(409);
    }

    

}