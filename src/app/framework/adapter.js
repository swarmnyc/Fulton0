"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var AdapterError = (function (_super) {
    __extends(AdapterError, _super);
    function AdapterError() {
        _super.apply(this, arguments);
    }
    AdapterError.type = 'AdapterError';
    return AdapterError;
}(Error));
