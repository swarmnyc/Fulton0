import { Model } from './model';
import { Schema } from './schema';
export declare class TestModel extends Model {
    timestamps(): boolean;
    schema(): {
        "testToOne": {
            type: string;
            ref: typeof TestModel;
        };
        "testToTwo": {
            type: string;
            ref: typeof TestModel;
        };
    };
    concurrencyControl(): boolean;
    collection(): string;
    getHiddenSchema(): Schema;
    callUpdateHook(): void;
}
export declare class ModelTests {
    testTimestampsGetSetDuringUpdateHook(model: TestModel): void;
    testIsAllowedToSave(model: TestModel): void;
    testIsNotAllowedToSave(model: TestModel): void;
    testVersionIsIncrementedProperly(attr: any): void;
    testSavingModel(): Promise<void>;
    testInitialSetAndValidate(): Promise<void>;
    testSavingModelFail(): Promise<void>;
    testRouterRelationship(): Promise<void>;
}
