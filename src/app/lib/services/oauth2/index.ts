import { Service } from '../../service';
import * as oauth2lib from './lib';
import { OAuth2BaseModel } from './models';

export class BaseOAuth2Service extends Service {
    as() {
      return 'oauth';
    }
    tokenEndpoint(): string {
      return 'token';
    }

    model(): typeof OAuth2BaseModel {
        return undefined;
    }

    grants(): string[] {
      return ['password'];
    }

    async init() {
        const Model = this.model();
        let o = Object.assign({}, { grants: this.grants(), tokenEndpoint: this.tokenEndpoint(), model: Model });
        return new oauth2lib.OAuth2Server(o);
    }
}