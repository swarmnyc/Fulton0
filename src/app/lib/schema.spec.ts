import { AsyncTest, Expect, Test, TestCase, TestFixture } from "alsatian";

import { Schema, ISchemaPath, ISchemaDefinition, SchemaModel } from './schema';
import { ObjectID } from 'mongodb';
import { Model } from './model';

class PrimitiveOnlyModel extends Model {
    schema() {
        return {
            "number": { type: "number" },
            "requiredNumber": { type: "number", required: true },
            "string": { type: "string" }
        }
    }
}


@TestFixture("Testing schema validator")
export class SchemaTest {

    @TestCase(new PrimitiveOnlyModel({
        "number": 1,
        "requiredNumber": 2,
    }))
    @TestCase(new PrimitiveOnlyModel({
        "string": "test",
        "requiredNumber": 2,
    }))
    public testValidation(model: PrimitiveOnlyModel) {
        let schema = new Schema(model.schema(), PrimitiveOnlyModel);
        try {
            schema.validate(model)
        } catch(error) {
            Expect.fail("failed with error " + error);
        }
    }

    
    @TestCase(new PrimitiveOnlyModel({
        "string": "test",
        "number": 2,
    }))
    public testValidationFails(model: PrimitiveOnlyModel) {
         let schema = new Schema(model.schema(), PrimitiveOnlyModel);
        try {
            schema.validate(model)
        } catch(error) {
            return
        }
         Expect.fail("validation should have failed");
    }

    // @TestCase(1, createSchema("string"))
    // @TestCase([objectId, "testing"], createSchema("string[]"))
    // @TestCase("string", createSchema("number"))
    // @TestCase([new Date()], createSchema("number[]"))
    // @TestCase(false, createSchema("date"))
    // @TestCase([2], createSchema("date[]"))
    // @TestCase(1, createSchema("boolean"))
    // @TestCase([""], createSchema("boolean[]"))
    // @TestCase( 1, createSchema("ObjectId"))
    // @TestCase([""], createSchema("ObjectId[]"))
    // public testValidationsFail(value: any, fakeSchema: ISchemaPath) {
    //     try {
    //         SchemaValidator.runTypecastingValidator(value, fakeSchema)
    //     } catch(error) {
    //         Expect(true).toBe(true)
    //        return;
    //     }
    //      Expect.fail(`validation should not have occured for type ${fakeSchema.type}, type provided was ${typeof value}`);
    // }

}