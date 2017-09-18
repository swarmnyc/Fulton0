"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const token_1 = require("./token");
const authenticate_1 = require("./authenticate");
class OAuth2Server {
    tokenEndpoint() {
        return this._tokenEndpoint;
    }
    token() {
        const model = new this.model();
        return token_1.token(model, this.grants);
    }
    authenticate(scope) {
        const model = new this.model();
        return authenticate_1.authenticate(model, scope);
    }
    authorize() {
    }
    constructor(opts, routeDefinitionFactory) {
        this.model = opts.model;
        this._tokenEndpoint = opts.tokenEndpoint;
        this.grants = opts.grants;
        this.routeDefinition = routeDefinitionFactory(this);
    }
    getRoute() {
        return this.routeDefinition;
    }
}
exports.OAuth2Server = OAuth2Server;
//# sourceMappingURL=server.js.map