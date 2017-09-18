import { Model } from 'fulton';
import { User } from './user';
import { OAuthClient } from './oauth-client';
import { OAuth2AccessToken } from '../lib/services/oauth2/lib';
export declare class OAuthToken extends Model implements OAuth2AccessToken {
    access_token: string;
    accessTokenExpiresOn: Date;
    client_id: string;
    user_id: string;
    collection(): string;
    schema(): {
        accessToken: {
            type: string;
        };
        accessTokenExpiresOn: {
            type: string;
            defaultValue: () => Date;
        };
        clientId: {
            type: string;
            ref: typeof OAuthClient;
            required: boolean;
        };
        userId: {
            type: string;
            ref: typeof User;
            required: boolean;
        };
    };
    configure(): void;
    generateAccessToken(next: any): Promise<void>;
    toJSON(): any;
}
export default OAuthToken;
