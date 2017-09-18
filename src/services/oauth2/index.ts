import { Service } from '../../service';
import * as oauth2lib from './lib';
import { OAuth2BaseModel } from './models';
export * from './models'
export * from './lib'
export * from './grants'
import { JoiRouterDefinition } from '../../router'
import { OAuth2Server } from './lib/server'

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

    async init(): Promise<any> {
        const Model = this.model();
        let o = Object.assign({}, { grants: this.grants(), tokenEndpoint: this.tokenEndpoint(), model: Model });
        return new oauth2lib.OAuth2Server(o, (server) => {
          return this.getRouteDefinition(server.tokenEndpoint(), server.token())
        });
    }
}