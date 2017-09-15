import App from './app'
import Service from './service';
import * as _ from 'lodash';

type ServiceConstructor = typeof Service;

export class ServiceLoader {

  async load(app: App) {
    let services: typeof Service[] = app.services()
    let loadedServices: Service[] = [];
    
    for (let Svc of services) {
      let instance = new Svc();
      let asName: string;
      await instance.load();
      asName = instance.as();
      app.set(`services.${asName}`, instance.get());
      app._services[asName] = instance.get();
    }

    return;
  }
}

export default ServiceLoader
