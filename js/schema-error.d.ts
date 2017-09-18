export declare class ValidationError extends Error {
    path: string;
    value: any;
    name: string;
    constructor(message: string, path: string, value: any);
}
export declare class UniqueError extends Error {
    path: string;
    value: any;
    name: string;
    constructor(message: string, path: string, value: any);
}
export declare class RequiredError extends Error {
    path: string;
    name: string;
    constructor(message: string, path: string);
}
