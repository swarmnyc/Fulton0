import { AsyncTest, Expect, Test, TestCase, TestFixture } from "alsatian";
import { PasswordGrantHandler } from './password';
import { Model } from '../../../model';
import * as Koa from 'koa'
import * as moment from 'moment';
import { ObjectID } from 'mongodb';
import { Request, Response, Context } from 'koa';
import { PasswordGrant } from '../../../../example_project/src/app/oauth/password';
import { User, OAuthToken, OAuthClient } from '../../../../example_project/src/app/models';
import { OAuth2AccessToken } from '../lib';
import { IQuery } from 'mongorito';
import * as bcrypt from 'bcrypt-nodejs';
import * as crypto from 'crypto';
import { promisify } from 'bluebird';

const SALT_WORK_FACTOR = 10;
async function hashPassword(password: string) {        
    const bcryptGenSalt = promisify(bcrypt.genSalt);
    const bcryptHash = promisify<any, string, string, any>(bcrypt.hash);
    const salt = await bcryptGenSalt(SALT_WORK_FACTOR);
    
    return bcryptHash(password, salt, null);
}

@TestFixture("Testing OAuth Password Grant")
export class PasswordGrantTest {
    passwordGrant: PasswordGrant = new PasswordGrant();
    passwordHandler: PasswordGrantHandler
    calledThrow: boolean = false;

    async getFakeRequestContext(email: string, password: string) {
        var self = this;
        this.calledThrow = false
        // ignore typescript issue, we don't need the full Context object
        let ctx: Koa.Context = {
            request: {
                body: {
                    email: email,
                    password: password,
                    scope: []
                }
            },
            state: {
                oauth: {
                    client: await OAuthClient.findOne()
                }
            },
            response: {
                set: function() {
                }
            },
            throw: function() {
                self.calledThrow = true;
            } 
        }
        return ctx as Koa.Context
    }

    @AsyncTest("test valid login")
    public async testValidLogin() {
        this.spoofMongoRequests();
        this.passwordHandler = new PasswordGrantHandler(this.passwordGrant);
        let ctx = await this.getFakeRequestContext("email email email", "password")
        
        await this.passwordHandler.handle(ctx)
        
        Expect(ctx.state.oauth.accessToken).toBeDefined();
        Expect(ctx.state.oauth.user).toBeDefined();
    }

    @AsyncTest("test invvalid login")
    public async testInvalidLogin() {
        this.spoofMongoRequests();
        this.passwordHandler = new PasswordGrantHandler(this.passwordGrant);
        let ctx = await this.getFakeRequestContext("email email email", "wrong password")

        await this.passwordHandler.handle(ctx)

        Expect(ctx.state.oauth.accessToken).not.toBeDefined();
        Expect(ctx.state.oauth.user).not.toBeDefined();
        Expect(this.calledThrow).toBe(true);
    }

    spoofMongoRequests() {
        let userId = new ObjectID();
        OAuthToken.findOne = async function<T, Model>(query?: IQuery) {
            let token = new OAuthToken({
                accessToken: "123456",
                accessTokenExpiresOn: moment().add(90, 'days').toDate(),
                clientId: "clientId",
                userId: userId
            })
            return token as T
        }
        OAuthToken.prototype.save = async function() {
            return this;
        }
        OAuthClient.findOne = async function<T, Model>(query?: IQuery) {
            let token = new OAuthClient({
                _id: new ObjectID(),
                name: "client name",
                secret: "client secret",
                userId: userId
            })
            return token as T
        }
        
        User.findOne = async function<T, Model>(query?: IQuery) {
            let token = new User({
                _id: new ObjectID(),
                email: "email email email",
                password: await hashPassword("password"),
                secret: "secret"
            })
            return token as T
        }
    }


}