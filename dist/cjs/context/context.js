"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextVertexBuffers = exports.ContextError = exports.ContextDefault = exports.ContextMode = exports.ContextPrecision = exports.ContextVersion = void 0;
var tslib_1 = require("tslib");
var common_1 = tslib_1.__importDefault(require("../core/common"));
var logger_1 = tslib_1.__importDefault(require("../logger/logger"));
var chunks_1 = require("./chunks");
var ContextVersion;
(function (ContextVersion) {
    ContextVersion["WebGl"] = "webgl";
    ContextVersion["WebGl2"] = "webgl2";
})(ContextVersion = exports.ContextVersion || (exports.ContextVersion = {}));
var ContextPrecision;
(function (ContextPrecision) {
    ContextPrecision["LowP"] = "lowp";
    ContextPrecision["MediumP"] = "mediump";
    ContextPrecision["HighP"] = "highp";
})(ContextPrecision = exports.ContextPrecision || (exports.ContextPrecision = {}));
var ContextMode;
(function (ContextMode) {
    ContextMode["Flat"] = "flat";
    ContextMode["Box"] = "box";
    ContextMode["Sphere"] = "sphere";
    ContextMode["Torus"] = "torus";
    ContextMode["Mesh"] = "mesh";
})(ContextMode = exports.ContextMode || (exports.ContextMode = {}));
exports.ContextDefault = {
    'webgl': {
        'flat': {
            vertex: chunks_1.DefaultWebGLMeshVertex,
            fragment: chunks_1.DefaultWebGLFlatFragment,
        },
        'mesh': {
            vertex: chunks_1.DefaultWebGLMeshVertex,
            fragment: chunks_1.DefaultWebGLMeshFragment,
        }
    },
    'webgl2': {
        'flat': {
            vertex: chunks_1.DefaultWebGL2MeshVertex,
            fragment: chunks_1.DefaultWebGL2FlatFragment,
        },
        'mesh': {
            vertex: chunks_1.DefaultWebGL2MeshVertex,
            fragment: chunks_1.DefaultWebGL2MeshFragment,
        }
    }
};
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
    Context.getFragmentVertex = function (gl, fragmentString) {
        var vertexString;
        if (fragmentString) {
            if (Context.isWebGl2(gl)) {
                fragmentString = fragmentString.replace(/^\#version\s*300\s*es\s*\n/, '');
            }
            var regexp = /(?:^\s*)((?:#if|#elif)(?:\s*)(defined\s*\(\s*VERTEX)(?:\s*\))|(?:#ifdef)(?:\s*VERTEX)(?:\s*))/gm;
            var matches = regexp.exec(fragmentString);
            if (matches !== null) {
                vertexString = Context.isWebGl2(gl) ? "#version 300 es\n#define VERTEX\n" + fragmentString : "#define VERTEX\n" + fragmentString;
            }
        }
        // console.log('vertexString', vertexString);
        return vertexString;
    };
    Context.getIncludes = function (input, workpath) {
        if (workpath === void 0) { workpath = ''; }
        if (input === undefined) {
            return Promise.resolve(input);
        }
        var regex = /#include\s*['|"](.*.glsl)['|"]/gm;
        var promises = [];
        var i = 0;
        var match;
        var _loop_1 = function () {
            promises.push(Promise.resolve(input.slice(i, match.index)));
            i = match.index + match[0].length;
            var filePath = match[1];
            var url = common_1.default.getResource(filePath, workpath);
            var nextWorkpath = filePath.indexOf(':/') === -1 ? common_1.default.dirname(url) : '';
            promises.push(common_1.default.fetch(url).then(function (input) { return Context.getIncludes(input, nextWorkpath); }));
        };
        while ((match = regex.exec(input)) !== null) {
            _loop_1();
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
    Context.inferPrecision = function (fragmentString) {
        var precision = fragmentString.match(/precision\s+(.+)\s+float/);
        if (precision && precision.length > 1) {
            Context.precision = precision[1];
        }
        // console.log('precision', Context.precision);
        return Context.precision;
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
    Context.getBufferVertex = function (gl) {
        return this.isWebGl2(gl) ? chunks_1.DefaultWebGL2BufferVertex : chunks_1.DefaultWebGLBufferVertex;
    };
    Context.getVertex = function (vertexString, fragmentString, mode) {
        if (mode === void 0) { mode = ContextMode.Flat; }
        if (vertexString) {
            return vertexString;
        }
        else {
            var version = this.inferVersion(vertexString, fragmentString);
            return exports.ContextDefault[version][mode === ContextMode.Flat ? 'flat' : 'mesh'].vertex;
        }
    };
    Context.getFragment = function (vertexString, fragmentString, mode) {
        if (mode === void 0) { mode = ContextMode.Flat; }
        if (fragmentString) {
            return fragmentString;
        }
        else {
            var version = this.inferVersion(vertexString, fragmentString);
            return exports.ContextDefault[version][mode === ContextMode.Flat ? 'flat' : 'mesh'].fragment;
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
        source = source.replace(/precision\s+(.+)\s+float/, "precision " + Context.precision + " float");
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!compiled) {
            // Something went wrong during compilation; get the error
            Context.lastError = gl.getShaderInfoLog(shader);
            // console.log('lastError', Context.lastError);
            logger_1.default.error("*** Error compiling shader: " + Context.lastError);
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
        gl.validateProgram(program);
        // Check the link status
        var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!linked) {
            // something went wrong with the link
            Context.lastError = gl.getProgramInfoLog(program);
            logger_1.default.error("Error in program linking: " + Context.lastError);
            gl.deleteProgram(program);
            return null;
        }
        gl.useProgram(program);
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
    Context.precision = ContextPrecision.MediumP;
    Context.lastError = '';
    return Context;
}());
exports.default = Context;
