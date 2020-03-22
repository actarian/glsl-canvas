"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("promise-polyfill");
var Common = /** @class */ (function () {
    function Common() {
    }
    Common.fetch = function (url) {
        // console.log('fetch', url);
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.onload = function () {
                resolve(xhr.response || xhr.responseText);
            };
            xhr.onerror = function (error) {
                // console.log(error);
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
    return Common;
}());
exports.default = Common;
