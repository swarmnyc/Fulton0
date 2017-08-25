import * as KoaRouter from 'koa-joi-router';
import { Router } from '../router';
import { Model } from '../model';
import { JSONAPIAdapter } from '../adapters/jsonapi';
import { queryHelper, countHelper } from '../helpers/query';
import qs from '../middlewares/qs';
import { ObjectID } from 'mongodb';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as pluralize from 'pluralize';
import { QueryParams } from '../helpers/query/types';

const { Joi } = KoaRouter;

export class JSONAPIRouter extends Router {

  name(): string {
    return _.startCase(this.type());
  }

  description(): string {
    return `JSON API routes for ${this.type()}.`
  }

  isAPI(): boolean {
    return true;
  }

  /**
   * The default limit on queries. Override this function to return your
   * own value. Default return value is 25.
   * @returns {number}
   */
  defaultLimit(): number {
    return 0;
  }

  /**
   * The maximum limit that can be applied to API queries. This is to prevent
   * large queries that may tax the API. Default return value is 1000.
   * @returns {number}
   */
  maxLimit(): number {
    return 0;
  }

  /**
   * The constructor for this route's model. MUST be overwritten to return a Model
   * class for the route to function.
   * @returns {typeof Model}
   */
  Model(): typeof Model {
    return undefined;
  }

  /**
   * Paths that are writable via create and update operations. The default
   * is all paths. Any paths in the returned array of strings will be permitted
   * to be updated, all other model paths will be un-writable via the endpoint.
   * @returns {string[]}
   */
  writablePaths(): string[] {
    return [];
  }

  /**
   * List of operations permitted at this endpoint
   * @returns {[JSONAPIRouter.OPERATION,JSONAPIRouter.OPERATION,JSONAPIRouter.OPERATION,JSONAPIRouter.OPERATION]}
   */
  operations(): number[] {
    return [JSONAPIRouter.OPERATION.GET,JSONAPIRouter.OPERATION.CREATE, JSONAPIRouter.OPERATION.UPDATE, JSONAPIRouter.OPERATION.REMOVE];
  }

  namespace(): string {
    return 'api';
  }

  /**
   * Set the type, used by the json api serializer. Defaults to the collection name of the model.
   * @returns {string}
   * @memberOf JSONAPIRouter
   */
  type(): string {
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
  idPath(): string {
    return '_id';
  }

  /**
   * Define relationships belonging to the model in the form of an
   * array of relationship definitions.
   * @see {JSONAPIRouter#RouterRelationship}
   * @returns {JSONAPIRouter#RouterRelationship[]}
   */
  relationships(): JSONAPIRouter.RouterRelationship[] {
    return [];
  }

  /**
   * Array of path names to not be returned by the route
   * 
   * @returns {string[]}
   * 
   * @memberof JSONAPIRouter
   */
  hidePaths(): string[] {
    return [];
  }

  adapterOptions(): JSONAPIAdapter.AdapterOptions {
    let relationships: JSONAPIAdapter.Relationship[] = this.relationships().map((relationship) => {
      return _.omit(relationship, 'Model');
    }) as JSONAPIAdapter.Relationship[];
    return {
      type: this.type(),
      idPath: this.idPath(),
      relationships: relationships,
      namespace: this.namespace(),
      omit: this.hidePaths()
    }
  }

  /**
   * 
   * 
   * @returns {Adapter} - Returns an Adapter to be appied to the routes
   * 
   * @memberof JSONAPIRouter
   */
  adapter() {
    return new JSONAPIAdapter(this.adapterOptions());
  }

  onRequestError(err: Error) {
      let code: number;
      let mesg: JSONAPIError;
      let path: string;
      if (err instanceof Model.ValidationError) {
        code = 422;
        path = err.path;
      } else if (err instanceof Model.RequiredError) {
        code = 422;
        path = err.path;
      } else if (err instanceof Model.UniqueError) {
        code = 409;
        path = err.path; 
      } else if (err instanceof TypeError) {
        let pathstr = 'at path ';
        let pathIndex: number = (err.message.indexOf(pathstr)) + pathstr.length;
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

  private _generatePaginationLinks(offset: number, count: number, limit: number): JSONAPILinksObject {
    const rootLink: string = `${this.prefix()}?page[limit]=${limit}&page[offset]=`;
    const lastPage: number = Math.max((count - limit), 0);
    return {
      self: `${rootLink}${offset}`,
      next: `${rootLink}${Math.min(lastPage, (offset + limit))}`,
      prev: `${rootLink}${Math.max(0, offset - limit)}`,
      first: `${rootLink}0`,
      last: `${rootLink}${lastPage}`
    };
  }

  protected singularType() {
    return pluralize(this.type(), 1);
  }

  protected async _getIncludes(include: string, doc: JSONModel) {
    const relationships: JSONAPIRouter.RouterRelationship[] = this.relationships();
    let output: JSONModel[] = [];
    let matchedRelationships: JSONAPIRouter.RouterRelationship[];
    let includes: string[] = include.split(',').map((pathName: string) => {
      return _.camelCase(pathName);
    });
    matchedRelationships = relationships.filter((item: JSONAPIRouter.RouterRelationship) => {
      return includes.indexOf(item.path) >= 0;
    });
    for (let rel of matchedRelationships) {
      let ids: string[] = [];
      let link: string = rel.link ? rel.link : `${this.namespace()}/${rel.type}`;
      let adapter = new JSONAPIAdapter({ type: rel.type, namespace: link, idPath: this.idPath() });
      let relPath = _.kebabCase(rel.path);
      if (doc['relationships'] && doc['relationships'][relPath]) {
        if (Array.isArray(doc['relationships'][relPath]['data'])) {
          ids = doc['relationships'][relPath]['data'].map((r) => {
            return r['id'];
          });
        } else {
          ids = [doc['relationships'][relPath].data.id];
        }
      }
      if (ids.length) {
        let relatedDocs = await rel.Model.find({ _id: { $in: ids }});
        if (relatedDocs.length) {
          let jsondocs = _.invokeMap(relatedDocs, 'toJSON');
          output.push(adapter.serialize(jsondocs).data);
        }
      }
    }
    return _.flatten(output);
  }

  async count(query: QueryParams, ctx: Router.Context) {
    const Model = this.Model();
    return countHelper(Model, query);
  }

  async find(query: QueryParams, ctx: Router.Context): Promise<JSONModel[]> {
    const Model = this.Model();
    return queryHelper(Model, query);
  }

  async findById(id: string, ctx: Router.Context) {
    const Model = this.Model();
    return Model.findById(id);
  }

  async create(data: JSONModel, ctx: Router.Context) {
    const Model = this.Model();
    const model = new Model();
    
    return model.setAndValidate(data)
      .then(() => {
        return model.save();
      });
  }

  async update(model: Model, payload: JSONModel, ctx: Router.Context) {
    return model.setAndValidate(payload)
      .then(() => {
        return model.save();
      }).catch((err) => {
        console.log(err);
      });
  }

  async remove(model: Model, ctx: Router.Context): Promise<boolean> {
    let isRemoved: boolean;
    try {
      await model.remove();
      isRemoved = true;
    } catch(e) {
      isRemoved = false;
    }
    return isRemoved;
  }

  setHeaders() {
    return async function(ctx: Router.Context, next: Function) {
      ctx.set('content-type', 'application/vnd.api+json');
      await next();
    };
  }

  setupQuery(ctx: Router.Context): QueryParams {
    const maxLimit = this.maxLimit();
    let skip;
    let offset;
    let size;
    let pageNumber;
    let query: any;
    let filter = _.mapKeys(ctx.state.query.filter, (v: any, k:string) => {
      return k.charAt(0) !== '$' ? _.camelCase(k) : `$${_.camelCase(k)}`;
    });
    let lessThan = _.mapKeys(ctx.state.query.lessThan, (v: any, k:string) => {
      return k.charAt(0) !== '$' ? _.camelCase(k) : `$${_.camelCase(k)}`;
    });
    let greaterThan = _.mapKeys(ctx.state.query.greaterThan, (v: any, k:string) => {
      return k.charAt(0) !== '$' ? _.camelCase(k) : `$${_.camelCase(k)}`;
    });
    let sort;
    if (typeof ctx.state.query.sort !== "undefined") {
      let sortKeys = [];
      const sortValues = ctx.state.query.sort.split(",");
      for (let value of sortValues) {
        if (value.charAt(0) == "-") {
          sortKeys.push("-" + _.camelCase(value))
        } else {
          sortKeys.push(_.camelCase(value));
        }
      }
      sort = sortKeys.join(",");
    }
    let page = ctx.state.query.page;
    let limit = this.defaultLimit();

    if (page && page.offset) {
      offset = Number(page.offset);
    }
    if (page && page.skip) {
      skip = Number(page.skip)
    }
    if (page && page.page) {
      pageNumber = Number(page.page)
    }
    

    if (page && page.limit) {
      if (maxLimit == 0) {
        limit = Number(page.limit)
      } else {
        limit = Math.min(Number(page.limit), maxLimit);
      }
    }

    if (page && page.size) {
      if (maxLimit == 0) {
        size = Number(page.size)
      } else {
        size = Math.min(Number(page.size), maxLimit);
      }
    }
    

    query = {
      skip: skip,
      size: size,
      page: pageNumber,
      offset: offset,
      limit: limit,
      filter: filter,
      lessThan: lessThan,
      greaterThan: greaterThan,
      sort: sort
    };

    ctx.app.context['services'].log.debug(query);
    return query;
  }

  async querySet(ctx: Router.Context): Promise<any> {
    return {};
  }
  
  protected _find() {
    const self = this;
    const find = this.find;
    const count = this.count;
    const setupQuery = this.setupQuery;
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
        query: Joi.object().keys({
          'include': KoaRouter.Joi.string().description('Include related documents at the specified paths').optional(),
          'lessThan[attr]': KoaRouter.Joi.string().description('Filter by the bracketed attribute with values less than').optional(),
          'greaterThan[attr]': KoaRouter.Joi.string().description('Filter by the bracketed attribute with values greater than').optional(),
          'filter[attr]': KoaRouter.Joi.string().description('Filter by the bracketed attribute (and/or queries by comma seperating values, this does not work on string types)').optional(),
          'page[limit]': KoaRouter.Joi.number().description(`Limit response size by the specified amount`).default(this.defaultLimit()).max(this.maxLimit()).optional(),
          'page[size]': KoaRouter.Joi.number().description(`same as limit`).default(this.defaultLimit()).max(this.maxLimit()).optional(),
          'page[offset]': KoaRouter.Joi.number().description(`Offset response set by specified number of documents`).default(0).optional(),
          'page[page]': KoaRouter.Joi.number().description(`The page number of the request`).default(0).optional(),
          sort: KoaRouter.Joi.string().description('Ascending sort results by specified model paths separated by commas. Placing - in front of  path name will make the sort descending. Example: ?sort=-created-at,updated-at').optional()
        }).optionalKeys('include', 'page[limit]', 'page[offset]', 'filter[attr]').unknown(),
      },
      handler: [async function (ctx: Router.Context, next: Function) {
        let query: QueryParams = {};

        if (ctx.state.query) {
          query = setupQuery.call(self, ctx);
          query.__base = await querySet(ctx);
        }

        ctx.state.model = await find.call(self, query, ctx);
        ctx.state.count = await count.call(self, query, ctx);
        ctx.state.status = 200;
        await next();
      }, this._permissions()]
    };
  }

  protected _findById() {
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
        continueOnError: true,
        // output: {
        //   200: {
        //     body: this.validBody()
        //   }
        // }
      },
      handler: [async function(ctx: Router.Context, next: Function) {
        const id: string = ctx.params.item_id;
        ctx.state.model = await findById.call(self, id, ctx);
        ctx.state.status = ctx.state.model ? 200 : 404;
        await next();
      }, this._permissions()]
    };
  }

  validAuthorization(): RegExp {
    return /^Bearer [a-zA-Z0-9]+$/;
  }

  validHeaders(): any {
    return Joi.object().keys({
      'Authorization': KoaRouter.Joi.string().regex(this.validAuthorization()).required(),
      'Content-Type': KoaRouter.Joi.string().valid(['application/vnd.api+json', 'application/json']).required()
    }).optionalKeys('Authorization', 'Content-Type').unknown();
  }

  /**
   * Gets teh Joi definition for the current model
   */
  def(): any {
    const Model = this.Model();
    let model = new Model();
    let schema = Object.assign({}, model.schema());
    schema['id'] = { type: 'string' };
    if (model.timestamps()) {
      schema['updated-at'] = { type: 'date' };
      schema['created-at'] = { type: 'date' };
    }
    let j = _.mapValues(schema, (path) => {
      let typeSplit: string[] = path.type.split('[');
      let type = typeSplit[0];
      let isArray: boolean = typeSplit.length > 1;
      let v;
      switch (type) {
        case 'boolean':
          v = Joi.boolean();
          break;

        case 'string':
          v = Joi.string();
          break;

        case 'number':
          v = Joi.number().allow(Infinity, -Infinity);
          break;

        case 'ObjectId':
          v = Joi.string();
          break;

        case 'date':
          v = Joi.date();
          break;

        case 'any':
        default:
          v = KoaRouter.Joi.any();
          break;
      }

      // Stick above inside a typed array
      if (isArray) {
        v = KoaRouter.Joi.array().items(v);
      }

      if (path.required) {
        v.required();
      } else {
        v.optional();
      }

      if (path.description) {
        v.description(path.description);
      }

      if (path.example) {
        v.example(path.example);
      }

      return v;
    });

    j = _.omitBy(j, function omit(val, key) {
      if (key === 'id') {
        return true;
      } else if (_.startsWith(key, '_')) {
        return true;
      } else {
        return false;
      }
    });

    j = _.mapKeys(j, function kebab(val, key) {
      return _.kebabCase(key);
    });

    let o = KoaRouter.Joi.object().keys(j);
    o.unknown();
    return o;
  }

  validBody(isArray = false) {
    let o: any;
    let attributes = this.def();
    let relationships = {};
    let data: any;

    // Iterate through route's relationships. Refs that aren't explicitly stated in the route can be assumed to be
    // private and not meant to be exposed to the API.
    for (let rel of this.relationships()) {
      let data = KoaRouter.Joi.object().keys({
        type: KoaRouter.Joi.string().valid(rel.type),
        id: KoaRouter.Joi.any()
      });

      // Convert to array for to many relationships
      if (rel.relationshipType === JSONAPIRouter.RelationshipType.TO_MANY) {
        data = KoaRouter.Joi.array().items(data);
        data.sparse();
      }

      relationships[_.kebabCase(rel.path)] = KoaRouter.Joi.object().keys({
        data: data,
        links: {
          self: Joi.string(),
          related: Joi.string()
        }
      }).unknown().optionalKeys('links', 'links.related');

      delete attributes[rel.path];
    }

    data = Joi.object().keys({
      type: KoaRouter.Joi.string().valid(this.type()),
      id: KoaRouter.Joi.any(),
      attributes: attributes,
      relationships: relationships
    }).unknown().optionalKeys('attributes', 'relationships', 'id');

    o = KoaRouter.Joi.object().keys({
      data: isArray ? Joi.array().items(data) : data
    });

    o.unknown();
    return o;
  }

  protected _create() {
    const self = this;
    const create = this.create;
    const onRequestError = this.onRequestError;
    return {
      method: 'post',
      path: `/`,
      meta: {
        friendlyName: `Create ${this.singularType()}`,
        description: `Creates a new ${this.singularType()}`
      },
      validate: {
        // type: 'json',
        continueOnError: true,
        // header: this.validHeaders(),
        // body: this.validBody()
      },
      handler: [this._permissions(), async function(ctx: Router.Context, next: Function) {
        if (!ctx.state.data) {
          ctx.throw(400);
        }
        try {
          ctx.state.model = await create.call(self, ctx.state.data, ctx);
          ctx.state.status = 201;
        } catch (e) {
          ctx.state.errors.push(onRequestError(e));
        } finally {
          await next();
        }
      }]
    };
  }

  protected _update() {
    const self = this;
    const update = this.update;
    const onRequestError = this.onRequestError;
    return {
      method: 'patch',
      path: `/:item_id`,
      meta: {
        friendlyName: `Update ${this.singularType()}`,
        description: `Update an existing ${this.singularType()}`
      },
      validate: {
        continueOnError: true,
      },
      handler: this._findById().handler.concat([async function(ctx: Router.Context, next: Function) {
        if (!ctx.state.data) {
          ctx.throw(400);
        }
        try {
          const model = await update.call(self, ctx.state.model, ctx.state.data, ctx);
          ctx.state.model = model;
          ctx.state.status = 200;
        } catch (e) {
          ctx.state.errors.push(onRequestError(e));
        } finally {
          await next();
        }
      }])
    };
  }


  protected _remove() {
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
        header: this.validHeaders(),
        params: {
          'item_id': KoaRouter.Joi.string().required().description(`The id of the ${this.singularType()} to delete`)
        }
      },
      handler: this._findById().handler.concat(async function(ctx: Router.Context, next: Function) {
        let isRemoved: Promise<boolean> = await remove.call(self, ctx.state.model, ctx);
        if (isRemoved) {
          ctx.state.status = 204;
        } else {
          ctx.throw(400);
        }
        await next();
      })
    };
  }

  protected _permissions() {
    const self = this;
    const permissions = this.permissions();
    return async function(ctx: Router.Context, next: Function) {
        let isAllowed: boolean = Boolean(!permissions);

        if (permissions && Array.isArray(ctx.state.model)) {
          isAllowed = (await Promise.all(ctx.state.model.map((model) => {
            return permissions.call(self, ctx, model);
          }))).every((val: boolean) => {
            return val === true;
          });
        } else if (permissions) {
          isAllowed = await permissions.call(self, ctx, ctx.state.model);
        }

        if (!isAllowed) {
          ctx.throw(401);
        } else {
          await next();
        }
    };
  }

  protected _getOperation(method: string): number {
    let operation: number;
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

  protected _init() {
    const deserialize = this.adapter().deserialize;
    const writablePaths: string[] = this.writablePaths();
    const getOperation = this._getOperation;
    return async function(ctx: Router.Context, next: Function) {
      ctx.state.errors = [];
      ctx.state.operation = getOperation(ctx.method);

      if (_.isNumber(ctx.state.operation) === false) {
        return ctx.throw(403);
      }

      if (_.isObject(ctx.request.body) && Object.keys(ctx.request.body).length) {
        let data: any = deserialize(ctx.request.body);
        if (writablePaths.length) {
          data = _.pickBy(data, writablePaths);
        }
        ctx.state.data = data;
      }
      await next();
    };
  }

  _responder() {
    const self = this;
    const generatePaginationLinks = this._generatePaginationLinks;    
    const getIncludes = this._getIncludes;
    const serialize = this.adapter().serialize;
    const copyright = this.copyright;
    return async function(ctx: Router.Context, next: Function) {
      let output: JSONAPIResponse = { jsonapi: { version: '1.0' }};
      output.meta = {
        copyright: copyright()
      };

      if (ctx.state.errors.length) {
        ctx.state.status = ctx.state.errors[0].code;
        Object.assign(output, { errors: ctx.state.errors });
      } else if (ctx.state.model) {
        if (Array.isArray(ctx.state.model)) {
          Object.assign(output, serialize(_.invokeMap(ctx.state.model, 'toJSON')));
        } else {
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
          let p: Promise<JSONModel>[];
          if (Array.isArray(output.data)) {
            p = output.data.map((item) => {
              return getIncludes.call(self, ctx.state.query.include, item);
            });
          } else {
            p = [getIncludes.call(self, ctx.state.query.include, output.data)];
          }

          await Promise.all(p).then((results) => {
            output.included = [];
            results.forEach((r) => {
              output.included = output.included.concat(r);
            });
            output.included = _.uniqBy(output.included, function(included) {
              return included.id.toString();
            });
          });
        }
      }

      ctx.status = ctx.state.status;
      ctx.body = output;
    };
  }

  copyright(): string {
    return `${moment().year()} SWARMNYC`;
  }

  static forbidden() {
    return {
      handler: async function (ctx: JSONAPIRouter.Context) {
        ctx.throw(403);
      }
    };
  }

  protected _canUseHandler(operation: number): boolean {
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
    router.use(qs());

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

/**
 * @namespace JSONAPIRouter
 */
export namespace JSONAPIRouter {
  export type Context = Router.Context
  /**
   * @typedef RelationshipType
   */
  export enum RelationshipType {
    BELONGS_TO,
    TO_MANY
  }

  export enum OPERATION {
    GET,
    CREATE,
    UPDATE,
    REMOVE
  }

  /**
   * @typedef RouterRelationship
   */
  export interface RouterRelationship {
    type: string
    relationshipType: RelationshipType
    path: string
    link?: string
    Model: typeof Model
  }
}




interface JSONAPIRelationshipData {
  type: string
  id: string
}

interface JSONAPIRelationship {
  links: JSONAPILinksObject,
  data: JSONAPIRelationshipData
}

interface JSONAPIRelationships {
  [K: string]: JSONAPIRelationship
}

interface JSONModel {
  [path: string]: any
}



interface JSONAPILinksObject {
  self?: string
  related?: string
  first?: string
  next?: string
  prev?: string
  last?: string
}

interface JSONAPIErrorSource {
  pointer: string
  parameter?: string
}

interface JSONAPIError {
  title?: string
  source?: JSONAPIErrorSource
  detail?: string
  code?: number
  meta?: JSONModel
}

interface JSONAPIVersion {
  version: string
}

interface JSONAPIResponse {
  data?: JSONModel | JSONModel[]
  included?: JSONModel[]
  links?: JSONAPILinksObject
  errors?: JSONAPIError[]
  meta?: JSONModel
  jsonapi: JSONAPIVersion
}
