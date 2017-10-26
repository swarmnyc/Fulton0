/// <reference types="koa" />
import * as models from '../models';
import { Context } from 'koa';
export declare function authenticate(model: models.OAuth2BaseModel, scope?: string[]): (ctx: Context) => Promise<void>;
