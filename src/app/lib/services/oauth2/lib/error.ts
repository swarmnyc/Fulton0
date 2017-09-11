import { Context } from 'koa';

export function errorHandler(ctx: Context, mesg: string) {
  const code = _getCode(mesg);
  ctx.response.set('content-type', 'text/plain');
  // TODO: Review this for later
  return ctx.throw(code, JSON.stringify({ error: mesg }));
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