"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var vector2_1 = tslib_1.__importDefault(require("../math/vector2"));
var vector3_1 = tslib_1.__importDefault(require("../math/vector3"));
var PI = Math.PI;
var RAD = PI / 180;
var OrbitCamera = /** @class */ (function (_super) {
    tslib_1.__extends(OrbitCamera, _super);
    function OrbitCamera(theta, phi, radius) {
        var _this = _super.call(this) || this;
        _this.position = new vector3_1.default();
        _this.value = new Float32Array([0, 0, 0]);
        _this.mouse = null;
        _this.dirty = false;
        _this.theta = (theta || 0) * RAD;
        _this.phi = (phi || 0) * RAD;
        _this.radius = radius || 6.0;
        return _this;
        // this.update();
    }
    OrbitCamera.prototype.down = function (x, y) {
        this.mouse = new vector2_1.default(x, y);
    };
    OrbitCamera.prototype.move = function (x, y) {
        var mouse = this.mouse;
        if (mouse && (mouse.x !== x || mouse.y !== y)) {
            var theta = (x - mouse.x) * 180 * RAD;
            var phi = (y - mouse.y) * 180 * RAD;
            mouse.x = x;
            mouse.y = y;
            this.theta += theta;
            this.phi = Math.max(-60 * RAD, Math.min(60 * RAD, this.phi + phi));
            // this.update();
        }
    };
    OrbitCamera.prototype.up = function () {
        this.mouse = null;
    };
    OrbitCamera.prototype.wheel = function (d) {
        this.radius = Math.max(4.0, Math.min(10.0, this.radius + d * 0.02));
    };
    OrbitCamera.fromVector = function (vector) {
        var radius = vector.length();
        var theta = Math.acos(vector.y / radius); //theta
        var phi = Math.atan(vector.x / vector.z); //phi
        return new OrbitCamera(theta, phi, radius);
    };
    OrbitCamera.toArray = function (camera) {
        var spr = Math.sin(camera.phi) * camera.radius;
        var x = spr * Math.sin(camera.theta);
        var y = Math.cos(camera.phi) * camera.radius;
        var z = spr * Math.cos(camera.theta);
        return [x, y, z];
    };
    return OrbitCamera;
}(vector3_1.default));
exports.default = OrbitCamera;
