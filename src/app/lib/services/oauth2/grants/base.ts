import { Context } from 'koa';

export class BaseGrantHandler {
  protected _getScope(ctx: Context): string[] {
    return ctx.request['body']['scope'];
  }
  
  async handle(ctx: Context): Promise<void> {}
}