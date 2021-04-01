
float sCircle(in vec2 p,in float w){
	return length(p)*2.-w;
}
float circle(in vec2 p,in float w){
	float d=sCircle(p,w);
	return fill(d);
}
