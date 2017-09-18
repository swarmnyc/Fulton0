import { OAuth2BaseModel } from './base';
import { OAuth2User } from '../lib';
export declare class OAuth2PasswordModel extends OAuth2BaseModel {
    usernameField(): string;
    getUser(username: string, password: string): Promise<OAuth2User>;
}
export default OAuth2PasswordModel;
