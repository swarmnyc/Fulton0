import { BaseGrantHandler } from '.';
import { Context } from 'koa';
import { OAuth2CodeModel } from '../models';
export declare class AuthorizationCodeGrantHandler extends BaseGrantHandler {
    model: OAuth2CodeModel;
    constructor(model: OAuth2CodeModel);
    handle(ctx: Context): Promise<void>;
}
