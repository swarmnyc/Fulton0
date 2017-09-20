/// <reference types="node" />
import { IAdapter } from '../..';
import { RelationshipType } from '../../routers/jsonapi';
export declare class AdapterError extends Error {
    static type: string;
}
export declare class JSONAPIAdapter implements IAdapter {
    private rels;
    private omitPaths;
    idPath: string;
    type: string;
    namespace: string;
    constructor(options: AdapterOptions);
    readonly relationships: JSONAPIAdapterRelationship[];
    protected _serialize(base: GenericObject): SerializedObject;
    private _deserialize;
    serialize: (input: GenericObject | GenericObject[], page?: number, limit?: number) => Package;
    deserialize: (input: Package) => GenericObject | GenericObject[];
}
export interface AdapterOptions {
    type: string;
    idPath?: string;
    relationships?: JSONAPIAdapterRelationship[];
    namespace?: string;
    omit?: string[];
}
export interface GenericObject {
    [K: string]: any;
}
export interface SerializedObject {
    id: string;
    type: string;
    attributes: Attributes;
    relationships?: Relationships;
    links?: LinksObject | LinksObject[];
    included?: CompoundDocument | CompoundDocument[];
}
export interface Package {
    data: SerializedObject | SerializedObject[];
    links?: LinksObject;
}
export interface Attributes {
    [K: string]: any;
}
export interface Relationships {
    [Rel: string]: SerializedRelationship;
}
export interface SerializedRelationship {
    data: RelationshipData | RelationshipData[];
    links: LinksObject;
}
export interface RelationshipData {
    id: string | number;
    type: string;
}
export interface LinksObject {
    self?: string;
    related?: string;
}
export interface CompoundDocument {
    [attr: string]: string | number | string[] | number[] | boolean | boolean[];
}
export interface JSONAPIAdapterRelationship {
    path: string;
    type: string;
    relationshipType: RelationshipType;
}
