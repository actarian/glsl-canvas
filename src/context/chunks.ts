
export const DefaultWebGLVertexAttributes_ = `
#ifdef GL_ES
precision mediump float;
#endif

attribute vec4 a_position;
attribute vec4 a_normal;
attribute vec2 a_texcoord;
attribute vec4 a_color;

varying vec4 v_position;
varying vec4 v_normal;
varying vec2 v_texcoord;
varying vec4 v_color;
`;

export const DefaultWebGLFragmentAttributes_ = `
#ifdef GL_ES
precision mediump float;
#endif

varying vec4 v_position;
varying vec4 v_normal;
varying vec2 v_texcoord;
varying vec4 v_color;
`;

export const DefaultWebGL2VertexAttributes_ = `#version 300 es

precision mediump float;

in vec4 a_position;
in vec4 a_normal;
in vec2 a_texcoord;
in vec4 a_color;

out vec4 v_position;
out vec4 v_normal;
out vec2 v_texcoord;
out vec4 v_color;
`;

export const DefaultWebGL2FragmentAttributes_ = `#version 300 es

precision mediump float;

in vec4 v_position;
in vec4 v_normal;
in vec2 v_texcoord;
in vec4 v_color;

out vec4 outColor;
`;

export const DefaultWebGLUniform_ = `
uniform mat4 u_projectionMatrix;
uniform mat4 u_modelViewMatrix;
uniform mat4 u_normalMatrix;

uniform vec2 u_resolution;
uniform float u_time;
`;

export const DefaultWebGL2Uniform_ = DefaultWebGLUniform_;

export const DefaultWebGLFlatVertex_ = `
void main() {
	v_position = a_position;
	v_normal = a_normal;
	v_texcoord = a_texcoord;
	v_color = a_color;
	gl_Position = a_position;
}
`;

export const DefaultWebGLMeshVertex_ = `
void main(void) {
	v_position = u_projectionMatrix * u_modelViewMatrix * a_position;
	v_normal = u_normalMatrix * a_normal;
	v_texcoord = a_texcoord;
	v_color = a_color;
	gl_Position = v_position;
}
`;

export const DefaultWebGLFlatFragment_ = `
void main() {
	vec2 st = gl_FragCoord.xy / u_resolution.xy;
	st.x *= u_resolution.x / u_resolution.y;
	vec3 color = vec3(
		abs(cos(u_time * 0.1)) * st.y,
		abs(cos(u_time * 0.2)) * st.y,
		abs(sin(u_time)) * st.y
	);
	gl_FragColor = vec4(color, 1.0);
}
`;

export const DefaultWebGL2FlatFragment_ = `
void main() {
	vec2 st = gl_FragCoord.xy / u_resolution.xy;
	st.x *= u_resolution.x / u_resolution.y;
	vec3 color = vec3(
		abs(cos(u_time * 0.1)) * st.y,
		abs(cos(u_time * 0.2)) * st.y,
		abs(sin(u_time)) * st.y
	);
	outColor = vec4(color, 1.0);
}
`;

export const DefaultWebGLMeshFragment_ = `
void main() {
	vec2 uv = v_texcoord;
	vec3 color = vec3(
		abs(cos(u_time * 0.1)) * uv.y,
		abs(cos(u_time * 0.2)) * uv.y,
		abs(sin(u_time)) * uv.y
	);
	float incidence = max(dot(v_normal.xyz, vec3(0.0, 1.0, 0.0)), 0.0);
	vec3 light = vec3(0.2) + (vec3(1.0) * incidence);
	gl_FragColor = vec4(v_color.rgb * color * light, 1.0);
}
`;

export const DefaultWebGL2MeshFragment_ = `
void main() {
	vec2 uv = v_texcoord;
	vec3 color = vec3(
		abs(cos(u_time * 0.1)) * uv.y,
		abs(cos(u_time * 0.2)) * uv.y,
		abs(sin(u_time)) * uv.y
	);
	float incidence = max(dot(v_normal.xyz, vec3(0.0, 1.0, 0.0)), 0.0);
	vec3 light = vec3(0.2) + (vec3(1.0) * incidence);
	outColor = vec4(v_color.rgb * color * light, 1.0);
}
`;

export const DefaultWebGLBufferFragment_ = `
void main(){
	gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
}`;

export const DefaultWebGL2BufferFragment_ = `
void main() {
	outColor = vec4(0.0, 0.0, 0.0, 1.0);
}
`;

//
export const DefaultWebGLMeshVertex = DefaultWebGLVertexAttributes_ + DefaultWebGLUniform_ + DefaultWebGLMeshVertex_;
export const DefaultWebGL2MeshVertex = DefaultWebGL2VertexAttributes_ + DefaultWebGLUniform_ + DefaultWebGLMeshVertex_;
export const DefaultWebGLFlatFragment = DefaultWebGLFragmentAttributes_ + DefaultWebGLUniform_ + DefaultWebGLFlatFragment_;
export const DefaultWebGL2FlatFragment = DefaultWebGL2FragmentAttributes_ + DefaultWebGLUniform_ + DefaultWebGL2FlatFragment_;
export const DefaultWebGLMeshFragment = DefaultWebGLFragmentAttributes_ + DefaultWebGLUniform_ + DefaultWebGLMeshFragment_;
export const DefaultWebGL2MeshFragment = DefaultWebGL2FragmentAttributes_ + DefaultWebGLUniform_ + DefaultWebGL2MeshFragment_;
//
export const DefaultWebGLBufferVertex = DefaultWebGLVertexAttributes_ + DefaultWebGLUniform_ + DefaultWebGLFlatVertex_;
export const DefaultWebGL2BufferVertex = DefaultWebGL2VertexAttributes_ + DefaultWebGLUniform_ + DefaultWebGLFlatVertex_;
export const DefaultWebGLBufferFragment = DefaultWebGLFragmentAttributes_ + DefaultWebGLUniform_ + DefaultWebGLBufferFragment_;
export const DefaultWebGL2BufferFragment = DefaultWebGL2FragmentAttributes_ + DefaultWebGLUniform_ + DefaultWebGL2BufferFragment_;
//

