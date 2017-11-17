import { ISchemaPath } from './schema';
export declare class SchemaValidator {
    static runTypecastingValidator(value: any, schemaPath: ISchemaPath): any;
    static ObjectId(value: any, schemaPath: any): void | void[];
    static object(value: any, schemaPath: any): void;
    static string(value: any, schemaPath: any): void | void[];
    static number(value: any, schemaPath: any): void | void[];
    static date(value: any, schemaPath: any): void | void[];
    static boolean(value: any, schemaPath: any): void | void[];
}
