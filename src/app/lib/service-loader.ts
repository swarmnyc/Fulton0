import ModuleLoader from './loader';
import App from './app'
import Service from './service';
import * as Services from '../services';
import * as _ from 'lodash';

type ServiceConstructor = typeof Service;

export class ServiceLoader {  

  async load(app: App) {
    let services: typeof Service[] = <typeof Service[]>_.values(Services);
    let loadedServices: Service[] = [];
    
    for (let Svc of services) {
      let instance = new Svc();
      let asName: string;
      await instance.load();
      asName = instance.as();
      app.set(`services.${asName}`, instance.get());
      app.services[asName] = instance.get();
    }

    return;
  }
}

export default ServiceLoader
