import { Router, Model } from '../..';
import { JSONAPIAdapter } from '../../adapters/jsonapi';
import { forEach as _forEach, startsWith as _startsWith, omit as _omit, invokeMap as _invokeMap } from 'lodash';
import { queryHelper } from '../../helpers/query';
import { Context } from 'koa';

interface IAdapterOptions {
  type: string;
  idPath?: string;
  relationships?: IRelationshipDefinition[];
  namespace: string;
}

interface IRelationshipDefinition {
  type: string,
  path: string
}

interface IUpdatePayload {
  [K: string]: any
}

export abstract class JSONAPIRouter extends Router {
  Model(): typeof Model {
    return undefined;
  }

  queryIgnorePaths(): string[] {
    return ['include'];
  }

  namespace(): string {
    return 'api';
  }

  /**
   * Auth middleware to use on request
   * 
   * @returns {RequestHandler}
   * 
   * @memberOf JSONAPIRouter
   */
  auth() {
    return function*(next: any) {
      yield next;
    }
  }

  /**
   * Set the type, used by the json api serializer. Defaults to the collection name of the model.  
   * 
   * @returns {string}
   * 
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
   * 
   * @returns {string}
   * 
   * @memberOf JSONAPIRouter
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
   * @memberOf JSONAPIRouter
   */
  adapter() {
    return new JSONAPIAdapter(this.adapterOptions());
  }

  find() {
    const Model = this.Model();
    const serialize = this.adapter().serialize;
    const queryIgnorePaths = this.queryIgnorePaths();
    return function*(next: any) {
      let model = yield queryHelper(Model, _omit(this.query, queryIgnorePaths));
      let output: any;
      model = _invokeMap(model, 'toJSON');
      output = serialize(model);  
      yield next;
      this.body = output;
    };
  }

  findById() {
    const Model = this.Model();
    const serialize = this.adapter().serialize;
    return function*(next: any) {
      let model: Model;
      try {
        model = yield Model.findById(this.params.item_id);
      } catch(e) {
        this.throw('Not found', 404);
      }

      if (!model) {
        this.throw(404);
      }
            
      const output = serialize(model.toJSON());      
      this.body = output;
    };
  }

  create() {
    const Model = this.Model();
    const deserialize = this.adapter().deserialize;
    const serialize = this.adapter().serialize;
    return function*(next: any) {
      let o = {};
      try {      
        o = deserialize(this.request.body);
      } catch(e) {
        this.throw(`Input rejected: malformed ${e}`, 400);
      }

      const model: Model = new Model(o);

      try {
        yield model.save();
      } catch(e) {
        this.throw(`There was an error saving your model ${e}`, 500);
      }
      
      this.status = 201;
      this.body = serialize(model.toJSON());
    };
  }

  protected async _update(id: string, ctx: Context, payload: IUpdatePayload) {
    const Model = this.Model();
    let model = await Model.findById(id);

    if (!model) {
      return undefined;
    }

    for (let key in payload) {
      if (key !== '_id' && key !== 'id') {
        model.set(key, payload[key]);
      }
    }

    try {
      model = await model.save();
    } catch(e) {
      // TODO error response handler
      ctx.throw(500, `There was an error saving your model ${e}`);
    }
    
    return model;
  }

  update() {    
    const deserialize = this.adapter().deserialize;
    const serialize = this.adapter().serialize;
    const _update = this._update;
    const self = this;
    return function*(next: any) {
      const update = deserialize(this.request.body);
      const model = yield _update.call(self, this.params.item_id, this, update);

      if (!model) {
        this.throw(404);
      }
      
      this.status = 200;      
      this.body = serialize(model.toJSON());
    };
  }

  remove() {
    const Model = this.Model();
    return function*(next: any) {
      const model = yield Model.findById(this.params.item_id);
      yield model.remove();
      this.response.status = 204;
    };
  }

  setHeaders() {
    return function* (next: any) {
      this.set('Content-Type', 'application/vnd.api+json');
      yield next;
    };
  }

  configure(router) {
    if (!this.Model()) {
      throw new TypeError(`Return type of router.Model() is not an instance of Model`);
    }
    
    router.use(this.setHeaders());
    router.use(this.auth());
    router.get('/', this.find());
    router.get('/:item_id', this.findById());
    router.patch('/:item_id', this.update());
    router.post('/', this.create());
    router.del('/:item_id', this.remove());
  }
}

export default JSONAPIRouter