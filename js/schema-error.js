"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ValidationError extends Error {
    constructor(message, path, value) {
        super(message);
        this.name = 'ValidationError';
        this.path = path;
        this.value = value;
    }
}
exports.ValidationError = ValidationError;
class UniqueError extends Error {
    constructor(message, path, value) {
        super(message);
        this.name = 'UniqueError';
        this.path = path;
        this.value = value;
    }
}
exports.UniqueError = UniqueError;
class RequiredError extends Error {
    constructor(message, path) {
        super(message);
        this.name = 'RequiredError';
        this.path = path;
    }
}
exports.RequiredError = RequiredError;
//# sourceMappingURL=schema-error.js.map