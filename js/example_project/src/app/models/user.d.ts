import { Model } from 'fulton';
export declare class User extends Model {
    collection(): string;
    configure(): void;
    saltPasswordOnSave(next: any): Promise<void>;
    schema(): {
        email: {
            type: any;
            required: boolean;
            unique: boolean;
        };
        password: {
            type: any;
            required: boolean;
        };
        secret: {
            type: any;
        };
    };
}
export default User;
