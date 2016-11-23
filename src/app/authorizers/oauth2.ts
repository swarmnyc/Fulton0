import * as oauthserver from 'koa-oauth-server';
import { Authorizer, Authenticator } from '../framework';

export class OAuth2Authorizer extends Authorizer {
    authenticator() {
        return new Authenticator();
    }
}

export default OAuth2Authorizer;