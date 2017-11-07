import * as models from '../models';
import * as oauth2lib from '.';
import * as moment from 'moment';
import { Context } from 'koa';

export function authenticate(model: models.OAuth2BaseModel, scope?: string[]) {
  return async function(ctx: Context): Promise<void> {
    ctx.state.oauth = {};
    const bearerToken: string = _getTokenFromRequest(ctx);
    let token: oauth2lib.OAuth2AccessToken;
    let isValidToken: boolean;
    let isValidScope: boolean;

    if (!bearerToken) {
      return model.errorHandler(ctx, 'unauthorized');
    }

    token = await model.getAccessToken(bearerToken);

    if (!token) {
      return model.errorHandler(ctx, 'unauthorized');
    }

    isValidToken = _validateAccessToken(token);
    if (isValidToken === false) {
      return model.errorHandler(ctx, 'unauthorized');
    }

    if (scope) {
      isValidScope = await model.validateScope(token, scope);
      if (isValidScope === false) {
        return model.errorHandler(ctx, 'unauthorized');
      }
      ctx.set('X-Accepted-OAuth-Scopes', scope);
      ctx.set('X-OAuth-Scopes', token.scope);
    }
    
    ctx.state.oauth.accessToken = token;

    return;
  };
}

function _getTokenFromRequest(ctx: Context): string {
  let token: string;
  let arr: string[];

  if (ctx.request.headers['authorization']) {
    arr = (ctx.request.headers['authorization'] as string).split(' ');
    if (arr.length > 1) {
      token = arr[1];
    } else {
      ctx.throw(401);
      return ""
    }
  } else if (ctx.request.body['access_token']) {
    token = ctx.request.body['access_token'];
  } else if (ctx.request.query['access_token']) {
    token = ctx.request.query['access_token'];
  }

  return token;
}

function _validateAccessToken(token: oauth2lib.OAuth2AccessToken) {
  return (moment(token.accessTokenExpiresOn).isAfter(moment()));
}