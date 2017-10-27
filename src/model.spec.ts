import { AsyncTest, Expect, Test, TestCase, TestFixture } from "alsatian";
import { Model } from './model';
import { SchemaTypes, Schema } from './schema';
import { RouterRelationship, RelationshipType } from './routers/jsonapi';

var addTimestamps = true

export class TestModel extends Model {
    timestamps() {
        return addTimestamps;
    }

    schema() {
        return {
			"testToOne":  { type: SchemaTypes.ToOne, ref: TestModel },
			"testToTwo":  { type: SchemaTypes.ToMany, ref: TestModel }
        }
    }
    concurrencyControl() {
        return true
	}
	collection() {
		return "test-model"
	}

    getHiddenSchema() : Schema {
        return this._schema;
    }
    callUpdateHook() {
        this._updateTimestamps(function() {});
    }

}

@TestFixture("Test Models")
export class ModelTests {
    
    @TestCase(new TestModel({}))
    public testTimestampsGetSetDuringUpdateHook(model: TestModel) {      
        model.callUpdateHook();
        Expect(model.get("updatedAt")).toBeDefined();
        Expect(model.get("createdAt")).toBeDefined();
    }


    @TestCase(new TestModel({"version": 0}))
    public testIsAllowedToSave(model: TestModel) {
       let canSave = model.canUpdateBasedOnConcurrencyControl({"version": 0})
        Expect(canSave).toEqual(true)
    }

    @TestCase(new TestModel({"version": 1}))
    public testIsNotAllowedToSave(model: TestModel) {
        let canSave = model.canUpdateBasedOnConcurrencyControl({"version": 0})
        Expect(canSave).toEqual(false)
    }

    @TestCase({"version": 0})
    public testVersionIsIncrementedProperly(attr: any) {
        let model = new TestModel()
        let newAttr = model.updateVersion(attr)
        Expect(newAttr["version"]).toEqual(1)
    }

    @AsyncTest("Saving Concurrency Controlled Model")
    async testSavingModel() {
        addTimestamps = false
        TestModel.prototype.save = async function() {
            return this
        }
        let model = new TestModel()
        model = await model.validate() as TestModel //will add the default version value
        console.log(model.schema())
        Expect(model.get("version")).toEqual(0)
        model = await model.setAndValidate({"version": 0}) as TestModel //should update version to 1
        Expect(model.get("version")).toEqual(1)
    }

    @AsyncTest("Test allows setAndValidate for first time")
    async testInitialSetAndValidate() {
        let model = new TestModel()
        model = await model.setAndValidate({"what": "what"}) as TestModel
        Expect(model.get("version")).toEqual(0)
    }

    @AsyncTest("Savimg Concurrency Controlled Model That Has Been Updated")
    async testSavingModelFail() {
        addTimestamps = false
        TestModel.prototype.save = async function() {
            return this
        }
        let model = new TestModel()
        model = await model.validate() as TestModel //will add the default version value
        console.log(model.schema())
        Expect(model.get("version")).toEqual(0)

        model.set({"version": 1}) //fake an update
        let e
        try {
            model = await model.setAndValidate({"version": 0}) as TestModel //should update version to 1
        } catch(error) {
            e = error
        }
        Expect(e).toBeDefined()
	}
	
	@AsyncTest("Router relationship get sets up properly")
    async testRouterRelationship() {
		let routerRelationship = TestModel.routerRelationships()
		Expect(routerRelationship.length).toBe(2)
		Expect(routerRelationship[0].Model).toBe(TestModel)
		Expect(routerRelationship[0].path).toBe("testToOne")
		Expect(routerRelationship[0].relationshipType).toBe(RelationshipType.BELONGS_TO)
		Expect(routerRelationship[0].type).toBe((new TestModel()).collection())
    }

   
}