import { OAuth2BaseModel } from '.';
import { OAuth2User } from '../lib';
export declare class OAuth2ClientModel extends OAuth2BaseModel {
    getUserFromClient(id: string, secret: string): Promise<OAuth2User>;
}
