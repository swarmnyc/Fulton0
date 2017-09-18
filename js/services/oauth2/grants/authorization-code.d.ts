import { BaseGrantHandler } from '.';
import { Context } from 'koa';
import { OAuth2CodeModel } from '../models';
import { OAuth2AuthorizationCode } from '../lib';
export declare class AuthorizationCodeGrantHandler extends BaseGrantHandler {
    model: OAuth2CodeModel;
    constructor(model: OAuth2CodeModel);
    protected _validateRequestUri(ctx: Context, code: OAuth2AuthorizationCode): boolean;
    handle(ctx: Context): Promise<any>;
}
