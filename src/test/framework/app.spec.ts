import { App } from '../../app/framework';
import { assert } from 'chai';
import * as sinon from 'sinon';
import * as koa from 'koa';

describe('App', () => {
    it('should return an instance of Koa.Application on app.init()', async () => {        
        const app = new App();        
        const koaApp = await app.init();
        
        assert(koaApp instanceof koa);
        return;
    });
});
