import IterableStringMap from '../core/iterable';
import Geometry from '../geometry/geometry';
export declare enum BufferFloatType {
    FLOAT = 0,
    HALF_FLOAT = 1
}
export declare class Buffer {
    texture: WebGLTexture;
    buffer: WebGLFramebuffer;
    BW: number;
    BH: number;
    index: number;
    static type: BufferFloatType;
    static getFloatType(gl: WebGLRenderingContext | WebGL2RenderingContext): number | null;
    static getHalfFloatType(gl: WebGLRenderingContext | WebGL2RenderingContext): number | null;
    static getInternalFormat(gl: WebGLRenderingContext | WebGL2RenderingContext): number;
    static getType(gl: WebGLRenderingContext | WebGL2RenderingContext): number;
    static getTexture(gl: WebGLRenderingContext | WebGL2RenderingContext, BW: number, BH: number, index: number): WebGLTexture;
    constructor(gl: WebGLRenderingContext | WebGL2RenderingContext, BW: number, BH: number, index: number);
    resize(gl: WebGLRenderingContext | WebGL2RenderingContext, BW: number, BH: number): void;
}
export declare class IOBuffer {
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
    isValid: boolean;
    constructor(index: number, key: string, vertexString: string, fragmentString: string);
    create(gl: WebGLRenderingContext | WebGL2RenderingContext, BW: number, BH: number): void;
    render(gl: WebGLRenderingContext | WebGL2RenderingContext, BW: number, BH: number): void;
    resize(gl: WebGLRenderingContext | WebGL2RenderingContext, BW: number, BH: number): void;
    destroy(gl: WebGLRenderingContext | WebGL2RenderingContext): void;
}
export default class Buffers extends IterableStringMap<IOBuffer> {
    get count(): number;
    static getBuffers(gl: WebGLRenderingContext | WebGL2RenderingContext, fragmentString: string, vertexString: string): Buffers;
}
