export interface IGeometry {
    positions: number[];
    colors: number[];
    normals: number[];
    texcoords: number[];
}
export default class Geometry implements IGeometry {
    positions: number[];
    colors: number[];
    normals: number[];
    texcoords: number[];
    positionBuffer: WebGLBuffer;
    colorBuffer: WebGLBuffer;
    normalBuffer: WebGLBuffer;
    texcoordBuffer: WebGLBuffer;
    positionLocation: number;
    colorLocation: number;
    normalLocation: number;
    texcoordLocation: number;
    size: number;
    constructor(options?: IGeometry);
    create(gl: WebGLRenderingContext | WebGL2RenderingContext, program: WebGLProgram): void;
    createBufferData_(gl: WebGLRenderingContext | WebGL2RenderingContext, type: number, array: BufferSource): WebGLBuffer;
    createAttribLocation_(gl: WebGLRenderingContext | WebGL2RenderingContext, program: WebGLProgram, name: string, size: number, type: number): number;
    createAttributes_(gl: WebGLRenderingContext | WebGL2RenderingContext, program: WebGLProgram): void;
    attachAttributes_(gl: WebGLRenderingContext | WebGL2RenderingContext, program: WebGLProgram): void;
    bindAttributes_(gl: WebGLRenderingContext | WebGL2RenderingContext, program: WebGLProgram): void;
    protected createData_(): void;
    static fromIndices(indices: number[], array: number[], size: number): number[];
}
