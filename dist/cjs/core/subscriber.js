"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var logger_1 = tslib_1.__importDefault(require("../logger/logger"));
var Listener = /** @class */ (function () {
    function Listener(event, callback) {
        this.event = event;
        this.callback = callback;
    }
    return Listener;
}());
exports.Listener = Listener;
var Subscriber = /** @class */ (function () {
    function Subscriber() {
        this.listeners = new Set();
    }
    Subscriber.prototype.logListeners = function () {
        this.listeners.forEach(function (x) { return logger_1.default.log(x); });
    };
    Subscriber.prototype.subscribe = function (listener) {
        this.listeners.add(listener);
    };
    Subscriber.prototype.unsubscribe = function (listener) {
        this.listeners.delete(listener);
    };
    Subscriber.prototype.unsubscribeAll = function () {
        this.listeners.clear();
    };
    Subscriber.prototype.on = function (event, callback) {
        this.listeners.add(new Listener(event, callback));
        return this;
    };
    Subscriber.prototype.off = function (event, callback) {
        var _this = this;
        if (callback) {
            this.listeners.delete(new Listener(event, callback));
        }
        else {
            this.listeners.forEach(function (x) {
                if (x.event === event) {
                    _this.listeners.delete(x);
                }
            });
        }
        return this;
    };
    Subscriber.prototype.trigger = function (event) {
        var data = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            data[_i - 1] = arguments[_i];
        }
        this.listeners.forEach(function (x) {
            if (x.event === event && typeof x.callback === 'function') {
                x.callback.apply(x, data);
            }
        });
        return this;
    };
    return Subscriber;
}());
exports.default = Subscriber;
