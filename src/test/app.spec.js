"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var framework_1 = require('../app/framework');
var chai_1 = require('chai');
var sinon = require('sinon');
var koa = require('koa');
describe('App', function () {
    it('should return an instance of Koa.Application on app.init()', function (done) __awaiter(this, void 0, void 0, function* () {
        var callback = sinon.spy();
        var app = new framework_1.App();
        var koaApp = yield app.init();
        chai_1.assert(koaApp instanceof koa);
        chai_1.assert.equal(callback.callCount, 1);
    }));
});
