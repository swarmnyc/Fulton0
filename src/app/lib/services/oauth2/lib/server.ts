import { token } from './token';
import { authenticate } from './authenticate';
import { OAuth2BaseModel } from '../models';

export interface OAuthConfig {
    enabled: boolean
    modelName: string
    grants?: string[],
    tokenEndpoint?: string 
}

export interface OAuthOptions {
    model: any
    grants?: string[]
    tokenEndpoint?: string,
    tokenLifetime?: number // days
}

export class OAuth2Server {
    model: typeof OAuth2BaseModel
    tokenEndpoint: string
    grants: string[]

    token() {
      const model = new this.model();
      return token(model, this.grants);
    }

    authenticate(scope?: string[]) {
      const model = new this.model();
      return authenticate(model, scope);
    }

    authorize() {

    }

    constructor(opts: OAuthOptions) {
        this.model = opts.model;
        this.tokenEndpoint = opts.tokenEndpoint;
        this.grants = opts.grants;
    }
}