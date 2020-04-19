export default class Vector2 {

	isVector2: boolean = true;
	x: number;
	y: number;

	constructor(x: number = 0, y: number = 0) {
		this.x = x;
		this.y = y;
	}

	copy(v: Vector2): Vector2 {
		this.x = v.x;
		this.y = v.y;
		return this;
	}

	length(): number {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	normalize(): Vector2 {
		return this.divideScalar(this.length() || 1);
	}

	divideScalar(scalar: number): Vector2 {
		return this.multiplyScalar(1 / scalar);
	}

	multiplyScalar(scalar: number): Vector2 {
		this.x *= scalar;
		this.y *= scalar;
		return this;
	}

	subVectors(a: Vector2, b: Vector2): Vector2 {
		this.x = a.x - b.x;
		this.y = a.y - b.y;
		return this;
	}

	addVectors(a: Vector2, b: Vector2): Vector2 {
		this.x = a.x + b.x;
		this.y = a.y + b.y;
		return this;
	}

}

