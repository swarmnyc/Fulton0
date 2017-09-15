import { Context } from 'koa';

export type RequestHandler<T> = (context?: T, next?: any) => any;
export default RequestHandler
