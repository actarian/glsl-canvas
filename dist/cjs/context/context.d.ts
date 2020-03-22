export declare const ContextDefaultVertex = "\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\nattribute vec2 a_position;\nattribute vec2 a_texcoord;\n\nvarying vec2 v_texcoord;\n\nvoid main(){\n\tgl_Position = vec4(a_position, 0.0, 1.0);\n\tv_texcoord = a_texcoord;\n}\n";
export declare const ContextDefaultFragment = "\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\nvoid main(){\n\tgl_FragColor = vec4(0.0);\n}\n";
export declare const ContextDefaultVertex2 = "#version 300 es\n\nin vec2 a_position;\nin vec2 a_texcoord;\n\nout vec2 v_texcoord;\n\nvoid main() {\n\tgl_Position = vec4(a_position, 0.0, 1.0);\n\tv_texcoord = a_texcoord;\n}\n";
export declare const ContextDefaultFragment2 = "#version 300 es\n\nprecision mediump float;\n\nout vec4 outColor;\n\nvoid main() {\n\toutColor = vec4(0.0);\n}\n";
export declare enum ContextVersion {
    WebGl = 1,
    WebGl2 = 2
}
export declare enum ContextError {
    BrowserSupport = 1,
    Other = 2
}
export interface IContextOptions {
    alpha?: GLboolean;
    antialias?: GLboolean;
    depth?: GLboolean;
    failIfMajorPerformanceCaveat?: boolean;
    premultipliedAlpha?: GLboolean;
    preserveDrawingBuffer?: GLboolean;
    stencil?: GLboolean;
}
export declare class ContextVertexBuffers {
    texcoord: WebGLBuffer;
    position: WebGLBuffer;
}
export default class Context {
    static lastError: string;
    static getContext_(canvas: HTMLCanvasElement, options?: WebGLContextAttributes): WebGLRenderingContext;
    static getContext2_(canvas: HTMLCanvasElement, options?: WebGLContextAttributes): WebGL2RenderingContext;
    static getIncludes(input: string | undefined): Promise<string | undefined>;
    static isWebGl(context: WebGLRenderingContext | WebGL2RenderingContext): boolean;
    static isWebGl2(context: WebGLRenderingContext | WebGL2RenderingContext): boolean;
    static inferVersion(vertexString?: string, fragmentString?: string): ContextVersion;
    static versionDiffers(gl: WebGLRenderingContext | WebGL2RenderingContext, vertexString?: string, fragmentString?: string): boolean;
    static getVertex(vertexString?: string, fragmentString?: string): string;
    static getFragment(vertexString?: string, fragmentString?: string): string;
    static tryInferContext(vertexString: string, fragmentString: string, canvas: HTMLCanvasElement, attributes: WebGLContextAttributes, extensions: string[], errorCallback: Function): WebGLRenderingContext | WebGL2RenderingContext;
    static tryGetContext(canvas: HTMLCanvasElement, attributes: WebGLContextAttributes, errorCallback: Function): WebGLRenderingContext;
    static inferContext(vertexString: string, fragmentString: string, canvas: HTMLCanvasElement, options?: WebGLContextAttributes): WebGLRenderingContext | WebGL2RenderingContext;
    static createShader(gl: WebGLRenderingContext | WebGL2RenderingContext, source: string, type: number, offset?: number): WebGLShader;
    static createProgram(gl: WebGLRenderingContext | WebGL2RenderingContext, shaders: WebGLShader[], attributes?: any[], locations?: number[]): WebGLProgram;
    static createVertexBuffers(gl: WebGLRenderingContext | WebGL2RenderingContext, program: WebGLProgram): ContextVertexBuffers;
}
