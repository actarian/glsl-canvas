#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform vec2 u_pos;
uniform vec4 u_col;
uniform sampler2D u_buffer0;

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

float fill(in float d) { return 1.0 - smoothstep(0.0, rx * 2.0, d); }

float sCircle(in vec2 p, in float w) {
    return length(p) * 2.0 - w;
}
float circle(in vec2 p, in float w) {
    float d = sCircle(p, w);
    return fill(d);
}

#if defined(BUFFER_0)

void main() {
	vec4 buffer = texture2D(u_buffer0, uv);
	buffer *= 0.99;
	vec2 p = st + u_pos;
	float c = circle(p, 0.2);
	buffer = mix(buffer, u_col, c * u_col.a);
	gl_FragColor = buffer;
}

#else

void main() {
	vec3 color = vec3(0.0, 0.0, 0.0);
	vec3 b0 = texture2D(u_buffer0, uv).rgb;
	color += b0;
	gl_FragColor = vec4(color, 1.0);
}

#endif