import { BaseGrantHandler } from '.';
import { Context } from 'koa';
import { OAuth2CodeModel } from '../models';
import { OAuth2AuthorizationCode, OAuth2AccessToken, errorHandler } from '../lib';

export class AuthorizationCodeGrantHandler extends BaseGrantHandler {
  model: OAuth2CodeModel

  constructor(model: OAuth2CodeModel) {
    super();
    this.model = model;
  }

  async handle(ctx: Context) {
    const code: string = ctx.request['body']['code'];
    
    if (!code) {
      return errorHandler.call(ctx, 'bad request');
    }
    let user;
    try {
        user = await this.model.getUserFromCode(code, ctx)
    } catch(error) {
        return errorHandler.call(ctx, 'bad request')
    }

    let token: OAuth2AccessToken;
    try {
        token = await this.model.getTokenForUser(user, ctx.state.oauth.client);
    } catch(error) {
        return errorHandler.call(ctx, 'bad request')
    }

    ctx.state.oauth.user = user;
    ctx.state.oauth.token = token;
    ctx.state.oauth.accessToken = {
        accessToken: token.access_token.toString(),
        accessTokenExpiresOn: token.accessTokenExpiresOn,
        clientId: token.client_id.toString(),
        userId: token.user_id.toString()
    }
    return true;
  }
}