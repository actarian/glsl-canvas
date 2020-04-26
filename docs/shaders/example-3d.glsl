
#ifdef GL_ES
precision mediump float;
#endif

varying vec4 v_position;
varying vec4 v_normal;
varying vec2 v_texcoord;
varying vec4 v_color;

uniform vec2 u_resolution;
uniform sampler2D u_texture; // data/bayer-matrix.png?repeat=true
// ?filtering=nearest
uniform vec2 u_textureResolution;
uniform float u_time;
uniform vec3 u_camera;

void main() {
	vec2 uv = v_texcoord;
	// uv.x = fract(uv.x + u_time * 0.5);
	vec4 color = texture2D(u_texture, uv);

	// light
	vec3 ambient = vec3(0.4);
	vec3 direction = vec3(0.0, 1.0, 0.0);
	vec3 lightColor = vec3(1.0);
	float incidence = max(dot(v_normal.xyz, direction), - 1.0);
	vec3 light = clamp(ambient + lightColor * incidence, 0.0, 1.0);

	gl_FragColor = vec4(v_color.rgb * color.rgb * light, color.a);
}
