import { AsyncTest, Expect, Test, TestCase, TestFixture } from "alsatian";

import { SchemaFormatter } from './schema-formatter';
import { ISchemaPath } from './schema';
import { ObjectID } from 'mongodb';

class Model {
    get(string: string) {
        return new ObjectID()
    }
}

 let createSchema = function(schemaType) {
     return {
         pathName: "key",
         type: schemaType,
         ref: Model
     }
 }
 let objectId = new ObjectID()

@TestFixture("Testing schema formatter")
export class FormatterTests {
    

    @TestCase(1, createSchema("string"))
    @TestCase(["testing", 1, "testing"], createSchema("string[]"))
    @TestCase("10", createSchema("number"))
    @TestCase([1, "10", 3], createSchema("number[]"))
    @TestCase("2017-08-25T16:16:39.620Z", createSchema("date"))
    @TestCase(["7/21/1993", new Date()], createSchema("date[]"))
    @TestCase("true", createSchema("boolean"))
    @TestCase([true, "false"], createSchema("boolean[]"))
    @TestCase( "59a04ea482302276af044f34", createSchema("ObjectId"))
    @TestCase([objectId, new Model()], createSchema("ObjectId[]"))
    public testFormatters(value: any, fakeSchema: ISchemaPath) {
        try {
            SchemaFormatter.runFormatter(value, fakeSchema)
        } catch(error) {
            Expect.fail(`error was throw ${fakeSchema.type} should have validated, type provided was ${typeof value}`);
        }
        Expect(true).toBe(true)
    }


   
    @TestCase("hello", createSchema("number"))
    @TestCase([1, "what", 3], createSchema("number[]"))
    @TestCase("trUee", createSchema("boolean"))
    @TestCase([true, "ffaalse"], createSchema("boolean[]"))
    @TestCase( "59a04ea402276af044f34", createSchema("ObjectId"))
    @TestCase(["499sd", objectId], createSchema("ObjectId[]"))
    public testFormattersFail(value: any, fakeSchema: ISchemaPath) {
        try {
            SchemaFormatter.runFormatter(value, fakeSchema)
        } catch(error) {
            Expect(true).toBe(true)
            return
        }
        Expect.fail(`error should have been thrown for type ${fakeSchema.type}, type provided was ${typeof value}`);
    }
}