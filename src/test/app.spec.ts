import { App } from '../app/framework';
import { assert } from 'chai';
import * as sinon from 'sinon';
import * as koa from 'koa';

describe('App', () => {
    it('should return an instance of Koa.Application on app.init()', async (done) => {
        const callback = sinon.spy();
        const app = new App();

        const koaApp = await app.init();

        assert(koaApp instanceof koa); 
        assert.equal(callback.callCount, 1);
    });
});
