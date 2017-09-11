import { AsyncTest, Expect, Test, TestCase, TestFixture } from "alsatian";
import { Model as MongoritoModel, IQuery, IQueryOptions } from 'mongorito';
import { Schema, ISchemaPath, ISchemaDefinition, SchemaModel, SchemaTypes } from './schema';
import { ObjectID } from 'mongodb';
import { Model } from './model';


let primitiveOnlyFindReturn: MongoritoModel

class PrimitiveOnlyModel extends Model {
    static async find<T extends MongoritoModel>(query?: IQuery, options?: IQueryOptions): Promise<T[]> {
        return [primitiveOnlyFindReturn as T]
    }
    
    setIsNewToFalse() {
        this._isNew = false;
    }
    schema() {
        return {
            "number": { type: SchemaTypes.Number },
            "requiredNumber": { type: SchemaTypes.Number, required: true },
            "string": { type: SchemaTypes.String },
            "readOnly": { type: SchemaTypes.String, defaultValue: "testing", readonly: true },
            "uniqueKey": { type: SchemaTypes.Number, unique: true },
            "defaultValueFromFunction": { type: SchemaTypes.String, defaultValue: function() {
                return "Testing value 123"
            }}
        }
    }
}


@TestFixture("Testing schema validator")
export class SchemaTest {


    @AsyncTest("Test Schema Validation")
    public async testValidation() {
         let testValidation = async function(model: PrimitiveOnlyModel) {
            let schema = new Schema(model.schema(), PrimitiveOnlyModel);
            try {
                await schema.validate(model)
            } catch(error) {
                Expect.fail("failed with error " + error);
            }
            return model
        }

        //testing required path
        let testValidationFails = async function(model: PrimitiveOnlyModel) {
            let schema = new Schema(model.schema(), PrimitiveOnlyModel);
            try {
                await schema.validate(model)
            } catch(error) {
                Expect(true).toBe(true)
                return
            }
            Expect.fail("Should have failed validation");
        }

        let testCase1 = new PrimitiveOnlyModel({
            "number": 1,
            "requiredNumber": 2,
        })
        let testCase2 = new PrimitiveOnlyModel({
            "string": "test",
            "number": 2,
        })
        let validated1 = await testValidation(testCase1)
        let validated2 = await testValidationFails(testCase2)
    }



    @AsyncTest("Test Extra Fields are Stripped on Validation")
    public async stripFields() {
        let validationTest = async function(model: PrimitiveOnlyModel) {
            let schema = new Schema(model.schema(), PrimitiveOnlyModel);
            let validatedModel: PrimitiveOnlyModel
            try {
                validatedModel = await schema["_removeExtraneousPaths"](model) as PrimitiveOnlyModel
            } catch(error) {
                Expect.fail("validation should not have failed");
                return;
            }
            Expect(validatedModel.attributes.extraField).not.toBeDefined();
            Expect(validatedModel.attributes.string).toBe("test");
            Expect(validatedModel.attributes.requiredNumber).toBe(2);
        }

        let extraFieldsModel = new PrimitiveOnlyModel({
            "string": "test",
            "requiredNumber": 2,
            "extraField": "extra"
        });
        await validationTest(extraFieldsModel)
    }
    

    @AsyncTest("Test that ready only fields cannot be changed")
    public async testReadOnlyFields() {
        let testValidation = async function(model: PrimitiveOnlyModel) {
            let schema = new Schema(model.schema(), PrimitiveOnlyModel);
            let attributesBeforeReadOnly: any;
            let validatedModel: PrimitiveOnlyModel
            try {
                validatedModel = await schema.validate(model) as PrimitiveOnlyModel
                validatedModel.setIsNewToFalse();        
                attributesBeforeReadOnly = validatedModel.attributes;        
                validatedModel.set("readOnly", "should not change to this!")
                validatedModel = await schema["_enforceReadOnlyPaths"](model) as PrimitiveOnlyModel
            } catch(error) {
                Expect.fail("validation should not have failed");
                return;
            }
             Expect(validatedModel.get("readOnly")).toBe("testing");
             Expect(validatedModel.attributes).toBe(attributesBeforeReadOnly);
        }
        let model = new PrimitiveOnlyModel({
            "string": "test",
            "requiredNumber": 2,
            "readOnly": "testing"
        });
        await testValidation(model);

    }

    @AsyncTest("Test unique field validation")
    public async testUniqueValidation() {
        primitiveOnlyFindReturn = new PrimitiveOnlyModel({
            "_id": new ObjectID(),
            "uniqueKey": 2
        })
        let testValidation = async function(model: PrimitiveOnlyModel) {
            let schema = new Schema(model.schema(), PrimitiveOnlyModel);
            let validatedModel: PrimitiveOnlyModel
            try {
                validatedModel = await schema["_validateUniquePaths"](model) as PrimitiveOnlyModel
            } catch(error) {
                Expect(true).toBe(true)
                return;
            }
             Expect.fail("validation should have failed")
        }


        let testModel = new PrimitiveOnlyModel({
            "_id": new ObjectID(),
            "string": "test",
            "requiredNumber": 1,
            "uniqueKey": 2
        })
        console.log(testModel.attributes);
        await testValidation(testModel)
        
    }

    @AsyncTest("Test add default values")    
    public async testDefaultValues() {
        let model = new PrimitiveOnlyModel({
            "_id": new ObjectID(),
            "string": "test",
            "requiredNumber": 1,
            "uniqueKey": 2
        });
        let schema = new Schema(model.schema(), PrimitiveOnlyModel);
        model.attributes.readOnly = undefined;
        model = await schema["_assignDefaultValues"](model) as PrimitiveOnlyModel;
        Expect(model.attributes.readOnly).toBe("testing");
        Expect(model.attributes.defaultValueFromFunction).toBe("Testing value 123")
        

    }


}