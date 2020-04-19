#ifdef GL_ES
precision mediump float;
#endif

varying vec2 v_texcoord;
varying vec3 v_normal;
varying vec3 v_light;
varying vec4 v_color;

uniform mat4 u_normalMatrix;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

#define PI_TWO 1.570796326794897
#define PI 3.141592653589793
#define TWO_PI 6.283185307179586

vec2 coord(in vec2 p) {
	p = p / u_resolution.xy;
	// correct aspect ratio
	if (u_resolution.x > u_resolution.y) {
		p.x *= u_resolution.x / u_resolution.y;
		p.x += (u_resolution.y - u_resolution.x) / u_resolution.y / 2.0;
	} else {
		p.y *= u_resolution.y / u_resolution.x;
		p.y += (u_resolution.x - u_resolution.y) / u_resolution.x / 2.0;
	}
	// centering
	p -= 0.5;
	p *= vec2(-1.0, 1.0);
	return p;
}
#define rx 1.0 / min(u_resolution.x, u_resolution.y)
#define uv gl_FragCoord.xy / u_resolution.xy
#define st coord(gl_FragCoord.xy)
#define mx coord(u_mouse)

void main() {
	vec2 p = v_texcoord;
	// p -= 0.5;
	// p *= vec2(-1.0, 1.0);
	// p *= 2.0;
	// p = smoothstep(0.49, 0.5, p);
	vec3 color = vec3(
		abs(cos(u_time * 0.75)),
		abs(sin(u_time * 0.25)),
		abs(sin(u_time))
	) * 0.9;
	// color *= vec3(step(vec2(0.1), fract(p * 10.0)), 1.0);
	// color *= vec3(smoothstep(fract(p.x * 3.0), -0.02, 0.02));
	// color *= vec3(smoothstep(fract(p.y * 3.0), -0.02, 0.02));
	// color = vec3(st.x, st.y, 0.0);
	// color = vec3(st.x, 0.0, 0.0);
	// color = vec3(p.x, p.y, 0.0);
	// color = vec3(gl_FragCoord.x / u_resolution.x, 0.0, 0.0);
	// color = vec3(v_texcoord.x, 0.0, 0.0);

	vec2 a = step(
		vec2(
			0.5 + sin(u_time) * 0.5),
			fract((p + u_time * 0.1) * vec2(5.0, 5.0)
		)
	);
	float alpha = a.x * a.y;
	alpha = 1.0;
	vec4 normal = u_normalMatrix * vec4(v_normal, 1.0);
	// normal = normalize(normal) * length(normal);
	gl_FragColor = vec4(normal.rgb * v_light, alpha);
}
