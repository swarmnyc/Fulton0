import { AsyncTest, Expect, Test, TestCase, TestFixture } from "alsatian";

import { SchemaValidator } from './schema-validator';
import { ISchemaPath } from './schema';
import { ObjectID } from 'mongodb';

 let createSchema = function(schemaType) {
     return {
         pathName: "key",
         type: schemaType
     }
 }
 let objectId = new ObjectID()

@TestFixture("Testing schema validator")
export class ValidatorTests {
    

    @TestCase("testing", createSchema("string"))
    @TestCase(["testing", "testing", "testing"], createSchema("string[]"))
    @TestCase(1, createSchema("number"))
    @TestCase([1, 2, 3], createSchema("number[]"))
    @TestCase(new Date(), createSchema("date"))
    @TestCase([new Date(), new Date()], createSchema("date[]"))
    @TestCase(true, createSchema("boolean"))
    @TestCase([true, false], createSchema("boolean[]"))
    @TestCase( objectId, createSchema("ObjectId"))
    @TestCase([objectId, objectId], createSchema("ObjectId[]"))
    public testValidations(value: any, fakeSchema: ISchemaPath) {
        try {
            SchemaValidator.runTypecastingValidator(value, fakeSchema)
        } catch(error) {
            Expect.fail(`error was throw ${fakeSchema.type} should have validated, type provided was ${typeof value}`);
        }
        Expect(true).toBe(true)
    }

    @TestCase(1, createSchema("string"))
    @TestCase([objectId, "testing"], createSchema("string[]"))
    @TestCase("string", createSchema("number"))
    @TestCase([new Date()], createSchema("number[]"))
    @TestCase(false, createSchema("date"))
    @TestCase([2], createSchema("date[]"))
    @TestCase(1, createSchema("boolean"))
    @TestCase([""], createSchema("boolean[]"))
    @TestCase( 1, createSchema("ObjectId"))
    @TestCase([""], createSchema("ObjectId[]"))
    public testValidationsFail(value: any, fakeSchema: ISchemaPath) {
        try {
            SchemaValidator.runTypecastingValidator(value, fakeSchema)
        } catch(error) {
            Expect(true).toBe(true)
           return;
        }
         Expect.fail(`validation should not have occured for type ${fakeSchema.type}, type provided was ${typeof value}`);
    }

}