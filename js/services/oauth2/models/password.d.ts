import { OAuth2BaseModel } from './base';
export declare class OAuth2PasswordModel extends OAuth2BaseModel {
    usernameField(): string;
    getUser(username: string, password: string): any;
}
export default OAuth2PasswordModel;
