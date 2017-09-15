import { ISchemaPath } from './schema';
export declare class SchemaFormatter {
    static runFormatter(value: any, schemaPath: ISchemaPath): any;
    static ObjectId(value: any, schemaPath: any): any;
    static string(value: any, schemaPath: any): string | string[];
    static number(value: any, schemaPath: any): number | number[];
    static date(value: any, schemaPath: any): Date | Date[];
    static boolean(value: any, schemaPath: any): boolean | boolean[];
}
