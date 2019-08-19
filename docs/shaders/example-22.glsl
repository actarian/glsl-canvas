#version 300 es

precision mediump float;

// Author: Patricio Gonzalez Vivo

#define PI 3.1415926535
#define HALF_PI 1.57079632679

uniform vec2 u_resolution;
uniform float u_time;
uniform sampler2D u_tex0;// data/moon.jpg
uniform vec2 u_tex0Resolution;
uniform sampler2D u_logo;// data/logo.jpg
uniform vec2 u_logoResolution;

vec2 scale(vec2 st,float s){
	return(st-.5)*s+.5;
}

vec2 ratio(in vec2 st,in vec2 s){
	return mix(vec2((st.x*s.x/s.y)-(s.x*.5-s.y*.5)/s.y,st.y),
	vec2(st.x,st.y*(s.y/s.x)-(s.y*.5-s.x*.5)/s.x),
	step(s.x,s.y));
}

float circleSDF(vec2 st){
	return length(st-.5)*2.;
}

vec2 sphereCoords(vec2 _st,float _scale){
	float maxFactor=sin(1.570796327);
	vec2 uv=vec2(0.);
	vec2 xy=2.*_st.xy-1.;
	float d=length(xy);
	if(d<(2.-maxFactor)){
		d=length(xy*maxFactor);
		float z=sqrt(1.-d*d);
		float r=atan(d,z)/3.1415926535*_scale;
		float phi=atan(xy.y,xy.x);
		uv.x=r*cos(phi)+.5;
		uv.y=r*sin(phi)+.5;
	}else{
		uv=_st.xy;
	}
	return uv;
}

vec4 sphereTexture(in sampler2D _tex,in vec2 _uv,float _time){
	vec2 st=sphereCoords(_uv,1.);
	float aspect=u_tex0Resolution.y/u_tex0Resolution.x;
	st.x=fract(st.x*aspect+_time);
	return texture(_tex,st);
}

vec3 sphereNormals(in vec2 uv){
	uv=fract(uv)*2.-1.;
	vec3 ret;
	ret.xy=sqrt(uv*uv)*sign(uv);
	ret.z=sqrt(abs(1.-dot(ret.xy,ret.xy)));
	ret=ret*.5+.5;
	return mix(vec3(0.),ret,smoothstep(1.,.98,dot(uv,uv)));
}

out vec4 outColor;

void main(){
	vec2 st=gl_FragCoord.xy/u_resolution.xy;
	st=scale(st,2.);
	st=ratio(st,u_resolution);
	vec3 color=vec3(0.);
	color=sphereTexture(u_tex0,st,u_time*.01).rgb;

	// Calculate sun direction
	float speedSun=.25;
	vec3 sunPos=normalize(vec3(cos(u_time*speedSun-HALF_PI),0.,sin(speedSun*u_time-HALF_PI)));
	vec3 surface=normalize(sphereNormals(st)*2.-1.);

	// Add Shadows
	color*=clamp(dot(sunPos,surface),0.,1.);
	// Blend black the edge of the sphere
	float radius=1.-circleSDF(st);
	color*=smoothstep(.001,.02,radius);
	st=scale(st,2.);
	color+=texture(u_logo,st).rgb*step(.0001,st.y)*step(st.y,.999);
	outColor=vec4(color,1.);
}
