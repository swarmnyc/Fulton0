import ModuleLoader from './loader';
import App from './app'
import Service from './service';
import { isString as _isString } from 'lodash';

type ServiceConstructor = typeof Service;

export class ServiceLoader {  

  async load(app: App, Svc: ServiceConstructor) {
    const config = app.get(`config.${Svc.name}`);
    const service = new Svc(config);
    let asName: string;
    await service.init();
    asName = _isString(service.as) ? service.as : Service.name;
    app.set(`services.${asName}`, service.instance);
    app.services[asName] = service.instance;
    return service;
  }
}

export default ServiceLoader
