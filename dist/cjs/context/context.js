"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var common_1 = tslib_1.__importDefault(require("../core/common"));
var logger_1 = tslib_1.__importDefault(require("../logger/logger"));
exports.ContextDefaultVertex = "\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\nattribute vec2 a_position;\nattribute vec2 a_texcoord;\n\nvarying vec2 v_texcoord;\n\nvoid main(){\n\tgl_Position = vec4(a_position, 0.0, 1.0);\n\tv_texcoord = a_texcoord;\n}\n";
exports.ContextDefaultFragment = "\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\nvoid main(){\n\tgl_FragColor = vec4(0.0);\n}\n";
exports.ContextDefaultVertex2 = "#version 300 es\n\nin vec2 a_position;\nin vec2 a_texcoord;\n\nout vec2 v_texcoord;\n\nvoid main() {\n\tgl_Position = vec4(a_position, 0.0, 1.0);\n\tv_texcoord = a_texcoord;\n}\n";
exports.ContextDefaultFragment2 = "#version 300 es\n\nprecision mediump float;\n\nout vec4 outColor;\n\nvoid main() {\n\toutColor = vec4(0.0);\n}\n";
var ContextVersion;
(function (ContextVersion) {
    ContextVersion[ContextVersion["WebGl"] = 1] = "WebGl";
    ContextVersion[ContextVersion["WebGl2"] = 2] = "WebGl2";
})(ContextVersion = exports.ContextVersion || (exports.ContextVersion = {}));
var ContextError;
(function (ContextError) {
    ContextError[ContextError["BrowserSupport"] = 1] = "BrowserSupport";
    ContextError[ContextError["Other"] = 2] = "Other";
})(ContextError = exports.ContextError || (exports.ContextError = {}));
var ContextVertexBuffers = /** @class */ (function () {
    function ContextVertexBuffers() {
    }
    return ContextVertexBuffers;
}());
exports.ContextVertexBuffers = ContextVertexBuffers;
var Context = /** @class */ (function () {
    function Context() {
    }
    Context.getContext_ = function (canvas, options) {
        var names = ['webgl', 'experimental-webgl'];
        var context = null;
        for (var i = 0; i < names.length; ++i) {
            try {
                context = canvas.getContext(names[i], options);
            }
            catch (e) {
                if (context) {
                    break;
                }
            }
        }
        return context;
    };
    Context.getContext2_ = function (canvas, options) {
        var context = null;
        try {
            context = canvas.getContext('webgl2', options);
        }
        catch (e) {
            // console.error('GlslCanvas.Context.getContext2_.error', e);
        }
        return context;
    };
    Context.getIncludes = function (input) {
        if (input === undefined) {
            return Promise.resolve(input);
        }
        var regex = /#include\s*['|"](.*.glsl)['|"]/gm;
        var promises = [];
        var i = 0;
        var match;
        while ((match = regex.exec(input)) !== null) {
            promises.push(Promise.resolve(input.slice(i, match.index)));
            i = match.index + match[0].length;
            promises.push(common_1.default.fetch(match[1]));
        }
        promises.push(Promise.resolve(input.slice(i)));
        return Promise.all(promises).then(function (chunks) {
            return chunks.join('');
        });
    };
    Context.isWebGl = function (context) {
        return context instanceof WebGLRenderingContext;
    };
    Context.isWebGl2 = function (context) {
        // console.log(context);
        // return context !== undefined && typeof (context as any).bindBufferRange === 'function';
        return window.WebGL2RenderingContext && context instanceof WebGL2RenderingContext;
    };
    Context.inferVersion = function (vertexString, fragmentString) {
        var source = vertexString || fragmentString;
        if (source) {
            return source.indexOf('#version 300 es') === 0 ? ContextVersion.WebGl2 : ContextVersion.WebGl;
        }
        else {
            return ContextVersion.WebGl;
        }
    };
    Context.versionDiffers = function (gl, vertexString, fragmentString) {
        if (gl) {
            var currentVersion = this.isWebGl2(gl) ? ContextVersion.WebGl2 : ContextVersion.WebGl;
            var newVersion = Context.inferVersion(vertexString, fragmentString);
            return newVersion !== currentVersion;
        }
        else {
            return false;
        }
    };
    Context.getVertex = function (vertexString, fragmentString) {
        if (vertexString) {
            return vertexString;
        }
        else {
            var version = this.inferVersion(vertexString, fragmentString);
            return version === ContextVersion.WebGl2 ? exports.ContextDefaultVertex2 : exports.ContextDefaultVertex;
        }
    };
    Context.getFragment = function (vertexString, fragmentString) {
        if (fragmentString) {
            return fragmentString;
        }
        else {
            var version = this.inferVersion(vertexString, fragmentString);
            return version === ContextVersion.WebGl2 ? exports.ContextDefaultFragment2 : exports.ContextDefaultFragment;
        }
    };
    Context.tryInferContext = function (vertexString, fragmentString, canvas, attributes, extensions, errorCallback) {
        if (extensions === void 0) { extensions = []; }
        function handleError(errorCode, html) {
            if (typeof errorCallback === 'function') {
                errorCallback(errorCode);
            }
            else {
                var container = canvas.parentNode;
                if (container) {
                    container.innerHTML = "<div class=\"glsl-canvas--error\">" + html + "</div>";
                }
            }
        }
        if (!WebGLRenderingContext) {
            handleError(ContextError.BrowserSupport, "This page requires a browser that supports WebGL.<br/>\n\t\t\t<a href=\"http://get.webgl.org\">Click here to upgrade your browser.</a>");
            return null;
        }
        var context = Context.inferContext(vertexString, fragmentString, canvas, attributes);
        if (!context) {
            handleError(ContextError.Other, "It does not appear your computer can support WebGL.<br/>\n\t\t\t<a href=\"http://get.webgl.org/troubleshooting/\">Click here for more information.</a>");
        }
        else {
            if (!(this.isWebGl2(context)) && extensions.indexOf('OES_standard_derivatives') === -1) {
                extensions.push('OES_standard_derivatives');
            }
            var supportedExtensions_1 = context.getSupportedExtensions();
            extensions.forEach(function (key) {
                if (supportedExtensions_1.indexOf(key) !== -1) {
                    context.getExtension(key);
                }
                else {
                    logger_1.default.warn("GlslCanvas " + key + " not supported");
                }
            });
            // context.getExtension('OES_standard_derivatives');
        }
        return context;
    };
    Context.tryGetContext = function (canvas, attributes, errorCallback) {
        function handleError(errorCode, html) {
            if (typeof errorCallback === 'function') {
                errorCallback(errorCode);
            }
            else {
                var container = canvas.parentNode;
                if (container) {
                    container.innerHTML = "<div class=\"glsl-canvas--error\">" + html + "</div>";
                }
            }
        }
        if (!WebGLRenderingContext) {
            handleError(ContextError.BrowserSupport, "This page requires a browser that supports WebGL.<br/>\n\t\t\t<a href=\"http://get.webgl.org\">Click here to upgrade your browser.</a>");
            return null;
        }
        var context = Context.getContext_(canvas, attributes);
        if (!context) {
            handleError(ContextError.Other, "It does not appear your computer can support WebGL.<br/>\n\t\t\t<a href=\"http://get.webgl.org/troubleshooting/\">Click here for more information.</a>");
        }
        else {
            context.getExtension('OES_standard_derivatives');
        }
        return context;
    };
    Context.inferContext = function (vertexString, fragmentString, canvas, options) {
        var version = this.inferVersion(vertexString, fragmentString);
        return version === ContextVersion.WebGl2 ? this.getContext2_(canvas, options) : this.getContext_(canvas, options);
    };
    Context.createShader = function (gl, source, type, offset) {
        if (offset === void 0) { offset = 0; }
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!compiled) {
            // Something went wrong during compilation; get the error
            Context.lastError = gl.getShaderInfoLog(shader);
            // console.log('lastError', Context.lastError);
            logger_1.default.error("*** Error compiling shader " + shader + ": " + Context.lastError);
            // main.trigger('error', {
            gl.deleteShader(shader);
            throw ({
                shader: shader,
                source: source,
                type: type,
                error: Context.lastError,
                offset: offset
            });
        }
        return shader;
    };
    Context.createProgram = function (gl, shaders, attributes, locations) {
        var program = gl.createProgram();
        for (var i = 0; i < shaders.length; ++i) {
            gl.attachShader(program, shaders[i]);
        }
        if (attributes && locations) {
            for (var i = 0; i < attributes.length; ++i) {
                gl.bindAttribLocation(program, locations ? locations[i] : i, attributes[i]);
            }
        }
        gl.linkProgram(program);
        // Check the link status
        var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!linked) {
            // something went wrong with the link
            Context.lastError = gl.getProgramInfoLog(program);
            logger_1.default.log("Error in program linking: " + Context.lastError);
            gl.deleteProgram(program);
            return null;
        }
        return program;
    };
    Context.createVertexBuffers = function (gl, program) {
        var vertexBuffers = new ContextVertexBuffers();
        var texcoordIndex = gl.getAttribLocation(program, 'a_texcoord');
        vertexBuffers.texcoord = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers.texcoord);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(texcoordIndex);
        gl.vertexAttribPointer(texcoordIndex, 2, gl.FLOAT, false, 0, 0);
        var positionIndex = gl.getAttribLocation(program, 'a_position');
        vertexBuffers.position = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers.position);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(positionIndex);
        gl.vertexAttribPointer(positionIndex, 2, gl.FLOAT, false, 0, 0);
        return vertexBuffers;
    };
    Context.lastError = '';
    return Context;
}());
exports.default = Context;
