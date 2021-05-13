#ifdef GL_ES
  precision highp float;
#endif

uniform vec3 u_camera;

void main() {
  vec3 c = vec3(u_camera.x, 1.0, 1.0);
  gl_FragColor = vec4(c, 1.0);
}