import { AsyncTest, Expect, Test, TestCase, TestFixture } from "alsatian";
import { Router } from './router';
import * as KoaRouter  from 'koa-joi-router';

class RouterSubclass extends Router {

    constructor(router: KoaRouter = KoaRouter()) {
        super(router);
    }

    shouldAuth: boolean = false
    auth() {
        return this.shouldAuth;
    }

    calledConfigure: boolean;
    configure() {
        this.calledConfigure = true;
    }
}

@TestFixture("Testing schema formatter")
export class FormatterTests {
    
    @TestCase()
    public testConfigureIsCalledOnInit() {
        let fakeKoaRouter = {
            calledUseWith: undefined,
            use(value: any) {
                this.calledUseWith = value;
            },
            prefix(value: any) {
                
            }}
        let router = new RouterSubclass(fakeKoaRouter);
        Expect(router.calledConfigure).toBe(true);
    }

   
}