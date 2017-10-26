import { OAuth2BaseModel } from '../models';
import { JoiRouterDefinition } from '../../../router';
export interface OAuthConfig {
    enabled: boolean;
    modelName: string;
    grants?: string[];
    tokenEndpoint?: string;
}
export interface OAuthOptions {
    model: any;
    grants?: string[];
    tokenEndpoint?: string;
    tokenLifetime?: number;
}
export declare class OAuth2Server {
    protected _tokenEndpoint: string;
    grants: string[];
    model: typeof OAuth2BaseModel;
    routeDefinition: JoiRouterDefinition;
    tokenEndpoint(): string;
    token(): Function;
    authenticate(scope?: string[]): Function;
    authorize(): void;
    constructor(opts: OAuthOptions, routeDefinitionFactory: (OAuth2Server) => JoiRouterDefinition);
    getRoute(): JoiRouterDefinition;
}
