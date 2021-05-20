import { DefaultWebGL2BufferFragment, DefaultWebGLBufferFragment } from '../context/chunks';
import Context from '../context/context';
import IterableStringMap from '../core/iterable';
import FlatGeometry from '../geometry/flat-geometry';
import Geometry from '../geometry/geometry';

export enum BufferFloatType {
	FLOAT = 0,
	HALF_FLOAT,
}

export class Buffer {

	texture: WebGLTexture;
	buffer: WebGLFramebuffer;
	BW: number;
	BH: number;
	index: number;

	static type: BufferFloatType = BufferFloatType.HALF_FLOAT;

	static getFloatType(gl: WebGLRenderingContext | WebGL2RenderingContext): number | null {
		let extension: any;
		if (Context.isWebGl2(gl)) {
			extension = gl.getExtension('EXT_color_buffer_float');
			if (extension) {
				return gl.FLOAT;
			}
		}
		extension = gl.getExtension('OES_texture_float');
		if (extension) {
			return gl.FLOAT;
		}
		return null;
	}

	static getHalfFloatType(gl: WebGLRenderingContext | WebGL2RenderingContext): number | null {
		let extension: any;
		if (Context.isWebGl2(gl)) {
			extension = gl.getExtension('EXT_color_buffer_half_float') || gl.getExtension('EXT_color_buffer_float');
			if (extension) {
				return (gl as WebGL2RenderingContext).HALF_FLOAT;
			}
		}
		extension = gl.getExtension('OES_texture_half_float');
		if (extension) {
			return extension.HALF_FLOAT_OES || null;
		}
		return null;
	}

	static getInternalFormat(gl: WebGLRenderingContext | WebGL2RenderingContext): number {
		return (Context.isWebGl2(gl) ? (gl as WebGL2RenderingContext).RGBA16F : gl.RGBA);
	}

	static getType(gl: WebGLRenderingContext | WebGL2RenderingContext): number {
		let type: number;
		if (Buffer.type === BufferFloatType.HALF_FLOAT) {
			type = Buffer.getHalfFloatType(gl);
			if (type) {
				return type;
			} else {
				Buffer.type = BufferFloatType.FLOAT;
				return Buffer.getType(gl);
			}
		} else {
			type = Buffer.getFloatType(gl);
			if (type) {
				return type;
			} else {
				Buffer.type = BufferFloatType.HALF_FLOAT;
				return Buffer.getType(gl);
			}
		}
	}

	static getTexture(gl: WebGLRenderingContext | WebGL2RenderingContext, BW: number, BH: number, index: number): WebGLTexture {
		const internalFormat = Buffer.getInternalFormat(gl);
		const format = gl.RGBA;
		const type = Buffer.getType(gl);
		const texture = gl.createTexture();
		gl.activeTexture(gl.TEXTURE0 + index);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, BW, BH, 0, format, type, null);
		const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
		if (status !== gl.FRAMEBUFFER_COMPLETE) {
			if (Buffer.type === BufferFloatType.FLOAT) {
				Buffer.type = BufferFloatType.HALF_FLOAT;
			} else {
				Buffer.type = BufferFloatType.FLOAT;
			}
			return Buffer.getTexture(gl, BW, BH, index);
		}
		// console.log('getTexture', 'internalFormat', internalFormat === (gl as WebGL2RenderingContext).RGBA16F, 'format', format === gl.RGBA, 'type', type === (gl as WebGL2RenderingContext).HALF_FLOAT, 'status', status === gl.FRAMEBUFFER_COMPLETE);
		return texture;
	}

	constructor(gl: WebGLRenderingContext | WebGL2RenderingContext, BW: number, BH: number, index: number) {
		const buffer = gl.createFramebuffer();
		const texture = Buffer.getTexture(gl, BW, BH, index);
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

	resize(gl: WebGLRenderingContext | WebGL2RenderingContext, BW: number, BH: number) {
		if (BW !== this.BW || BH !== this.BH) {
			const buffer = this.buffer;
			const texture = this.texture;
			const index = this.index;
			gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
			const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
			const minW = Math.min(BW, this.BW);
			const minH = Math.min(BH, this.BH);
			let pixels: Float32Array;
			let type = Buffer.getType(gl);
			if (status === gl.FRAMEBUFFER_COMPLETE) {
				pixels = new Float32Array(minW * minH * 4);
				gl.readPixels(0, 0, minW, minH, gl.RGBA, type, pixels);
			}
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			const newIndex = index + 1; // temporary index
			const newTexture = Buffer.getTexture(gl, BW, BH, newIndex);
			type = Buffer.getType(gl);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			if (pixels) {
				gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, minW, minH, gl.RGBA, type, pixels);
			}
			const newBuffer = gl.createFramebuffer();
			/*
			if (!newBuffer) {
				Logger.error('Failed to create the frame buffer object');
				return null;
			}
			*/
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			gl.deleteTexture(texture);
			gl.activeTexture(gl.TEXTURE0 + index);
			gl.bindTexture(gl.TEXTURE_2D, newTexture);
			this.index = index;
			this.texture = newTexture;
			this.buffer = newBuffer;
			this.BW = BW;
			this.BH = BH;
			// console.log('resize', newBuffer);
		}
	}
}

export class IOBuffer {

	program: WebGLProgram;
	geometry: Geometry;
	input: Buffer;
	output: Buffer;
	index: number;
	key: string;
	vertexString: string;
	fragmentString: string;
	BW: number;
	BH: number;
	isValid: boolean = false;

	constructor(index: number, key: string, vertexString: string, fragmentString: string) {
		this.index = index;
		this.key = key;
		this.vertexString = vertexString;
		this.fragmentString = fragmentString;
		this.geometry = new FlatGeometry();
	}

	create(gl: WebGLRenderingContext | WebGL2RenderingContext, BW: number, BH: number) {
		// BW = BH = 1024;
		const vertexShader = Context.createShader(gl, this.vertexString, gl.VERTEX_SHADER);
		let fragmentShader = Context.createShader(gl, this.fragmentString, gl.FRAGMENT_SHADER, 1);
		if (!fragmentShader) {
			fragmentShader = Context.createShader(gl, Context.isWebGl2(gl) ? DefaultWebGL2BufferFragment : DefaultWebGLBufferFragment, gl.FRAGMENT_SHADER);
			this.isValid = false;
		} else {
			this.isValid = true;
		}
		const program = Context.createProgram(gl, [vertexShader, fragmentShader]);
		if (!program) {
			this.isValid = false;
			gl.deleteShader(vertexShader);
			gl.deleteShader(fragmentShader);
			return;
		}
		this.geometry.create(gl, program);
		gl.deleteShader(vertexShader);
		gl.deleteShader(fragmentShader);
		const input = new Buffer(gl, BW, BH, this.index + 0);
		const output = new Buffer(gl, BW, BH, this.index + 2);
		this.program = program;
		this.input = input;
		this.output = output;
		// console.log(geometry.position.length / 3, geometry.size);
		// console.log(gl.getProgramInfoLog(program));
		// Context.lastError = gl.getProgramInfoLog(program);
		// Logger.warn(`Error in program linking: ${Context.lastError}`);
	}

	render(gl: WebGLRenderingContext | WebGL2RenderingContext, BW: number, BH: number) {
		// BW = BH = 1024;
		gl.useProgram(this.program);
		// gl.activeTexture(gl.TEXTURE0);
		// gl.bindTexture(gl.TEXTURE_2D, this.input.texture);
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.output.buffer);
		// gl.bindTexture(gl.TEXTURE_2D, this.output.texture);
		// console.log(this.output.texture);
		// console.log('binding', gl.getParameter(gl.FRAMEBUFFER_BINDING));
		// gl.enable(gl.DEPTH_TEST); // Enable depth testing
		// gl.depthFunc(gl.LEQUAL); // Near things obscure far things
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.output.texture, 0);
		const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
		if (status === gl.FRAMEBUFFER_COMPLETE) {
			// Clear the canvas before we start drawing on it.
			gl.clearColor(0, 0, 0, 1);  // black
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		}
		// this.geometry.createAttributes_(gl, this.program);
		// this.geometry.bindAttributes_(gl, this.program);
		gl.viewport(0, 0, BW, BH);
		gl.drawArrays(gl.TRIANGLES, 0, this.geometry.size);
		// console.log(this.geometry.size);
		// gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		// console.log(BW, BH);
		// console.log(gl.getProgramInfoLog(this.program));
		// swap
		const input = this.input;
		// const output = this.output;
		this.input = this.output;
		this.output = input;
		// console.log('swap');
	}

	resize(gl: WebGLRenderingContext | WebGL2RenderingContext, BW: number, BH: number) {
		// BW = BH = 1024;
		gl.useProgram(this.program);
		gl.viewport(0, 0, BW, BH);
		this.input.resize(gl, BW, BH);
		this.output.resize(gl, BW, BH);
	}

	destroy(gl: WebGLRenderingContext | WebGL2RenderingContext) {
		gl.deleteProgram(this.program);
		this.program = null;
		this.input = null;
		this.output = null;
	}
}

export default class Buffers extends IterableStringMap<IOBuffer> {

	get count(): number {
		return Object.keys(this.values).length * 4;
	}

	static getBuffers(gl: WebGLRenderingContext | WebGL2RenderingContext, fragmentString: string, vertexString: string): Buffers {
		const buffers: Buffers = new Buffers();
		let count = 0;
		if (fragmentString) {
			if (Context.isWebGl2(gl)) {
				fragmentString = fragmentString.replace(/^\#version\s*300\s*es\s*\n/, '');
			}
			const regexp = /(?:^\s*)((?:#if|#elif)(?:\s*)(defined\s*\(\s*BUFFER_)(\d+)(?:\s*\))|(?:#ifdef)(?:\s*BUFFER_)(\d+)(?:\s*))/gm;
			let matches;
			while ((matches = regexp.exec(fragmentString)) !== null) {
				const i = matches[3] || matches[4];
				const key = 'u_buffer' + i;
				const bufferFragmentString = Context.isWebGl2(gl) ? `#version 300 es
#define BUFFER_${i}
${fragmentString}` : `#define BUFFER_${i}
${fragmentString}`;
				const buffer = new IOBuffer(count, key, vertexString, bufferFragmentString);
				buffer.create(gl, gl.drawingBufferWidth, gl.drawingBufferHeight);
				if (buffer.program) {
					buffers.set(key, buffer);
				} else {
					throw (`buffer error ${key}`);
				}
				count += 4;
			}
		}
		return buffers;
	}
}
