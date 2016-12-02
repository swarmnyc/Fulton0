import { App, Router } from '../../app/lib';
import * as chai from 'chai';
import { createServer, Server } from 'http';
const chaiHttp = require('chai-http');

const { assert, expect } = chai;
chai.use(chaiHttp);

class TestRoute extends Router {
    namespace() {
        return 'test';
    }

    configure(router) {
        router.get('/', function() {
            return function * (next: any) {
                this.set('Content-Type', 'text/html');
                this.body = '<html><head><title>Test Title</title></head><body><h1>Test Heading</h1></body></html>';
                yield next;
            };
        }());
        router.get('/testing', function() {
            return function* (next: any) {
                this.set('Content-Type', 'text/plain');
                this.body = 'Testing Routes';
                yield next;
            };
        }());
        router.post('/', function() {
            return function* (next: any) {
                const body = this.request.body;
                if (body.name === 'Bob') {
                    this.set('Content-Type', 'application/json');
                    this.body = { response: 'Hi, Bob!' };
                    this.response.status = 201;
                }
                yield next;
            };
        }());
    }
}

describe('Router', () => {
    it('should use the configured routes on app.use(router.routes())', async () => {
        const app = new App();
        const router = new TestRoute();
        const server = createServer(app.listener());
        let response: any;

        app.use(router.routes());
        await app.init();

        response = await chai['request'](server).get('/test/testing');

        expect(response).to.be['text'];
        expect(response.text).to.equal('Testing Routes');

        return;
    });

    it('should resolve to the right namespace on router.namespace()', async() => {
        const app = new App();
        const router = new TestRoute();
        const server = createServer(app.listener());
        let response: any;

        app.use(router.routes());
        await app.init();

        response = await chai['request'](server).get('/test');

        expect(response.status).to.equal(200);
        expect(response).to.be['html'];

        return;
    });

    it('should accept post requests and properly format responses on POST request', async () => {
        const app = new App();
        const router = new TestRoute();
        const server = createServer(app.listener());
        let response: any;
        
        await app.init();
        app.use(router.routes());
        
        response = await chai['request'](server).post('/test').set('Content-Type', 'application/json').send({ name: 'Bob' });

        expect(response.status).to.equal(201);
        expect(response).to.be['json'];
        expect(response.body).to.have.property('response');
        expect(response.body.response).to.equal('Hi, Bob!');

        return;
    });
});