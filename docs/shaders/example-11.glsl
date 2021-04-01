#ifdef GL_ES
precision mediump float;
#endif

#include "./example-11-include-01.glsl"
#include "./example-11-include-02.glsl"

void main(){
	vec3 color=vec3(
		.5+cos(u_time)*.5,
		.5+sin(u_time)*.5,
		1.
	);
	vec2 p=vec2(
		st.x+cos(u_time*5.)*.3,
		st.y+sin(u_time*2.)*.3
	);
	float c=circle(p,.1+.1*sin(u_time));
	gl_FragColor=vec4(mix(vec3(0.),color,c),1.);
}
