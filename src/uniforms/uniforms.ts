
import IterableStringMap from '../core/iterable';
import Logger from '../logger/logger';
import { Texture } from '../textures/textures';

export enum UniformMethod {
	Unknown = 0,
	Uniform1i = 'uniform1i', // (intUniformLoc,   v);                 // for int
	// Uniform1i  = 'uniform1i', // (boolUniformLoc,   v);                // for bool
	// Uniform1i  = 'uniform1i', // (sampler2DUniformLoc,   v);           // for sampler2D
	// Uniform1i  = 'uniform1i', // (samplerCubeUniformLoc,   v);         // for samplerCube
	Uniform2i = 'uniform2i', // (ivec2UniformLoc, v0, v1);            // for ivec2
	Uniform3i = 'uniform3i', // (ivec3UniformLoc, v0, v1, v2);        // for ivec3
	Uniform4i = 'uniform4i', // (ivec4UniformLoc, v0, v1, v2, v4);    // for ivec4
	Uniform1f = 'uniform1f', // (floatUniformLoc, v);                 // for float
	Uniform2f = 'uniform2f', // (vec2UniformLoc,  v0, v1);            // for vec2
	Uniform3f = 'uniform3f', // (vec3UniformLoc,  v0, v1, v2);        // for vec3
	Uniform4f = 'uniform4f', // (vec4UniformLoc,  v0, v1, v2, v4);    // for vec4
	//
	Uniform1iv = 'uniform1iv', // (intUniformLoc, [v]);                 // for int or int array
	// Uniform1iv = 'uniform1iv', // (boolUniformLoc, [v]);                // for bool or bool array
	// Uniform1iv = 'uniform1iv', // (sampler2DUniformLoc, [v]);           // for sampler2D or sampler2D array
	// Uniform1iv = 'uniform1iv', // (samplerCubeUniformLoc, [v]);         // for samplerCube or samplerCube array
	Uniform2iv = 'uniform2iv', // (ivec2UniformLoc, [v0, v1]);          // for ivec2 or ivec2 array
	Uniform3iv = 'uniform3iv', // (ivec3UniformLoc, [v0, v1, v2]);      // for ivec3 or ivec3 array
	Uniform4iv = 'uniform4iv', // (ivec4UniformLoc, [v0, v1, v2, v4]);  // for ivec4 or ivec4 array
	//
	Uniform1fv = 'uniform1fv', // (floatUniformLoc, [v]);               // for float or float array
	Uniform2fv = 'uniform2fv', // (vec2UniformLoc,  [v0, v1]);          // for vec2 or vec2 array
	Uniform3fv = 'uniform3fv', // (vec3UniformLoc,  [v0, v1, v2]);      // for vec3 or vec3 array
	Uniform4fv = 'uniform4fv', // (vec4UniformLoc,  [v0, v1, v2, v4]);  // for vec4 or vec4 array
	//
	UniformMatrix2fv = 'uniformMatrix2fv', // (mat2UniformLoc, false, [  4x element array ])  // for mat2 or mat2 array
	UniformMatrix3fv = 'uniformMatrix3fv', // (mat3UniformLoc, false, [  9x element array ])  // for mat3 or mat3 array
	UniformMatrix4fv = 'uniformMatrix4fv', // (mat4UniformLoc, false, [ 16x element array ])  // for mat4 or mat4 array
}

export enum UniformType {
	Unknown = 0,
	Float,
	Int,
	Bool,
	Sampler2D,
	SamplerCube,
	Matrix2fv,
	Matrix3fv,
	Matrix4fv,
}

export const METHODS_INT = [UniformMethod.Uniform1i, UniformMethod.Uniform2i, UniformMethod.Uniform3i, UniformMethod.Uniform4i];
export const METHODS_FLOAT = [UniformMethod.Uniform1f, UniformMethod.Uniform2f, UniformMethod.Uniform3f, UniformMethod.Uniform4f];
export const METHODS_INTV = [UniformMethod.Uniform1iv, UniformMethod.Uniform2iv, UniformMethod.Uniform3iv, UniformMethod.Uniform4iv];
export const METHODS_FLOATV = [UniformMethod.Uniform1fv, UniformMethod.Uniform2fv, UniformMethod.Uniform3fv, UniformMethod.Uniform4fv];

export interface IUniformOption { [key: string]: any[]; }

export class Uniform {
	method: UniformMethod;
	type: UniformType;
	key: string;
	values: any[];
	location?: WebGLUniformLocation;
	dirty?: boolean = true;
	apply?: Function;

	constructor(options?: Uniform) {
		if (options) {
			Object.assign(this, options);
		}
		switch (this.method) {
			case UniformMethod.UniformMatrix2fv:
			case UniformMethod.UniformMatrix3fv:
			case UniformMethod.UniformMatrix4fv:
				this.apply = (gl: WebGLRenderingContext | WebGL2RenderingContext, program: WebGLProgram) => {
					if (this.dirty) {
						gl.useProgram(program);
						const location = gl.getUniformLocation(program, this.key);
						// Logger.log(this.key, this.method, this.values);
						// (gl as any)[this.method].apply(gl, [location].concat(this.values));
						(gl as any)[this.method].apply(gl, [location, false].concat(this.values));
					}
				}
				break;
			case UniformMethod.Uniform1fv:
				this.apply = (gl: WebGLRenderingContext | WebGL2RenderingContext, program: WebGLProgram) => {
					if (this.dirty) {
						gl.useProgram(program);
						const location = gl.getUniformLocation(program, this.key);
						(gl as any)[this.method].apply(gl, [location].concat([this.values]));
					}
				}
				break;
			default:
				this.apply = (gl: WebGLRenderingContext | WebGL2RenderingContext, program: WebGLProgram) => {
					if (this.dirty) {
						gl.useProgram(program);
						const location = gl.getUniformLocation(program, this.key);
						// Logger.log(this.key, this.method, this.values);
						// (gl as any)[this.method].apply(gl, [location].concat(this.values));
						(gl as any)[this.method].apply(gl, [location].concat(this.values));
					}
				}
		}
	}

}

export class UniformTexture extends Uniform {

	texture: Texture;

	constructor(options?: Uniform) {
		super(options);
	}

}

export default class Uniforms extends IterableStringMap<Uniform> {

	dirty: boolean = false;

	static isArrayOfInteger(array: any[]): boolean {
		return array.reduce((flag: boolean, value: any) => {
			return flag && Number.isInteger(value);
		}, true);
	}

	static isArrayOfNumber(array: any[]): boolean {
		return array.reduce((flag: boolean, value: any) => {
			return flag && typeof value === 'number';
		}, true);
	}

	static isArrayOfBoolean(array: any[]): boolean {
		return array.reduce((flag: boolean, value: any) => {
			return flag && typeof value === 'boolean';
		}, true);
	}

	static isArrayOfTexture(array: any[]): boolean {
		return array.reduce((flag: boolean, value: any) => {
			return flag && Texture.isTexture(value);
		}, true);
	}

	static isArrayOfSampler2D(array: Uniform[]): boolean {
		return array.reduce((flag: boolean, value: Uniform) => {
			return flag && value.type === UniformType.Sampler2D;
		}, true);
	}

	private static getType_(
		values: any[],
	): UniformType {
		let type = UniformType.Unknown;
		const isVector = values.length === 1 && Array.isArray(values[0]);
		const subject = isVector ? values[0] : values;
		if (Uniforms.isArrayOfNumber(subject)) {
			type = UniformType.Float;
		} else if (Uniforms.isArrayOfBoolean(subject)) {
			type = UniformType.Bool;
		} else if (Uniforms.isArrayOfTexture(subject)) {
			type = UniformType.Sampler2D;
		}
		return type;
	}

	private static getMethod_(
		type: UniformType,
		values: any[],
	): UniformMethod {
		let method = UniformMethod.Unknown;
		const isVector = values.length === 1 && Array.isArray(values[0]);
		const subject = isVector ? values[0] : values;
		const length = subject.length;
		const i = length - 1;
		switch (type) {
			case UniformType.Float:
				if (isVector) {
					method = i < METHODS_FLOATV.length ? METHODS_FLOATV[i] : UniformMethod.Unknown;
				} else {
					method = i < METHODS_FLOAT.length ? METHODS_FLOAT[i] : UniformMethod.Uniform1fv;
				}
				break;
			case UniformType.Int:
			case UniformType.Bool:
				if (isVector) {
					method = i < METHODS_INTV.length ? METHODS_INTV[i] : UniformMethod.Unknown;
				} else {
					method = i < METHODS_INT.length ? METHODS_INT[i] : UniformMethod.Uniform1iv;
				}
				break;
			case UniformType.Sampler2D:
				if (isVector) {
					method = UniformMethod.Uniform1iv;
				} else {
					method = length === 1 ? UniformMethod.Uniform1i : UniformMethod.Uniform1iv;
				}
				break;
		}
		return method;
	}

	static parseUniform(
		key: string,
		values: any[],
		type: UniformType = null
	): Uniform | Uniform[] {
		let uniform: Uniform;
		type = type || Uniforms.getType_(values);
		const method = Uniforms.getMethod_(type, values);
		if (type !== UniformType.Unknown && method !== UniformMethod.Unknown) {
			// Logger.log('Uniforms.parseUniform', key, UniformType[type], method, values);
			if (type === UniformType.Sampler2D && method === UniformMethod.Uniform1iv) {
				return values[0].map((texture: any, index: number) => {
					return new Uniform({
						method: method,
						type: type,
						key: `${key}[${index}]`, // `${key.split('[')[0]}[${index}]`,
						values: [texture]
					});
				});
			} else {
				uniform = new Uniform({
					method: method,
					type: type,
					key: key,
					values: values
				});
			}
		} else {
			Logger.error('Uniforms.parseUniform.Unknown', key, values);
		}
		// return this.parseUniform__bak(key, values);
		return uniform;
	}

	create(method: UniformMethod, type: UniformType, key: string, values: any[]): Uniform {
		const uniform = new Uniform({
			method: method,
			type: type,
			key: key,
			values: values,
		});
		this.set(key, uniform);
		this.dirty = true;
		return uniform;
	}

	createTexture(key: string, index: number): UniformTexture {
		let uniform;
		if (key.indexOf(']') !== -1) {
			uniform = new UniformTexture({
				method: UniformMethod.Uniform1iv,
				type: UniformType.Sampler2D,
				key: key,
				values: [[index]],
			});
		} else {
			uniform = new UniformTexture({
				method: UniformMethod.Uniform1i,
				type: UniformType.Sampler2D,
				key: key,
				values: [index],
			});
		}
		this.set(key, uniform);
		this.dirty = true;
		return uniform;
	}

	update(method: UniformMethod, type: UniformType, key: string, values: any[]) {
		const uniform = this.get(key);
		if (uniform) {
			// !!! consider performance
			// && (uniform.method !== method || uniform.type !== type || Uniforms.isDifferent(uniform.values, values))) {
			uniform.method = method;
			uniform.type = type;
			uniform.values = values;
			uniform.dirty = true;
			this.dirty = true;
		}
	}

	createOrUpdate(method: UniformMethod, type: UniformType, key: string, values: any[]) {
		if (this.has(key)) {
			this.update(method, type, key, values);
		} else {
			this.create(method, type, key, values);
		}
	}

	apply(gl: WebGLRenderingContext | WebGL2RenderingContext, program: WebGLProgram) {
		gl.useProgram(program);
		Object.keys(this.values).forEach((key) => {
			// if (typeof this.values[key].apply === 'function') {
			this.values[key].apply(gl, program);
			// }
		});
		// this.forEach(uniform => uniform.apply(gl, program));
	}

	clean() {
		Object.keys(this.values).forEach((key) => {
			this.values[key].dirty = false;
		});
		this.dirty = false;
	}

	/*
	// slow
	static isDifferent(a: any, b: any): boolean {
        return JSON.stringify(a) !== JSON.stringify(b);
    }
	*/

	static isDifferent(a: any[], b: any[]) {
		return a.length !== b.length || a.reduce((f: boolean, v: any, i: number) => {
			return f || v !== b[i];
		}, false);
	}

}
