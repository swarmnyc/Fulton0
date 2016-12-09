import * as models from '../models';
import * as oauth2lib from '.';
import * as moment from 'moment';

export function authenticate(model: models.OAuth2BaseModel, scope?: string[]) {
  return function*(next: any) {
    const bearerToken: string = _getTokenFromRequest.call(this);
    let token: oauth2lib.OAuth2AccessToken;
    let isValidToken: boolean;
    let isValidScope: boolean;

    if (!bearerToken) {
      oauth2lib.errorHandler.call(this, 'unauthorized');
    }

    token = yield model.getAccessToken(bearerToken);

    if (!token) {
      oauth2lib.errorHandler.call(this, 'unauthorized');
    }

    isValidToken = _validateAccessToken(token);
    if (isValidToken === false) {
      oauth2lib.errorHandler.call(this, 'unauthorized');
    }

    isValidScope = yield model.validateScope(token, scope);
    if (isValidScope === false) {
      oauth2lib.errorHandler.call(this, 'unauthorized');
    }

    this.set('X-Accepted-OAuth-Scopes', scope);
    this.set('X-OAuth-Scopes', token.scope);
    yield next;
  };
}

function _getTokenFromRequest(): string {
  let token: string;

  if (this.request.header['Authorization']) {
    token = this.request.header['Authorization'];
  } else if (this.request.body['access_token']) {
    token = this.request.body['access_token'];
  } else if (this.request.query['access_token']) {
    token = this.request.query['access_token'];
  }

  return token;
}

function _validateAccessToken(token: oauth2lib.OAuth2AccessToken) {
  return (moment(token.accessTokenExpiresOn).isAfter(moment()));
}