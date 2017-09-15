export interface JSONAPIRelationshipData {
    type: string;
    id: string;
}
export interface JSONAPIRelationship {
    links: JSONAPILinksObject;
    data: JSONAPIRelationshipData;
}
export interface JSONAPIRelationships {
    [K: string]: JSONAPIRelationship;
}
export interface JSONModel {
    [path: string]: any;
}
export interface JSONAPILinksObject {
    self?: string;
    related?: string;
    first?: string;
    next?: string;
    prev?: string;
    last?: string;
}
export interface JSONAPIErrorSource {
    pointer: string;
    parameter?: string;
}
export interface JSONAPIError {
    title?: string;
    source?: JSONAPIErrorSource;
    detail?: string;
    code?: number;
    meta?: JSONModel;
}
export interface JSONAPIVersion {
    version: string;
}
export interface JSONAPIResponse {
    data?: JSONModel | JSONModel[];
    included?: JSONModel[];
    links?: JSONAPILinksObject;
    errors?: JSONAPIError[];
    meta?: JSONModel;
    jsonapi: JSONAPIVersion;
}
