import * as _ from 'lodash';
import * as winston from 'winston';
import { User } from '../models';
import { Context } from 'koa';
import { OAuth2Server } from 'fulton';

export function authTokenMiddleware(openMethods: String[] = []) {
    return async function(ctx: Context, next: Function) {
        //we want every get request open, but an account is required for everything else
        //if you have an account you can modify everything
        for (let method of openMethods) {
            if (ctx.method == method) {
                await next();
                return;
            }
        }
        const oauth = _.get(ctx.app, 'context.services.oauth');
        const authenticate = oauth.authenticate(); // get authenticate middleware from oauth service
        await authenticate(ctx); // use call to preserve context
        
        if (_.get(ctx.state, 'oauth.accessToken.userId') && !!(ctx.state.oauth.accessToken.userId)) {
            ctx.state.oauth.user = await User.findById(ctx.state.oauth.accessToken.userId);
        }

        await next();
    };
}