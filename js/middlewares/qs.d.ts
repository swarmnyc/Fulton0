/// <reference types="koa" />
import { Context } from 'koa';
export declare function queryStringMiddleware(): (ctx: Context, next: Function) => Promise<any>;
export default queryStringMiddleware;
