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

  protected _validateRequestUri(ctx: Context, code: OAuth2AuthorizationCode): boolean {
    if (!code.redirectUri) {
      return true;
    }

    const redirectUri: string = ctx.request['body']['redirect_uri'] || ctx.request.query['redirect_uri'];
    return (redirectUri === code.redirectUri);
  }

  async handle(ctx: Context) {
    const code: string = ctx.request['body']['code'];
    let auth: OAuth2AuthorizationCode;
    let isValidRequestUri: boolean;
    let token: OAuth2AccessToken;

    if (!code) {
      return errorHandler.call(ctx, 'bad request');
    }

    auth = await this.model.getAuthorizationCode(code);
    isValidRequestUri = this._validateRequestUri(ctx, auth);

    if (isValidRequestUri === false) {
      return errorHandler.call(ctx, 'bad request');
    }

    await this.model.revokeAuthorizationCode(auth);
    token = await this.model.saveToken(auth.user, ctx.state.oauth.client, auth.scope, auth.authorizationCode);
    ctx.state.oauth.user = auth.user;
    ctx.state.oauth.scope = auth.scope;
    ctx.state.oauth.auth = auth;
    ctx.state.oauth.token = token;

    return true;
  }
}