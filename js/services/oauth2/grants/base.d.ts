import { Context } from 'koa';
export declare class BaseGrantHandler {
    protected _getScope(ctx: Context): string[];
    handle(ctx: Context): Promise<void>;
}
