export class ValidationError extends Error {
    path: string
    value: any

    constructor(message: string, path: string, value: any) {
        super(message);
        this.path = path;
        this.value = value;
    }
}
export class UniqueError extends Error {
    path: string
    value: any

    constructor(message: string, path: string, value: any) {
        super(message);
        this.path = path;
        this.value = value;
    }
}
export class RequiredError extends Error {
    path: string

    constructor(message: string, path: string) {
        super(message);
        this.path = path;
    }
}