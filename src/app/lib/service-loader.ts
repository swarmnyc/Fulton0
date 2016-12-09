import ModuleLoader from './loader';
import App from './app'
import Service from './service';
import { isString as _isString } from 'lodash';
import * as services from '../services';
import * as _ from 'lodash';

type ServiceConstructor = typeof Service;

export class ServiceLoader {  

  async load(app: App) {
    await _.forEach(services, async (Svc) => {
      const config = app.get(`config.${Svc.name}`);
      const service = new Svc(config);
      let asName: string;
      await service.init();
      asName = _isString(service.as) ? service.as : Svc.name;
      app.set(`services.${asName}`, service.instance);
      app.services[asName] = service.instance;
      return service;
    });
  }
}

export default ServiceLoader
