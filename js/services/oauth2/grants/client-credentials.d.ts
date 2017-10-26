/// <reference types="koa" />
import { BaseGrantHandler } from '.';
import { Context } from 'koa';
import { OAuth2ClientModel } from '../models';
export declare class ClientCredentialsGrantHandler extends BaseGrantHandler {
    model: OAuth2ClientModel;
    constructor(model: OAuth2ClientModel);
    handle(ctx: Context): Promise<void>;
}
