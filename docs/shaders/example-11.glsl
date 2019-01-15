

// Author: Luca Zampetti

#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
uniform sampler2D u_video;
uniform vec2 u_videoResolution;
uniform vec3 u_color;
uniform float u_threshold;
uniform float u_smoothing;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
	vec4 color = texture2D(u_video, st);

/*
    vec3 u_color = vec3(76.0/255.0, 229.0/255.0, 45.0/255.0);
    float u_threshold = 0.35;
    float u_smoothing = 0.001;
*/

    float Y = 0.2989 * u_color.r + 0.5866 * u_color.g + 0.1145 * u_color.b;
    float Cr = 0.7132 * (u_color.r - Y);
    float Cb = 0.5647 * (u_color.b - Y);

    float videoY = 0.2989 * color.r + 0.5866 * color.g + 0.1145 * color.b;
    float videoCr = 0.7132 * (color.r - videoY);
    float videoCb = 0.5647 * (color.b - videoY);

    float mask = distance(vec2(videoCr, videoCb), vec2(Cr, Cb));

    float alpha = smoothstep(u_threshold, u_threshold + u_smoothing, mask);

    // vec3 post = mix(color.rgb, vec3(1.0), color.a * alpha);
    // gl_FragColor = vec4(vec3(u_threshold), 1.0); 
    gl_FragColor = vec4(mix(vec3(1.0), color.rgb, color.a * alpha), 1.0);    
}