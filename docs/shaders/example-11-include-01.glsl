
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_buffer0;

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
