#extension GL_EXT_shader_texture_lod : enable
#extension GL_OES_standard_derivatives : enable

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform sampler2D u_texture; // glsl-canvas/data/moon.jpg
uniform vec2 u_textureResolution;

void main() {
	vec2 st = gl_FragCoord.xy / u_resolution.xy;
	vec3 color = texture2DLodEXT(u_texture, st, 0.0).rgb;
	gl_FragColor = vec4(color, 1.0);
}
