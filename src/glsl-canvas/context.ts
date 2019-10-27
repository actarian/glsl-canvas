import Common from './common';
import Logger from './logger';

export const ContextDefaultVertex = `
#ifdef GL_ES
precision mediump float;
#endif

attribute vec2 a_position;
attribute vec2 a_texcoord;

varying vec2 v_texcoord;

void main(){
	gl_Position = vec4(a_position, 0.0, 1.0);
	v_texcoord = a_texcoord;
}
`;

export const ContextDefaultFragment = `
#ifdef GL_ES
precision mediump float;
#endif

void main(){
	gl_FragColor = vec4(0.0);
}
`;

export const ContextDefaultVertex2 = `#version 300 es

in vec2 a_position;
in vec2 a_texcoord;

out vec2 v_texcoord;

void main() {
	gl_Position = vec4(a_position, 0.0, 1.0);
	v_texcoord = a_texcoord;
}
`;

export const ContextDefaultFragment2 = `#version 300 es

precision mediump float;

out vec4 outColor;

void main() {
	outColor = vec4(0.0);
}
`;

export class ContextOptions {
	alpha?: GLboolean;
	antialias?: GLboolean;
	depth?: GLboolean;
	failIfMajorPerformanceCaveat?: boolean;
	// powerPreference?: WebGLPowerPreference;
	premultipliedAlpha?: GLboolean;
	preserveDrawingBuffer?: GLboolean;
	stencil?: GLboolean;
}

export enum ContextVersion {
	WebGl = 1,
	WebGl2 = 2,
}

export enum ContextError {
	BrowserSupport = 1,
	Other = 2,
}

export class ContextVertexBuffers {
	texcoord: WebGLBuffer;
	position: WebGLBuffer;
}

export default class Context {

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

	static getIncludes(input: string | undefined): Promise<string | undefined> {
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

	static versionDiffers(gl: WebGLRenderingContext | WebGL2RenderingContext, vertexString?: string, fragmentString?: string): boolean {
		if (gl) {
			const currentVersion = this.isWebGl2(gl) ? ContextVersion.WebGl2 : ContextVersion.WebGl;
			const newVersion = Context.inferVersion(vertexString, fragmentString);
			return newVersion !== currentVersion;
		} else {
			return false;
		}
	}

	static getVertex(vertexString?: string, fragmentString?: string): string {
		if (vertexString) {
			return vertexString;
		} else {
			const version: ContextVersion = this.inferVersion(vertexString, fragmentString);
			return version === ContextVersion.WebGl2 ? ContextDefaultVertex2 : ContextDefaultVertex;
		}
	}

	static getFragment(vertexString?: string, fragmentString?: string): string {
		if (fragmentString) {
			return fragmentString;
		} else {
			const version: ContextVersion = this.inferVersion(vertexString, fragmentString);
			return version === ContextVersion.WebGl2 ? ContextDefaultFragment2 : ContextDefaultFragment;
		}
	}

	static tryInferContext(vertexString: string, fragmentString: string, canvas: HTMLCanvasElement, attributes: WebGLContextAttributes, errorCallback: Function): WebGLRenderingContext | WebGL2RenderingContext {
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
			return;
		}
		const context: WebGLRenderingContext | WebGL2RenderingContext = Context.inferContext(vertexString, fragmentString, canvas, attributes);
		if (!context) {
			handleError(ContextError.Other, `It does not appear your computer can support WebGL.<br/>
			<a href="http://get.webgl.org/troubleshooting/">Click here for more information.</a>`);
		} else {
			if (!(this.isWebGl2(context))) {
				context.getExtension('OES_standard_derivatives');
			}
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
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
		if (!compiled) {
			// Something went wrong during compilation; get the error
			Context.lastError = gl.getShaderInfoLog(shader);
			// console.log('lastError', Context.lastError);
			Logger.error('*** Error compiling shader ' + shader + ':' + Context.lastError);
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
		// Check the link status
		const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
		if (!linked) {
			// something went wrong with the link
			Context.lastError = gl.getProgramInfoLog(program);
			Logger.log('Error in program linking:' + Context.lastError);
			gl.deleteProgram(program);
			return null;
		}
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
