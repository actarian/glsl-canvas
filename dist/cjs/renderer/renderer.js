"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var gl_matrix_1 = require("gl-matrix");
var buffers_1 = tslib_1.__importDefault(require("../buffers/buffers"));
var orbit_camera_1 = tslib_1.__importDefault(require("../camera/orbit-camera"));
var canvas_timer_1 = tslib_1.__importDefault(require("../canvas/canvas-timer"));
var context_1 = require("../context/context");
var subscriber_1 = tslib_1.__importDefault(require("../core/subscriber"));
var box_geometry_1 = tslib_1.__importDefault(require("../geometry/box-geometry"));
var flat_geometry_1 = tslib_1.__importDefault(require("../geometry/flat-geometry"));
var sphere_geometry_1 = tslib_1.__importDefault(require("../geometry/sphere-geometry"));
var torus_geometry_1 = tslib_1.__importDefault(require("../geometry/torus-geometry"));
var obj_loader_1 = tslib_1.__importDefault(require("../loaders/obj-loader"));
var logger_1 = tslib_1.__importDefault(require("../logger/logger"));
var vector2_1 = tslib_1.__importDefault(require("../math/vector2"));
var textures_1 = tslib_1.__importDefault(require("../textures/textures"));
var uniforms_1 = tslib_1.__importStar(require("../uniforms/uniforms"));
var Renderer = /** @class */ (function (_super) {
    tslib_1.__extends(Renderer, _super);
    function Renderer() {
        var _this = _super.call(this) || this;
        _this.uniforms = new uniforms_1.default();
        _this.buffers = new buffers_1.default();
        _this.textures = new textures_1.default();
        _this.textureList = [];
        _this.W = 0;
        _this.H = 0;
        _this.mouse = new vector2_1.default();
        _this.radians = 0;
        _this.dirty = true;
        _this.animated = false;
        _this.camera = new orbit_camera_1.default();
        _this.cache = {};
        _this.drawFunc_ = _this.drawArrays_;
        return _this;
    }
    Renderer.prototype.render = function () {
        var gl = this.gl;
        if (!gl) {
            return;
        }
        var BW = gl.drawingBufferWidth;
        var BH = gl.drawingBufferHeight;
        this.update_();
        gl.viewport(0, 0, BW, BH);
        for (var key in this.buffers.values) {
            var buffer = this.buffers.values[key];
            buffer.geometry.attachAttributes_(gl, buffer.program);
            // this.uniforms.get('u_resolution').values = [1024, 1024];
            this.uniforms.apply(gl, buffer.program);
            /*
            console.log('uniforms');
            for (const key in this.uniforms.values) {
                if (key.indexOf('u_buff') === 0) {
                    console.log(key);
                }
            }
            */
            buffer.render(gl, BW, BH);
        }
        // this.uniforms.get('u_resolution').values = [BW, BH];
        this.geometry.attachAttributes_(gl, this.program);
        this.uniforms.apply(gl, this.program);
        // gl.viewport(0, 0, BW, BH);
        this.drawFunc_(this.timer.delta);
        this.uniforms.clean();
        this.textures.clean();
        this.dirty = false;
        this.trigger('render', this);
    };
    /*
    protected drawArrays_(deltaTime: number) {
        const gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    */
    Renderer.prototype.drawArrays_ = function (deltaTime) {
        var gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        // Clear
        gl.viewport(0, 0, this.W, this.H);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        // Clear the canvas before we start drawing on it.
        // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.enable(gl.CULL_FACE);
        if (this.doubleSided && this.mode !== context_1.ContextMode.Flat) {
            // back
            // gl.frontFace(gl.CW);
            gl.cullFace(gl.FRONT);
            gl.drawArrays(gl.TRIANGLES, 0, this.geometry.size);
            // front
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        }
        // gl.frontFace(gl.CCW);
        gl.cullFace(gl.BACK);
        gl.drawArrays(gl.TRIANGLES, 0, this.geometry.size);
        // gl.drawElements(gl.TRIANGLES, this.geometry.size, gl.UNSIGNED_SHORT, 0);
    };
    Renderer.prototype.create_ = function () {
        this.createGeometry_();
        this.createUniforms_();
    };
    Renderer.prototype.createGeometry_ = function () {
        // console.log('Geometry', Geometry);
        // console.log('FlatGeometry', FlatGeometry);
        // console.log('BoxGeometry', BoxGeometry);
        this.parseGeometry_();
        this.setMode(this.mode);
    };
    Renderer.prototype.parseGeometry_ = function () {
        var regexp = /^attribute\s+vec4\s+a_position\s*;\s*\/\/\s*([\w|\:\/\/|\.|\-|\_|\?|\&|\=]+)/gm;
        var match = regexp.exec(this.vertexString);
        if (match && match.length > 1) {
            this.mesh = match[1];
        }
        else {
            this.mesh = this.defaultMesh;
        }
    };
    Renderer.prototype.createUniforms_ = function () {
        var gl = this.gl;
        var fragmentString = this.fragmentString;
        var BW = gl.drawingBufferWidth;
        var BH = gl.drawingBufferHeight;
        var timer = this.timer = new canvas_timer_1.default();
        var hasDelta = (fragmentString.match(/u_delta/g) || []).length > 1;
        var hasTime = (fragmentString.match(/u_time/g) || []).length > 1;
        var hasDate = (fragmentString.match(/u_date/g) || []).length > 1;
        var hasMouse = (fragmentString.match(/u_mouse/g) || []).length > 1;
        this.animated = hasTime || hasDate || hasMouse;
        this.uniforms.create(uniforms_1.UniformMethod.Uniform2f, uniforms_1.UniformType.Float, 'u_resolution', [BW, BH]);
        if (hasDelta) {
            this.uniforms.create(uniforms_1.UniformMethod.Uniform1f, uniforms_1.UniformType.Float, 'u_delta', [timer.delta / 1000.0]);
        }
        if (hasTime) {
            this.uniforms.create(uniforms_1.UniformMethod.Uniform1f, uniforms_1.UniformType.Float, 'u_time', [timer.current / 1000.0]);
        }
        if (hasDate) {
            var date = new Date();
            this.uniforms.create(uniforms_1.UniformMethod.Uniform4f, uniforms_1.UniformType.Float, 'u_date', [date.getFullYear(), date.getMonth(), date.getDate(), date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds() + date.getMilliseconds() * 0.001]);
        }
        if (hasMouse) {
            this.uniforms.create(uniforms_1.UniformMethod.Uniform2f, uniforms_1.UniformType.Float, 'u_mouse', [0, 0]);
        }
        // if (this.mode !== ContextMode.Flat) {
        this.projectionMatrix = gl_matrix_1.mat4.create();
        this.uniforms.create(uniforms_1.UniformMethod.UniformMatrix4fv, uniforms_1.UniformType.Float, 'u_projectionMatrix', this.projectionMatrix);
        this.modelViewMatrix = gl_matrix_1.mat4.create();
        this.uniforms.create(uniforms_1.UniformMethod.UniformMatrix4fv, uniforms_1.UniformType.Float, 'u_modelViewMatrix', this.modelViewMatrix);
        this.normalMatrix = gl_matrix_1.mat4.create();
        this.uniforms.create(uniforms_1.UniformMethod.UniformMatrix4fv, uniforms_1.UniformType.Float, 'u_normalMatrix', this.normalMatrix);
        this.uniforms.create(uniforms_1.UniformMethod.Uniform3f, uniforms_1.UniformType.Float, 'u_lightAmbient', [0.3, 0.3, 0.3]);
        this.uniforms.create(uniforms_1.UniformMethod.Uniform3f, uniforms_1.UniformType.Float, 'u_lightColor', [1.0, 1.0, 1.0]);
        this.uniforms.create(uniforms_1.UniformMethod.Uniform3f, uniforms_1.UniformType.Float, 'u_lightDirection', [0.0, 0.0, 1.0]);
        // }
    };
    Renderer.prototype.update_ = function () {
        this.updateUniforms_();
    };
    Renderer.prototype.updateUniforms_ = function () {
        var gl = this.gl;
        var BW = gl.drawingBufferWidth;
        var BH = gl.drawingBufferHeight;
        if (!this.timer) {
            return;
        }
        var timer = this.timer.next();
        this.uniforms.update(uniforms_1.UniformMethod.Uniform2f, uniforms_1.UniformType.Float, 'u_resolution', [BW, BH]);
        if (this.uniforms.has('u_delta')) {
            this.uniforms.update(uniforms_1.UniformMethod.Uniform1f, uniforms_1.UniformType.Float, 'u_delta', [timer.delta / 1000.0]);
        }
        if (this.uniforms.has('u_time')) {
            this.uniforms.update(uniforms_1.UniformMethod.Uniform1f, uniforms_1.UniformType.Float, 'u_time', [timer.current / 1000.0]);
        }
        if (this.uniforms.has('u_date')) {
            var date = new Date();
            this.uniforms.update(uniforms_1.UniformMethod.Uniform4f, uniforms_1.UniformType.Float, 'u_date', [date.getFullYear(), date.getMonth(), date.getDate(), date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds() + date.getMilliseconds() * 0.001]);
        }
        if (this.uniforms.has('u_mouse')) {
            var mouse = this.mouse;
            this.uniforms.update(uniforms_1.UniformMethod.Uniform2f, uniforms_1.UniformType.Float, 'u_mouse', [mouse.x, mouse.y]);
            /*
            const rect = this.rect;
            if (mouse.x >= rect.left && mouse.x <= rect.right &&
                mouse.y >= rect.top && mouse.y <= rect.bottom) {
                const MX = (mouse.x - rect.left) * this.devicePixelRatio;
                const MY = (this.canvas.height - (mouse.y - rect.top) * this.devicePixelRatio);
                this.uniforms.update(UniformMethod.Uniform2f, UniformType.Float, 'u_mouse', [MX, MY]);
            }
            */
        }
        if (this.mode !== context_1.ContextMode.Flat) {
            this.uniforms.update(uniforms_1.UniformMethod.UniformMatrix4fv, uniforms_1.UniformType.Float, 'u_projectionMatrix', this.updateProjectionMatrix_());
            this.uniforms.update(uniforms_1.UniformMethod.UniformMatrix4fv, uniforms_1.UniformType.Float, 'u_modelViewMatrix', this.updateModelViewMatrix_(this.timer.delta));
            this.uniforms.update(uniforms_1.UniformMethod.UniformMatrix4fv, uniforms_1.UniformType.Float, 'u_normalMatrix', this.updateNormalMatrix_(this.modelViewMatrix));
        }
    };
    Renderer.prototype.updateProjectionMatrix_ = function () {
        var gl = this.gl;
        var fieldOfView = 45 * Math.PI / 180;
        var aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
        var zNear = 0.1;
        var zFar = 100.0;
        gl_matrix_1.mat4.perspective(this.projectionMatrix, fieldOfView, aspect, zNear, zFar);
        return this.projectionMatrix;
    };
    /*
    protected updateModelViewMatrix__(deltaTime: number): mat4 {
        this.modelViewMatrix = mat4.identity(this.modelViewMatrix);
        mat4.translate(this.modelViewMatrix, this.modelViewMatrix, [0.0, 0.0, -6.0]); // amount to translate
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, this.radians, [0, 1, 0]); // axis to rotate around (Y)
        // mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, this.radians * 0.2, [1, 0, 0]); // axis to rotate around (X)
        this.radians += deltaTime * 0.001;
        return this.modelViewMatrix;
    }
    */
    Renderer.prototype.updateModelViewMatrix_ = function (deltaTime) {
        this.modelViewMatrix = gl_matrix_1.mat4.identity(this.modelViewMatrix);
        gl_matrix_1.mat4.translate(this.modelViewMatrix, this.modelViewMatrix, [0.0, 0.0, -this.camera.radius]); // amount to translate
        gl_matrix_1.mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, this.camera.theta + this.radians, [0, 1, 0]); // axis to rotate around (Y)
        gl_matrix_1.mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, this.camera.phi, [1, 0, 0]); // axis to rotate around (X)
        if (!this.camera.mouse) {
            this.camera.theta += (0 - this.camera.theta) / 20;
            this.camera.phi += (0 - this.camera.phi) / 20;
            this.radians += deltaTime * 0.0005;
        }
        return this.modelViewMatrix;
    };
    Renderer.prototype.updateNormalMatrix_ = function (modelViewMatrix) {
        // this.normalMatrix = mat4.create();
        this.normalMatrix = gl_matrix_1.mat4.identity(this.normalMatrix);
        gl_matrix_1.mat4.invert(this.normalMatrix, modelViewMatrix);
        gl_matrix_1.mat4.transpose(this.normalMatrix, this.normalMatrix);
        return this.normalMatrix;
    };
    Renderer.prototype.setMode = function (mode) {
        var _this = this;
        var geometry;
        if (mode === context_1.ContextMode.Mesh) {
            geometry = this.cache[this.mesh];
            if (geometry) {
                this.geometry = geometry;
                this.mode = context_1.ContextMode.Mesh;
                this.dirty = true;
                return;
            }
        }
        var loader;
        switch (mode) {
            case context_1.ContextMode.Flat:
                geometry = new flat_geometry_1.default();
                this.uniforms.update(uniforms_1.UniformMethod.UniformMatrix4fv, uniforms_1.UniformType.Float, 'u_projectionMatrix', gl_matrix_1.mat4.create());
                this.uniforms.update(uniforms_1.UniformMethod.UniformMatrix4fv, uniforms_1.UniformType.Float, 'u_modelViewMatrix', gl_matrix_1.mat4.create());
                this.uniforms.update(uniforms_1.UniformMethod.UniformMatrix4fv, uniforms_1.UniformType.Float, 'u_normalMatrix', gl_matrix_1.mat4.create());
                break;
            case context_1.ContextMode.Box:
                geometry = new box_geometry_1.default();
                break;
            case context_1.ContextMode.Sphere:
                geometry = new sphere_geometry_1.default();
                break;
            case context_1.ContextMode.Torus:
                geometry = new torus_geometry_1.default();
                break;
            case context_1.ContextMode.Mesh:
                geometry = new flat_geometry_1.default();
                if (this.mesh) {
                    loader = new obj_loader_1.default();
                    loader.load(this.getResource(this.mesh)).then(function (geometry) {
                        geometry.createAttributes_(_this.gl, _this.program);
                        var cache = {};
                        cache[_this.mesh] = geometry;
                        _this.cache = cache;
                        _this.geometry = geometry;
                        _this.dirty = true;
                    }, function (error) {
                        logger_1.default.warn('GlslCanvas', error);
                        _this.mode = context_1.ContextMode.Flat;
                    });
                }
                else {
                    mode = context_1.ContextMode.Flat;
                }
                break;
        }
        geometry.create(this.gl, this.program);
        this.geometry = geometry;
        this.mode = mode;
        this.dirty = true;
    };
    Renderer.prototype.setMesh = function (mesh) {
        this.mesh = mesh;
    };
    Renderer.prototype.getResource = function (url) {
        return String((url.indexOf(':/') === -1 && this.workpath !== undefined) ? this.workpath + "/" + url : url);
    };
    return Renderer;
}(subscriber_1.default));
exports.default = Renderer;
