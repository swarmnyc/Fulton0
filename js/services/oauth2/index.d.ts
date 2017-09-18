import { Service } from '../../service';
import { OAuth2BaseModel } from './models';
export * from './models';
export * from './lib';
export * from './grants';
import { JoiRouterDefinition } from '../../router';
export declare class BaseOAuth2Service extends Service {
    as(): string;
    tokenEndpoint(): string;
    model(): typeof OAuth2BaseModel;
    grants(): string[];
    getRouteDefinition(endpointName: string, tokenHandler: (model: OAuth2BaseModel, grants?: string[]) => void): JoiRouterDefinition;
    init(): Promise<any>;
}
