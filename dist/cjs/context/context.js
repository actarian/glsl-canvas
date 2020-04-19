"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var common_1 = tslib_1.__importDefault(require("../core/common"));
var logger_1 = tslib_1.__importDefault(require("../logger/logger"));
exports.DefaultWebGLBufferVertex = "\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\nattribute vec4 a_position;\nattribute vec2 a_texcoord;\nattribute vec3 a_normal;\nattribute vec4 a_color;\n\nvarying vec2 v_texcoord;\nvarying vec3 v_normal;\nvarying vec4 v_color;\nvarying vec3 v_light;\n\nuniform mat4 u_projectionMatrix;\nuniform mat4 u_modelViewMatrix;\nuniform mat4 u_normalMatrix;\n\nuniform vec3 u_lightAmbient;\nuniform vec3 u_lightColor;\nuniform vec3 u_lightDirection;\n\nvoid main(void) {\n\tgl_Position = a_position;\n\tv_texcoord = a_texcoord;\n\tv_normal = a_normal;\n\tv_color = a_color;\n\n\t// light\n\tvec4 normal = u_normalMatrix * vec4(a_normal, 1.0);\n\tfloat incidence = max(dot(normal.xyz, u_lightDirection), 0.0);\n\tv_light = u_lightAmbient + (u_lightColor * incidence);\n}\n";
exports.DefaultWebGL2BufferVertex = "#version 300 es\n\nprecision mediump float;\n\nin vec4 a_position;\nin vec2 a_texcoord;\nin vec3 a_normal;\nin vec4 a_color;\n\nout vec2 v_texcoord;\nout vec3 v_normal;\nout vec4 v_color;\nout vec3 v_light;\n\nuniform mat4 u_projectionMatrix;\nuniform mat4 u_modelViewMatrix;\nuniform mat4 u_normalMatrix;\n\nuniform vec3 u_lightAmbient;\nuniform vec3 u_lightColor;\nuniform vec3 u_lightDirection;\n\nvoid main() {\n\tgl_Position = a_position;\n\tv_texcoord = a_texcoord;\n\tv_normal = a_normal;\n\tv_color = a_color;\n\n\t// light\n\tvec4 normal = u_normalMatrix * vec4(a_normal, 1.0);\n\tfloat incidence = max(dot(normal.xyz, u_lightDirection), 0.0);\n\tv_light = u_lightAmbient + (u_lightColor * incidence);\n}\n";
exports.DefaultWebGLFlatFragment = "\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\nuniform vec2 u_resolution;\nuniform float u_time;\n\nvoid main() {\n\tvec2 st = gl_FragCoord.xy / u_resolution.xy;\n\tst.x *= u_resolution.x / u_resolution.y;\n\tvec3 color = vec3(\n\t\tabs(cos(u_time * 0.1)) * st.y,\n\t\tabs(cos(u_time * 0.2)) * st.y,\n\t\tabs(sin(u_time)) * st.y\n\t);\n\tgl_FragColor = vec4(color, 1.0);\n}\n";
exports.DefaultWebGLMeshVertex = "\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\nattribute vec4 a_position;\nattribute vec2 a_texcoord;\nattribute vec3 a_normal;\nattribute vec4 a_color;\n\nvarying vec4 v_position;\nvarying vec2 v_texcoord;\nvarying vec3 v_normal;\nvarying vec4 v_color;\nvarying vec3 v_light;\n\nuniform float u_time;\n\nuniform mat4 u_projectionMatrix;\nuniform mat4 u_modelViewMatrix;\nuniform mat4 u_normalMatrix;\n\nuniform vec3 u_lightAmbient;\nuniform vec3 u_lightColor;\nuniform vec3 u_lightDirection;\n\nvoid main(void) {\n\tvec4 v_position = a_position;\n\t// v_position.y += sin(v_position.x * 0.1) * 10.0;\n\t// v_position.xyz += a_normal * 0.025 + cos(u_time * 5.0) * a_normal * 0.025;\n\tv_position = u_projectionMatrix * u_modelViewMatrix * v_position;\n\tgl_Position = v_position;\n\n\tv_texcoord = a_texcoord;\n\tv_normal = a_normal;\n\tv_color = a_color;\n\n\t// light\n\tvec4 normal = u_normalMatrix * vec4(a_normal, 1.0) * 1.5;\n\tfloat incidence = max(dot(normal.xyz, u_lightDirection), 0.0);\n\tv_light = u_lightAmbient + (u_lightColor * incidence);\n}\n";
exports.DefaultWebGL2MeshVertex = "#version 300 es\n\nprecision mediump float;\n\nin vec4 a_position;\nin vec2 a_texcoord;\nin vec3 a_normal;\nin vec4 a_color;\n\nout vec2 v_texcoord;\nout vec3 v_normal;\nout vec4 v_color;\nout vec3 v_light;\n\nuniform mat4 u_projectionMatrix;\nuniform mat4 u_modelViewMatrix;\nuniform mat4 u_normalMatrix;\n\nuniform vec3 u_lightAmbient;\nuniform vec3 u_lightColor;\nuniform vec3 u_lightDirection;\n\nvoid main() {\n\tgl_Position = u_projectionMatrix * u_modelViewMatrix * a_position;\n\tv_texcoord = a_texcoord;\n\tv_normal = a_normal;\n\tv_color = a_color;\n\n\t// light\n\tvec4 normal = u_normalMatrix * vec4(a_normal, 1.0);\n\tfloat incidence = max(dot(normal.xyz, u_lightDirection), 0.0);\n\tv_light = u_lightAmbient + (u_lightColor * incidence);\n}\n";
exports.DefaultWebGLMeshFragment = "\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\nvarying vec2 v_texcoord;\nvarying vec3 v_normal;\nvarying vec3 v_light;\nvarying vec4 v_color;\n\nuniform vec2 u_resolution;\nuniform float u_time;\n\nvoid main() {\n\tvec2 uv = v_texcoord;\n\tvec3 color = vec3(\n\t\tabs(cos(u_time * 0.1)) * uv.y,\n\t\tabs(cos(u_time * 0.2)) * uv.y,\n\t\tabs(sin(u_time)) * uv.y\n\t);\n\tgl_FragColor = vec4(v_color.rgb * color * v_light, 1.0);\n}\n";
exports.DefaultWebGL2FlatFragment = "#version 300 es\n\nprecision mediump float;\n\nout vec4 outColor;\n\nuniform vec2 u_resolution;\nuniform float u_time;\n\nvoid main() {\n\tvec2 st = gl_FragCoord.xy / u_resolution.xy;\n\tst.x *= u_resolution.x / u_resolution.y;\n\tvec3 color = vec3(\n\t\tabs(cos(u_time * 0.1)) * st.y,\n\t\tabs(cos(u_time * 0.2)) * st.y,\n\t\tabs(sin(u_time)) * st.y\n\t);\n\toutColor = vec4(color, 1.0);\n}\n";
exports.DefaultWebGL2MeshFragment = "#version 300 es\n\nprecision mediump float;\n\nin vec2 v_texcoord;\nin vec3 v_light;\nin vec4 v_color;\n\nout vec4 outColor;\n\nuniform vec2 u_resolution;\nuniform float u_time;\n\nvoid main() {\n\tvec2 uv = v_texcoord;\n\tvec3 color = vec3(\n\t\tabs(cos(u_time * 0.1)) * uv.y,\n\t\tabs(cos(u_time * 0.2)) * uv.y,\n\t\tabs(sin(u_time)) * uv.y\n\t);\n\toutColor = vec4(v_color.rgb * color * v_light, 1.0);\n}\n";
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
            vertex: exports.DefaultWebGLMeshVertex,
            fragment: exports.DefaultWebGLFlatFragment,
        },
        'mesh': {
            vertex: exports.DefaultWebGLMeshVertex,
            fragment: exports.DefaultWebGLMeshFragment,
        }
    },
    'webgl2': {
        'flat': {
            vertex: exports.DefaultWebGL2MeshVertex,
            fragment: exports.DefaultWebGL2FlatFragment,
        },
        'mesh': {
            vertex: exports.DefaultWebGL2MeshVertex,
            fragment: exports.DefaultWebGL2MeshFragment,
        }
    }
};
var ContextError;
(function (ContextError) {
    ContextError[ContextError["BrowserSupport"] = 1] = "BrowserSupport";
    ContextError[ContextError["Other"] = 2] = "Other";
})(ContextError = exports.ContextError || (exports.ContextError = {}));
/*
export interface IContextOptions {
    alpha?: GLboolean;
    antialias?: GLboolean;
    depth?: GLboolean;
    failIfMajorPerformanceCaveat?: boolean;
    powerPreference?: WebGLPowerPreference;
    premultipliedAlpha?: GLboolean;
    preserveDrawingBuffer?: GLboolean;
    stencil?: GLboolean;
}
*/
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
        return this.isWebGl2(gl) ? exports.DefaultWebGL2BufferVertex : exports.DefaultWebGLBufferVertex;
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
