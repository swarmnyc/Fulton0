import { Router, Model } from '../..';
import { JSONAPIAdapter } from '../../adapters/jsonapi';
import { forEach as _forEach, isNil as _isNil, flatten as _flatten, startsWith as _startsWith, isObject as _isObject, omit as _omit, invokeMap as _invokeMap, map as _map } from 'lodash';
import { queryHelper, countHelper } from '../../helpers/query';
import { Context } from 'koa';
import { ObjectID } from 'mongodb';
import * as assert from 'assert';

interface IAdapterOptions {
  type: string;
  idPath?: string;
  relationships?: IRelationshipDefinition[];
  namespace: string;
}

interface IRelationshipDefinition {
  router: typeof JSONAPIRouter
  path: string
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

interface IQueryObject {
  limit?: number
  skip?: number
  [K: string]: any
}

interface JSONAPILinksObject {
  [linkType: string]: string
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

interface JSONAPIResponse {
  data?: JSONModel | JSONModel[]
  included?: JSONModel[]
  links?: JSONAPILinksObject
  errors?: JSONAPIError[]
  meta?: JSONModel
}

export class JSONAPIRouter extends Router {
  Model(): typeof Model {
    return undefined;
  }

  queryIgnorePaths(): string[] {
    return ['include', 'page'];
  }

  namespace(): string {
    return 'api';
  }

  /**
   * Set the type, used by the json api serializer. Defaults to the collection name of the model.  
   * 
   * @returns {string}
   * 
   * @memberof JSONAPIRouter
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
   * 
   * @returns {string}
   * 
   * @memberof JSONAPIRouter
   */
  idPath(): string {
    return '_id';
  }

  relationships(): IRelationshipDefinition[] {
    return [];
  }

  adapterOptions(): IAdapterOptions {
    return {
      type: this.type(),
      idPath: this.idPath(),
      relationships: this.relationships(),
      namespace: this.namespace()
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

  private _generatePaginationLinks(input: JSONModel[], page: number, count: number, limit: number): JSONAPILinksObject {
    const rootLink: string = `${this.prefix()}?limit=${limit}&page=`;
    const lastPage: number = Math.ceil(count / limit);
    return {
      self: `${rootLink}${page}`,
      next: `${rootLink}${(page + 1)}`,
      prev: `${rootLink}${page === 1 ? null : (page - 1)}`,
      first: `${rootLink}1`,
      last: `${rootLink}${lastPage}`
    };
  }

  protected async _getIncludes(include: string, doc: JSONModel) {
    const relationships: IRelationshipDefinition[] = this.relationships();
    const relationshipPaths: string[] = _map(relationships, (rel) => {
      return rel.path;
    });
    let output: JSONModel[] = [];
    let matchedRelationships: IRelationshipDefinition[];
    let includes: string[] = include.split(',');
    matchedRelationships = relationships.filter((item: IRelationshipDefinition) => {
      return includes.indexOf(item.path) >= 0;
    });
    for (let rel of matchedRelationships) {
      let relRouter = new rel.router();
      let ids: string[] = [];
      let adapter = new JSONAPIAdapter({ type: relRouter.type(), namespace: relRouter.namespace(), idPath: relRouter.idPath() });      
      if (doc['relationships']) {
        if (doc['relationships'][rel.path]) {
          if (Array.isArray(doc['relationships'][rel.path]['data'])) {
            ids = _map(doc['relationships'][rel.path]['data'], (r) => {
              return r['id'];
            });
          } else {
            ids = [doc['relationships'][rel.path].data.id];
          }
        }
      }
      if (ids.length) {
        let relatedDocs = await relRouter.Model().find({ _id: {$in: ids }});
        if (relatedDocs.length) {
          let jsondocs = _invokeMap(relatedDocs, 'toJSON');
          output.push(adapter.serialize(jsondocs).data);
        }
      }
    }
    return _flatten(output);
  }

  async count(query: IQueryObject) {
    const Model = this.Model();
    const queryIgnorePaths = this.queryIgnorePaths();
    let count: number = await countHelper(Model, _omit(query, queryIgnorePaths));
    return count;
  }

  async find(query: IQueryObject): Promise<JSONModel[]> {
    const Model = this.Model();
    const queryIgnorePaths = this.queryIgnorePaths();
    let model: Model[] = await queryHelper(Model, _omit(query, queryIgnorePaths));
    let output = _invokeMap(model, 'toJSON');
    return output;
  }

  async findById(id: string) {
    const Model = this.Model();
    let model = await Model.findById(id);
    return model.toJSON();    
  }

  async create(data: JSONModel) {
    const Model = this.Model();
    const model = new Model(data);
    await model.save();
    return model.toJSON();
  }

  async update(id: string, payload: JSONModel) {
    const Model = this.Model();
    const model = await Model.findById(id);
    const deletedKeys: any = {};
        
    for (let key in payload) {
      if (key !== '_id' && key !== 'id') {
        model.set(key, payload[key]);
      }
    }

    for (let key in model.attributes) {
      if (!payload[key]) {
        delete model.attributes[key];
      }
    }

    await model.save();
    return model.toJSON();
  }

  async remove(itemId: string): Promise<boolean> {
    const Model = this.Model();
    const model = await Model.findById(itemId);
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
    return function* (next: any) {
      this.set('Content-Type', 'application/vnd.api+json');
      yield next;
    };
  }

  protected _find() {
    const self = this;
    const find = this.find;
    const count = this.count;
    return function*(next: any) {
      let query: IQueryObject = {};
      let skip: number;
      if (this.query) {
        if (this.query.limit && this.query.page) {
          skip = (parseInt(this.query.page, 10) * parseInt(this.query.limit, 10)) - parseInt(this.query.limit, 10);
        } else if (this.query.skip) {
          skip = parseInt(this.query.skip, 10);
        } else {
          skip = 0;
        }

        query = {         
          skip: skip
        };

        for (let key in this.query) {          
          if (key !== 'skip') {
            if (key === 'limit') {
              query.limit = parseInt(this.query[key], 10);
            } else {
              query[key] = this.query[key];
            }
          }
        }
      }

      this.state.model = yield find.call(self, query);
      this.state.count = yield count.call(self, query);
      this.state.status = 200;
      yield next;
    }
  }

  protected _findById() {
    const findById = this.findById;
    const self = this;
    return function*(next: any) {
      const id: string = this.params.item_id;      
      this.state.model = yield findById.call(self, id);
      this.state.status = this.state.model ? 200 : 404;
      yield next;
    };
  }

  protected _create() {
    const self = this;
    const create = this.create;
    const onRequestError = this.onRequestError;
    return function*(next: any) {
      if (!this.state.data) {
        this.throw(400);
      }
      try {
        this.state.model = yield create.call(self, this.state.data);
        this.state.status = 201;
      } catch(e) {
        this.state.errors.push(onRequestError(e));
      } finally {
        yield next;
      }

    };
  }

  protected _update() {    
    const update = this.update;
    const self = this;
    const onRequestError = this.onRequestError;
    return function*(next: any) {
      if (!this.state.data) {
        this.throw(400);
      }
      try {
        this.state.model = yield update.call(self, this.params.item_id, this.state.data);      
        this.state.status = 200;
      } catch(e) {
        this.state.errors.push(onRequestError(e));
      } finally {
        yield next;
      }
    };
  }


  protected _remove() {
    const self = this;
    const remove = this.remove;
    return function*(next: any) {
      let isRemoved: Promise<boolean> = yield remove.call(self, this.params.item_id);
      if (isRemoved) {
        this.state.status = 204;
      } else {
        this.throw(400);
      }
      yield next;
    };
  }

  protected _responder() {
    const self = this;
    const deserialize = this.adapter().deserialize;
    const generatePaginationLinks = this._generatePaginationLinks;    
    const getIncludes = this._getIncludes;
    const serialize = this.adapter().serialize;
    return function*(next: any) {
      let included: JSONModel[] = [];
      let output: JSONAPIResponse;      
      this.state.errors = [];
      if (_isObject(this.request.body) && Object.keys(this.request.body).length) {
        this.state.data = deserialize(this.request.body);
      }
      yield next;
      if (this.state.errors.length) {
        this.state.status = this.state.errors[0].code;
        output = { errors: this.state.errors };
      } else if (this.state.model) {
        output = serialize(this.state.model);
        if (this.query && this.query.limit && this.query.page && this.state.count) {
          output.links = generatePaginationLinks.call(self, this.state.model, parseInt(this.query.page, 10), this.state.count, parseInt(this.query.limit, 10));
        }
        if (this.request.query && this.request.query.include) {
          if (Array.isArray(output.data)) {
            for (let item of output.data) {              
              let d = yield getIncludes.call(self, this.query.include, item);
              included = included.concat(d);
            }
          } else {
            included = yield getIncludes.call(self, this.query.include, output.data);
          }
          if (included.length) {
            output.included = included;
          }
        }
      }
      
      this.status = this.state.status;
      this.body = output;
    };
  }

  configure(router) {
    if (!this.Model()) {
      throw new TypeError(`Return type of router.Model() is not an instance of Model`);
    }
    
    router.use(this.setHeaders());
    router.use(this._responder());
    router.get('/', this._find());
    router.get('/:item_id', this._findById());
    router.patch('/:item_id', this._update());
    router.post('/', this._create());
    router.del('/:item_id', this._remove());    
  }
}

export default JSONAPIRouter