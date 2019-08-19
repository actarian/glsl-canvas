#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 outColor;

void main(){
	vec2 st=gl_FragCoord.xy/u_resolution.xy;
	st.x*=u_resolution.x/u_resolution.y;
	vec3 color=vec3(0.);
	color=vec3(
		abs(cos(u_time*.1))*st.y,
		abs(cos(u_time*.2))*st.y,
		abs(sin(u_time))*st.y
	);
	outColor=vec4(color,1.);
}
