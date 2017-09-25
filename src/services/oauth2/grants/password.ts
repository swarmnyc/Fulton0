import { Request, Response, Context } from 'koa';
import { errorHandler } from '../lib';
import { OAuth2User, OAuth2Client, OAuth2AccessToken, OAuth2Scope, OAuth2AuthorizationCode } from '../lib';
import * as models from '../models';
import { BaseGrantHandler } from './base';

export class PasswordGrantHandler extends BaseGrantHandler {
  model: models.OAuth2PasswordModel;

  constructor(model: models.OAuth2PasswordModel) {
    super();
    this.model = model;
  }

  async handle(ctx: Context) {
    const usernameField = this.model.usernameField();
    const username = ctx.request.body[usernameField];
    const password = ctx.request.body.password;
    const scope: OAuth2Scope = this._getScope(ctx);
    let user: OAuth2User;
    let token: OAuth2AccessToken;  

    ctx.state.oauth.scope = scope;

    if (!username || !password) {
      errorHandler(ctx, 'bad request');
      return;
    }

    user = await this.model.getUser(username, password, ctx);
    
    if (!user) {
      errorHandler(ctx, 'unauthorized');
      return;
    }

    token = await this.model.saveToken(user, ctx.state.oauth.client, scope);
    ctx.state.oauth.accessToken = token;
    ctx.state.oauth.user = user;

    return;
  }
}