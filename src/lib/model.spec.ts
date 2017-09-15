import { AsyncTest, Expect, Test, TestCase, TestFixture } from "alsatian";
import { Model } from './model';

var addTimestamps = true

class TestModel extends Model {
    timestamps() {
        return addTimestamps;
    }

    schema() {
        return {
        }
    }
    concurrencyControl() {
        return true
    }

    getHiddenSchema() {
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


    @TestCase(new TestModel({"_v": 0}))
    public testIsAllowedToSave(model: TestModel) {
       let canSave = model.canUpdateBasedOnConcurrencyControl({"_v": 0})
        Expect(canSave).toEqual(true)
    }

    @TestCase(new TestModel({"_v": 1}))
    public testIsNotAllowedToSave(model: TestModel) {
        let canSave = model.canUpdateBasedOnConcurrencyControl({"_v": 0})
        Expect(canSave).toEqual(false)
    }

    @TestCase({"_v": 0})
    public testVersionIsIncrementedProperly(attr: any) {
        let model = new TestModel()
        let newAttr = model.updateVersion(attr)
        Expect(newAttr["_v"]).toEqual(1)
    }

    @AsyncTest("Saving Concurrency Controlled Model")
    async testSavingModel() {
        addTimestamps = false
        TestModel.prototype.save = async function() {
            return this
        }
        let model = new TestModel()
        model = await model.validate() as TestModel //will add the default _v value
        console.log(model.schema())
        Expect(model.get("_v")).toEqual(0)
        model = await model.setAndValidate({"_v": 0}) as TestModel //should update _v to 1
        Expect(model.get("_v")).toEqual(1)
    }

    @AsyncTest("Test allows setAndValidate for first time")
    async testInitialSetAndValidate() {
        let model = new TestModel()
        model = await model.setAndValidate({"what": "what"}) as TestModel
        Expect(model.get("_v")).toEqual(0)
    }

    @AsyncTest("Savimg Concurrency Controlled Model That Has Been Updated")
    async testSavingModelFail() {
        addTimestamps = false
        TestModel.prototype.save = async function() {
            return this
        }
        let model = new TestModel()
        model = await model.validate() as TestModel //will add the default _v value
        console.log(model.schema())
        Expect(model.get("_v")).toEqual(0)

        model.set({"_v": 1}) //fake an update
        let e
        try {
            model = await model.setAndValidate({"_v": 0}) as TestModel //should update _v to 1
        } catch(error) {
            e = error
        }
        Expect(e).toBeDefined()
    }

   
}