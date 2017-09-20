"use strict";
const model_1 = require('../../model');
function onRequestError(err) {
    let code;
    let mesg;
    let path;
    if (err instanceof model_1.Model.ValidationError) {
        code = 422;
        path = err.path;
    }
    else if (err instanceof model_1.Model.RequiredError) {
        code = 422;
        path = err.path;
    }
    else if (err instanceof model_1.Model.UniqueError) {
        code = 409;
        path = err.path;
    }
    else if (err instanceof TypeError) {
        let pathstr = 'at path ';
        let pathIndex = (err.message.indexOf(pathstr)) + pathstr.length;
        code = 422;
        path = err.message.substring(pathIndex, err.message.indexOf(' ', pathIndex));
    }
    mesg = {
        title: err.name,
        code: code,
        detail: err.message,
        source: {
            pointer: `/data/attributes/${path}`
        }
    };
    return mesg;
}
exports.onRequestError = onRequestError;
//# sourceMappingURL=jsonapi-errors.js.map