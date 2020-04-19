
#ifdef GL_ES
precision highp float;
#endif

varying vec2 v_texcoord;
varying vec3 v_light;
varying vec4 v_color;

uniform vec2 u_resolution;
uniform sampler2D u_texture; // data/bayer-matrix.png
// ?filtering=nearest
uniform vec2 u_textureResolution;
uniform float u_time;
uniform vec3 u_camera;

void main() {
	vec2 uv = v_texcoord;
	// uv.x = fract(uv.x + u_time * 0.5);
	vec4 color = texture2D(u_texture, uv);
	gl_FragColor = vec4(v_color.rgb * color.rgb * v_light, color.a);
}
