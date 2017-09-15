import { BaseOAuth2Service } from '../lib/services/oauth2';
import * as oauth2lib from '../lib/services/oauth2/lib';
import * as KoaRouter from 'koa-joi-router';
const { Joi } = KoaRouter;
import { PasswordGrant } from '../oauth/password';
import { OAuth2BaseModel } from '../lib/services/oauth2/models';

export class OAuth2 extends BaseOAuth2Service {


  model(): typeof OAuth2BaseModel {
    return PasswordGrant;
  }
  getRouteDefinition(endpointName: string, tokenHandler: (model: OAuth2BaseModel, grants?: string[]) => void) {
    return {
      method: 'post',
      path: `/${endpointName}`,
      meta: {
        friendlyName: 'Get API Token',
        description: 'Issues new API token to user'
      },
      validate: {
        type: 'json',
        continueOnError: true,            
        body: {
          grant_type: Joi.string().required().label('grant_type').description("the type of oauth2 authentication you are requestion").example("password"),
          email: Joi.string().required().label("User's Email").description("The email address of the user logging in."),
          password: Joi.string().required().label("User's Password").description("The password of the user logging in."),
          scope: Joi.string().required().label("Authentication Scope").description("Currently unused, but required, ex: `email`"),
          client_id: Joi.string().required().label("The Id of the oauth client").description("The Id of the oauth client"),
          client_secret: Joi.string().required().label("secret of the oauth client").description("secret of the oauth client")
        },
        //TODO: figure out output validation, so that we can show the output in the docs
        header: {
        }
      },
      handler: tokenHandler
  }
  }
}