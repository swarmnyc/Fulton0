/// <reference path="../src/custom-types/mongorito.d.ts" />
/// <reference types="koa" />
import { Model as MongoritoModel } from 'mongorito';
import { IAttributesHash } from 'mongorito';
import { ISchemaDefinition, Schema } from './schema';
import { ValidationError, UniqueError, RequiredError } from './schema-error';
import { ObjectID } from 'mongodb';
import { Context } from 'koa';
import { RouterRelationship } from './routers/jsonapi';
export interface KeyTransformDictionary {
    [path: string]: (any) => any;
}
export declare class Model extends MongoritoModel {
    static ValidationError: typeof ValidationError;
    static UniqueError: typeof UniqueError;
    static RequiredError: typeof RequiredError;
    static ObjectID: typeof ObjectID;
    static appliedIndex: boolean;
    static versionKey: string;
    collectionName: string;
    readonly changedKeys: any;
    /**
     * Define a schema for your model here.
     *
     * @returns {ISchemaDefinition}
     *
     * @memberOf Model
     */
    schema(): ISchemaDefinition;
    static routerRelationships(): RouterRelationship[];
    static hideKeysFromClient(ctx: Context): string[];
    static transformKeysForClient(ctx: Context): KeyTransformDictionary;
    static applyClientTransforms(ctx: Context, doc: any): any;
    static schema(): ISchemaDefinition;
    static isSchemaKeyRelationship(key: string): boolean;
    static isSchemaKeyArray(key: string): boolean;
    protected _schema: Schema;
    protected _isNew: boolean;
    /**
     * Returns true if constructor has a schema attached to it
     *
     * @readonly
     * @protected
     * @static
     *
     * @memberOf Model
     */
    readonly hasSchema: boolean;
    protected _getParent(): typeof Model;
    /**
     * Return true to automatically add an updatedAt and createdAt path to a model.
     *
     * @returns {boolean}
     *
     * @memberOf Model
     */
    timestamps(): boolean;
    /**
     * Return true to automatically add concurrency control to autogenerated JSON API Routes, if someone else makes a change to a model before you save, your update will fail.
     *
     * @returns {boolean}
     *
     * @memberOf Model
     */
    concurrencyControl(): boolean;
    /**
     * Check if a document is a newly created document.
     *
     * @returns {boolean} isNew - True if the document has not been saved to the db
     *
     * @memberOf Model
     */
    isNew(): boolean;
    setAndValidate(newAttr: any): Promise<Model>;
    canUpdateBasedOnConcurrencyControl(newAttr: any): Boolean;
    updateVersion(newAttr: any): any;
    validateAndTypecastAttributes(attrs: IAttributesHash): IAttributesHash;
    /**
     * Validates the model against its schema. Setup a catch on the returned Promise to catch validation errors.
     *
     * @returns {Promise<Model>}
     *
     * @memberof Model
     */
    validate(): Promise<Model>;
    /**
     * Register middleware hooks for your model here. For schema support, do not forget to call
     * super.configure() or else schema will not be validated.
     *
     *
     * @memberOf Model
     */
    configure(): void;
    protected _validate(next: any): Promise<Model>;
    protected _setTimestampPaths(): void;
    protected _setConcurrencyControls(): void;
    /**
     * Sets timestamp paths if model.timestamps() returns true
     *
     * @protected
     * @param {*} next
     *
     * @memberOf Model
     */
    protected _updateTimestamps(next: any): Promise<void>;
    protected _setIsNew(next: any): Promise<void>;
    setIndex(): Promise<void>;
    constructor(attr?: any, opts?: any);
}
export default Model;
