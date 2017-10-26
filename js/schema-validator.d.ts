import { ISchemaPath } from './schema';
export declare class SchemaValidator {
    static runTypecastingValidator(value: any, schemaPath: ISchemaPath): any;
    static ObjectId(value: any, schemaPath: any): any;
    static string(value: any, schemaPath: any): any;
    static number(value: any, schemaPath: any): any;
    static date(value: any, schemaPath: any): any;
    static boolean(value: any, schemaPath: any): any;
}
