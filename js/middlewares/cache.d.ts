/// <reference types="koa" />
import { Context } from 'koa';
export declare function cache(): (ctx: Context, next: Function) => Promise<void>;
