"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("promise-polyfill");
var Common = /** @class */ (function () {
    function Common() {
    }
    Common.fetch = function (url) {
        // console.log('Common.fetch', url);
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.onload = function () {
                resolve(xhr.response || xhr.responseText);
            };
            xhr.onerror = function (error) {
                console.log('Common.error', error);
                reject(new Error("Network request failed for url " + url));
            };
            xhr.ontimeout = function (error) {
                // console.log(error);
                reject(new Error("Network request failed for url " + url));
            };
            xhr.onabort = function () {
                reject(new Error('Aborted'));
            };
            xhr.open('GET', url, true);
            xhr.send(null);
        });
    };
    Common.getResource = function (filepath, workpath) {
        if (workpath === void 0) { workpath = ''; }
        var resource = (filepath.indexOf(':/') === -1) ? Common.join(workpath, filepath) : filepath;
        return resource;
    };
    Common.join = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var comp = [];
        args.forEach(function (a) {
            var parts = a.split(/(?<!\/)\/(?!\/)/g);
            if (parts.length && parts[parts.length - 1] === '') {
                parts.pop();
            }
            parts.forEach(function (x) {
                switch (x) {
                    case '':
                        comp = [];
                        break;
                    case '.':
                        break;
                    case '..':
                        comp.pop();
                        break;
                    default:
                        comp.push(x);
                }
            });
        });
        return comp.join('/');
    };
    Common.dirname = function (path) {
        var comp = path.split(/(?<!\/)\/(?!\/)/g);
        comp.pop();
        return comp.join('/');
    };
    return Common;
}());
exports.default = Common;
