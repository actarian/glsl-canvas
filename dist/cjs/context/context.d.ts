export declare const DefaultWebGLBufferVertex = "\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\nattribute vec4 a_position;\nattribute vec2 a_texcoord;\nattribute vec3 a_normal;\nattribute vec4 a_color;\n\nvarying vec2 v_texcoord;\nvarying vec3 v_normal;\nvarying vec4 v_color;\nvarying vec3 v_light;\n\nuniform mat4 u_projectionMatrix;\nuniform mat4 u_modelViewMatrix;\nuniform mat4 u_normalMatrix;\n\nuniform vec3 u_lightAmbient;\nuniform vec3 u_lightColor;\nuniform vec3 u_lightDirection;\n\nvoid main(void) {\n\tgl_Position = a_position;\n\tv_texcoord = a_texcoord;\n\tv_normal = a_normal;\n\tv_color = a_color;\n\n\t// light\n\tvec4 normal = u_normalMatrix * vec4(a_normal, 1.0);\n\tfloat incidence = max(dot(normal.xyz, u_lightDirection), 0.0);\n\tv_light = u_lightAmbient + (u_lightColor * incidence);\n}\n";
export declare const DefaultWebGL2BufferVertex = "#version 300 es\n\nprecision mediump float;\n\nin vec4 a_position;\nin vec2 a_texcoord;\nin vec3 a_normal;\nin vec4 a_color;\n\nout vec2 v_texcoord;\nout vec3 v_normal;\nout vec4 v_color;\nout vec3 v_light;\n\nuniform mat4 u_projectionMatrix;\nuniform mat4 u_modelViewMatrix;\nuniform mat4 u_normalMatrix;\n\nuniform vec3 u_lightAmbient;\nuniform vec3 u_lightColor;\nuniform vec3 u_lightDirection;\n\nvoid main() {\n\tgl_Position = a_position;\n\tv_texcoord = a_texcoord;\n\tv_normal = a_normal;\n\tv_color = a_color;\n\n\t// light\n\tvec4 normal = u_normalMatrix * vec4(a_normal, 1.0);\n\tfloat incidence = max(dot(normal.xyz, u_lightDirection), 0.0);\n\tv_light = u_lightAmbient + (u_lightColor * incidence);\n}\n";
export declare const DefaultWebGLFlatFragment = "\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\nuniform vec2 u_resolution;\nuniform float u_time;\n\nvoid main() {\n\tvec2 st = gl_FragCoord.xy / u_resolution.xy;\n\tst.x *= u_resolution.x / u_resolution.y;\n\tvec3 color = vec3(\n\t\tabs(cos(u_time * 0.1)) * st.y,\n\t\tabs(cos(u_time * 0.2)) * st.y,\n\t\tabs(sin(u_time)) * st.y\n\t);\n\tgl_FragColor = vec4(color, 1.0);\n}\n";
export declare const DefaultWebGLMeshVertex = "\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\nattribute vec4 a_position;\nattribute vec2 a_texcoord;\nattribute vec3 a_normal;\nattribute vec4 a_color;\n\nvarying vec4 v_position;\nvarying vec2 v_texcoord;\nvarying vec3 v_normal;\nvarying vec4 v_color;\nvarying vec3 v_light;\n\nuniform float u_time;\n\nuniform mat4 u_projectionMatrix;\nuniform mat4 u_modelViewMatrix;\nuniform mat4 u_normalMatrix;\n\nuniform vec3 u_lightAmbient;\nuniform vec3 u_lightColor;\nuniform vec3 u_lightDirection;\n\nvoid main(void) {\n\tvec4 v_position = a_position;\n\t// v_position.y += sin(v_position.x * 0.1) * 10.0;\n\t// v_position.xyz += a_normal * 0.025 + cos(u_time * 5.0) * a_normal * 0.025;\n\tv_position = u_projectionMatrix * u_modelViewMatrix * v_position;\n\tgl_Position = v_position;\n\n\tv_texcoord = a_texcoord;\n\tv_normal = a_normal;\n\tv_color = a_color;\n\n\t// light\n\tvec4 normal = u_normalMatrix * vec4(a_normal, 1.0) * 1.5;\n\tfloat incidence = max(dot(normal.xyz, u_lightDirection), 0.0);\n\tv_light = u_lightAmbient + (u_lightColor * incidence);\n}\n";
export declare const DefaultWebGL2MeshVertex = "#version 300 es\n\nprecision mediump float;\n\nin vec4 a_position;\nin vec2 a_texcoord;\nin vec3 a_normal;\nin vec4 a_color;\n\nout vec2 v_texcoord;\nout vec3 v_normal;\nout vec4 v_color;\nout vec3 v_light;\n\nuniform mat4 u_projectionMatrix;\nuniform mat4 u_modelViewMatrix;\nuniform mat4 u_normalMatrix;\n\nuniform vec3 u_lightAmbient;\nuniform vec3 u_lightColor;\nuniform vec3 u_lightDirection;\n\nvoid main() {\n\tgl_Position = u_projectionMatrix * u_modelViewMatrix * a_position;\n\tv_texcoord = a_texcoord;\n\tv_normal = a_normal;\n\tv_color = a_color;\n\n\t// light\n\tvec4 normal = u_normalMatrix * vec4(a_normal, 1.0);\n\tfloat incidence = max(dot(normal.xyz, u_lightDirection), 0.0);\n\tv_light = u_lightAmbient + (u_lightColor * incidence);\n}\n";
export declare const DefaultWebGLMeshFragment = "\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\nvarying vec2 v_texcoord;\nvarying vec3 v_normal;\nvarying vec3 v_light;\nvarying vec4 v_color;\n\nuniform vec2 u_resolution;\nuniform float u_time;\n\nvoid main() {\n\tvec2 uv = v_texcoord;\n\tvec3 color = vec3(\n\t\tabs(cos(u_time * 0.1)) * uv.y,\n\t\tabs(cos(u_time * 0.2)) * uv.y,\n\t\tabs(sin(u_time)) * uv.y\n\t);\n\tgl_FragColor = vec4(v_color.rgb * color * v_light, 1.0);\n}\n";
export declare const DefaultWebGL2FlatFragment = "#version 300 es\n\nprecision mediump float;\n\nout vec4 outColor;\n\nuniform vec2 u_resolution;\nuniform float u_time;\n\nvoid main() {\n\tvec2 st = gl_FragCoord.xy / u_resolution.xy;\n\tst.x *= u_resolution.x / u_resolution.y;\n\tvec3 color = vec3(\n\t\tabs(cos(u_time * 0.1)) * st.y,\n\t\tabs(cos(u_time * 0.2)) * st.y,\n\t\tabs(sin(u_time)) * st.y\n\t);\n\toutColor = vec4(color, 1.0);\n}\n";
export declare const DefaultWebGL2MeshFragment = "#version 300 es\n\nprecision mediump float;\n\nin vec2 v_texcoord;\nin vec3 v_light;\nin vec4 v_color;\n\nout vec4 outColor;\n\nuniform vec2 u_resolution;\nuniform float u_time;\n\nvoid main() {\n\tvec2 uv = v_texcoord;\n\tvec3 color = vec3(\n\t\tabs(cos(u_time * 0.1)) * uv.y,\n\t\tabs(cos(u_time * 0.2)) * uv.y,\n\t\tabs(sin(u_time)) * uv.y\n\t);\n\toutColor = vec4(v_color.rgb * color * v_light, 1.0);\n}\n";
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
