import { Router } from '../framework';
import { JSONAPIAdapter } from '../adapters/jsonapi';
import { Model } from 'mongorito';
import { forEach as _forEach, startsWith as _startsWith } from 'lodash';
import * as bodyParser from 'koa-bodyparser';

interface IAdapterOptions {
  type: string;
  idPath?: string;
  relationships?: IRelationshipDefinition[] 
}

interface IRelationshipDefinition {
  type: string,
  path: string  
}

interface IQueryObject {
  filter?: any;
  sort?: ISortObject;
}

interface ISortObject {
  [K: string]: number
}

export abstract class JSONAPIRouter extends Router {
  queryIgnorePaths() {
    return ['include'];
  }

  Model() {
    return Model;
  }

  mountPath() {
    return '/api';
  }  

  type(): string {
    return '';
  }

  prefix() {
    return `${this.mountPath()}/${this.type()}`;
  }

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
      relationships: this.relationships()
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

  composeQuery(query: any) {
    function _filter(key: string) {
      const re = new RegExp(/filter\[([a-z0-9]+)\]/, 'i');
      let assoc: string;
      let matches: string[] = key.match(re);

      if (matches.length >= 2) {
        assoc = matches[1];
      }

      return assoc;
    }

    function _sort(value: string) {       
      const sortKeys = value.split(',');
      const sortObj: ISortObject = {};
      _forEach(sortKeys, (key) => {
        sortObj[key] = (key.charAt(0) === '-') ? -1 : 1;         
      });

      return sortObj;
    }
    
    const ignorePaths: string[] = this.queryIgnorePaths();
    const q: IQueryObject = {
      filter: {},
      sort: {}
    };
    _forEach(query, (value: any, key: string) => {
      let filter: string;      
      if(_startsWith(key, 'filter')) {
        filter = _filter(key);
        q.filter[filter] = value;
      } else if (key === 'sort') {
        q.sort = _sort(value);
      } else if (ignorePaths.indexOf(key) >= 0) {
        // skip
        return;
      } else {
        q.filter[key] = value;
      }
    });    
    return q;
  }

  find() {
    const Model = this.Model();
    const serialize = this.adapter().serialize;
    const composeQuery = this.composeQuery;    
    return function*(next: any) {
      const query = composeQuery(this.query);
      const model = yield Model.find();
      const output: any = [];       
      for (let item of model) {
        output.push(serialize(item.toJSON()));
      }
      yield next;
      this.body = { data: output };
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
        this.response.status = 500;        
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
  public routes = () => {
    const router = this.router;
    router.use(bodyParser());
    router.get('/', this.find());
    router.get('/:item_id', this.findById());
    router.patch('/:item_id', this.update());
    router.post('/', this.create());
    router.del('/:item_id', this.remove());
    return router.routes();
  }
}

export default JSONAPIRouter