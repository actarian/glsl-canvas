import Common from '../core/common';
import Logger from '../logger/logger';
import { DefaultWebGL2BufferVertex, DefaultWebGL2FlatFragment, DefaultWebGL2MeshFragment, DefaultWebGL2MeshVertex, DefaultWebGLBufferVertex, DefaultWebGLFlatFragment, DefaultWebGLMeshFragment, DefaultWebGLMeshVertex } from './chunks';

export enum ContextVersion {
	WebGl = 'webgl',
	WebGl2 = 'webgl2',
}

export enum ContextPrecision {
	LowP = 'lowp',
	MediumP = 'mediump',
	HighP = 'highp',
}

export enum ContextMode {
	Flat = 'flat',
	Box = 'box',
	Sphere = 'sphere',
	Torus = 'torus',
	Mesh = 'mesh',
}

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

export enum ContextError {
	BrowserSupport = 1,
	Other = 2,
}

export class ContextVertexBuffers {
	texcoord: WebGLBuffer;
	position: WebGLBuffer;
}

export default class Context {

	static precision: ContextPrecision = ContextPrecision.MediumP;
	static lastError: string = '';

	static getContext_(canvas: HTMLCanvasElement, options?: WebGLContextAttributes): WebGLRenderingContext {
		const names = ['webgl', 'experimental-webgl'];
		let context = null;
		for (let i = 0; i < names.length; ++i) {
			try {
				context = canvas.getContext(names[i], options) as WebGLRenderingContext;
			} catch (e) {
				if (context) {
					break;
				}
			}
		}
		return context;
	}

	static getContext2_(canvas: HTMLCanvasElement, options?: WebGLContextAttributes): WebGL2RenderingContext {
		let context = null;
		try {
			context = canvas.getContext('webgl2', options) as WebGL2RenderingContext;
		} catch (e) {
			// console.error('GlslCanvas.Context.getContext2_.error', e);
		}
		return context;
	}

	static getFragmentVertex(gl: WebGLRenderingContext | WebGL2RenderingContext, fragmentString: string): string {
		let vertexString;
		if (fragmentString) {
			const version = Context.inferVersion(fragmentString);
			if (version === ContextVersion.WebGl2) {
				fragmentString = fragmentString.replace(/^\#version\s*300\s*es.*?\n/, '');
			}
			const regexp = /(?:^\s*)((?:#if|#elif)(?:\s*)(defined\s*\(\s*VERTEX)(?:\s*\))|(?:#ifdef)(?:\s*VERTEX)(?:\s*))/gm;
			const matches = regexp.exec(fragmentString);
			if (matches !== null) {
				vertexString = version === ContextVersion.WebGl2 ? `#version 300 es
#define VERTEX
${fragmentString}` : `#define VERTEX
${fragmentString}`;
			}
		}
		return vertexString;
	}

	static getIncludes(input: string | undefined, workpath: string = ''): Promise<string | undefined> {
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
			const filePath = match[1];
			const url = Common.getResource(filePath, workpath);
			const nextWorkpath = filePath.indexOf(':/') === -1 ? Common.dirname(url) : '';
			promises.push(Common.fetch(url).then(input => Context.getIncludes(input, nextWorkpath)));
		}
		promises.push(Promise.resolve(input.slice(i)));
		return Promise.all(promises).then(chunks => {
			return chunks.join('');
		});
	}

	static isWebGl(context: WebGLRenderingContext | WebGL2RenderingContext): boolean {
		return context instanceof WebGLRenderingContext;
	}

	static isWebGl2(context: WebGLRenderingContext | WebGL2RenderingContext): boolean {
		// console.log(context);
		// return context !== undefined && typeof (context as any).bindBufferRange === 'function';
		return (window as any).WebGL2RenderingContext && context instanceof WebGL2RenderingContext;
	}

	static inferVersion(vertexString?: string, fragmentString?: string): ContextVersion {
		const source: string = vertexString || fragmentString;
		if (source) {
			return source.indexOf('#version 300 es') === 0 ? ContextVersion.WebGl2 : ContextVersion.WebGl;
		} else {
			return ContextVersion.WebGl;
		}
	}

	static inferPrecision(fragmentString: string): ContextPrecision {
		const precision: RegExpMatchArray = fragmentString.match(/precision\s+(.+)\s+float/);
		if (precision && precision.length > 1) {
			Context.precision = precision[1] as ContextPrecision;
		}
		// console.log('precision', Context.precision);
		return Context.precision;
	}

	static versionDiffers(gl: WebGLRenderingContext | WebGL2RenderingContext, vertexString?: string, fragmentString?: string): boolean {
		if (gl) {
			const currentVersion = this.isWebGl2(gl) ? ContextVersion.WebGl2 : ContextVersion.WebGl;
			const newVersion = Context.inferVersion(vertexString, fragmentString);
			return newVersion !== currentVersion;
		} else {
			return false;
		}
	}

	static getBufferVertex(gl: WebGLRenderingContext | WebGL2RenderingContext): string {
		return this.isWebGl2(gl) ? DefaultWebGL2BufferVertex : DefaultWebGLBufferVertex;
	}

	static getVertex(vertexString?: string, fragmentString?: string, mode: ContextMode = ContextMode.Flat): string {
		if (vertexString) {
			return vertexString;
		} else {
			const version: ContextVersion = this.inferVersion(vertexString, fragmentString);
			return ContextDefault[version][mode === ContextMode.Flat ? 'flat' : 'mesh'].vertex;
		}
	}

	static getFragment(vertexString?: string, fragmentString?: string, mode: ContextMode = ContextMode.Flat): string {
		if (fragmentString) {
			return fragmentString;
		} else {
			const version: ContextVersion = this.inferVersion(vertexString, fragmentString);
			return ContextDefault[version][mode === ContextMode.Flat ? 'flat' : 'mesh'].fragment;
		}
	}

	static tryInferContext(vertexString: string, fragmentString: string, canvas: HTMLCanvasElement, attributes: WebGLContextAttributes, extensions: string[] = [], errorCallback: Function): WebGLRenderingContext | WebGL2RenderingContext {
		function handleError(errorCode: number, html: string) {
			if (typeof errorCallback === 'function') {
				errorCallback(errorCode);
			} else {
				const container = canvas.parentNode;
				if (container) {
					(container as HTMLElement).innerHTML = `<div class="glsl-canvas--error">${html}</div>`;
				}
			}
		}
		if (!WebGLRenderingContext) {
			handleError(ContextError.BrowserSupport, `This page requires a browser that supports WebGL.<br/>
			<a href="http://get.webgl.org">Click here to upgrade your browser.</a>`);
			return null;
		}
		const context: WebGLRenderingContext | WebGL2RenderingContext = Context.inferContext(vertexString, fragmentString, canvas, attributes);
		if (!context) {
			handleError(ContextError.Other, `It does not appear your computer can support WebGL.<br/>
			<a href="http://get.webgl.org/troubleshooting/">Click here for more information.</a>`);
		} else {
			if (!(this.isWebGl2(context)) && extensions.indexOf('OES_standard_derivatives') === -1) {
				extensions.push('OES_standard_derivatives');
			}
			const supportedExtensions = context.getSupportedExtensions();
			extensions.forEach(key => {
				if (supportedExtensions.indexOf(key) !== -1) {
					context.getExtension(key);
				} else {
					Logger.warn(`GlslCanvas ${key} not supported`);
				}
			});
			// context.getExtension('OES_standard_derivatives');
		}
		return context;
	}

	static tryGetContext(canvas: HTMLCanvasElement, attributes: WebGLContextAttributes, errorCallback: Function): WebGLRenderingContext {
		function handleError(errorCode: number, html: string) {
			if (typeof errorCallback === 'function') {
				errorCallback(errorCode);
			} else {
				const container = canvas.parentNode;
				if (container) {
					(container as HTMLElement).innerHTML = `<div class="glsl-canvas--error">${html}</div>`;
				}
			}
		}
		if (!WebGLRenderingContext) {
			handleError(ContextError.BrowserSupport, `This page requires a browser that supports WebGL.<br/>
			<a href="http://get.webgl.org">Click here to upgrade your browser.</a>`);
			return null;
		}
		const context: WebGLRenderingContext = Context.getContext_(canvas, attributes);
		if (!context) {
			handleError(ContextError.Other, `It does not appear your computer can support WebGL.<br/>
			<a href="http://get.webgl.org/troubleshooting/">Click here for more information.</a>`);
		} else {
			context.getExtension('OES_standard_derivatives');
		}
		return context;
	}

	static inferContext(vertexString: string, fragmentString: string, canvas: HTMLCanvasElement, options?: WebGLContextAttributes): WebGLRenderingContext | WebGL2RenderingContext {
		const version: ContextVersion = this.inferVersion(vertexString, fragmentString);
		return version === ContextVersion.WebGl2 ? this.getContext2_(canvas, options) : this.getContext_(canvas, options);
	}

	static createShader(gl: WebGLRenderingContext | WebGL2RenderingContext, source: string, type: number, offset: number = 0): WebGLShader {
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

	static createProgram(gl: WebGLRenderingContext | WebGL2RenderingContext, shaders: WebGLShader[], attributes?: any[], locations?: number[]): WebGLProgram {
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

	static createVertexBuffers(gl: WebGLRenderingContext | WebGL2RenderingContext, program: WebGLProgram): ContextVertexBuffers {
		const vertexBuffers: ContextVertexBuffers = new ContextVertexBuffers();
		const texcoordIndex: number = gl.getAttribLocation(program, 'a_texcoord');
		vertexBuffers.texcoord = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers.texcoord);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0]), gl.STATIC_DRAW);
		gl.enableVertexAttribArray(texcoordIndex);
		gl.vertexAttribPointer(texcoordIndex, 2, gl.FLOAT, false, 0, 0);
		const positionIndex: number = gl.getAttribLocation(program, 'a_position');
		vertexBuffers.position = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers.position);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0]), gl.STATIC_DRAW);
		gl.enableVertexAttribArray(positionIndex);
		gl.vertexAttribPointer(positionIndex, 2, gl.FLOAT, false, 0, 0);
		return vertexBuffers;
	}
}
