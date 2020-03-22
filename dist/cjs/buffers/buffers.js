"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var context_1 = tslib_1.__importDefault(require("../context/context"));
var iterable_1 = tslib_1.__importDefault(require("../core/iterable"));
exports.BuffersDefaultFragment = "\nvoid main(){\n\tgl_FragColor = vec4(1.0);\n}";
exports.BuffersDefaultFragment2 = "#version 300 es\n\nprecision mediump float;\n\nout vec4 outColor;\n\nvoid main() {\n\toutColor = vec4(1.0);\n}\n";
var BufferFloatType;
(function (BufferFloatType) {
    BufferFloatType[BufferFloatType["FLOAT"] = 0] = "FLOAT";
    BufferFloatType[BufferFloatType["HALF_FLOAT"] = 1] = "HALF_FLOAT";
})(BufferFloatType = exports.BufferFloatType || (exports.BufferFloatType = {}));
var Buffer = /** @class */ (function () {
    function Buffer(gl, BW, BH, index) {
        var buffer = gl.createFramebuffer();
        var texture = this.getTexture(gl, BW, BH, index);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        this.texture = texture;
        this.buffer = buffer;
        this.BW = BW;
        this.BH = BH;
        this.index = index;
    }
    Buffer.prototype.getFloatType = function (gl) {
        var floatType, extension;
        if (Buffer.floatType === BufferFloatType.FLOAT) {
            var extensionName = context_1.default.isWebGl2(gl) ? 'EXT_color_buffer_float' : 'OES_texture_float';
            extension = gl.getExtension(extensionName);
            if (extension) {
                floatType = gl.FLOAT;
            }
            else {
                Buffer.floatType = BufferFloatType.HALF_FLOAT;
                return this.getFloatType(gl);
            }
        }
        else {
            var extensionName = context_1.default.isWebGl2(gl) ? 'EXT_color_buffer_half_float' : 'OES_texture_half_float';
            extension = gl.getExtension(extensionName);
            if (extension) {
                floatType = extension.HALF_FLOAT_OES;
            }
            else {
                Buffer.floatType = BufferFloatType.FLOAT;
                return this.getFloatType(gl);
            }
        }
        return floatType;
    };
    Buffer.prototype.getTexture = function (gl, BW, BH, index) {
        var floatType = this.getFloatType(gl);
        var texture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + index);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, (context_1.default.isWebGl2(gl) ? gl.RGBA16F : gl.RGBA), BW, BH, 0, gl.RGBA, floatType, null);
        var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (status !== gl.FRAMEBUFFER_COMPLETE) {
            if (Buffer.floatType === BufferFloatType.FLOAT) {
                Buffer.floatType = BufferFloatType.HALF_FLOAT;
            }
            else {
                Buffer.floatType = BufferFloatType.FLOAT;
            }
            return this.getTexture(gl, BW, BH, index);
        }
        return texture;
    };
    Buffer.prototype.resize = function (gl, BW, BH) {
        if (BW !== this.BW || BH !== this.BH) {
            var buffer = this.buffer;
            var texture = this.texture;
            var index = this.index;
            gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
            var status_1 = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
            var minW = Math.min(BW, this.BW);
            var minH = Math.min(BH, this.BH);
            var pixels = void 0;
            var floatType = this.getFloatType(gl);
            if (status_1 === gl.FRAMEBUFFER_COMPLETE) {
                pixels = new Float32Array(minW * minH * 4);
                gl.readPixels(0, 0, minW, minH, gl.RGBA, floatType, pixels);
            }
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            var newIndex = index + 1; // temporary index
            var newTexture = this.getTexture(gl, BW, BH, newIndex);
            floatType = this.getFloatType(gl);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            if (pixels) {
                gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, minW, minH, gl.RGBA, floatType, pixels);
            }
            var newBuffer = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.deleteTexture(texture);
            gl.activeTexture(gl.TEXTURE0 + index);
            gl.bindTexture(gl.TEXTURE_2D, newTexture);
            this.index = index;
            this.texture = newTexture;
            this.buffer = newBuffer;
            this.BW = BW;
            this.BH = BH;
        }
    };
    Buffer.floatType = BufferFloatType.HALF_FLOAT;
    return Buffer;
}());
exports.Buffer = Buffer;
var IOBuffer = /** @class */ (function () {
    function IOBuffer(index, key, vertexString, fragmentString) {
        this.isValid = false;
        this.index = index;
        this.key = key;
        this.vertexString = vertexString;
        this.fragmentString = fragmentString;
    }
    IOBuffer.prototype.create = function (gl, BW, BH) {
        // console.log('create', this.vertexString, this.fragmentString);
        var vertexShader = context_1.default.createShader(gl, this.vertexString, gl.VERTEX_SHADER);
        var fragmentShader = context_1.default.createShader(gl, this.fragmentString, gl.FRAGMENT_SHADER, 1);
        if (!fragmentShader) {
            fragmentShader = context_1.default.createShader(gl, context_1.default.isWebGl2(gl) ?
                exports.BuffersDefaultFragment2 : exports.BuffersDefaultFragment, gl.FRAGMENT_SHADER);
            this.isValid = false;
        }
        else {
            this.isValid = true;
        }
        var program = context_1.default.createProgram(gl, [vertexShader, fragmentShader]);
        gl.linkProgram(program);
        var input = new Buffer(gl, BW, BH, this.index + 0);
        var output = new Buffer(gl, BW, BH, this.index + 2);
        this.program = program;
        this.input = input;
        this.output = output;
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
    };
    IOBuffer.prototype.render = function (gl, BW, BH) {
        gl.useProgram(this.program);
        gl.viewport(0, 0, BW, BH);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.output.buffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.output.texture, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        // swap
        var input = this.input;
        var output = this.output;
        this.input = output;
        this.output = input;
    };
    IOBuffer.prototype.resize = function (gl, BW, BH) {
        gl.useProgram(this.program);
        gl.viewport(0, 0, BW, BH);
        this.input.resize(gl, BW, BH);
        this.output.resize(gl, BW, BH);
    };
    IOBuffer.prototype.destroy = function (gl) {
        gl.deleteProgram(this.program);
        this.program = null;
        this.input = null;
        this.output = null;
    };
    return IOBuffer;
}());
exports.IOBuffer = IOBuffer;
var Buffers = /** @class */ (function (_super) {
    tslib_1.__extends(Buffers, _super);
    function Buffers() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(Buffers.prototype, "count", {
        get: function () {
            return Object.keys(this.values).length * 4;
        },
        enumerable: true,
        configurable: true
    });
    Buffers.getBuffers = function (gl, fragmentString, vertexString) {
        var buffers = new Buffers();
        var count = 0;
        if (fragmentString) {
            if (context_1.default.isWebGl2(gl)) {
                fragmentString = fragmentString.replace(/^\#version\s*300\s*es\s*\n/, '');
            }
            var regexp = /(?:^\s*)((?:#if|#elif)(?:\s*)(defined\s*\(\s*BUFFER_)(\d+)(?:\s*\))|(?:#ifdef)(?:\s*BUFFER_)(\d+)(?:\s*))/gm;
            var matches = void 0;
            while ((matches = regexp.exec(fragmentString)) !== null) {
                var i = matches[3] || matches[4];
                var key = 'u_buffer' + i;
                var bufferFragmentString = context_1.default.isWebGl2(gl) ? "#version 300 es\n#define BUFFER_" + i + "\n" + fragmentString : "#define BUFFER_" + i + "\n" + fragmentString;
                var buffer = new IOBuffer(count, key, vertexString, bufferFragmentString);
                buffer.create(gl, gl.drawingBufferWidth, gl.drawingBufferHeight);
                buffers.set(key, buffer);
                count += 4;
            }
        }
        return buffers;
    };
    return Buffers;
}(iterable_1.default));
exports.default = Buffers;
