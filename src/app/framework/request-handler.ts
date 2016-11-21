import { Middleware } from 'koa-router';

export type RequestHandler<T> = (context: T, next: () => any) => any;
export default RequestHandler
