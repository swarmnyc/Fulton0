"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const KoaRouter = require('koa-joi-router');
class ServiceLoader {
    load(app) {
        return __awaiter(this, void 0, void 0, function* () {
            let services = app.services();
            let oauthServices = app.oauthModels();
            var handleService = function (Svc) {
                return __awaiter(this, void 0, void 0, function* () {
                    let instance = new Svc();
                    let asName;
                    yield instance.load();
                    asName = instance.as();
                    app.set(`services.${asName}`, instance.get());
                    app._services[asName] = instance.get();
                    return instance;
                });
            };
            for (let Svc of services) {
                yield handleService(Svc);
            }
            for (let Svc of oauthServices) {
                let service = yield handleService(Svc);
                let instance = service.get();
                let oauth = new KoaRouter();
                oauth.route(instance.getRoute());
                app._groups.push({ groupName: service.as() + " Token", description: "OAuth Authentication", prefix: "", routes: oauth.routes });
                app.use(oauth.middleware());
            }
            return;
        });
    }
}
exports.ServiceLoader = ServiceLoader;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ServiceLoader;
//# sourceMappingURL=service-loader.js.map