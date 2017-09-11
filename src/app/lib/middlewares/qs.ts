import * as qs from 'qs';
import { Context } from 'koa';

export function queryStringMiddleware() {
  return async function(ctx: Context, next: Function) {
    let parsed = qs.parse(ctx.request.querystring);
    ctx.app.context['services'].log.debug(parsed);
    // koa 2.0 does not allow overwriting ctx.request.query
    // so we have to assign it to the state object
    ctx.state.query = parsed;
    return next();
  };
}

export default queryStringMiddleware;