export class ValidationError extends Error {
    path: string
    value: any
    name = 'ValidationError'

    constructor(message: string, path: string, value: any) {
        super(message);
        this.path = path;
        this.value = value;
    }
}
export class UniqueError extends Error {
    path: string
    value: any
    name = 'UniqueError'

    constructor(message: string, path: string, value: any) {
        super(message);
        this.path = path;
        this.value = value;
    }
}
export class RequiredError extends Error {
    path: string
    name = 'RequiredError'

    constructor(message: string, path: string) {
        super(message);
        this.path = path;
    }
}