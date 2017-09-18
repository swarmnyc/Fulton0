import { Model } from 'fulton';
import { User } from './user';
export declare class OAuthClient extends Model {
    collection(): string;
    schema(): {
        name: {
            type: string;
            index: boolean;
        };
        secret: {
            type: string;
            index: boolean;
        };
        userId: {
            type: string;
            ref: typeof User;
        };
    };
    configure(): void;
    generateClientSecret(next: any): Promise<void>;
    toJSON(): any;
}
export default OAuthClient;
