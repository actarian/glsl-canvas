
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

varying vec2 v_texcoord;

void main(){
	gl_FragColor = vec4(0.0);
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
		const context: WebGLRenderingContext = Context.getContext(canvas, attributes);
		if (!context) {
			handleError(ContextError.Other, `It does not appear your computer can support WebGL.<br/>
			<a href="http://get.webgl.org/troubleshooting/">Click here for more information.</a>`);
		} else {
			context.getExtension('OES_standard_derivatives');
		}
		return context;
	}

	static getContext(canvas: HTMLCanvasElement, options?: WebGLContextAttributes): WebGLRenderingContext {
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

	static createShader(gl: WebGLRenderingContext, source: string, type: number, offset: number = 0): WebGLShader {
		const shader = gl.createShader(type);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
		if (!compiled) {
			// Something went wrong during compilation; get the error
			Context.lastError = gl.getShaderInfoLog(shader);
			console.error('*** Error compiling shader ' + shader + ':' + Context.lastError);
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

	static createProgram(gl: WebGLRenderingContext, shaders: WebGLShader[], attributes?: any[], locations?: number[]): WebGLProgram {
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
			console.log('Error in program linking:' + Context.lastError);
			gl.deleteProgram(program);
			return null;
		}
		return program;
	}

	static createVertexBuffers(gl: WebGLRenderingContext, program: WebGLProgram): ContextVertexBuffers {
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
