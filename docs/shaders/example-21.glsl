#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_buffer0;

out vec4 outColor;

vec2 coord(in vec2 p){
	p=p/u_resolution.xy;
	// correct aspect ratio
	if(u_resolution.x>u_resolution.y){
		p.x*=u_resolution.x/u_resolution.y;
		p.x+=(u_resolution.y-u_resolution.x)/u_resolution.y/2.;
	}else{
		p.y*=u_resolution.y/u_resolution.x;
		p.y+=(u_resolution.x-u_resolution.y)/u_resolution.x/2.;
	}
	// centering
	p-=.5;
	p*=vec2(-1.,1.);
	return p;
}
#define rx 1./min(u_resolution.x,u_resolution.y)
#define uv gl_FragCoord.xy/u_resolution.xy
#define st coord(gl_FragCoord.xy)
#define mx coord(u_mouse)

float fill(in float d){return 1.-smoothstep(0.,rx*2.,d);}

float sCircle(in vec2 p,in float w){
	return length(p)*2.-w;
}
float circle(in vec2 p,in float w){
	float d=sCircle(p,w);
	return fill(d);
}

#if defined(BUFFER_0)

void main(){
	vec3 color=vec3(
		.5+cos(u_time)*.5,
		.5+sin(u_time)*.5,
		1.
	);
	vec3 buffer=texture(u_buffer0,uv).rgb*.99;
	vec2 p=vec2(
		st.x+cos(u_time*5.)*.3,
		st.y+sin(u_time*2.)*.3
	);
	float c=circle(p,.1+.1*sin(u_time));
	outColor=vec4(mix(buffer,color,c),1.);
}

#else

void main(){
	vec3 color=texture(u_buffer0,uv).rgb;
	outColor=vec4(color,1.);
}

#endif
