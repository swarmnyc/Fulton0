import { Request, Response, Context } from 'koa';
export declare class OAuth2RequestHandler {
    request: Request;
    response: Response;
    ctx: Context;
    scope: string;
    constructor(ctx: Context, request: Request, response: Response);
}
