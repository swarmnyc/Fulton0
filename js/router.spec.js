"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const alsatian_1 = require("alsatian");
const router_1 = require('./router');
const KoaRouter = require('koa-joi-router');
class RouterSubclass extends router_1.Router {
    constructor(router = KoaRouter()) {
        super(router);
        this.shouldAuth = false;
    }
    auth() {
        return this.shouldAuth;
    }
    configure() {
        this.calledConfigure = true;
    }
}
let FormatterTests = class FormatterTests {
    testConfigureIsCalledOnInit() {
        let fakeKoaRouter = {
            calledUseWith: undefined,
            use(value) {
                this.calledUseWith = value;
            },
            prefix(value) {
            } };
        let router = new RouterSubclass(fakeKoaRouter);
        alsatian_1.Expect(router.calledConfigure).toBe(true);
    }
};
__decorate([
    alsatian_1.TestCase()
], FormatterTests.prototype, "testConfigureIsCalledOnInit", null);
FormatterTests = __decorate([
    alsatian_1.TestFixture("Testing schema formatter")
], FormatterTests);
exports.FormatterTests = FormatterTests;
//# sourceMappingURL=router.spec.js.map