
float fill(in float d){return 1.-smoothstep(0.,rx*2.,d);}

float sCircle(in vec2 p,in float w){
	return length(p)*2.-w;
}
float circle(in vec2 p,in float w){
	float d=sCircle(p,w);
	return fill(d);
}
