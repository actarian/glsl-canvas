import Common from '../core/common';
import Logger from '../logger/logger';
export const DefaultWebGLBufferVertex = `
#ifdef GL_ES
precision mediump float;
#endif

attribute vec4 a_position;
attribute vec2 a_texcoord;
attribute vec3 a_normal;
attribute vec4 a_color;

varying vec2 v_texcoord;
varying vec3 v_normal;
varying vec4 v_color;
varying vec3 v_light;

uniform mat4 u_projectionMatrix;
uniform mat4 u_modelViewMatrix;
uniform mat4 u_normalMatrix;

uniform vec3 u_lightAmbient;
uniform vec3 u_lightColor;
uniform vec3 u_lightDirection;

void main(void) {
	gl_Position = a_position;
	v_texcoord = a_texcoord;
	v_normal = a_normal;
	v_color = a_color;

	// light
	vec4 normal = u_normalMatrix * vec4(a_normal, 1.0);
	float incidence = max(dot(normal.xyz, u_lightDirection), 0.0);
	v_light = u_lightAmbient + (u_lightColor * incidence);
}
`;
export const DefaultWebGL2BufferVertex = `#version 300 es

precision mediump float;

in vec4 a_position;
in vec2 a_texcoord;
in vec3 a_normal;
in vec4 a_color;

out vec2 v_texcoord;
out vec3 v_normal;
out vec4 v_color;
out vec3 v_light;

uniform mat4 u_projectionMatrix;
uniform mat4 u_modelViewMatrix;
uniform mat4 u_normalMatrix;

uniform vec3 u_lightAmbient;
uniform vec3 u_lightColor;
uniform vec3 u_lightDirection;

void main() {
	gl_Position = a_position;
	v_texcoord = a_texcoord;
	v_normal = a_normal;
	v_color = a_color;

	// light
	vec4 normal = u_normalMatrix * vec4(a_normal, 1.0);
	float incidence = max(dot(normal.xyz, u_lightDirection), 0.0);
	v_light = u_lightAmbient + (u_lightColor * incidence);
}
`;
export const DefaultWebGLFlatFragment = `
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

void main() {
	vec2 st = gl_FragCoord.xy / u_resolution.xy;
	st.x *= u_resolution.x / u_resolution.y;
	vec3 color = vec3(
		abs(cos(u_time * 0.1)) * st.y,
		abs(cos(u_time * 0.2)) * st.y,
		abs(sin(u_time)) * st.y
	);
	gl_FragColor = vec4(color, 1.0);
}
`;
export const DefaultWebGLMeshVertex = `
#ifdef GL_ES
precision mediump float;
#endif

attribute vec4 a_position;
attribute vec2 a_texcoord;
attribute vec3 a_normal;
attribute vec4 a_color;

varying vec4 v_position;
varying vec2 v_texcoord;
varying vec3 v_normal;
varying vec4 v_color;
varying vec3 v_light;

uniform float u_time;

uniform mat4 u_projectionMatrix;
uniform mat4 u_modelViewMatrix;
uniform mat4 u_normalMatrix;

uniform vec3 u_lightAmbient;
uniform vec3 u_lightColor;
uniform vec3 u_lightDirection;

void main(void) {
	vec4 v_position = a_position;
	// v_position.y += sin(v_position.x * 0.1) * 10.0;
	// v_position.xyz += a_normal * 0.025 + cos(u_time * 5.0) * a_normal * 0.025;
	v_position = u_projectionMatrix * u_modelViewMatrix * v_position;
	gl_Position = v_position;

	v_texcoord = a_texcoord;
	v_normal = a_normal;
	v_color = a_color;

	// light
	vec4 normal = u_normalMatrix * vec4(a_normal, 1.0) * 1.5;
	float incidence = max(dot(normal.xyz, u_lightDirection), 0.0);
	v_light = u_lightAmbient + (u_lightColor * incidence);
}
`;
export const DefaultWebGL2MeshVertex = `#version 300 es

precision mediump float;

in vec4 a_position;
in vec2 a_texcoord;
in vec3 a_normal;
in vec4 a_color;

out vec2 v_texcoord;
out vec3 v_normal;
out vec4 v_color;
out vec3 v_light;

uniform mat4 u_projectionMatrix;
uniform mat4 u_modelViewMatrix;
uniform mat4 u_normalMatrix;

uniform vec3 u_lightAmbient;
uniform vec3 u_lightColor;
uniform vec3 u_lightDirection;

void main() {
	gl_Position = u_projectionMatrix * u_modelViewMatrix * a_position;
	v_texcoord = a_texcoord;
	v_normal = a_normal;
	v_color = a_color;

	// light
	vec4 normal = u_normalMatrix * vec4(a_normal, 1.0);
	float incidence = max(dot(normal.xyz, u_lightDirection), 0.0);
	v_light = u_lightAmbient + (u_lightColor * incidence);
}
`;
export const DefaultWebGLMeshFragment = `
#ifdef GL_ES
precision mediump float;
#endif

varying vec2 v_texcoord;
varying vec3 v_normal;
varying vec3 v_light;
varying vec4 v_color;

uniform vec2 u_resolution;
uniform float u_time;

void main() {
	vec2 uv = v_texcoord;
	vec3 color = vec3(
		abs(cos(u_time * 0.1)) * uv.y,
		abs(cos(u_time * 0.2)) * uv.y,
		abs(sin(u_time)) * uv.y
	);
	gl_FragColor = vec4(v_color.rgb * color * v_light, 1.0);
}
`;
export const DefaultWebGL2FlatFragment = `#version 300 es

precision mediump float;

out vec4 outColor;

uniform vec2 u_resolution;
uniform float u_time;

void main() {
	vec2 st = gl_FragCoord.xy / u_resolution.xy;
	st.x *= u_resolution.x / u_resolution.y;
	vec3 color = vec3(
		abs(cos(u_time * 0.1)) * st.y,
		abs(cos(u_time * 0.2)) * st.y,
		abs(sin(u_time)) * st.y
	);
	outColor = vec4(color, 1.0);
}
`;
export const DefaultWebGL2MeshFragment = `#version 300 es

precision mediump float;

in vec2 v_texcoord;
in vec3 v_light;
in vec4 v_color;

out vec4 outColor;

uniform vec2 u_resolution;
uniform float u_time;

void main() {
	vec2 uv = v_texcoord;
	vec3 color = vec3(
		abs(cos(u_time * 0.1)) * uv.y,
		abs(cos(u_time * 0.2)) * uv.y,
		abs(sin(u_time)) * uv.y
	);
	outColor = vec4(v_color.rgb * color * v_light, 1.0);
}
`;
export var ContextVersion;
(function (ContextVersion) {
    ContextVersion["WebGl"] = "webgl";
    ContextVersion["WebGl2"] = "webgl2";
})(ContextVersion || (ContextVersion = {}));
export var ContextPrecision;
(function (ContextPrecision) {
    ContextPrecision["LowP"] = "lowp";
    ContextPrecision["MediumP"] = "mediump";
    ContextPrecision["HighP"] = "highp";
})(ContextPrecision || (ContextPrecision = {}));
export var ContextMode;
(function (ContextMode) {
    ContextMode["Flat"] = "flat";
    ContextMode["Box"] = "box";
    ContextMode["Sphere"] = "sphere";
    ContextMode["Torus"] = "torus";
    ContextMode["Mesh"] = "mesh";
})(ContextMode || (ContextMode = {}));
export const ContextDefault = {
    'webgl': {
        'flat': {
            vertex: DefaultWebGLMeshVertex,
            fragment: DefaultWebGLFlatFragment,
        },
        'mesh': {
            vertex: DefaultWebGLMeshVertex,
            fragment: DefaultWebGLMeshFragment,
        }
    },
    'webgl2': {
        'flat': {
            vertex: DefaultWebGL2MeshVertex,
            fragment: DefaultWebGL2FlatFragment,
        },
        'mesh': {
            vertex: DefaultWebGL2MeshVertex,
            fragment: DefaultWebGL2MeshFragment,
        }
    }
};
export var ContextError;
(function (ContextError) {
    ContextError[ContextError["BrowserSupport"] = 1] = "BrowserSupport";
    ContextError[ContextError["Other"] = 2] = "Other";
})(ContextError || (ContextError = {}));
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
export class ContextVertexBuffers {
}
export default class Context {
    static getContext_(canvas, options) {
        const names = ['webgl', 'experimental-webgl'];
        let context = null;
        for (let i = 0; i < names.length; ++i) {
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
    }
    static getContext2_(canvas, options) {
        let context = null;
        try {
            context = canvas.getContext('webgl2', options);
        }
        catch (e) {
            // console.error('GlslCanvas.Context.getContext2_.error', e);
        }
        return context;
    }
    static getFragmentVertex(gl, fragmentString) {
        let vertexString;
        if (fragmentString) {
            if (Context.isWebGl2(gl)) {
                fragmentString = fragmentString.replace(/^\#version\s*300\s*es\s*\n/, '');
            }
            const regexp = /(?:^\s*)((?:#if|#elif)(?:\s*)(defined\s*\(\s*VERTEX)(?:\s*\))|(?:#ifdef)(?:\s*VERTEX)(?:\s*))/gm;
            const matches = regexp.exec(fragmentString);
            if (matches !== null) {
                vertexString = Context.isWebGl2(gl) ? `#version 300 es
#define VERTEX
${fragmentString}` : `#define VERTEX
${fragmentString}`;
            }
        }
        // console.log('vertexString', vertexString);
        return vertexString;
    }
    static getIncludes(input) {
        if (input === undefined) {
            return Promise.resolve(input);
        }
        const regex = /#include\s*['|"](.*.glsl)['|"]/gm;
        const promises = [];
        let i = 0;
        let match;
        while ((match = regex.exec(input)) !== null) {
            promises.push(Promise.resolve(input.slice(i, match.index)));
            i = match.index + match[0].length;
            promises.push(Common.fetch(match[1]));
        }
        promises.push(Promise.resolve(input.slice(i)));
        return Promise.all(promises).then(chunks => {
            return chunks.join('');
        });
    }
    static isWebGl(context) {
        return context instanceof WebGLRenderingContext;
    }
    static isWebGl2(context) {
        // console.log(context);
        // return context !== undefined && typeof (context as any).bindBufferRange === 'function';
        return window.WebGL2RenderingContext && context instanceof WebGL2RenderingContext;
    }
    static inferVersion(vertexString, fragmentString) {
        const source = vertexString || fragmentString;
        if (source) {
            return source.indexOf('#version 300 es') === 0 ? ContextVersion.WebGl2 : ContextVersion.WebGl;
        }
        else {
            return ContextVersion.WebGl;
        }
    }
    static inferPrecision(fragmentString) {
        const precision = fragmentString.match(/precision\s+(.+)\s+float/);
        if (precision && precision.length > 1) {
            Context.precision = precision[1];
        }
        // console.log('precision', Context.precision);
        return Context.precision;
    }
    static versionDiffers(gl, vertexString, fragmentString) {
        if (gl) {
            const currentVersion = this.isWebGl2(gl) ? ContextVersion.WebGl2 : ContextVersion.WebGl;
            const newVersion = Context.inferVersion(vertexString, fragmentString);
            return newVersion !== currentVersion;
        }
        else {
            return false;
        }
    }
    static getBufferVertex(gl) {
        return this.isWebGl2(gl) ? DefaultWebGL2BufferVertex : DefaultWebGLBufferVertex;
    }
    static getVertex(vertexString, fragmentString, mode = ContextMode.Flat) {
        if (vertexString) {
            return vertexString;
        }
        else {
            const version = this.inferVersion(vertexString, fragmentString);
            return ContextDefault[version][mode === ContextMode.Flat ? 'flat' : 'mesh'].vertex;
        }
    }
    static getFragment(vertexString, fragmentString, mode = ContextMode.Flat) {
        if (fragmentString) {
            return fragmentString;
        }
        else {
            const version = this.inferVersion(vertexString, fragmentString);
            return ContextDefault[version][mode === ContextMode.Flat ? 'flat' : 'mesh'].fragment;
        }
    }
    static tryInferContext(vertexString, fragmentString, canvas, attributes, extensions = [], errorCallback) {
        function handleError(errorCode, html) {
            if (typeof errorCallback === 'function') {
                errorCallback(errorCode);
            }
            else {
                const container = canvas.parentNode;
                if (container) {
                    container.innerHTML = `<div class="glsl-canvas--error">${html}</div>`;
                }
            }
        }
        if (!WebGLRenderingContext) {
            handleError(ContextError.BrowserSupport, `This page requires a browser that supports WebGL.<br/>
			<a href="http://get.webgl.org">Click here to upgrade your browser.</a>`);
            return null;
        }
        const context = Context.inferContext(vertexString, fragmentString, canvas, attributes);
        if (!context) {
            handleError(ContextError.Other, `It does not appear your computer can support WebGL.<br/>
			<a href="http://get.webgl.org/troubleshooting/">Click here for more information.</a>`);
        }
        else {
            if (!(this.isWebGl2(context)) && extensions.indexOf('OES_standard_derivatives') === -1) {
                extensions.push('OES_standard_derivatives');
            }
            const supportedExtensions = context.getSupportedExtensions();
            extensions.forEach(key => {
                if (supportedExtensions.indexOf(key) !== -1) {
                    context.getExtension(key);
                }
                else {
                    Logger.warn(`GlslCanvas ${key} not supported`);
                }
            });
            // context.getExtension('OES_standard_derivatives');
        }
        return context;
    }
    static tryGetContext(canvas, attributes, errorCallback) {
        function handleError(errorCode, html) {
            if (typeof errorCallback === 'function') {
                errorCallback(errorCode);
            }
            else {
                const container = canvas.parentNode;
                if (container) {
                    container.innerHTML = `<div class="glsl-canvas--error">${html}</div>`;
                }
            }
        }
        if (!WebGLRenderingContext) {
            handleError(ContextError.BrowserSupport, `This page requires a browser that supports WebGL.<br/>
			<a href="http://get.webgl.org">Click here to upgrade your browser.</a>`);
            return null;
        }
        const context = Context.getContext_(canvas, attributes);
        if (!context) {
            handleError(ContextError.Other, `It does not appear your computer can support WebGL.<br/>
			<a href="http://get.webgl.org/troubleshooting/">Click here for more information.</a>`);
        }
        else {
            context.getExtension('OES_standard_derivatives');
        }
        return context;
    }
    static inferContext(vertexString, fragmentString, canvas, options) {
        const version = this.inferVersion(vertexString, fragmentString);
        return version === ContextVersion.WebGl2 ? this.getContext2_(canvas, options) : this.getContext_(canvas, options);
    }
    static createShader(gl, source, type, offset = 0) {
        const shader = gl.createShader(type);
        source = source.replace(/precision\s+(.+)\s+float/, `precision ${Context.precision} float`);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!compiled) {
            // Something went wrong during compilation; get the error
            Context.lastError = gl.getShaderInfoLog(shader);
            // console.log('lastError', Context.lastError);
            Logger.error(`*** Error compiling shader: ${Context.lastError}`);
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
    }
    static createProgram(gl, shaders, attributes, locations) {
        const program = gl.createProgram();
        for (let i = 0; i < shaders.length; ++i) {
            gl.attachShader(program, shaders[i]);
        }
        if (attributes && locations) {
            for (let i = 0; i < attributes.length; ++i) {
                gl.bindAttribLocation(program, locations ? locations[i] : i, attributes[i]);
            }
        }
        gl.linkProgram(program);
        gl.validateProgram(program);
        // Check the link status
        const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!linked) {
            // something went wrong with the link
            Context.lastError = gl.getProgramInfoLog(program);
            Logger.error(`Error in program linking: ${Context.lastError}`);
            gl.deleteProgram(program);
            return null;
        }
        gl.useProgram(program);
        return program;
    }
    static createVertexBuffers(gl, program) {
        const vertexBuffers = new ContextVertexBuffers();
        const texcoordIndex = gl.getAttribLocation(program, 'a_texcoord');
        vertexBuffers.texcoord = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers.texcoord);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(texcoordIndex);
        gl.vertexAttribPointer(texcoordIndex, 2, gl.FLOAT, false, 0, 0);
        const positionIndex = gl.getAttribLocation(program, 'a_position');
        vertexBuffers.position = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers.position);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(positionIndex);
        gl.vertexAttribPointer(positionIndex, 2, gl.FLOAT, false, 0, 0);
        return vertexBuffers;
    }
}
Context.precision = ContextPrecision.MediumP;
Context.lastError = '';
