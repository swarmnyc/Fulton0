import { Context } from 'koa';

export function errorHandler(ctx: Context, mesg: string) {
    const code = _getCode(mesg);
    // TODO: Review this for later
    // CORS option should get from app, set to * for now.
    const properties = {headers:{'access-control-allow-origin': '*'}};
    const body = {errors: [{status: code, title: mesg}]};
    return ctx.throw(code, JSON.stringify(body), properties);
}

function _getCode(mesg: string) {
    let code: number;

    switch (mesg) {
      case 'bad request':
        code = 400;
        break;

      case 'unauthorized':
        code = 401;
        break;

      case 'forbidden':
        code = 403;
        break;
        
      default:
        code = 500;
        break;
    }

    return code;
  }