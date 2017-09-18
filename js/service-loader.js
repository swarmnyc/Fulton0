"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class ServiceLoader {
    load(app) {
        return __awaiter(this, void 0, void 0, function* () {
            let services = app.services();
            let loadedServices = [];
            for (let Svc of services) {
                let instance = new Svc();
                let asName;
                yield instance.load();
                asName = instance.as();
                app.set(`services.${asName}`, instance.get());
                app._services[asName] = instance.get();
            }
            return;
        });
    }
}
exports.ServiceLoader = ServiceLoader;
exports.default = ServiceLoader;
//# sourceMappingURL=service-loader.js.map