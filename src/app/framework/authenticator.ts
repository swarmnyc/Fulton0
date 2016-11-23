// Implements oauth2 node-style api for use with koa
// https://github.com/oauthjs/node-oauth2-server/wiki/Model-specification
import { EventEmitter } from 'events';

export class Authenticator extends EventEmitter {
    async getAccessToken() {
        return true;
    }

    async getAuthorizationCode() {
        return true;
    }

    async getClient() {
        return true;
    }

    async getUser() {
        return true;
    }

    async revokeAuthorizationCode() {
        return true;
    }

    async saveAuthorizationCode() {
        return true;
    }

    async validateScope() {
        return true;
    }
}

export default Authenticator