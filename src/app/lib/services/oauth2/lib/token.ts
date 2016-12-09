import { Request, Response, Context } from 'koa';
import { errorHandler } from '.';
import { OAuth2User, OAuth2Client, OAuth2AccessToken, OAuth2Scope, OAuth2AuthorizationCode } from '.';
import * as models from '../models';
import * as grants from '../grants';

export function token(model: models.OAuth2BaseModel, grants?: string[]) {
  return function*(next: any) {
    this.state.oauth = {};
    const grantType: string = _getGrantType.call(this);
    const client = yield _getClient.call(this, model);

    if (grants.indexOf(grantType) === -1) {
      errorHandler.call(this, 'bad request');
    }

    this.state.oauth = {
      client: client
    };

    switch(grantType) {
      case 'password':
        yield _handlePasswordGrant.call(this, model);
        break;

      case 'authorization_code':
        yield _handleAuthorizationGrant.call(this, model);
        break;

      case 'client_credentials':
        yield _handleClientCredentialsGrant.call(this, model);
        break;
    }

    this.body = this.state.oauth.accessToken;
    this.status = 200;
    this.response.set('Cache-Control', 'no-store');
    this.response.set('Pragma', 'no-cache');
    yield next;
  }
}

function _getGrantType(): string {
  return this.request.body['grant_type'];
}

async function _getClient(model: models.OAuth2BaseModel) {
  const clientId = this.request['body']['client_id'];
  const clientSecret = this.request['body']['client_secret'];
  const client = await model.getClient(clientId, clientSecret);
  return client;
}

async function _handlePasswordGrant(model: models.OAuth2PasswordModel) {
  const grant = new grants.PasswordGrantHandler(model);
  return grant.handle(this);
}

async function _handleAuthorizationGrant(model: models.OAuth2CodeModel) {
  const grant = new grants.AuthorizationCodeGrantHandler(model);
  return grant.handle(this);
}

async function _handleClientCredentialsGrant(model: models.OAuth2ClientModel) {
  const grant = new grants.ClientCredentialsGrantHandler(model);
  return grant.handle(this);
}