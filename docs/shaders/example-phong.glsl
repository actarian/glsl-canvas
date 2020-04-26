#extension GL_OES_standard_derivatives : enable

#ifdef GL_ES
precision mediump float;
#endif

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

// vertex shader
#if defined(VERTEX)

/**
* attribute vec4 a_position; // myfolder/myfile.obj
*/
// attribute vec4 a_position; // data/dolphin.obj
attribute vec4 a_position;
attribute vec4 a_normal;
attribute vec2 a_texcoord;
attribute vec4 a_color;

void main(void) {
	v_position = u_projectionMatrix * u_modelViewMatrix * a_position;
	v_normal = u_normalMatrix * a_normal;
	v_texcoord = a_texcoord;
	v_color = a_color;
	gl_Position = v_position;
}

// fragment shader
#else

uniform vec2 u_mouse;
uniform vec2 u_pos;
uniform vec2 u_textureResolution;
// uniform sampler2D u_texture; // https://cdn.jsdelivr.net/gh/actarian/plausible-brdf-shader/textures/noise/cloud-1.png?repeat=true
uniform sampler2D u_texture; // https://cdn.jsdelivr.net/gh/actarian/plausible-brdf-shader/textures/mars/4096x2048/bump.jpg?repeat=true

float checker(vec2 uv, float repeats) {
	float cx = floor(repeats * uv.x);
	float cy = floor(repeats * uv.y);
	float result = mod(cx + cy, 2.0);
	return sign(result);
}

uniform float shininess;

void phong() {

	vec3 n = normalize(normal);
	vec4 diffuse = vec4(0.0);
	vec4 specular = vec4(0.0);

	// the material properties are embedded in the shader (for now)
	vec4 mat_ambient = vec4(1.0, 1.0, 1.0, 1.0);
	vec4 mat_diffuse = vec4(1.0, 1.0, 1.0, 1.0);
	vec4 mat_specular = vec4(1.0, 1.0, 1.0, 1.0);

	// ambient term
	vec4 ambient = mat_ambient * gl_LightSource[0].ambient;

	// diffuse color
	vec4 kd = mat_diffuse * gl_LightSource[0].diffuse;

	// specular color
	vec4 ks = mat_specular * gl_LightSource[0].specular;

	// diffuse term
	vec3 lightDir = normalize(gl_LightSource[0].position.xyz - vpos);
	float NdotL = dot(n, lightDir);

	if (NdotL > 0.0) {
		diffuse = kd * NdotL;
	}
	// specular term
	vec3 rVector = normalize(2.0 * n * dot(n, lightDir) - lightDir);
	vec3 viewVector = normalize(-vpos);
	float RdotV = dot(rVector, viewVector);

	if (RdotV > 0.0) {
		specular = ks * pow(RdotV, shininess);
	}
	gl_FragColor = ambient + diffuse + specular;
}

void main() {
	vec2 p = v_texcoord;
	vec3 normal = normalize(v_normal.xyz);

	// light
	vec3 ambient = vec3(0.4);
	vec3 direction = vec3(0.0, 1.0, 1.0);
	vec3 lightColor = vec3(1.0);
	// vec3 direction = vec3(sin(u_time), cos(u_time), 0.0);
	// vec3 direction = rotateY(vec3(0.0, 0.0, 1.0), - u_time * 2.0);
	float incidence = max(dot(normal, direction), - 1.0);
	vec3 light = ambient + lightColor * incidence;
	light = clamp(light, 0.0, 1.0);

	vec3 color = (0.2 * checker(p, 8.0) + normal);
	// vec3 color = normal;
	// color = clamp(max(light, color), 0.0, 1.0);
	color *= light;
	gl_FragColor = vec4(color, 1.0);
}

#endif
