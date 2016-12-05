import { Router, Model } from '../lib';
import { JSONAPIAdapter } from '../adapters/jsonapi';
import { forEach as _forEach, startsWith as _startsWith, omit as _omit } from 'lodash';
import { queryHelper } from '../helpers/query';
import { PasswordGrant } from '../oauth';
import * as oauthserver from 'koa-oauth-server';

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

  authorizer() {
    const oauth = oauthserver({
      model: new PasswordGrant(),
      grants: ['password'],
      debug: process.env['NODE_ENV'] === 'development'
    });

    return oauth;
  }

  find() {
    const Model = this.Model();
    const serialize = this.adapter().serialize;
    const queryIgnorePaths = this.queryIgnorePaths();
    return function*(next: any) {
      const model = yield queryHelper(Model, _omit(this.query, queryIgnorePaths));
      const output: any = [];       
      for (let item of model) {
        output.push(serialize(item.toJSON()));
      }
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
        this.throw('There was an error processing your request', 500);
      }

      if (!model) {
        this.throw(404);
      }
            
      const output = { data: serialize(model.toJSON()) };      
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
  
  update() {
    const Model = this.Model();
    const deserialize = this.adapter().deserialize;
    const serialize = this.adapter().serialize;
    return function*(next: any) {
      const o = deserialize(this.request.body);
      const model = yield Model.findById(this.params.item_id);
      yield model.update(o);
      try {
        this.body = serialize(model);
      } catch(e) {
        this.throw(500);       
      }
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

    const authorizer = this.authorizer();

    if (!!authorizer) {
      router.post('/token', authorizer.grant());
      router.use(authorizer.authorise());
    }
    
    router.use(this.setHeaders());
    router.get('/', this.find());
    router.get('/:item_id', this.findById());
    router.patch('/:item_id', this.update());
    router.post('/', this.create());
    router.del('/:item_id', this.remove());
  }
}

export default JSONAPIRouter