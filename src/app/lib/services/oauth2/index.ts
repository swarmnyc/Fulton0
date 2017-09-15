import { Service } from '../../service';
import * as oauth2lib from './lib';
import { OAuth2BaseModel } from './models';
import { JoiRouterDefinition } from '../../../lib/router';

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
    getRouteDefinition(endpointName: string, tokenHandler: (model: OAuth2BaseModel, grants?: string[]) => void): JoiRouterDefinition {
      return undefined;
    }

    async init() {
        const Model = this.model();
        let o = Object.assign({}, { grants: this.grants(), tokenEndpoint: this.tokenEndpoint(), model: Model, routerDefinition: this.getRouteDefinition() });
        return new oauth2lib.OAuth2Server(o, (server) => {
          return this.getRouteDefinition(server.tokenEndpoint(), server.token())
        });
    }
}


