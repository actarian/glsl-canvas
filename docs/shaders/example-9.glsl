// Author: Patricio Gonzalez Vivo

#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.1415926535
#define HALF_PI 1.57079632679

uniform vec2 u_resolution;
uniform float u_time;
uniform sampler2D u_texture[2];
uniform vec2 u_textureResolution[2];

vec2 scale(vec2 st, float s) {
    return (st-.5)*s+.5;
}

vec2 ratio(in vec2 st, in vec2 s) {
    return mix( vec2((st.x*s.x/s.y)-(s.x*.5-s.y*.5)/s.y,st.y),
			vec2(st.x,st.y*(s.y/s.x)-(s.y*.5-s.x*.5)/s.x),
			step(s.x,s.y));
}

float circleSDF(vec2 st) {
    return length(st - 0.5) * 2.0;
}

vec2 sphereCoords(vec2 _st, float _scale){
    float maxFactor = sin(1.570796327);
    vec2 uv = vec2(0.0);
    vec2 xy = 2.0 * _st.xy - 1.0;
    float d = length(xy);
    if (d < (2.0-maxFactor)){
        d = length(xy * maxFactor);
        float z = sqrt(1.0 - d * d);
        float r = atan(d, z) / 3.1415926535 * _scale;
        float phi = atan(xy.y, xy.x);
        uv.x = r * cos(phi) + 0.5;
        uv.y = r * sin(phi) + 0.5;
    } else {
        uv = _st.xy;
    }
    return uv;
}

vec4 sphereTexture(in sampler2D _tex, in vec2 _uv, float _time) {
    vec2 st = sphereCoords(_uv, 1.0);
    float aspect;
    int i = int(mod(u_time, 2.0));
    if (i == 0) {
        aspect = u_textureResolution[0].y / u_textureResolution[0].x;
    } else {
        aspect = u_textureResolution[1].y / u_textureResolution[1].x;
    }
    st.x = fract(st.x * aspect + _time);
    return texture2D(_tex, st);
}

vec3 sphereNormals(in vec2 uv) {
    uv = fract(uv)*2.0-1.0;
    vec3 ret;
    ret.xy = sqrt(uv * uv) * sign(uv);
    ret.z = sqrt(abs(1.0 - dot(ret.xy,ret.xy)));
    ret = ret * 0.5 + 0.5;
    return mix(vec3(0.0), ret, smoothstep(1.0,0.98,dot(uv,uv)) );
}

void main(){
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st = scale(st, 2.0);
    st = ratio(st, u_resolution);
    vec3 color = vec3(0.0);
    int i = int(mod(u_time, 2.0));
    if (i == 0) {
        color = sphereTexture(u_texture[0], st, u_time * 0.01).rgb;
    } else {
        color = sphereTexture(u_texture[1], st, u_time * 0.01).rgb;
    }

    float speedSun = 0.50;
    vec3 sunPos = normalize(vec3(cos(u_time * speedSun - HALF_PI), 0.0, sin(speedSun * u_time - HALF_PI)));
    vec3 surface = normalize(sphereNormals(st)*2.0-1.0);

    // Add Shadows
    color *= clamp(dot(sunPos, surface), 0.0, 1.0);

    // Blend black the edge of the sphere
    float radius = 1.0 - circleSDF(st);
    color *= smoothstep(0.001, 0.02, radius);
    st = scale(st, 2.);
    gl_FragColor = vec4(color, 1.0);
}
