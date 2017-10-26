/// <reference types="koa" />
import { BaseContext as KoaBaseContext, Context as KoaContext } from 'koa';
export interface Context extends KoaContext {
    params?: any;
}
export interface BaseContext extends KoaBaseContext {
    services: any;
}
export default Context;
