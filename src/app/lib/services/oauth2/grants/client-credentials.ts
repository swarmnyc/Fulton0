import { BaseGrantHandler } from '.';
import { Context } from 'koa';
import { OAuth2ClientModel } from '../models';
import { OAuth2User, OAuth2AccessToken, OAuth2Scope } from '../lib';

export class ClientCredentialsGrantHandler extends BaseGrantHandler {
  model: OAuth2ClientModel

  constructor(model: OAuth2ClientModel) {
    super();
    this.model = model;
  }

  async handle(ctx: Context) {
    const scope: OAuth2Scope = this._getScope(ctx);
    const user: OAuth2User = await this.model.getUserFromClient(ctx.state.oauth.client.id, ctx.state.oauth.client.secret);
    const token = await this.model.saveToken(user, ctx.state.oauth.client, scope);

    ctx.state.oauth.user = user;
    ctx.state.oauth.token = token;
    ctx.state.oauth.scope = scope;
    return;
  }
}