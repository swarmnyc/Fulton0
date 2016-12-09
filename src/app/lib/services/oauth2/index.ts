import { Service } from '../../service';
import * as oauth2lib from './lib';
import { OAuth2BaseModel } from './models';

export class OAuth2 extends Service {
    config: oauth2lib.OAuthConfig 
    as = 'oauth'
    tokenEndpoint: string

    model(): typeof OAuth2BaseModel {
        return undefined;
    }

    async init() {
        const Model = this.model();
        let o = Object.assign({}, this.config, { model: Model });
        delete o.modelName;
        delete o.enabled;
        this.instance = new oauth2lib.OAuth2Server(o);
        return this;
    }
}