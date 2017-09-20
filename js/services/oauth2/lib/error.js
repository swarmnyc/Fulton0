"use strict";
function errorHandler(ctx, mesg) {
    const code = _getCode(mesg);
    ctx.response.set('content-type', 'text/plain');
    // TODO: Review this for later
    return ctx.throw(code, JSON.stringify({ error: mesg }));
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