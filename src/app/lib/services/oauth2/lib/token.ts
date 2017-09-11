import { Request, Response, Context } from 'koa';
import { errorHandler } from '.';
import { OAuth2User, OAuth2Client, OAuth2AccessToken, OAuth2Scope, OAuth2AuthorizationCode } from '.';
import * as models from '../models';
import * as grants from '../grants';

export function token(model: models.OAuth2BaseModel, grants?: string[]) {
  return async function(ctx: Context, next: Function) {
    ctx.state.oauth = {};
    const grantType: string = _getGrantType(ctx);
    const client = await _getClient(ctx, model);

    if (grants.indexOf(grantType) === -1) {
      return errorHandler(ctx, 'bad request');
    }

    ctx.state.oauth.client = client;

    switch(grantType) {
      case 'password':
        await _handlePasswordGrant(ctx, model as models.OAuth2PasswordModel);
        break;

      case 'authorization_code':
        await _handleAuthorizationGrant(ctx, model as models.OAuth2CodeModel);
        break;

      case 'client_credentials':
        await _handleClientCredentialsGrant(ctx, model as models.OAuth2ClientModel);
        break;
    }

    ctx.body = ctx.state.oauth.accessToken;
    ctx.status = 200;
    ctx.response.set('Cache-Control', 'no-store');
    ctx.response.set('Pragma', 'no-cache');
    await next();
  }
}

function _getGrantType(ctx: Context): string {
  return ctx.request.body['grant_type'];
}

function _getClientFromHeader(authHeader: string): ClientManifest {
  let buf: Buffer;
  let encoded: string;
  let decoded: string;
  let arr: string[];
  let manifest: ClientManifest = {
    clientId: null,
    clientSecret: null
  };
  let splitHeader: string[];

  if (!authHeader) {
    return manifest;
  }

  splitHeader = authHeader.split(' ');

  // Indecipherable auth header
  if (splitHeader.length <= 1) {
    return manifest;
  }

  encoded = splitHeader[1];
  buf = new Buffer(splitHeader[1], 'base64');
  decoded = buf.toString('utf8');
  arr = decoded.split(':');
  manifest.clientId = arr[0];
  manifest.clientSecret = arr.length > 1 ? arr[1] : null;

  return manifest;
}

async function _getClient(ctx: Context, model: models.OAuth2BaseModel) {
  let clientId = ctx.request.body.client_id;
  let clientSecret = ctx.request.body.client_secret;
  let client: OAuth2Client;
  let manifest: ClientManifest;

  // If no clientId in body, check for base64 encoded clientId/secret in auth header
  if (!clientId) {
    manifest = _getClientFromHeader(ctx.headers.authorization);
    clientId = manifest.clientId;
    clientSecret = manifest.clientSecret;
  }

  // Missing client ID, byebye
  if (!clientId) {
    return ctx.throw(401);
  }

  // Fetch client from oauth2 model
  client = await model.getClient(clientId, clientSecret);

  // No client, see ya later
  if (!client) {
    return ctx.throw(401);
  }

  // Return client to handler
  return client;
}

async function _handlePasswordGrant(ctx: Context, model: models.OAuth2PasswordModel) {
  const grant = new grants.PasswordGrantHandler(model);
  return grant.handle(ctx);
}

async function _handleAuthorizationGrant(ctx: Context, model: models.OAuth2CodeModel) {
  const grant = new grants.AuthorizationCodeGrantHandler(model);
  return grant.handle(ctx);
}

async function _handleClientCredentialsGrant(ctx: Context, model: models.OAuth2ClientModel) {
  const grant = new grants.ClientCredentialsGrantHandler(model);
  return grant.handle(ctx);
}

interface ClientManifest {
  clientId: string
  clientSecret: string
}