import { Request, Response, Context } from 'koa';

export class OAuth2RequestHandler {
  request: Request
  response: Response
  ctx: Context
  scope: string

  constructor(ctx: Context, request: Request, response: Response) {
    this.ctx = ctx;
    this.request = request;
    this.response = response;
  }

  
}