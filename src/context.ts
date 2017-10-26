import { Context as KoaContext } from 'koa';

export interface Context extends KoaContext {
    params?: any
}

export default Context;