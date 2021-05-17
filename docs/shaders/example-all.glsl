#extension GL_OES_standard_derivatives : enable

#ifdef GL_ES
precision mediump float;
#endif

// #define useWobble
// #define useAlpha
#define useNoise
#define useGrid
// #define useVignette
// #define useHatch

// common

varying vec4 v_position;
varying vec4 v_normal;
varying vec2 v_texcoord;
varying vec4 v_color;

uniform mat4 u_projectionMatrix;
uniform mat4 u_modelViewMatrix;
uniform mat4 u_normalMatrix;
uniform vec2 u_resolution;
uniform float u_time;

float easeQuintInOut(float t) {
	if ((t / 2.0) < 1.0)return 0.5 * t * t * t * t * t;
	return 0.5 * ((t -= 2.0) * t * t * t * t + 2.0);
}

mat4 rotationAxis(float angle, vec3 axis) {
	axis = normalize(axis);
	float s = sin(angle);
	float c = cos(angle);
	float oc = 1.0 - c;
	return mat4(oc * axis.x * axis.x + c, oc * axis.x * axis.y - axis.z * s, oc * axis.z * axis.x + axis.y * s, 0.0,
		oc * axis.x * axis.y + axis.z * s, oc * axis.y * axis.y + c, oc * axis.y * axis.z - axis.x * s, 0.0,
		oc * axis.z * axis.x - axis.y * s, oc * axis.y * axis.z + axis.x * s, oc * axis.z * axis.z + c, 0.0,
	0.0, 0.0, 0.0, 1.0);
}

vec3 rotateX(vec3 p, float angle) {
	return (vec4(p, 1.0) * rotationAxis(angle, vec3(1.0, 0.0, 0.0))).xyz;
}

vec3 rotateY(vec3 p, float angle) {
	return (vec4(p, 1.0) * rotationAxis(angle, vec3(0.0, 1.0, 0.0))).xyz;
}

vec3 rotateZ(vec3 p, float angle) {
	return (vec4(p, 1.0) * rotationAxis(angle, vec3(0.0, 0.0, 1.0))).xyz;
}

#if defined(VERTEX)
// vertex shader

/**
* attribute vec4 a_position; // myfolder/myfile.obj
*/
// attribute vec4 a_position; // glsl-canvas/data/dolphin.obj
attribute vec4 a_position;
attribute vec4 a_normal;
attribute vec2 a_texcoord;
attribute vec4 a_color;

void main(void) {
	v_position = a_position;
	#if defined(useWobble)
	v_position.xyz = rotateZ(
		v_position.xyz,
		cos(u_time + a_position.x) * sin(u_time * 4.0 + a_position.y) * 0.2
	);
	#endif
	v_position = u_projectionMatrix * u_modelViewMatrix * v_position;
	v_normal = u_normalMatrix * a_normal;
	v_texcoord = a_texcoord;
	v_color = a_color;
	gl_Position = v_position;
}

#else
// fragment shader

uniform vec2 u_textureResolution;
uniform vec2 u_mouse;
uniform vec2 u_pos;
uniform sampler2D u_buffer0;
// uniform sampler2D u_texture; // https://cdn.jsdelivr.net/gh/actarian/plausible-brdf-shader/textures/noise/cloud-1.png?repeat=true
uniform sampler2D u_texture; // https://cdn.jsdelivr.net/gh/actarian/plausible-brdf-shader/textures/mars/4096x2048/bump.jpg?repeat=true

#define PI_TWO 1.570796326794897
#define PI 3.141592653589793
#define TWO_PI 6.283185307179586
#define RAD = PI / 180.0

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

vec2 tile(in vec2 p, vec2 w) { return fract(mod(p + w / 2.0, w)) - (w / 2.0); }
vec2 tile(in vec2 p, float w) { return tile(p, vec2(w)); }

float grid(vec2 p) {
	vec2 grid = abs(fract(p - 0.5) - 0.5) / fwidth(p);
	float line = min(grid.x, grid.y);
	return 1.0 - min(line, 1.0);
}

// noise
float rand(vec2 n) {
	return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}
float noise(vec2 p) {
	p *= 300.0;
	vec2 ip = floor(p);
	vec2 u = fract(p);
	u = u * u * (3.0 - 2.0 * u);
	float res = mix(
		mix(rand(ip), rand(ip + vec2(1.0, 0.0)), u.x),
		mix(rand(ip + vec2(0.0, 1.0)), rand(ip + vec2(1.0, 1.0)), u.x),
		u.y
	);
	return res * res;
}

// fbm
float hash(in vec2 p, in float scale) {
	p = mod(p, scale);
	return fract(sin(dot(p, vec2(27.16898, 38.90563))) * 5151.5473453);
}
float noise(in vec2 p, in float scale) {
	vec2 f;
	p *= scale;
	f = fract(p); // Separate integer from fractional
	p = floor(p);
	f = f * f * (3.0 - 2.0 * f); // Cosine interpolation approximation
	float res = mix(mix(hash(p, scale),
	hash(p + vec2(1.0, 0.0), scale), f.x),
	mix(hash(p + vec2(0.0, 1.0), scale),
	hash(p + vec2(1.0, 1.0), scale), f.x), f.y);
	return res;
}
float fbm(in vec2 p) {
	// p += vec2(sin(u_time * 0.7), cos(u_time * 0.45)) * (0.1) + u_mouse.xy * 0.1 / u_resolution.xy;
	float f = 0.0;
	// Change starting scale to any integer value...
	float scale = 60.0;
	p = mod(p, scale);
	float amp = 0.1;
	for(int i = 0; i < 5; i ++ ) {
		f += noise(p, scale) * amp;
		amp *= 0.5;
		// Scale must be multiplied by an integer value...
		scale *= 2.0;
	}
	return min(f, 1.0);
}

vec2 dHdxy(vec2 p, float strength) {
	vec2 duvx = dFdx(p);
	vec2 duvy = dFdy(p);
	float lev = strength * texture2D(u_texture, p).r;
	float dx = strength * texture2D(u_texture, p + duvx).r - lev;
	float dy = strength * texture2D(u_texture, p + duvy).r - lev;
	return vec2(dx, dy);
}

vec3 bumpNormal(vec3 p, vec3 n, vec2 dHdxy) {
	vec3 sigmax = vec3(dFdx(p.x), dFdx(p.y), dFdx(p.z));
	vec3 sigmay = vec3(dFdy(p.x), dFdy(p.y), dFdy(p.z));
	vec3 crossy = cross(sigmay, n);
	vec3 crossx = cross(n, sigmax);
	float det = dot(sigmax, crossy);
	det *= (float(gl_FrontFacing) * 2.0 - 1.0);
	vec3 grad = sign(det) * (dHdxy.x * crossy + dHdxy.y * crossx);
	return normalize(abs(det) * n - grad);
}

void main() {
	vec2 p = v_texcoord;
	vec3 normal = v_normal.xyz;

	#if defined(useNoise)
	vec2 t = p;
	// vec2 t = p + vec2(-u_time * 0.1);
	vec2 dxy = dHdxy(t, 0.02);
	normal = bumpNormal(vec3(t, 1.0), normal, dxy);
	#endif

	// light
	vec3 ambient = vec3(0.4);
	vec3 direction = vec3(0.0, 1.0, 0.0);
	vec3 lightColor = vec3(1.0);
	// vec3 direction = rotateY(vec3(0.0, 0.0, 1.0), - u_time * 2.0);
	float incidence = max(dot(normal, direction), - 1.0);
	vec3 light = clamp(ambient + lightColor * incidence, 0.0, 1.0);

	// fresnel
	float fresnel = 1.0 - dot(normal, vec3(0.0, 0.0, 1.0));

	// alpha
	#if defined(useAlpha)
	float alpha = 0.1 + fresnel;
	#else
	float alpha = 1.0;
	#endif

	// hatch
	#if defined(useVignette)
	float hatch = clamp(fresnel - incidence, 0.0, 1.0);
	hatch = smoothstep(hatch, 0.0, 0.2);
	#if defined(useHatch)
	hatch *= step(length(tile(st * 70.0, 0.9)) * 2.0, 0.5);
	#endif
	#else
	float hatch = 0.0;
	#endif

	vec3 color = (0.2 + normal);
	// color = vec3(n);

	// grid
	#if defined(useGrid)
	float gridColor = max(grid(p * 4.0) * 0.6, grid(p * 8.0) * 0.3);
	light *= (1.0 - gridColor);
	#endif

	gl_FragColor = vec4(clamp(max(light, color), 0.0, 1.0) - hatch, alpha);
	// gl_FragColor = vec4(light * color - hatch, alpha);
	// gl_FragColor = vec4(light - hatch, alpha);
}

#endif
