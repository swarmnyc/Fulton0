"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function errorHandler(ctx, mesg) {
    const code = _getCode(mesg);
    // TODO: Review this for later
    // CORS option should get from app, set to * for now.
    const properties = { headers: { 'access-control-allow-origin': '*' } };
    const body = { errors: [{ status: code, title: mesg }] };
    return ctx.throw(code, JSON.stringify(body), properties);
}
exports.errorHandler = errorHandler;
function _getCode(mesg) {
    let code;
    switch (mesg) {
        case 'bad request':
            code = 400;
            break;
        case 'unauthorized':
            code = 401;
            break;
        case 'forbidden':
            code = 403;
            break;
        default:
            code = 500;
            break;
    }
    return code;
}
//# sourceMappingURL=error.js.map