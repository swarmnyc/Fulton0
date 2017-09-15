"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const KoaRouter = require("koa-joi-router");
const router_1 = require("../router");
const jsonapi_1 = require("../adapters/jsonapi");
const jsonapi_request_validator_1 = require("./jsonapi-route-components/jsonapi-request-validator");
const query_1 = require("../helpers/query");
const qs_1 = require("../middlewares/qs");
const _ = require("lodash");
const moment = require("moment");
const pluralize = require("pluralize");
const jsonapi_query_reader_1 = require("./jsonapi-route-components/jsonapi-query-reader");
const jsonapi_errors_1 = require("./jsonapi-route-components/jsonapi-errors");
const { Joi } = KoaRouter;
class JSONAPIRouter extends router_1.Router {
    name() {
        return _.startCase(this.type());
    }
    description() {
        return `JSON API routes for ${this.type()}.`;
    }
    isAPI() {
        return true;
    }
    /**
     * The default limit on queries. Override this function to return your
     * own value. Default return value is 25.
     * @returns {number}
     */
    defaultLimit() {
        return 0;
    }
    /**
     * The maximum limit that can be applied to API queries. This is to prevent
     * large queries that may tax the API. Default return value is 1000.
     * @returns {number}
     */
    maxLimit() {
        return 0;
    }
    /**
     * The constructor for this route's model. MUST be overwritten to return a Model
     * class for the route to function.
     * @returns {typeof Model}
     */
    Model() {
        return undefined;
    }
    /**
     * Paths that are writable via create and update operations. The default
     * is all paths. Any paths in the returned array of strings will be permitted
     * to be updated, all other model paths will be un-writable via the endpoint.
     * @returns {string[]}
     */
    writablePaths() {
        return [];
    }
    /**
     * List of operations permitted at this endpoint
     * @returns {[JSONAPIRouter.OPERATION,JSONAPIRouter.OPERATION,JSONAPIRouter.OPERATION,JSONAPIRouter.OPERATION]}
     */
    operations() {
        return [JSONAPIRouter.OPERATION.GET, JSONAPIRouter.OPERATION.CREATE, JSONAPIRouter.OPERATION.UPDATE, JSONAPIRouter.OPERATION.REMOVE];
    }
    namespace() {
        return 'api';
    }
    /**
     * Set the type, used by the json api serializer. Defaults to the collection name of the model.
     * @returns {string}
     * @memberOf JSONAPIRouter
     */
    type() {
        const M = this.Model();
        const m = new M();
        return m.collectionName;
    }
    prefix() {
        return `/${this.namespace()}/${this.type()}`;
    }
    /**
     * The id path on the model. Set to _id by default, as per mongodb.
     * Override to point to a different path.
     * @returns {string}
     * @memberOf JSONAPIRouter
     */
    idPath() {
        return '_id';
    }
    /**
     * Define relationships belonging to the model in the form of an
     * array of relationship definitions.
     * @see {JSONAPIRouter#RouterRelationship}
     * @returns {JSONAPIRouter#RouterRelationship[]}
     */
    relationships() {
        return [];
    }
    /**
     * Array of path names to not be returned by the route
     *
     * @returns {string[]}
     *
     * @memberof JSONAPIRouter
     */
    hidePaths() {
        return [];
    }
    adapterOptions() {
        let relationships = this.relationships().map((relationship) => {
            return _.omit(relationship, 'Model');
        });
        return {
            type: this.type(),
            idPath: this.idPath(),
            relationships: relationships,
            namespace: this.namespace(),
            omit: this.hidePaths()
        };
    }
    /**
     *
     *
     * @returns {Adapter} - Returns an Adapter to be appied to the routes
     *
     * @memberof JSONAPIRouter
     */
    adapter() {
        return new jsonapi_1.JSONAPIAdapter(this.adapterOptions());
    }
    _generatePaginationLinks(offset, count, limit) {
        const rootLink = `${this.prefix()}?page[limit]=${limit}&page[offset]=`;
        const lastPage = Math.max((count - limit), 0);
        return {
            self: `${rootLink}${offset}`,
            next: `${rootLink}${Math.min(lastPage, (offset + limit))}`,
            prev: `${rootLink}${Math.max(0, offset - limit)}`,
            first: `${rootLink}0`,
            last: `${rootLink}${lastPage}`
        };
    }
    singularType() {
        return pluralize(this.type(), 1);
    }
    _getIncludes(include, doc) {
        return __awaiter(this, void 0, void 0, function* () {
            const relationships = this.relationships();
            let output = [];
            let matchedRelationships;
            let includes = include.split(',').map((pathName) => {
                return _.camelCase(pathName);
            });
            matchedRelationships = relationships.filter((item) => {
                return includes.indexOf(item.path) >= 0;
            });
            for (let rel of matchedRelationships) {
                let ids = [];
                let link = rel.link ? rel.link : `${this.namespace()}/${rel.type}`;
                let adapter = new jsonapi_1.JSONAPIAdapter({ type: rel.type, namespace: link, idPath: this.idPath() });
                let relPath = _.kebabCase(rel.path);
                if (doc['relationships'] && doc['relationships'][relPath]) {
                    if (Array.isArray(doc['relationships'][relPath]['data'])) {
                        ids = doc['relationships'][relPath]['data'].map((r) => {
                            return r['id'];
                        });
                    }
                    else {
                        ids = [doc['relationships'][relPath].data.id];
                    }
                }
                if (ids.length) {
                    let relatedDocs = yield rel.Model.find({ _id: { $in: ids } });
                    if (relatedDocs.length) {
                        let jsondocs = _.invokeMap(relatedDocs, 'toJSON');
                        output.push(adapter.serialize(jsondocs).data);
                    }
                }
            }
            return _.flatten(output);
        });
    }
    count(query, ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const Model = this.Model();
            return query_1.countHelper(Model, query);
        });
    }
    find(query, ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const Model = this.Model();
            let q;
            try {
                q = yield query_1.queryHelper(Model, query);
            }
            catch (error) {
                error.message = "Couldn't put query together. Check your params and try again.";
                ctx.state.status = 422;
                ctx.state.errors.push(jsonapi_errors_1.onRequestError(error));
            }
            return q;
        });
    }
    findById(id, ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const Model = this.Model();
            return Model.findById(id);
        });
    }
    create(data, ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const Model = this.Model();
            const model = new Model();
            return model.setAndValidate(data)
                .then(() => {
                return model.save();
            });
        });
    }
    update(model, payload, ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            return model.setAndValidate(payload)
                .then(() => {
                return model.save();
            }).catch((err) => {
                console.log(err);
            });
        });
    }
    remove(model, ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            let isRemoved;
            try {
                yield model.remove();
                isRemoved = true;
            }
            catch (e) {
                isRemoved = false;
            }
            return isRemoved;
        });
    }
    setHeaders() {
        return function (ctx, next) {
            return __awaiter(this, void 0, void 0, function* () {
                ctx.set('content-type', 'application/vnd.api+json');
                yield next();
            });
        };
    }
    setupQuery(ctx) {
        let query = jsonapi_query_reader_1.QueryReader.getQueryParams(this, ctx.state.query);
        ctx.app.context['services'].log.debug(query);
        return query;
    }
    querySet(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            return {};
        });
    }
    _find() {
        const self = this;
        const find = this.find;
        const count = this.count;
        const setupQuery = this.setupQuery;
        const getSizeValidator = function () {
            let validator = KoaRouter.Joi.number().description(`Limit response size by the specified amount`).default(self.defaultLimit());
            if (self.maxLimit() !== 0) {
                validator = validator.max(this.maxLimit());
            }
            return validator.optional();
        };
        const querySet = this.querySet;
        return {
            method: 'get',
            path: `/`,
            meta: {
                friendlyName: `Find ${this.type()}`,
                description: `Find ${this.type()}. Provide query filters, sort options, and pagination to customize results.`
            },
            validate: {
                continueOnError: true,
                header: jsonapi_request_validator_1.RequestValidator.createValidatorForJSONAPIHeaders(),
                query: Joi.object().keys({
                    'include': KoaRouter.Joi.string().description('Include related documents at the specified paths').optional(),
                    'lessThan[attr]': KoaRouter.Joi.string().description('**DEPRECATED Filter by the bracketed attribute with values less than **DEPRECATED').optional(),
                    'greaterThan[attr]': KoaRouter.Joi.string().description('**DEPRECATED Filter by the bracketed attribute with values greater than **DEPRECATED').optional(),
                    'filter[attr]': KoaRouter.Joi.string().description('Filter by the bracketed attribute (and/or queries by comma seperating values, this does not work on string types)').optional(),
                    'filter[attr][$gt|$lt]': KoaRouter.Joi.string().description('Filter by the bracketed attribute with values less than or greater than. Ex. `filter[likeCount][$gt]=10`').optional(),
                    'page[limit]': getSizeValidator(),
                    'page[size]': getSizeValidator(),
                    'page[offset]': KoaRouter.Joi.number().description(`Offset response set by specified number of documents`).default(0).optional(),
                    'page[page]': KoaRouter.Joi.number().description(`The page number of the request`).default(0).optional(),
                    sort: KoaRouter.Joi.string().description('Ascending sort results by specified model paths separated by commas. Placing - in front of  path name will make the sort descending. Example: ?sort=-created-at,updated-at').optional()
                }).optionalKeys('include', 'page[limit]', 'page[offset]', 'filter[attr]').unknown(),
            },
            handler: [self.deserializerMiddleware(), function (ctx, next) {
                    return __awaiter(this, void 0, void 0, function* () {
                        let query = {};
                        if (ctx.state.query) {
                            query = setupQuery.call(self, ctx);
                            query.__base = yield querySet(ctx);
                        }
                        ctx.state.model = yield find.call(self, query, ctx);
                        ctx.state.count = yield count.call(self, query, ctx);
                        ctx.state.status = 200;
                        yield next();
                    });
                }, this._permissions()]
        };
    }
    _findById() {
        const findById = this.findById;
        const self = this;
        return {
            method: 'get',
            path: `/:item_id`,
            meta: {
                friendlyName: `Get ${this.singularType()}`,
                description: `Get a single ${this.singularType()}`
            },
            validate: {
                type: 'json',
                continueOnError: true,
                header: jsonapi_request_validator_1.RequestValidator.createValidatorForJSONAPIHeaders(),
                body: jsonapi_request_validator_1.RequestValidator.createValidatorForBody(self)
            },
            handler: [self.deserializerMiddleware(), function (ctx, next) {
                    return __awaiter(this, void 0, void 0, function* () {
                        const id = ctx.params.item_id;
                        ctx.state.model = yield findById.call(self, id, ctx);
                        ctx.state.status = ctx.state.model ? 200 : 404;
                        yield next();
                    });
                }, this._permissions()]
        };
    }
    validAuthorization() {
        return /^Bearer [a-zA-Z0-9]+$/;
    }
    _create() {
        const self = this;
        const create = this.create;
        return {
            method: 'post',
            path: `/`,
            meta: {
                friendlyName: `Create ${this.singularType()}`,
                description: `Creates a new ${this.singularType()}`
            },
            validate: {
                type: 'json',
                continueOnError: true,
                header: jsonapi_request_validator_1.RequestValidator.createValidatorForJSONAPIHeaders(),
                body: jsonapi_request_validator_1.RequestValidator.createValidatorForBody(self)
            },
            handler: [self.deserializerMiddleware(), this._permissions(), function (ctx, next) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (!ctx.state.data) {
                            ctx.throw(400);
                        }
                        try {
                            ctx.state.model = yield create.call(self, ctx.state.data, ctx);
                            ctx.state.status = 201;
                        }
                        catch (e) {
                            ctx.state.errors.push(jsonapi_errors_1.onRequestError(e));
                        }
                        finally {
                            yield next();
                        }
                    });
                }]
        };
    }
    _update() {
        const self = this;
        const update = this.update;
        return {
            method: 'patch',
            path: `/:item_id`,
            meta: {
                friendlyName: `Update ${this.singularType()}`,
                description: `Update an existing ${this.singularType()}`
            },
            validate: {
                type: 'json',
                continueOnError: true,
                body: jsonapi_request_validator_1.RequestValidator.createValidatorForBody(self),
                header: jsonapi_request_validator_1.RequestValidator.createValidatorForJSONAPIHeaders(),
            },
            handler: this._findById().handler.concat([function (ctx, next) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (!ctx.state.data) {
                            ctx.throw(400);
                        }
                        try {
                            const model = yield update.call(self, ctx.state.model, ctx.state.data, ctx);
                            ctx.state.model = model;
                            ctx.state.status = 200;
                        }
                        catch (e) {
                            ctx.state.errors.push(jsonapi_errors_1.onRequestError(e));
                        }
                        finally {
                            yield next();
                        }
                    });
                }])
        };
    }
    _remove() {
        const self = this;
        const remove = this.remove;
        return {
            method: 'delete',
            path: `/:item_id`,
            meta: {
                friendlyName: `Delete ${this.singularType()}`,
                description: `Deletes a ${this.singularType()}`
            },
            validate: {
                header: jsonapi_request_validator_1.RequestValidator.createValidatorForJSONAPIHeaders(),
                params: {
                    'item_id': KoaRouter.Joi.string().required().description(`The id of the ${this.singularType()} to delete`)
                }
            },
            handler: this._findById().handler.concat(function (ctx, next) {
                return __awaiter(this, void 0, void 0, function* () {
                    let isRemoved = yield remove.call(self, ctx.state.model, ctx);
                    if (isRemoved) {
                        ctx.state.status = 204;
                    }
                    else {
                        ctx.throw(400);
                    }
                    yield next();
                });
            })
        };
    }
    _permissions() {
        const self = this;
        const permissions = this.permissions();
        return function (ctx, next) {
            return __awaiter(this, void 0, void 0, function* () {
                let isAllowed = Boolean(!permissions);
                if (permissions && Array.isArray(ctx.state.model)) {
                    isAllowed = (yield Promise.all(ctx.state.model.map((model) => {
                        return permissions.call(self, ctx, model);
                    }))).every((val) => {
                        return val === true;
                    });
                }
                else if (permissions) {
                    isAllowed = yield permissions.call(self, ctx, ctx.state.model);
                }
                if (!isAllowed) {
                    ctx.throw(401);
                }
                else {
                    yield next();
                }
            });
        };
    }
    _getOperation(method) {
        let operation;
        switch (method.toLowerCase()) {
            case 'get':
                operation = JSONAPIRouter.OPERATION.GET;
                break;
            case 'post':
                operation = JSONAPIRouter.OPERATION.CREATE;
                break;
            case 'patch':
                operation = JSONAPIRouter.OPERATION.UPDATE;
                break;
            case 'delete':
                operation = JSONAPIRouter.OPERATION.REMOVE;
                break;
        }
        return operation;
    }
    _init() {
        const getOperation = this._getOperation;
        return function (ctx, next) {
            return __awaiter(this, void 0, void 0, function* () {
                ctx.state.errors = [];
                ctx.state.operation = getOperation(ctx.method);
                if (_.isNumber(ctx.state.operation) === false) {
                    return ctx.throw(403);
                }
                yield next();
            });
        };
    }
    deserializerMiddleware() {
        const deserialize = this.adapter().deserialize;
        const writablePaths = this.writablePaths();
        return function (ctx, next) {
            return __awaiter(this, void 0, void 0, function* () {
                if (_.isObject(ctx.request.body) && Object.keys(ctx.request.body).length) {
                    let data;
                    try {
                        data = deserialize(ctx.request.body);
                    }
                    catch (err) {
                        return ctx.throw(400, err);
                    }
                    if (writablePaths.length) {
                        data = _.pick(data, writablePaths);
                    }
                    ctx.state.data = data;
                }
                yield next();
            });
        };
    }
    _responder() {
        const self = this;
        const generatePaginationLinks = this._generatePaginationLinks;
        const getIncludes = this._getIncludes;
        const serialize = this.adapter().serialize;
        const copyright = this.copyright;
        return function (ctx, next) {
            return __awaiter(this, void 0, void 0, function* () {
                let output = { jsonapi: { version: '1.0' } };
                output.meta = {
                    copyright: copyright()
                };
                if (ctx.state.errors.length) {
                    ctx.state.status = ctx.state.errors[0].code;
                    Object.assign(output, { errors: ctx.state.errors });
                }
                else if (ctx.state.model) {
                    if (Array.isArray(ctx.state.model)) {
                        Object.assign(output, serialize(_.invokeMap(ctx.state.model, 'toJSON')));
                    }
                    else {
                        Object.assign(output, serialize(ctx.state.model.toJSON()));
                    }
                    if (ctx.state.query && ctx.state.query.page && ctx.state.query.page.offset && ctx.state.query.page.size && ctx.state.count) {
                        output.links = generatePaginationLinks.call(self, Number(ctx.state.query.page.offset), ctx.state.count, Number(ctx.state.query.page.size));
                    }
                    if (typeof ctx.state.count !== "undefined") {
                        output.meta['total'] = ctx.state.count;
                        if (ctx.state.query.page) {
                            let limit = ctx.state.query.page.limit || ctx.state.query.page.size;
                            let numberOfPages = Math.ceil(ctx.state.count / Number(limit));
                            if (_.isNumber(numberOfPages)) {
                                output.meta['pages'] = numberOfPages;
                            }
                        }
                    }
                    if (ctx.state.query && ctx.state.query.include) {
                        let p;
                        if (Array.isArray(output.data)) {
                            p = output.data.map((item) => {
                                return getIncludes.call(self, ctx.state.query.include, item);
                            });
                        }
                        else {
                            p = [getIncludes.call(self, ctx.state.query.include, output.data)];
                        }
                        yield Promise.all(p).then((results) => {
                            output.included = [];
                            results.forEach((r) => {
                                output.included = output.included.concat(r);
                            });
                            output.included = _.uniqBy(output.included, function (included) {
                                return included.id.toString();
                            });
                        });
                    }
                }
                ctx.status = ctx.state.status;
                ctx.body = output;
            });
        };
    }
    copyright() {
        return `${moment().year()} SWARMNYC`;
    }
    static forbidden() {
        return {
            handler: function (ctx) {
                return __awaiter(this, void 0, void 0, function* () {
                    ctx.throw(403);
                });
            }
        };
    }
    _canUseHandler(operation) {
        const operations = this.operations();
        return operations.indexOf(operation) >= 0;
    }
    configure(router) {
        if (!this.Model()) {
            throw new TypeError(`Return type of router.Model() is not an instance of Model`);
        }
        // Get the route handlers for this route if allowed
        const find = this._find.bind(this);
        const findById = this._findById.bind(this);
        const update = this._update.bind(this);
        const create = this._create.bind(this);
        const remove = this._remove.bind(this);
        // compose query string into object
        router.use(qs_1.default());
        // utility functions
        router.use(this.setHeaders());
        router.use(this._init());
        // mount route handlers
        if (this._canUseHandler(JSONAPIRouter.OPERATION.GET)) {
            router.route(find());
            router.route(findById());
        }
        if (this._canUseHandler(JSONAPIRouter.OPERATION.UPDATE)) {
            router.route(update());
        }
        if (this._canUseHandler(JSONAPIRouter.OPERATION.CREATE)) {
            router.route(create());
        }
        if (this._canUseHandler(JSONAPIRouter.OPERATION.REMOVE)) {
            router.route(remove());
        }
        // send completed responses
        router.use(this._responder());
    }
}
exports.JSONAPIRouter = JSONAPIRouter;
/**
 * @namespace JSONAPIRouter
 */
(function (JSONAPIRouter) {
    /**
     * @typedef RelationshipType
     */
    let RelationshipType;
    (function (RelationshipType) {
        RelationshipType[RelationshipType["BELONGS_TO"] = 0] = "BELONGS_TO";
        RelationshipType[RelationshipType["TO_MANY"] = 1] = "TO_MANY";
    })(RelationshipType = JSONAPIRouter.RelationshipType || (JSONAPIRouter.RelationshipType = {}));
    let OPERATION;
    (function (OPERATION) {
        OPERATION[OPERATION["GET"] = 0] = "GET";
        OPERATION[OPERATION["CREATE"] = 1] = "CREATE";
        OPERATION[OPERATION["UPDATE"] = 2] = "UPDATE";
        OPERATION[OPERATION["REMOVE"] = 3] = "REMOVE";
    })(OPERATION = JSONAPIRouter.OPERATION || (JSONAPIRouter.OPERATION = {}));
})(JSONAPIRouter = exports.JSONAPIRouter || (exports.JSONAPIRouter = {}));
//# sourceMappingURL=jsonapi.js.map