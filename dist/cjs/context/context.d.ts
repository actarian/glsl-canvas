export declare enum ContextVersion {
    WebGl = "webgl",
    WebGl2 = "webgl2"
}
export declare enum ContextPrecision {
    LowP = "lowp",
    MediumP = "mediump",
    HighP = "highp"
}
export declare enum ContextMode {
    Flat = "flat",
    Box = "box",
    Sphere = "sphere",
    Torus = "torus",
    Mesh = "mesh"
}
export declare const ContextDefault: {
    webgl: {
        flat: {
            vertex: string;
            fragment: string;
        };
        mesh: {
            vertex: string;
            fragment: string;
        };
    };
    webgl2: {
        flat: {
            vertex: string;
            fragment: string;
        };
        mesh: {
            vertex: string;
            fragment: string;
        };
    };
};
export declare enum ContextError {
    BrowserSupport = 1,
    Other = 2
}
export declare class ContextVertexBuffers {
    texcoord: WebGLBuffer;
    position: WebGLBuffer;
}
export default class Context {
    static precision: ContextPrecision;
    static lastError: string;
    static getContext_(canvas: HTMLCanvasElement, options?: WebGLContextAttributes): WebGLRenderingContext;
    static getContext2_(canvas: HTMLCanvasElement, options?: WebGLContextAttributes): WebGL2RenderingContext;
    static getFragmentVertex(gl: WebGLRenderingContext | WebGL2RenderingContext, fragmentString: string): string;
    static getIncludes(input: string | undefined): Promise<string | undefined>;
    static isWebGl(context: WebGLRenderingContext | WebGL2RenderingContext): boolean;
    static isWebGl2(context: WebGLRenderingContext | WebGL2RenderingContext): boolean;
    static inferVersion(vertexString?: string, fragmentString?: string): ContextVersion;
    static inferPrecision(fragmentString: string): ContextPrecision;
    static versionDiffers(gl: WebGLRenderingContext | WebGL2RenderingContext, vertexString?: string, fragmentString?: string): boolean;
    static getBufferVertex(gl: WebGLRenderingContext | WebGL2RenderingContext): string;
    static getVertex(vertexString?: string, fragmentString?: string, mode?: ContextMode): string;
    static getFragment(vertexString?: string, fragmentString?: string, mode?: ContextMode): string;
    static tryInferContext(vertexString: string, fragmentString: string, canvas: HTMLCanvasElement, attributes: WebGLContextAttributes, extensions: string[], errorCallback: Function): WebGLRenderingContext | WebGL2RenderingContext;
    static tryGetContext(canvas: HTMLCanvasElement, attributes: WebGLContextAttributes, errorCallback: Function): WebGLRenderingContext;
    static inferContext(vertexString: string, fragmentString: string, canvas: HTMLCanvasElement, options?: WebGLContextAttributes): WebGLRenderingContext | WebGL2RenderingContext;
    static createShader(gl: WebGLRenderingContext | WebGL2RenderingContext, source: string, type: number, offset?: number): WebGLShader;
    static createProgram(gl: WebGLRenderingContext | WebGL2RenderingContext, shaders: WebGLShader[], attributes?: any[], locations?: number[]): WebGLProgram;
    static createVertexBuffers(gl: WebGLRenderingContext | WebGL2RenderingContext, program: WebGLProgram): ContextVertexBuffers;
}
