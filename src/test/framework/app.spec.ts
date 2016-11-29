import { App } from '../../app/framework';
import { createServer, Server } from 'http';
import * as koa from 'koa';
import * as chai from 'chai';
const chaiHttp = require('chai-http');

const { assert, expect } = chai;
chai.use(chaiHttp);

describe('App', () => {
    it('should return an instance of Koa.Application on app.init()', async () => {        
        const app = new App();        
        const koaApp = await app.init();
        
        assert(koaApp instanceof koa);
        return;
    });

    it('should return a node-http compatible request listener on app.listener()', async () => {
        const server = createServer();
        const app = new App();
        const listener = app.listener();
        const mount = () => {
            server.on('request', listener);
        };

        assert.doesNotThrow(mount);
        return;
    });

    it('should call didInit() event on init of app', async () => {
        let didFire: boolean;
        class MyApp extends App {
            didInit() {
                didFire = true;
            }
        }

        const myApp = new MyApp();

        await myApp.init();
        assert(didFire === true);
        return;
    });

    it('should set a value to the corresponding key on the underlying koa app on app.set(key, value)', async () => {
        const app = new App();
        await app.init();

        app.set('someKey', true);
        assert(app.get('someKey') === true);
        return;
    });

    it('should pass the request handler to the underlying instance of koa app on app.use(handler)', async () => {
        const app = new App();
        const server = createServer();
        const responseText = 'success';
        const listener = function *(next: any) {
            this.body = responseText;
            yield next;
        };
        
        app.use(listener);
        await app.init();
        
        server.on('request', app.listener());
        const response = await chai['request'](server).get('/').set('content-type', 'text/plain');
        
        expect(response).to.have['status'](200);
        expect(response).to.be['text'];
        expect(response.text).to.equal(responseText);
        
        return;
    });
});
