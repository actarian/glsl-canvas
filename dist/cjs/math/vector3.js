"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Vector3 = /** @class */ (function () {
    function Vector3(x, y, z) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (z === void 0) { z = 0; }
        this.isVector3 = true;
        this.x = x;
        this.y = y;
        this.z = z;
    }
    Vector3.prototype.copy = function (v) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
    };
    Vector3.prototype.length = function () {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    };
    Vector3.prototype.normalize = function () {
        return this.divideScalar(this.length() || 1);
    };
    Vector3.prototype.divideScalar = function (scalar) {
        return this.multiplyScalar(1 / scalar);
    };
    Vector3.prototype.multiplyScalar = function (scalar) {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
        return this;
    };
    Vector3.prototype.subVectors = function (a, b) {
        this.x = a.x - b.x;
        this.y = a.y - b.y;
        this.z = a.z - b.z;
        return this;
    };
    Vector3.prototype.addVectors = function (a, b) {
        this.x = a.x + b.x;
        this.y = a.y + b.y;
        this.z = a.z + b.z;
        return this;
    };
    Vector3.prototype.crossVectors = function (a, b) {
        var ax = a.x, ay = a.y, az = a.z;
        var bx = b.x, by = b.y, bz = b.z;
        this.x = ay * bz - az * by;
        this.y = az * bx - ax * bz;
        this.z = ax * by - ay * bx;
        return this;
    };
    return Vector3;
}());
exports.default = Vector3;
