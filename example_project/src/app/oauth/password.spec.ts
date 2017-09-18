import { AsyncTest, Expect, Test, TestCase, TestFixture } from "alsatian";
import { PasswordGrantHandler } from 'fulton';
import { Model } from 'fulton';
import * as moment from 'moment';
import { ObjectID } from 'mongodb';
import { hashPassword } from '../helpers/user';
import { Request, Response, Context } from 'koa';
import { PasswordGrant } from './password';
import { User, OAuthToken, OAuthClient } from '../models';
import { OAuth2AccessToken } from 'fulton';
import { IQuery } from 'mongorito';

@TestFixture("Testing OAuth Password Grant")
export class PasswordGrantTest {
    passwordGrant: PasswordGrant = new PasswordGrant();
    passwordHandler: PasswordGrantHandler
    calledThrow: boolean = false;

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

    @AsyncTest("test valid login details on getUser")
    public async validLoginTestOnGetUser() {
        this.spoofMongoRequests();
        let user = await this.passwordGrant.getUser("email email email", "password")
        Expect(user).toBeDefined();
    }

    @AsyncTest("test invalid login details on getUser")
    public async invalidLoginTestOnGetUser() {
        this.spoofMongoRequests();
        let user = await this.passwordGrant.getUser("email email email", "wrong password")
        Expect(user).not.toBeDefined();
    }
   
    @AsyncTest("test save token")
    public async testSaveToken() {
        this.spoofMongoRequests();
        let user = await this.passwordGrant.getUser("email email email", "password");
        let client = await this.passwordGrant.getClient("whatever", "whatever");
        let token = await this.passwordGrant.saveToken(user, client, []) as OAuth2AccessToken;
    
        Expect(token.client_id.toString()).toBe(client.id.toString());
        Expect(token.user_id.toString()).toBe(user.id.toString());
    }

}