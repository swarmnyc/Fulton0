/// <reference types="koa" />
import { Context } from 'koa';
import * as mongorito from 'mongorito';
import { Router, JoiRouterDefinition } from '../router';
import { Model } from '../model';
import { JSONAPIAdapter, AdapterOptions } from '../adapters/jsonapi';
import { ValidationProperties } from './jsonapi-route-components/jsonapi-request-validator';
import { QueryParams } from '../helpers/query/types';
import { QueryParamSettings } from './jsonapi-route-components/jsonapi-query-reader';
import { JSONModel } from './jsonapi-route-components/jsonapi-types';
export declare abstract class JSONAPIRouter extends Router implements ValidationProperties, QueryParamSettings {
    relationships(): RouterRelationship[];
    name(): string;
    description(): string;
    isAPI(): boolean;
    /**
     * The default limit on queries. Override this function to return your
     * own value. Default return value is 25.
     * @returns {number}
     */
    defaultLimit(): number;
    /**
     * The maximum limit that can be applied to API queries. This is to prevent
     * large queries that may tax the API. Default return value is 1000.
     * @returns {number}
     */
    maxLimit(): number;
    /**
     * The constructor for this route's model. MUST be overwritten to return a Model
     * class for the route to function.
     * @returns {typeof Model}
     */
    Model(): typeof Model;
    /**
     * Paths that are writable via create and update operations. The default
     * is all paths. Any paths in the returned array of strings will be permitted
     * to be updated, all other model paths will be un-writable via the endpoint.
     * @returns {string[]}
     */
    writablePaths(): string[];
    /**
     * List of operations permitted at this endpoint
     * @returns {[OPERATION,OPERATION,OPERATION,OPERATION]}
     */
    operations(): OPERATION[];
    namespace(): string;
    /**
     * Set the type, used by the json api serializer. Defaults to the collection name of the model.
     * @returns {string}
     * @memberOf JSONAPIRouter
     */
    type(): string;
    prefix(): string;
    /**
     * The id path on the model. Set to _id by default, as per mongodb.
     * Override to point to a different path.
     * @returns {string}
     * @memberOf JSONAPIRouter
     */
    idPath(): string;
    /**
     * Array of path names to not be returned by the route
     *
     * @returns {string[]}
     *
     * @memberof JSONAPIRouter
     */
    hidePaths(): string[];
    adapterOptions(): AdapterOptions;
    /**
     *
     *
     * @returns {Adapter} - Returns an Adapter to be appied to the routes
     *
     * @memberof JSONAPIRouter
     */
    adapter(): JSONAPIAdapter;
    private _generatePaginationLinks(offset, count, limit);
    protected singularType(): any;
    protected _getIncludes(include: string, doc: JSONModel, ctx: Context): Promise<any>;
    count(query: QueryParams, ctx: Router.Context): Promise<any>;
    find(query: QueryParams, ctx: Router.Context): Promise<JSONModel[]>;
    findById(id: string, ctx: Router.Context): Promise<mongorito.Model>;
    create(data: JSONModel, ctx: Router.Context): Promise<Model>;
    update(model: Model, payload: JSONModel, ctx: Router.Context): Promise<Model>;
    remove(model: Model, ctx: Router.Context): Promise<boolean>;
    setHeaders(): Function;
    setupQuery(ctx: Router.Context): QueryParams;
    querySet(ctx: Router.Context): Promise<any>;
    protected _find(): JoiRouterDefinition;
    protected _findById(): JoiRouterDefinition;
    validAuthorization(): RegExp;
    protected _create(): JoiRouterDefinition;
    protected _update(): JoiRouterDefinition;
    protected _remove(): JoiRouterDefinition;
    protected _permissions(): Function;
    protected _getOperation(method: string): number;
    protected _init(): Function;
    deserializerMiddleware(): Function;
    _responder(): Function;
    copyright(): string;
    static forbidden(): any;
    protected _canUseHandler(operation: OPERATION): boolean;
    configure(router: any): void;
}
/**
 * @typedef RelationshipType
 */
export declare enum RelationshipType {
    BELONGS_TO = 0,
    TO_MANY = 1,
}
export declare enum OPERATION {
    GET = 0,
    CREATE = 1,
    UPDATE = 2,
    REMOVE = 3,
}
/**
 * @typedef RouterRelationship
 */
export interface RouterRelationship {
    type: string;
    relationshipType: RelationshipType;
    path: string;
    link?: string;
    Model: typeof Model;
}
