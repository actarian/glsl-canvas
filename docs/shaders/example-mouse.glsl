#ifdef GL_ES
  precision highp float;
#endif

uniform vec3 u_camera;
uniform vec2 u_mouse;

void main() {
	if (length(u_mouse - gl_FragCoord.xy) < 10.0) {
		gl_FragColor = vec4(1.0);
	} else {
        gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
    }
}