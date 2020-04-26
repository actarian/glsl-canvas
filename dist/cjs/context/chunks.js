"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultWebGLVertexAttributes_ = "\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\nattribute vec4 a_position;\nattribute vec4 a_normal;\nattribute vec2 a_texcoord;\nattribute vec4 a_color;\n\nvarying vec4 v_position;\nvarying vec4 v_normal;\nvarying vec2 v_texcoord;\nvarying vec4 v_color;\n";
exports.DefaultWebGLFragmentAttributes_ = "\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\nvarying vec4 v_position;\nvarying vec4 v_normal;\nvarying vec2 v_texcoord;\nvarying vec4 v_color;\n";
exports.DefaultWebGL2VertexAttributes_ = "#version 300 es\n\nprecision mediump float;\n\nin vec4 a_position;\nin vec4 a_normal;\nin vec2 a_texcoord;\nin vec4 a_color;\n\nout vec4 v_position;\nout vec4 v_normal;\nout vec2 v_texcoord;\nout vec4 v_color;\n";
exports.DefaultWebGL2FragmentAttributes_ = "#version 300 es\n\nprecision mediump float;\n\nin vec4 v_position;\nin vec4 v_normal;\nin vec2 v_texcoord;\nin vec4 v_color;\n\nout vec4 outColor;\n";
exports.DefaultWebGLUniform_ = "\nuniform mat4 u_projectionMatrix;\nuniform mat4 u_modelViewMatrix;\nuniform mat4 u_normalMatrix;\n\nuniform vec2 u_resolution;\nuniform float u_time;\n";
exports.DefaultWebGL2Uniform_ = exports.DefaultWebGLUniform_;
exports.DefaultWebGLFlatVertex_ = "\nvoid main() {\n\tv_position = a_position;\n\tv_normal = a_normal;\n\tv_texcoord = a_texcoord;\n\tv_color = a_color;\n\tgl_Position = a_position;\n}\n";
exports.DefaultWebGLMeshVertex_ = "\nvoid main(void) {\n\tv_position = u_projectionMatrix * u_modelViewMatrix * a_position;\n\tv_normal = u_normalMatrix * a_normal;\n\tv_texcoord = a_texcoord;\n\tv_color = a_color;\n\tgl_Position = v_position;\n}\n";
exports.DefaultWebGLFlatFragment_ = "\nvoid main() {\n\tvec2 st = gl_FragCoord.xy / u_resolution.xy;\n\tst.x *= u_resolution.x / u_resolution.y;\n\tvec3 color = vec3(\n\t\tabs(cos(u_time * 0.1)) * st.y,\n\t\tabs(cos(u_time * 0.2)) * st.y,\n\t\tabs(sin(u_time)) * st.y\n\t);\n\tgl_FragColor = vec4(color, 1.0);\n}\n";
exports.DefaultWebGL2FlatFragment_ = "\nvoid main() {\n\tvec2 st = gl_FragCoord.xy / u_resolution.xy;\n\tst.x *= u_resolution.x / u_resolution.y;\n\tvec3 color = vec3(\n\t\tabs(cos(u_time * 0.1)) * st.y,\n\t\tabs(cos(u_time * 0.2)) * st.y,\n\t\tabs(sin(u_time)) * st.y\n\t);\n\toutColor = vec4(color, 1.0);\n}\n";
exports.DefaultWebGLMeshFragment_ = "\nvoid main() {\n\tvec2 uv = v_texcoord;\n\tvec3 color = vec3(\n\t\tabs(cos(u_time * 0.1)) * uv.y,\n\t\tabs(cos(u_time * 0.2)) * uv.y,\n\t\tabs(sin(u_time)) * uv.y\n\t);\n\tfloat incidence = max(dot(v_normal.xyz, vec3(0.0, 1.0, 0.0)), 0.0);\n\tvec3 light = vec3(0.2) + (vec3(1.0) * incidence);\n\tgl_FragColor = vec4(v_color.rgb * color * light, 1.0);\n}\n";
exports.DefaultWebGL2MeshFragment_ = "\nvoid main() {\n\tvec2 uv = v_texcoord;\n\tvec3 color = vec3(\n\t\tabs(cos(u_time * 0.1)) * uv.y,\n\t\tabs(cos(u_time * 0.2)) * uv.y,\n\t\tabs(sin(u_time)) * uv.y\n\t);\n\tfloat incidence = max(dot(v_normal.xyz, vec3(0.0, 1.0, 0.0)), 0.0);\n\tvec3 light = vec3(0.2) + (vec3(1.0) * incidence);\n\toutColor = vec4(v_color.rgb * color * light, 1.0);\n}\n";
exports.DefaultWebGLBufferFragment_ = "\nvoid main(){\n\tgl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n}";
exports.DefaultWebGL2BufferFragment_ = "\nvoid main() {\n\toutColor = vec4(0.0, 0.0, 0.0, 1.0);\n}\n";
//
exports.DefaultWebGLMeshVertex = exports.DefaultWebGLVertexAttributes_ + exports.DefaultWebGLUniform_ + exports.DefaultWebGLMeshVertex_;
exports.DefaultWebGL2MeshVertex = exports.DefaultWebGL2VertexAttributes_ + exports.DefaultWebGLUniform_ + exports.DefaultWebGLMeshVertex_;
exports.DefaultWebGLFlatFragment = exports.DefaultWebGLFragmentAttributes_ + exports.DefaultWebGLUniform_ + exports.DefaultWebGLFlatFragment_;
exports.DefaultWebGL2FlatFragment = exports.DefaultWebGL2FragmentAttributes_ + exports.DefaultWebGLUniform_ + exports.DefaultWebGL2FlatFragment_;
exports.DefaultWebGLMeshFragment = exports.DefaultWebGLFragmentAttributes_ + exports.DefaultWebGLUniform_ + exports.DefaultWebGLMeshFragment_;
exports.DefaultWebGL2MeshFragment = exports.DefaultWebGL2FragmentAttributes_ + exports.DefaultWebGLUniform_ + exports.DefaultWebGL2MeshFragment_;
//
exports.DefaultWebGLBufferVertex = exports.DefaultWebGLVertexAttributes_ + exports.DefaultWebGLUniform_ + exports.DefaultWebGLFlatVertex_;
exports.DefaultWebGL2BufferVertex = exports.DefaultWebGL2VertexAttributes_ + exports.DefaultWebGLUniform_ + exports.DefaultWebGLFlatVertex_;
exports.DefaultWebGLBufferFragment = exports.DefaultWebGLFragmentAttributes_ + exports.DefaultWebGLUniform_ + exports.DefaultWebGLBufferFragment_;
exports.DefaultWebGL2BufferFragment = exports.DefaultWebGL2FragmentAttributes_ + exports.DefaultWebGLUniform_ + exports.DefaultWebGL2BufferFragment_;
//
