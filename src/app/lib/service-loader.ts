import ModuleLoader from './loader';
import App from './app'
import { isString as _isString } from 'lodash';

export class ServiceLoader extends ModuleLoader {  
  path = 'services'
  
  async action(app: App, filePath: string) {
    const Service = require(filePath);
    const config = app.get(`config.${Service.name}`);    
    const service = new Service(config);
    let asName: string;    
    await service.init();
    asName = _isString(service.as) ? service.as : Service.name;
    app.set(`services.${asName}`, service.instance);    
    return service;
  }
}

export default ServiceLoader
