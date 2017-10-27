/// <reference types="koa" />
import { Context } from 'koa';
import * as models from '../models';
import { BaseGrantHandler } from './base';
export declare class PasswordGrantHandler extends BaseGrantHandler {
    model: models.OAuth2PasswordModel;
    constructor(model: models.OAuth2PasswordModel);
    handle(ctx: Context): Promise<void>;
}
