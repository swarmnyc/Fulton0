import { Model } from './model';
import { IAttributesHash } from 'mongorito';
export declare class SchemaTypes {
    static getTypeOfArray(type: string): string;
    static ToOne: string;
    static ToMany: string;
    static isRef(type: String): boolean;
    static String: string;
    static StringArray: string;
    static isString(type: String): boolean;
    static Number: string;
    static NumberArray: string;
    static isNumber(type: String): boolean;
    static Date: string;
    static DateArray: string;
    static isDate(type: String): boolean;
    static Boolean: string;
    static BooleanArray: string;
    static isBoolean(type: String): boolean;
}
export interface ISchemaPathDefinition {
    type: string;
    unique?: boolean;
    required?: boolean;
    index?: boolean;
    indexType?: string;
    description?: string;
    example?: string;
    validator?: IValidator;
    ref?: typeof Model;
    defaultValue?: any;
    label?: string;
    readonly?: boolean;
}
export interface ISchemaDefinition {
    [Path: string]: ISchemaPathDefinition;
}
export interface ISchemaPath extends ISchemaPathDefinition {
    pathName: string;
}
export interface IValidator {
    (value: any): boolean | string;
}
export declare type SchemaModel = typeof Model;
export declare class Schema {
    private _paths;
    private _Model;
    private _validationMethods;
    paths(): ISchemaPath[];
    Model(): SchemaModel;
    add(pathName: string, def: ISchemaPathDefinition): void;
    validate(doc: Model): Promise<Model>;
    constructor(def: ISchemaDefinition, Model: SchemaModel);
    /**
     * Removes paths from document that are not specified in schema
     *
     * @protected
     * @param {Model} doc - Instance of Model
     *
     * @returns {Promise<Model>}
     *
     * @memberOf Schema
     */
    protected _removeExtraneousPaths(doc: Model): Promise<Model>;
    /**
     * Sets read only paths to their previous values
     * @param {Model} doc
     * @returns {Promise<Model>}
     * @protected
     * @memberOf Schema
     */
    protected _enforceReadOnlyPaths(doc: Model): Promise<Model>;
    /**
     * Validate model's requires paths
     * @protected
     * @param {Model} doc - Instance of Model
     * @returns {Promise<Model>}
     * @memberOf Schema
     */
    protected _validateRequiredPaths(doc: Model): Promise<Model>;
    /**
     * Validation middleware that ensures unique paths are actually unique
     *
     * @protected
     * @param {Model} doc - Instance of Model
     *
     * @returns {Promise<Model>}
     * @memberOf Schema
     */
    protected _validateUniquePaths(doc: Model): Promise<Model>;
    /**
     * Validates typecasting on models
     *
     * @protected
     * @param {Model} doc - Instance of Model
     *
     * @returns {Promise<Model>}
     *
     * @memberOf Schema
     */
    protected _validateTypeCasting(doc: Model): Model;
    validateAndTypeCastObject(obj: IAttributesHash): IAttributesHash;
    /**
     * Runs custom validate() hooks on schema paths
     *
     * @protected
     * @param {Model} doc - Instance of Model
     *
     * @returns {Promise<Model>}
     *
     * @memberOf Schema
     */
    protected _validateValidators(doc: Model): Promise<void>;
    /**
     * Assigns values on undefined paths with a defaultValue specified in their schema
     *
     * @protected
     * @param {Model} doc - Instance of Model
     *
     * @returns {Promise<Model>}
     *
     * @memberOf Schema
     */
    protected _assignDefaultValues(doc: Model): Promise<Model>;
}
export default Schema;
