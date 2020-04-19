#ifdef GL_ES
precision highp float;
#endif

varying vec4 v_position;
varying vec2 v_texcoord;
varying vec3 v_normal;
varying vec4 v_color;
varying vec3 v_light;

uniform mat4 u_projectionMatrix;
uniform mat4 u_modelViewMatrix;
uniform mat4 u_normalMatrix;
uniform vec3 u_lightAmbient;
uniform vec3 u_lightColor;
uniform vec3 u_lightDirection;
uniform vec2 u_resolution;

uniform vec2 u_textureResolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_pos;
uniform sampler2D u_buffer0;

#if defined(VERTEX)

attribute vec4 a_position; // data/duck-toy.obj
// attribute vec4 a_position;
attribute vec2 a_texcoord;
attribute vec3 a_normal;
attribute vec4 a_color;

mat4 rotationAxis(float angle, vec3 axis) {
	axis = normalize(axis);
	float s = sin(angle);
	float c = cos(angle);
	float oc = 1.0 - c;
	return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
				oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
				oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
				0.0,                                0.0,                                0.0,                                1.0);
}

vec3 rotateZ(vec3 p, float angle) {
	mat4 rmy = rotationAxis(angle, vec3(0.0, 0.0, 1.0));
	return (vec4(p, 1.0) * rmy).xyz;
}

float easeQuintInOut(float t) {
    if ((t / 2.0) < 1.0) return 0.5 * t * t * t * t * t;
    return 0.5 * ((t -= 2.0) * t * t * t * t + 2.0);
}

void main(void) {
	vec4 v_position = a_position;
	// v_position.y += sin(v_position.x * 0.1) * 10.0;

	// float d = (5.0 + cos(u_time) * 2.5);
	float a = sin((u_time * 4.0) + a_position.y) * 0.1;
	float b = cos(((u_time + 1.5) * 10.0) + a_position.y * 2.0) * 0.05;
	float c = sin((u_time * 4.0) + a_position.y) * 0.3;
	v_position.z += a - b;
	v_position.xyz = rotateZ(v_position.xyz, cos(u_time + a_position.x) * (2.0 * a));
	// v_position.x -= a + c;
	// v_position.xyz += a_normal * 0.025 + (cos(u_time * 5.0)) * a_normal * 0.025;
	v_position = u_projectionMatrix * u_modelViewMatrix * v_position;
	gl_Position = v_position;

	v_texcoord = a_texcoord;
	v_normal = normalize(a_normal);
	v_color = a_color;

	// light
	vec4 normal = u_normalMatrix * vec4(a_normal, 1.0) * 1.5;
	float incidence = max(dot(normal.xyz, u_lightDirection), 0.0);
	v_light = u_lightAmbient + (u_lightColor * incidence);
}

#elif defined(BUFFER_0)

vec2 coord(in vec2 p) {
	p = p / u_resolution.xy;
	// correct aspect ratio
	/*
	if (u_resolution.x > u_resolution.y) {
		p.x *= u_resolution.x / u_resolution.y;
		p.x += (u_resolution.y - u_resolution.x) / u_resolution.y / 2.0;
	} else {
		p.y *= u_resolution.y / u_resolution.x;
		p.y += (u_resolution.x - u_resolution.y) / u_resolution.x / 2.0;
	}
	*/
	// centering
	p -= 0.5;
	p *= vec2(-1.0, 1.0);
	return p;
}

#define rx 1.0 / min(u_resolution.x, u_resolution.y)
#define uv gl_FragCoord.xy / u_resolution.xy
#define st coord(gl_FragCoord.xy)

float fill(in float d) {
	float s = 0.2;
	return 1.0 - smoothstep(0.0 - s, rx * 2.0 + s, d);
}

float sCircle(in vec2 p, in float w) {
	return length(p) * 2.0 - w;
}
float circle(in vec2 p, in float w) {
	float d = sCircle(p, w);
	return fill(d);
}

void main() {
	vec3 a_light = v_light;
	vec3 color = vec3(1.0);
	vec3 bufferColor = texture2D(u_buffer0, uv).rgb;
	// bufferColor *= 0.99;
	bufferColor *= 0.6;
	vec2 p = vec2(
		st.x + cos(u_time * 5.0) * 0.4,
		st.y + sin(u_time * 2.25) * 0.4
	);
	float c = circle(p, 0.05);
	bufferColor = mix(bufferColor, color, c);
	bufferColor += pow(bufferColor.r, 2.0);
	bufferColor = min(vec3(1.0), bufferColor);
	gl_FragColor = vec4(bufferColor, 1.0);
}

#else

void main() {
	vec4 buffer = texture2D(u_buffer0, v_texcoord);
	vec3 color = vec3(0.0);
	color = vec3(
		abs(cos(u_time * 0.1)) * v_texcoord.y,
		abs(cos(u_time * 0.2)) * v_texcoord.y,
		abs(sin(u_time)) * v_texcoord.y
	);
	/*
	// uv.x = fract(uv.x + u_time * 0.5);
	vec4 buffer = texture2D(u_buffer0, uv);
	*/
	vec4 normal = u_normalMatrix * vec4(v_normal, 1.0);
	float fresnel = dot(normal.xyz, vec3(0.0, 0.0, 1.0));
	fresnel = 1.0 - pow(fresnel, 1.0);

	gl_FragColor = vec4((color.rgb * v_light) * v_light, 0.1 + (fresnel + buffer.r) * 2.0);

	// gl_FragColor = vec4(fresnel + color.rgb, fresnel + buffer.r);
	// gl_FragColor = vec4(vec3(fresnel), 1.0);
	// gl_FragColor = vec4(v_color.rgb * color.rgb * buffer.rgb * buffer.rgb * v_light, buffer.r);
	// gl_FragColor = buffer;
	// gl_FragColor = vec4(v_color.rgb * v_light, 1.0);
}

#endif
