import { App } from './app'
import Service from './service';
import * as _ from 'lodash';
import * as Koa from 'koa';
import * as KoaRouter from 'koa-joi-router';

type ServiceConstructor = typeof Service;

export class ServiceLoader {

  async load(app: App) {
    let services: typeof Service[] = app.services()
    let oauthServices: typeof Service[] = app.oauthModels()
    var handleService = async function(Svc) {
      let instance = new Svc();
      let asName: string;
      await instance.load();
      asName = instance.as();
      app.set(`services.${asName}`, instance.get());
      app._services[asName] = instance.get();
      return instance
    }
    for (let Svc of services) {
      await handleService(Svc)
    }
    for (let Svc of oauthServices) {
      let service = await handleService(Svc)
      let instance = service.get()
      let oauth = new KoaRouter();
      oauth.route(instance.getRoute());
      app._groups.push({ groupName: service.as() + " Token", description: "OAuth Authentication", prefix: "", routes: oauth.routes });
      app.use(oauth.middleware());
    }

    return;
  }
}

export default ServiceLoader
