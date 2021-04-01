"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringMap = exports.NumberMap = void 0;
var NumberMap = /** @class */ (function () {
    function NumberMap() {
    }
    return NumberMap;
}());
exports.NumberMap = NumberMap;
;
var StringMap = /** @class */ (function () {
    function StringMap() {
    }
    return StringMap;
}());
exports.StringMap = StringMap;
;
var IterableStringMap = /** @class */ (function () {
    function IterableStringMap() {
        this.values = new StringMap();
    }
    IterableStringMap.prototype.has = function (key) {
        return key in this.values;
        // return this.values.hasOwnProperty(key);
    };
    IterableStringMap.prototype.set = function (key, item) {
        this.values[key] = item;
    };
    IterableStringMap.prototype.get = function (key) {
        return this.values[key];
    };
    IterableStringMap.prototype.forEach = function (callbackfn) {
        var _this = this;
        var i = 0;
        Object.keys(this.values).forEach(function (key) {
            callbackfn(_this.values[key], i, _this.values);
            i++;
        });
    };
    IterableStringMap.prototype.reduce = function (callbackfn, initialValue) {
        var _this = this;
        var previous = initialValue, i = 0;
        Object.keys(this.values).forEach(function (key) {
            previous = callbackfn(previous, _this.values[key], i, _this.values);
            i++;
        });
        return previous;
    };
    return IterableStringMap;
}());
exports.default = IterableStringMap;
