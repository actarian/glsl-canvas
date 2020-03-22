"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LoggerLevel;
(function (LoggerLevel) {
    LoggerLevel[LoggerLevel["None"] = 0] = "None";
    LoggerLevel[LoggerLevel["Error"] = 1] = "Error";
    LoggerLevel[LoggerLevel["Warn"] = 2] = "Warn";
    LoggerLevel[LoggerLevel["Log"] = 3] = "Log";
})(LoggerLevel = exports.LoggerLevel || (exports.LoggerLevel = {}));
var Logger = /** @class */ (function () {
    function Logger() {
    }
    Logger.log = function () {
        var datas = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            datas[_i] = arguments[_i];
        }
        if (Logger.enabled && Logger.level >= LoggerLevel.Log) {
            console.log.apply(console, datas);
        }
    };
    Logger.warn = function () {
        var datas = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            datas[_i] = arguments[_i];
        }
        if (Logger.enabled && Logger.level >= LoggerLevel.Warn) {
            console.warn.apply(console, datas);
        }
    };
    Logger.error = function () {
        var datas = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            datas[_i] = arguments[_i];
        }
        if (Logger.enabled && Logger.level >= LoggerLevel.Error) {
            console.error.apply(console, datas);
        }
    };
    Logger.level = LoggerLevel.Warn;
    Logger.enabled = true;
    return Logger;
}());
exports.default = Logger;
