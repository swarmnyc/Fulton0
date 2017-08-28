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

   
}