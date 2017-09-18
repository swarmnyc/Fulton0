import { OAuth2PasswordModel } from 'fulton';
import { OAuth2Client, OAuth2User, OAuth2Scope } from 'fulton';
import * as _ from 'lodash';
export declare class PasswordGrant extends OAuth2PasswordModel {
    usernameField(): string;
    getAccessToken(token: string): Promise<any>;
    getClient(id: string, secret: string): Promise<any>;
    getUser(username: string, password: string): Promise<_.Dictionary<any>>;
    saveToken(user: OAuth2User, client: OAuth2Client, scope?: OAuth2Scope): Promise<any>;
}
export default PasswordGrant;
