"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
        return this.values.hasOwnProperty(key);
    };
    IterableStringMap.prototype.set = function (key, item) {
        this.values[key] = item;
    };
    IterableStringMap.prototype.get = function (key) {
        return this.values[key];
    };
    IterableStringMap.prototype.forEach = function (callbackfn) {
        var i = 0;
        for (var key in this.values) {
            callbackfn(this.values[key], i, this.values);
            i++;
        }
    };
    IterableStringMap.prototype.reduce = function (callbackfn, initialValue) {
        var previous = initialValue, i = 0;
        for (var key in this.values) {
            previous = callbackfn(previous, this.values[key], i, this.values);
            i++;
        }
        return previous;
    };
    return IterableStringMap;
}());
exports.default = IterableStringMap;
