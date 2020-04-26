
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_video;
uniform vec2 u_videoResolution;
uniform float u_x;
uniform float u_y;

vec3 pixellate(vec2 uv, vec3 color) {
    float size = 30.0 * u_y / u_resolution.y;
    if (size > 0.0) {
        float dx = size / u_resolution.x;
        float dy = size / u_resolution.y;
        uv = vec2(dx * (floor(uv.x / dx) + 0.5), dy * (floor(uv.y / dy) + 0.5));
        return texture2D(u_video, uv).rgb;
    }
    return color;
}

void main() {
   	vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec3 video = texture2D(u_video, uv).rgb;
    vec3 color = gl_FragCoord.x < u_x ? pixellate(uv, video) : video;
    gl_FragColor = vec4(color, 1.0);
}
