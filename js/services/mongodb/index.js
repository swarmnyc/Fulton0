"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const mongorito = require('mongorito');
const service_1 = require('../../service');
class BaseMongoDBService extends service_1.Service {
    constructor() {
        super(...arguments);
        this.uri = 'mongodb://localhost:27017/test';
    }
    /**
     * Returns the URI of the mongo connection. Defaults to mongodb://localhost:27017/test. Change the return value of this method in your subclass to specify a different URI.
     *
     *
     * @returns {string}
     *
     * @memberOf BaseMongoDBService
     */
    mongoUri() {
        return this.uri;
    }
    /**
     * Overrides service Mongo URI. Use only before connection is set.
     *
     * @param {string} uri - The URI to set the service to
     *
     * @returns {void}
     */
    setMongoUri(uri) {
        this.uri = uri;
    }
    /**
     * Returns a string that specifies the name the service should be mounted under in the app. Defaults to 'db'
     *
     * @returns {string}
     *
     * @memberOf BaseMongoDBService
     */
    as() {
        return 'db';
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const instance = mongorito;
            var options = { server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
                replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } } };
            yield instance.connect(this.mongoUri(), options);
            mongorito.db.on('error', console.error.bind(console, 'connection error:'));
            return mongorito;
        });
    }
    deinit() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.instance.disconnect();
            return;
        });
    }
}
exports.BaseMongoDBService = BaseMongoDBService;
//# sourceMappingURL=index.js.map