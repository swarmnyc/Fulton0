"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
class Service {
    /**
     * Name to use for the service in the app. Defaults to the name of the service class.
     *
     * @returns {string}
     *
     * @memberof Service
     */
    as() {
        return this.constructor.name;
    }
    /**
     * This function is called when the service is instantiated. It should return a new instance of the underlying service and apply any boot-up operations.
     *
     * @returns {Promise<any>}
     * @memberof Service
     */
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            return;
        });
    }
    /**
     *
     *
     *
     * @memberof Service
     */
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            this.instance = yield this.init();
            return;
        });
    }
    /**
     * Function that is called when the service is tore down. Do any clean up that needs to happen here.
     *
     * @returns {Promise<void>}
     *
     * @memberof Service
     */
    deinit() {
        return __awaiter(this, void 0, void 0, function* () {
            return;
        });
    }
    /**
     * Returns the instance of the service
     *
     * @returns {any} - Service instance
     *
     * @memberof Service
     */
    get() {
        return this.instance;
    }
}
exports.Service = Service;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Service;
//# sourceMappingURL=service.js.map