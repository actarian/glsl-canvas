import IterableStringMap from '../core/iterable';
import Logger from '../logger/logger';
import { Texture } from '../textures/textures';
export var UniformMethod;
(function (UniformMethod) {
    UniformMethod[UniformMethod["Unknown"] = 0] = "Unknown";
    UniformMethod["Uniform1i"] = "uniform1i";
    // Uniform1i  = 'uniform1i', // (boolUniformLoc,   v);                // for bool
    // Uniform1i  = 'uniform1i', // (sampler2DUniformLoc,   v);           // for sampler2D
    // Uniform1i  = 'uniform1i', // (samplerCubeUniformLoc,   v);         // for samplerCube
    UniformMethod["Uniform2i"] = "uniform2i";
    UniformMethod["Uniform3i"] = "uniform3i";
    UniformMethod["Uniform4i"] = "uniform4i";
    UniformMethod["Uniform1f"] = "uniform1f";
    UniformMethod["Uniform2f"] = "uniform2f";
    UniformMethod["Uniform3f"] = "uniform3f";
    UniformMethod["Uniform4f"] = "uniform4f";
    //
    UniformMethod["Uniform1iv"] = "uniform1iv";
    // Uniform1iv = 'uniform1iv', // (boolUniformLoc, [v]);                // for bool or bool array
    // Uniform1iv = 'uniform1iv', // (sampler2DUniformLoc, [v]);           // for sampler2D or sampler2D array
    // Uniform1iv = 'uniform1iv', // (samplerCubeUniformLoc, [v]);         // for samplerCube or samplerCube array
    UniformMethod["Uniform2iv"] = "uniform2iv";
    UniformMethod["Uniform3iv"] = "uniform3iv";
    UniformMethod["Uniform4iv"] = "uniform4iv";
    //
    UniformMethod["Uniform1fv"] = "uniform1fv";
    UniformMethod["Uniform2fv"] = "uniform2fv";
    UniformMethod["Uniform3fv"] = "uniform3fv";
    UniformMethod["Uniform4fv"] = "uniform4fv";
    //
    UniformMethod["UniformMatrix2fv"] = "uniformMatrix2fv";
    UniformMethod["UniformMatrix3fv"] = "uniformMatrix3fv";
    UniformMethod["UniformMatrix4fv"] = "uniformMatrix4fv";
})(UniformMethod || (UniformMethod = {}));
export var UniformType;
(function (UniformType) {
    UniformType[UniformType["Unknown"] = 0] = "Unknown";
    UniformType[UniformType["Float"] = 1] = "Float";
    UniformType[UniformType["Int"] = 2] = "Int";
    UniformType[UniformType["Bool"] = 3] = "Bool";
    UniformType[UniformType["Sampler2D"] = 4] = "Sampler2D";
    UniformType[UniformType["SamplerCube"] = 5] = "SamplerCube";
    UniformType[UniformType["Matrix2fv"] = 6] = "Matrix2fv";
    UniformType[UniformType["Matrix3fv"] = 7] = "Matrix3fv";
    UniformType[UniformType["Matrix4fv"] = 8] = "Matrix4fv";
})(UniformType || (UniformType = {}));
export const METHODS_INT = [UniformMethod.Uniform1i, UniformMethod.Uniform2i, UniformMethod.Uniform3i, UniformMethod.Uniform4i];
export const METHODS_FLOAT = [UniformMethod.Uniform1f, UniformMethod.Uniform2f, UniformMethod.Uniform3f, UniformMethod.Uniform4f];
export const METHODS_INTV = [UniformMethod.Uniform1iv, UniformMethod.Uniform2iv, UniformMethod.Uniform3iv, UniformMethod.Uniform4iv];
export const METHODS_FLOATV = [UniformMethod.Uniform1fv, UniformMethod.Uniform2fv, UniformMethod.Uniform3fv, UniformMethod.Uniform4fv];
export class Uniform {
    constructor(options) {
        this.dirty = true;
        if (options) {
            Object.assign(this, options);
        }
        this.apply = (gl, program) => {
            if (this.dirty) {
                gl.useProgram(program);
                const location = gl.getUniformLocation(program, this.key);
                // Logger.log(this.key, this.method, this.values);
                // (gl as any)[this.method].apply(gl, [location].concat(this.values));
                gl[this.method].apply(gl, [location].concat(this.values));
            }
        };
    }
}
export class UniformTexture extends Uniform {
    constructor(options) {
        super(options);
    }
}
export default class Uniforms extends IterableStringMap {
    constructor() {
        super(...arguments);
        this.dirty = false;
    }
    /*
    // slow
    static isDifferent(a: any, b: any): boolean {
        return JSON.stringify(a) !== JSON.stringify(b);
    }
    */
    static isDifferent(a, b) {
        return a.length !== b.length ||
            a.reduce((f, v, i) => {
                return f || v !== b[i];
            }, false);
    }
    static isArrayOfInteger(array) {
        return array.reduce((flag, value) => {
            return flag && Number.isInteger(value);
        }, true);
    }
    static isArrayOfNumber(array) {
        return array.reduce((flag, value) => {
            return flag && typeof value === 'number';
        }, true);
    }
    static isArrayOfBoolean(array) {
        return array.reduce((flag, value) => {
            return flag && typeof value === 'boolean';
        }, true);
    }
    static isArrayOfTexture(array) {
        return array.reduce((flag, value) => {
            return flag && Texture.isTexture(value);
        }, true);
    }
    static isArrayOfSampler2D(array) {
        return array.reduce((flag, value) => {
            return flag && value.type === UniformType.Sampler2D;
        }, true);
    }
    static getType_(values) {
        let type = UniformType.Unknown;
        const isVector = values.length === 1 && Array.isArray(values[0]);
        const subject = isVector ? values[0] : values;
        if (Uniforms.isArrayOfNumber(subject)) {
            type = UniformType.Float;
        }
        else if (Uniforms.isArrayOfBoolean(subject)) {
            type = UniformType.Bool;
        }
        else if (Uniforms.isArrayOfTexture(subject)) {
            type = UniformType.Sampler2D;
        }
        return type;
    }
    static getMethod_(type, values) {
        let method = UniformMethod.Unknown;
        const isVector = values.length === 1 && Array.isArray(values[0]);
        const subject = isVector ? values[0] : values;
        const length = subject.length;
        const i = length - 1;
        switch (type) {
            case UniformType.Float:
                if (isVector) {
                    method = i < METHODS_FLOATV.length ? METHODS_FLOATV[i] : UniformMethod.Unknown;
                }
                else {
                    method = i < METHODS_FLOAT.length ? METHODS_FLOAT[i] : UniformMethod.Uniform1fv;
                }
                break;
            case UniformType.Int:
            case UniformType.Bool:
                if (isVector) {
                    method = i < METHODS_INTV.length ? METHODS_INTV[i] : UniformMethod.Unknown;
                }
                else {
                    method = i < METHODS_INT.length ? METHODS_INT[i] : UniformMethod.Uniform1iv;
                }
                break;
            case UniformType.Sampler2D:
                if (isVector) {
                    method = UniformMethod.Uniform1iv;
                }
                else {
                    method = length === 1 ? UniformMethod.Uniform1i : UniformMethod.Uniform1iv;
                }
                break;
        }
        return method;
    }
    static parseUniform(key, values, type = null) {
        let uniform;
        type = type || Uniforms.getType_(values);
        const method = Uniforms.getMethod_(type, values);
        if (type !== UniformType.Unknown && method !== UniformMethod.Unknown) {
            // Logger.log('Uniforms.parseUniform', key, UniformType[type], method, values);
            if (type === UniformType.Sampler2D && method === UniformMethod.Uniform1iv) {
                return values[0].map((texture, index) => {
                    return new Uniform({
                        method: method,
                        type: type,
                        key: `${key}[${index}]`,
                        values: [texture]
                    });
                });
            }
            else {
                uniform = new Uniform({
                    method: method,
                    type: type,
                    key: key,
                    values: values
                });
            }
        }
        else {
            Logger.error('Uniforms.parseUniform.Unknown', key, values);
        }
        // return this.parseUniform__bak(key, values);
        return uniform;
    }
    create(method, type, key, values) {
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
    createTexture(key, index) {
        let uniform;
        if (key.indexOf(']') !== -1) {
            uniform = new UniformTexture({
                method: UniformMethod.Uniform1iv,
                type: UniformType.Sampler2D,
                key: key,
                values: [[index]],
            });
        }
        else {
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
    update(method, type, key, values) {
        const uniform = this.get(key);
        if (uniform &&
            (uniform.method !== method ||
                uniform.type !== type ||
                Uniforms.isDifferent(uniform.values, values))) {
            uniform.method = method;
            uniform.type = type;
            uniform.values = values;
            uniform.dirty = true;
            this.dirty = true;
        }
    }
    createOrUpdate(method, type, key, values) {
        if (this.has(key)) {
            this.update(method, type, key, values);
        }
        else {
            this.create(method, type, key, values);
        }
    }
    apply(gl, program) {
        for (const key in this.values) {
            // if (typeof this.values[key].apply === 'function') {
            this.values[key].apply(gl, program);
            // }
        }
        // this.forEach(uniform => uniform.apply(gl, program));
    }
    clean() {
        for (const key in this.values) {
            this.values[key].dirty = false;
        }
        this.dirty = false;
    }
}
