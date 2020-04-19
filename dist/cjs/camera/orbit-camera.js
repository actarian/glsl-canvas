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
    /*

    update() {
        const spr = Math.sin(this.phi) * this.radius;
        const x = spr * Math.sin(this.theta);
        const y = Math.cos(this.phi) * this.radius;
        const z = spr * Math.cos(this.theta);
        this.position.x = x;
        this.position.y = y;
        this.position.z = z;
        this.value[0] = x;
        this.value[1] = y;
        this.value[2] = z;
    }

    render(canvas: Canvas) {
        const vector = OrbitCamera.toVector(this);
        const array = new Float32Array([vector.x, vector.y, vector.z]);
        this.update_(canvas, '3fv', 'vec3', 'u_camera', array);
    }

    update_(canvas: Canvas, method, type, name, value) {
        try {
            const u = canvas.uniforms[name] = canvas.uniforms[name] || {};
            u.name = name;
            u.value = value;
            u.type = type;
            u.method = 'uniform' + method;
            u.location = canvas.gl.getUniformLocation(canvas.program, name);
            canvas.gl[u.method].apply(canvas.gl, [u.location].concat(u.value));
        } catch (e) {
            console.log('fastUpdate', e);
        }
    }

    static toVector(camera: OrbitCamera): Vector3 {
        camera.update();
        return camera.position;
        const spr = Math.sin(camera.phi) * camera.radius;
        const x = spr * Math.sin(camera.theta);
        const y = Math.cos(camera.phi) * camera.radius;
        const z = spr * Math.cos(camera.theta);
        return new Vector3(x, y, z);
    }
    */
    OrbitCamera.fromVector = function (vector) {
        var radius = vector.length();
        var theta = Math.acos(vector.y / radius); //theta
        var phi = Math.atan(vector.x / vector.z); //phi
        return new OrbitCamera(theta, phi, radius);
    };
    return OrbitCamera;
}(vector3_1.default));
exports.default = OrbitCamera;
