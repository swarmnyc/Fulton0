import { Service } from '../lib';
import { passwordGrant } from '../oauth/password';
import * as Router from 'koa-router';
import * as oauth from 'oauth2-server';
import { promisify } from 'bluebird';

const Request = require('express/lib/request');
const Response = require('express/lib/response');
const oauthserver = require('oauth2-server');
const OAuth2Error = require('oauth2-server/lib/error');

interface OAuthConfig {
    enabled: boolean
    modelName: string
    grants?: string[],
    tokenEndpoint?: string 
}

interface OAuthOptions {
    model: any
    grants?: string[]
    tokenEndpoint?: string
}

class OAuthServer {
    model: any
    tokenEndpoint: string
    grants: string[]
    server: oauth.OAuth2Server

    constructor(opts: OAuthOptions) {
        this.tokenEndpoint = opts.tokenEndpoint || 'token';
        this.model = opts.model;
        this.grants = opts.grants || [];        

        this.server = new oauthserver({
            model: this.model,
            grants: this.grants,
            debug: console.log
        });
    }

    handleResponse = function*(response: any) {
        this.body = response.body;
        this.status = response.status;

        this.set(response.headers);
    }

    handleError = function*(err: any, response: any) {
        if (response) {
            this.set(response.headers);
        }

        if (err instanceof OAuth2Error) {
            this.status = err.code;
        } else {
            this.body = { error: err.name, error_description: err.message };
            this.status = err.code;
        }

        if (err.code !== 401 || err.code !== 400) {
            return this.throw(err.code);
        }        
    }

    grant() {
        const server = this.server;
        const grant = promisify(server.grant());
        const handleResponse = this.handleResponse;
        const handleError = this.handleError;
        return function *(next: any) {
            const req = this.req;
            const res = this.res;
            
            
            try {
                this.state.oauth = {
                    token: yield grant(req, res)
                };
                handleResponse.call(this, res);
             } catch(e) {
                handleError.call(this, e, res);
             }

            yield next;
        };
    }

    authenticate() {
        const server = this.server;
        return function*(next: any) {            
            yield next;
        }
    }
}

class OAuth extends Service {
    config: OAuthConfig 
    as = 'oauth'
    tokenEndpoint: string

    model() {
        return passwordGrant;
    }
    async init() {
        const model = this.model();
        let o = Object.assign({}, this.config, { model: model });
        delete o.modelName;
        delete o.enabled;
        this.instance = new OAuthServer(o);
        return this;
    }
}

export = OAuth