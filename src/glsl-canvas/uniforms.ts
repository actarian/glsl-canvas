
import IterableStringMap from './iterable';
import { Texture } from './textures';

export interface IUniformOption { [key: string]: any[]; }

export enum UniformMethod {
    Uniform1i = 'uniform1i', // (intUniformLoc,   v);                 // for int
    // Uniform1i  = 'uniform1i', // (boolUniformLoc,   v);                // for bool
    // Uniform1i  = 'uniform1i', // (sampler2DUniformLoc,   v);           // for sampler2D
    // Uniform1i  = 'uniform1i', // (samplerCubeUniformLoc,   v);         // for samplerCube
    Uniform1iv = 'uniform1iv', // (intUniformLoc, [v]);                 // for int or int array
    // Uniform1iv = 'uniform1iv', // (boolUniformLoc, [v]);                // for bool or bool array
    // Uniform1iv = 'uniform1iv', // (sampler2DUniformLoc, [v]);           // for sampler2D or sampler2D array
    // Uniform1iv = 'uniform1iv', // (samplerCubeUniformLoc, [v]);         // for samplerCube or samplerCube array
    Uniform2i = 'uniform2i', // (ivec2UniformLoc, v0, v1);            // for ivec2
    Uniform2iv = 'uniform2iv', // (ivec2UniformLoc, [v0, v1]);          // for ivec2 or ivec2 array
    Uniform3i = 'uniform3i', // (ivec3UniformLoc, v0, v1, v2);        // for ivec3
    Uniform3iv = 'uniform3iv', // (ivec3UniformLoc, [v0, v1, v2]);      // for ivec3 or ivec3 array
    Uniform4i = 'uniform4i', // (ivec4UniformLoc, v0, v1, v2, v4);    // for ivec4
    Uniform4iv = 'uniform4iv', // (ivec4UniformLoc, [v0, v1, v2, v4]);  // for ivec4 or ivec4 array
    //
    Uniform1f = 'uniform1f', // (floatUniformLoc, v);                 // for float
    Uniform1fv = 'uniform1fv', // (floatUniformLoc, [v]);               // for float or float array
    Uniform2f = 'uniform2f', // (vec2UniformLoc,  v0, v1);            // for vec2
    Uniform2fv = 'uniform2fv', // (vec2UniformLoc,  [v0, v1]);          // for vec2 or vec2 array
    Uniform3f = 'uniform3f', // (vec3UniformLoc,  v0, v1, v2);        // for vec3
    Uniform3fv = 'uniform3fv', // (vec3UniformLoc,  [v0, v1, v2]);      // for vec3 or vec3 array
    Uniform4f = 'uniform4f', // (vec4UniformLoc,  v0, v1, v2, v4);    // for vec4
    Uniform4fv = 'uniform4fv', // (vec4UniformLoc,  [v0, v1, v2, v4]);  // for vec4 or vec4 array
    //
    UniformMatrix2fv = 'uniformMatrix2fv', // (mat2UniformLoc, false, [  4x element array ])  // for mat2 or mat2 array
    UniformMatrix3fv = 'uniformMatrix3fv', // (mat3UniformLoc, false, [  9x element array ])  // for mat3 or mat3 array
    UniformMatrix4fv = 'uniformMatrix4fv', // (mat4UniformLoc, false, [ 16x element array ])  // for mat4 or mat4 array
}

export enum UniformType {
    Bool = 0,
    BoolArray,
    Int,
    IntArray,
    IntVec2,
    IntVec2Array,
    IntVec3,
    IntVec3Array,
    IntVec4,
    IntVec4Array,
    Float,
    FloatArray,
    FloatVec2,
    FloatVec2Array,
    FloatVec3,
    FloatVec3Array,
    FloatVec4,
    FloatVec4Array,
    Sampler2D,
    Sampler2DArray,
    SamplerCube,
    SamplerCubeArray,
    Matrix2fv,
    Matrix3fv,
    Matrix4fv,
}

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
        this.apply = (gl: WebGLRenderingContext, program: WebGLProgram) => {
            if (this.dirty) {
                gl.useProgram(program);
                const location = gl.getUniformLocation(program, this.key);
                // console.log(this.key, this.method, this.values);
                // (gl as any)[this.method].apply(gl, [location].concat(this.values));
                (gl as any)[this.method].apply(gl, [location].concat(this.values));
            }
        }
    }

    static isDifferent(a: any, b: any): boolean {
        if (a && b) {
            return a.toString() !== b.toString();
        }
        return false;
    }

	/*
	set?(gl: WebGLRenderingContext, program: WebGLProgram, ...values: any) {
		let dirty = false;
		// remember and keep track of uniforms location to save calls
		if (!this.location || !this.values || Uniform.isDifferent(this.values, values)) {
			dirty = true;
		}
		return dirty;
	}
	*/

}

export class UniformTexture extends Uniform {

    texture: Texture;

    constructor(options?: Uniform) {
        super(options);
    }

}

export default class Uniforms extends IterableStringMap<Uniform> {

    dirty: boolean = false;

    static isArrayOfNumbers(array: any[]): boolean {
        return array.reduce((flag: boolean, value: any) => {
            return flag && typeof value === 'number';
        }, true)
    }

    static parseUniform(key: string, ...values: any[]): Uniform {
        const value = values.length === 1 ? values[0] : values;
        let uniform: Uniform;
        // console.log(key, value);
        // Single float
        if (typeof value === 'number') {
            uniform = new Uniform({
                method: UniformMethod.Uniform1f,
                type: UniformType.Float,
                key: key,
                values: [value]
            });
        } else if (typeof value === 'boolean') {
            // Boolean
            uniform = new Uniform({
                method: UniformMethod.Uniform1i,
                type: UniformType.Bool,
                key: key,
                values: [value]
            });
        } else if (Texture.isTexture(value)) {
            // Texture
            uniform = new Uniform({
                method: UniformMethod.Uniform1i,
                type: UniformType.Sampler2D,
                key: key,
                values: value // !!!
            });
        } else if (Array.isArray(value)) {
            // Array: vector, array of floats, array of textures, or array of structs
            // Numeric values
            if (Uniforms.isArrayOfNumbers(value)) {
                switch (value.length) {
                    case 1:
                        uniform = new Uniform({
                            method: UniformMethod.Uniform1f,
                            type: UniformType.Float,
                            key: key,
                            values: value
                        });
                        break;
                    case 2:
                        uniform = new Uniform({
                            method: UniformMethod.Uniform2f,
                            type: UniformType.FloatVec2,
                            key: key,
                            values: value
                        });
                        break;
                    case 3:
                        uniform = new Uniform({
                            method: UniformMethod.Uniform3f,
                            type: UniformType.FloatVec3,
                            key: key,
                            values: value
                        });
                        break;
                    case 4:
                        uniform = new Uniform({
                            method: UniformMethod.Uniform4f,
                            type: UniformType.FloatVec4,
                            key: key,
                            values: value
                        });
                        break;
                    default:
                        // float array
                        uniform = new Uniform({
                            method: UniformMethod.Uniform1fv,
                            type: UniformType.FloatArray,
                            key: key,
                            values: value
                        });
                }
                // TODO: assume matrix for (typeof == Float32Array && length == 16)?
            } else if (Texture.getTextureOptions(value[0])) {
                // Array of textures
                uniform = new Uniform({
                    method: UniformMethod.Uniform1iv,
                    type: UniformType.Sampler2D,
                    key: key,
                    values: value
                });
            } else if (Array.isArray(value[0]) && typeof value[0][0] === 'number') {
                // Array of arrays - but only arrays of vectors are allowed in this case
                // float vectors (vec2, vec3, vec4)
                if (value[0].length >= 2 && value[0].length <= 4) {
                    // Set each vector in the array
                    for (let u = 0; u < value.length; u++) {
                        switch (value.length) {
                            case 2:
                                uniform = new Uniform({
                                    method: UniformMethod.Uniform2fv,
                                    type: UniformType.FloatVec2,
                                    key: key + '[' + u + ']',
                                    values: value
                                });
                                break;
                            case 3:
                                uniform = new Uniform({
                                    method: UniformMethod.Uniform3fv,
                                    type: UniformType.FloatVec3,
                                    key: key + '[' + u + ']',
                                    values: value
                                });
                                break;
                            case 4:
                                uniform = new Uniform({
                                    method: UniformMethod.Uniform4fv,
                                    type: UniformType.FloatVec4,
                                    key: key + '[' + u + ']',
                                    values: value
                                });
                                break;
                        }
                    }
                }
                // else error?
            } else if (typeof value[0] === 'object') {
                // Array of structures
                for (let u = 0; u < value.length; u++) {
                    // Set each struct in the array
                    // !!! uniform = new Uniform(...Uniforms.parseUniforms(value[u], key + '[' + u + ']'));
                }
            }
        } else if (typeof value === 'object') {
            // Structure
            // Set each field in the struct
            // !!! uniform = new Uniform(...Uniforms.parseUniforms(value, key));
        }
        // TODO: support other non-float types? (int, etc.)
        return uniform;
    }

    static parseUniforms(values: any, prefix?: string): Map<string, Uniform> {
        const uniforms = new Map<string, Uniform>();
        for (let key in values) {
            const value = values[key];
            if (prefix) {
                key = prefix + '.' + key;
            }
            const uniform: Uniform = Uniforms.parseUniform(key, value);
            if (uniform) {
                uniforms.set(key, uniform);
            }
        }
        return uniforms;
    }

    clean() {
        for (const key in this.values) {
            this.values[key].dirty = false;
        }
        this.dirty = false;
    }

    setParse(key: string, ...values: any[]): Uniform {
        const uniform: Uniform = Uniforms.parseUniform(key, ...values);
        if (uniform) {
            this.set(key, uniform);
        }
        return uniform;
    }

    create(method: UniformMethod, type: UniformType, key: string, ...values: any[]): Uniform {
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
        const uniform = new UniformTexture({
            method: UniformMethod.Uniform1i,
            type: UniformType.Sampler2D,
            key: key,
            values: [index],
        });
        this.set(key, uniform);
        this.dirty = true;
        return uniform;
        // const uniform = this.setParse(key, url) as UniformTexture; // !!!
        // console.log(uniform.type, key, url);
		/*
		if (uniform.type === 'sampler2D') {
			// console.log(u, uniform);
			// For textures, we need to track texture units, so we have a special setter
			// this.uniformTexture(uniform.key, uniform.value[0]);
			if (uniform.method === '1iv') {
				// todo
				uniform.values.map((
					urlElementOrData: string | HTMLCanvasElement | HTMLImageElement | HTMLVideoElement | Element | TextureData,
					i: number
				) => this.uniformTexture(uniform.key + i, urlElementOrData));
			} else {
				this.uniformTexture(uniform.key, uniform.values[0]);
			}
		}
		*/
        return uniform;
    }

    update(method: UniformMethod, type: UniformType, key: string, ...values: any[]) {
        const uniform = this.get(key);
        if (uniform &&
            (uniform.method !== method ||
                uniform.type !== type ||
                uniform.values !== values
            )) {
            uniform.method = method;
            uniform.type = type;
            uniform.values = values;
            uniform.dirty = true;
            this.dirty = true;
        }
    }

    createOrUpdate(method: UniformMethod, type: UniformType, key: string, ...values: any[]) {
        if (this.has(key)) {
            this.update(method, type, key, ...values);
        } else {
            this.create(method, type, key, ...values);
        }
    }

    apply(gl: WebGLRenderingContext, program: WebGLProgram) {
        for (const key in this.values) {
            this.values[key].apply(gl, program);
        }
        // this.forEach(uniform => uniform.apply(gl, program));
    }

}
