#version 300 es

precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform sampler2D u_buffer0;

out vec4 color;

void main() {
	#if defined(BUFFER_0)
	color = vec4(1.0, 0.0, 0.0, 1.0);
	#else
	vec2 uv = gl_FragCoord.xy / u_resolution.xy;
	if (u_time == 0.0) {
		color = vec4(1);
	} else {
		color = texture(u_buffer0, uv);
	}
	#endif
}
