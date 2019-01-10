#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform sampler2D u_texture; // data/moon.jpg
uniform vec2 u_textureResolution;

void main() {
	vec2 st = gl_FragCoord.xy / u_resolution.xy;
	vec3 color = texture2D(u_texture, st).rgb;
	gl_FragColor = vec4(color, 1.0);
}