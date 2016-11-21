import { Router } from '../framework';
import { JSONAPIAdapter } from '../adapters/jsonapi';
import { Model } from 'mongorito';
import { APIRoute } from './api-route';

class DefaultModel extends Model {
  collection() {
    return 'default';
  }
}

export abstract class JSONAPIRouter extends Router {
  Model() {
    return Model;
  }
  adapter() {
    return new JSONAPIAdapter();
  }

  find() {
    const Model = this.Model();
    const serialize = this.adapter().serialize;
    return function*(next: any) {
      const model = yield Model.find();
      const output: any[] = [];
      for (let item of model) {
        output.push(serialize(item.toJSON()));
      }
      yield next;
      this.body = output;
    }
  }
  findById() {
    const Model = this.Model();
    const serialize = this.adapter().serialize;
    return function*(next: any) {
      const model = yield Model.findById(this.params.item_id);
      const output = serialize(model.toJSON());      
      this.body = output;
    }
  }
  create() {
    const Model = this.Model();
    const deserialize = this.adapter().deserialize;
    const serialize = this.adapter().serialize;
    return function*(next: any) {      
      const o = deserialize(this.request.body);
      const model: Model = new Model(o);
      yield model.save();
      this.status = 201;
      this.body = serialize(model);
    }
  }
  update() {
    const Model = this.Model();
    const deserialize = this.adapter().deserialize;
    const serialize = this.adapter().serialize;
    return function*(next: any) {
      const o = deserialize(this.request.body);
      const model = yield Model.findById(this.params.item_id);
      yield model.update(o);
      this.body = serialize(model);
    }
  }
  remove() {
    const Model = this.Model();
    return function*(next: any) {
      const model = yield Model.findById(this.params.item_id);
      yield model.remove();
      this.response.status = 204;
    }
  }
  routes() {
    const router = this.router;
    router.get('/', this.find);
    router.get('/:item_id', this.findById);
    router.patch('/:item_id', this.update);
    router.post('/', this.create);
    router.del('/:item_id', this.remove);
    return router.routes();
  }
}

export default JSONAPIRouter