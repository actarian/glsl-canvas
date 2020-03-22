import IterableStringMap from '../core/iterable';
import { Texture } from '../textures/textures';
export declare enum UniformMethod {
    Unknown = 0,
    Uniform1i = "uniform1i",
    Uniform2i = "uniform2i",
    Uniform3i = "uniform3i",
    Uniform4i = "uniform4i",
    Uniform1f = "uniform1f",
    Uniform2f = "uniform2f",
    Uniform3f = "uniform3f",
    Uniform4f = "uniform4f",
    Uniform1iv = "uniform1iv",
    Uniform2iv = "uniform2iv",
    Uniform3iv = "uniform3iv",
    Uniform4iv = "uniform4iv",
    Uniform1fv = "uniform1fv",
    Uniform2fv = "uniform2fv",
    Uniform3fv = "uniform3fv",
    Uniform4fv = "uniform4fv",
    UniformMatrix2fv = "uniformMatrix2fv",
    UniformMatrix3fv = "uniformMatrix3fv",
    UniformMatrix4fv = "uniformMatrix4fv"
}
export declare enum UniformType {
    Unknown = 0,
    Float = 1,
    Int = 2,
    Bool = 3,
    Sampler2D = 4,
    SamplerCube = 5,
    Matrix2fv = 6,
    Matrix3fv = 7,
    Matrix4fv = 8
}
export declare const METHODS_INT: UniformMethod[];
export declare const METHODS_FLOAT: UniformMethod[];
export declare const METHODS_INTV: UniformMethod[];
export declare const METHODS_FLOATV: UniformMethod[];
export interface IUniformOption {
    [key: string]: any[];
}
export declare class Uniform {
    method: UniformMethod;
    type: UniformType;
    key: string;
    values: any[];
    location?: WebGLUniformLocation;
    dirty?: boolean;
    apply?: Function;
    constructor(options?: Uniform);
}
export declare class UniformTexture extends Uniform {
    texture: Texture;
    constructor(options?: Uniform);
}
export default class Uniforms extends IterableStringMap<Uniform> {
    dirty: boolean;
    static isDifferent(a: any[], b: any[]): boolean;
    static isArrayOfInteger(array: any[]): boolean;
    static isArrayOfNumber(array: any[]): boolean;
    static isArrayOfBoolean(array: any[]): boolean;
    static isArrayOfTexture(array: any[]): boolean;
    static isArrayOfSampler2D(array: Uniform[]): boolean;
    private static getType_;
    private static getMethod_;
    static parseUniform(key: string, values: any[], type?: UniformType): Uniform | Uniform[];
    create(method: UniformMethod, type: UniformType, key: string, values: any[]): Uniform;
    createTexture(key: string, index: number): UniformTexture;
    update(method: UniformMethod, type: UniformType, key: string, values: any[]): void;
    createOrUpdate(method: UniformMethod, type: UniformType, key: string, values: any[]): void;
    apply(gl: WebGLRenderingContext | WebGL2RenderingContext, program: WebGLProgram): void;
    clean(): void;
}
