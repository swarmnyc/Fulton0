import { OAuth2AccessToken, OAuth2Client, OAuth2User, OAuth2Scope } from '../lib';
import { Context } from 'koa';

export class OAuth2BaseModel {
	errorHandler(ctx: Context, mesg: string, err?: Error) {
		const code = this._getCode(mesg);
		// TODO: Review this for later
		// CORS option should get from app, set to * for now.
		const properties = {headers:{'access-control-allow-origin': '*'}};
		const body = {errors: [{status: code, title: mesg}]};
		return ctx.throw(code, JSON.stringify(body), properties);
	}
	_getCode(mesg: string) {
		let code: number;
	
		switch (mesg) {
		  case 'bad request':
			code = 400;
			break;
	
		  case 'unauthorized':
			code = 401;
			break;
	
		  case 'forbidden':
			code = 403;
			break;
			
		  default:
			code = 500;
			break;
		}
	
		return code;
	}

    async getAccessToken(token: string): Promise<OAuth2AccessToken> {
        return undefined;
    }

    async getClient(id: string, secret: string): Promise<OAuth2Client> {
        return undefined;
    }

    async saveToken(user: OAuth2User, client: OAuth2Client, scope?: OAuth2Scope): Promise<OAuth2AccessToken> {
        return undefined;
    }

    async validateScope(token: OAuth2AccessToken, scope: string[] | string): Promise<boolean> {
        return false;
    }
}