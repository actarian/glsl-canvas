export default class Vector3 {

	isVector3: boolean = true;
	x: number;
	y: number;
	z: number;

	constructor(x: number = 0, y: number = 0, z: number = 0) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	copy(v: Vector3): Vector3 {
		this.x = v.x;
		this.y = v.y;
		this.z = v.z;
		return this;
	}

	length(): number {
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
	}

	normalize(): Vector3 {
		return this.divideScalar(this.length() || 1);
	}


	divideScalar(scalar: number): Vector3 {
		return this.multiplyScalar(1 / scalar);
	}

	multiplyScalar(scalar: number): Vector3 {
		this.x *= scalar;
		this.y *= scalar;
		this.z *= scalar;
		return this;
	}

	subVectors(a: Vector3, b: Vector3): Vector3 {
		this.x = a.x - b.x;
		this.y = a.y - b.y;
		this.z = a.z - b.z;
		return this;
	}

	addVectors(a: Vector3, b: Vector3): Vector3 {
		this.x = a.x + b.x;
		this.y = a.y + b.y;
		this.z = a.z + b.z;
		return this;
	}

	crossVectors(a: Vector3, b: Vector3): Vector3 {
		var ax = a.x, ay = a.y, az = a.z;
		var bx = b.x, by = b.y, bz = b.z;
		this.x = ay * bz - az * by;
		this.y = az * bx - ax * bz;
		this.z = ax * by - ay * bx;
		return this;
	}

	/*
	set(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
		return this;
	}

	setScalar(scalar) {
		this.x = scalar;
		this.y = scalar;
		this.z = scalar;
		return this;
	}

	setX(x) {
		this.x = x;
		return this;
	}

	setY(y) {
		this.y = y;
		return this;
	}

	setZ(z) {
		this.z = z;
		return this;
	}

	setComponent(index, value) {
		switch (index) {
			case 0: this.x = value; break;
			case 1: this.y = value; break;
			case 2: this.z = value; break;
			default: throw new Error('index is out of range: ' + index);
		}

		return this;
	}

	getComponent(index) {
		switch (index) {
			case 0: return this.x;
			case 1: return this.y;
			case 2: return this.z;
			default: throw new Error('index is out of range: ' + index);
		}

	}

	clone() {
		return new Vector3(this.x, this.y, this.z);
	}

	add(v, w) {
		if (w !== undefined) {
			return this.addVectors(v, w);
		}
		this.x += v.x;
		this.y += v.y;
		this.z += v.z;
		return this;
	}

	addScalar(s) {
		this.x += s;
		this.y += s;
		this.z += s;
		return this;
	}

	addScaledVector(v, s) {
		this.x += v.x * s;
		this.y += v.y * s;
		this.z += v.z * s;
		return this;
	}

	sub(v, w) {
		if (w !== undefined) {
			return this.subVectors(v, w);
		}
		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;
		return this;
	}

	subScalar(s) {
		this.x -= s;
		this.y -= s;
		this.z -= s;
		return this;
	}


	multiply(v, w) {
		if (w !== undefined) {
			return this.multiplyVectors(v, w);
		}
		this.x *= v.x;
		this.y *= v.y;
		this.z *= v.z;
		return this;
	}

	multiplyVectors(a:Vector3, b:Vector3):Vector3 {
		this.x = a.x * b.x;
		this.y = a.y * b.y;
		this.z = a.z * b.z;
		return this;
	}

	applyMatrix3(m) {
		var x = this.x, y = this.y, z = this.z;
		var e = m.elements;
		this.x = e[0] * x + e[3] * y + e[6] * z;
		this.y = e[1] * x + e[4] * y + e[7] * z;
		this.z = e[2] * x + e[5] * y + e[8] * z;
		return this;
	}

	applyNormalMatrix(m) {
		return this.applyMatrix3(m).normalize();
	}

	applyMatrix4(m) {
		var x = this.x, y = this.y, z = this.z;
		var e = m.elements;
		var w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);
		this.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w;
		this.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w;
		this.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;
		return this;
	}

	applyQuaternion(q) {
		var x = this.x, y = this.y, z = this.z;
		var qx = q.x, qy = q.y, qz = q.z, qw = q.w;
		// calculate quat * vector
		var ix = qw * x + qy * z - qz * y;
		var iy = qw * y + qz * x - qx * z;
		var iz = qw * z + qx * y - qy * x;
		var iw = - qx * x - qy * y - qz * z;
		// calculate result * inverse quat
		this.x = ix * qw + iw * - qx + iy * - qz - iz * - qy;
		this.y = iy * qw + iw * - qy + iz * - qx - ix * - qz;
		this.z = iz * qw + iw * - qz + ix * - qy - iy * - qx;
		return this;
	}

	project(camera) {
		return this.applyMatrix4(camera.matrixWorldInverse).applyMatrix4(camera.projectionMatrix);
	}

	unproject(camera) {
		return this.applyMatrix4(camera.projectionMatrixInverse).applyMatrix4(camera.matrixWorld);
	}

	transformDirection(m) {
		// input: THREE.Matrix4 affine matrix
		// vector interpreted as a direction
		var x = this.x, y = this.y, z = this.z;
		var e = m.elements;
		this.x = e[0] * x + e[4] * y + e[8] * z;
		this.y = e[1] * x + e[5] * y + e[9] * z;
		this.z = e[2] * x + e[6] * y + e[10] * z;
		return this.normalize();
	}

	divide(v) {
		this.x /= v.x;
		this.y /= v.y;
		this.z /= v.z;
		return this;
	}

	min(v) {
		this.x = Math.min(this.x, v.x);
		this.y = Math.min(this.y, v.y);
		this.z = Math.min(this.z, v.z);
		return this;
	}

	max(v) {
		this.x = Math.max(this.x, v.x);
		this.y = Math.max(this.y, v.y);
		this.z = Math.max(this.z, v.z);
		return this;
	}

	clamp(min, max) {
		// assumes min < max, componentwise
		this.x = Math.max(min.x, Math.min(max.x, this.x));
		this.y = Math.max(min.y, Math.min(max.y, this.y));
		this.z = Math.max(min.z, Math.min(max.z, this.z));
		return this;
	}

	clampScalar(minVal, maxVal) {
		this.x = Math.max(minVal, Math.min(maxVal, this.x));
		this.y = Math.max(minVal, Math.min(maxVal, this.y));
		this.z = Math.max(minVal, Math.min(maxVal, this.z));
		return this;
	}

	clampLength(min, max) {
		var length = this.length();
		return this.divideScalar(length || 1).multiplyScalar(Math.max(min, Math.min(max, length)));
	}

	floor() {
		this.x = Math.floor(this.x);
		this.y = Math.floor(this.y);
		this.z = Math.floor(this.z);
		return this;
	}

	ceil() {
		this.x = Math.ceil(this.x);
		this.y = Math.ceil(this.y);
		this.z = Math.ceil(this.z);
		return this;
	}

	round() {
		this.x = Math.round(this.x);
		this.y = Math.round(this.y);
		this.z = Math.round(this.z);
		return this;
	}

	roundToZero() {
		this.x = (this.x < 0) ? Math.ceil(this.x) : Math.floor(this.x);
		this.y = (this.y < 0) ? Math.ceil(this.y) : Math.floor(this.y);
		this.z = (this.z < 0) ? Math.ceil(this.z) : Math.floor(this.z);
		return this;
	}

	negate() {
		this.x = - this.x;
		this.y = - this.y;
		this.z = - this.z;
		return this;
	}

	dot(v) {
		return this.x * v.x + this.y * v.y + this.z * v.z;
	}

	// TODO lengthSquared?
	lengthSq() {
		return this.x * this.x + this.y * this.y + this.z * this.z;
	}

	manhattanLength() {
		return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
	}

	setLength(length) {
		return this.normalize().multiplyScalar(length);
	}

	lerp(v, alpha) {
		this.x += (v.x - this.x) * alpha;
		this.y += (v.y - this.y) * alpha;
		this.z += (v.z - this.z) * alpha;
		return this;
	}

	lerpVectors(v1, v2, alpha) {
		return this.subVectors(v2, v1).multiplyScalar(alpha).add(v1);
	}

	cross(v, w) {
		if (w !== undefined) {
			return this.crossVectors(v, w);
		}
		return this.crossVectors(this, v);
	}

	projectOnVector(v) {
		var denominator = v.lengthSq();
		if (denominator === 0) return this.set(0, 0, 0);
		var scalar = v.dot(this) / denominator;
		return this.copy(v).multiplyScalar(scalar);
	}

	projectOnPlane(planeNormal) {
		const v = new Vector3();
		v.copy(this).projectOnVector(planeNormal);
		return this.sub(v);
	}

	reflect(normal) {
		const v = new Vector3();
		return this.sub(v.copy(normal).multiplyScalar(2 * this.dot(normal)));
	}

	angleTo(v) {
		var denominator = Math.sqrt(this.lengthSq() * v.lengthSq());
		if (denominator === 0) return Math.PI / 2;
		var theta = this.dot(v) / denominator;
		// clamp, to handle numerical problems
		return Math.acos(MathUtils.clamp(theta, - 1, 1));
	}

	distanceTo(v) {
		return Math.sqrt(this.distanceToSquared(v));
	}

	distanceToSquared(v) {
		var dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;
		return dx * dx + dy * dy + dz * dz;
	}

	manhattanDistanceTo(v) {
		return Math.abs(this.x - v.x) + Math.abs(this.y - v.y) + Math.abs(this.z - v.z);
	}

	setFromSpherical(s) {
		return this.setFromSphericalCoords(s.radius, s.phi, s.theta);
	}

	setFromSphericalCoords(radius, phi, theta) {
		var sinPhiRadius = Math.sin(phi) * radius;
		this.x = sinPhiRadius * Math.sin(theta);
		this.y = Math.cos(phi) * radius;
		this.z = sinPhiRadius * Math.cos(theta);
		return this;
	}

	setFromCylindrical(c) {
		return this.setFromCylindricalCoords(c.radius, c.theta, c.y);
	}

	setFromCylindricalCoords(radius, theta, y) {
		this.x = radius * Math.sin(theta);
		this.y = y;
		this.z = radius * Math.cos(theta);
		return this;
	}

	setFromMatrixPosition(m) {
		var e = m.elements;
		this.x = e[12];
		this.y = e[13];
		this.z = e[14];
		return this;
	}

	setFromMatrixScale(m) {
		var sx = this.setFromMatrixColumn(m, 0).length();
		var sy = this.setFromMatrixColumn(m, 1).length();
		var sz = this.setFromMatrixColumn(m, 2).length();
		this.x = sx;
		this.y = sy;
		this.z = sz;
		return this;
	}

	setFromMatrixColumn(m, index) {
		return this.fromArray(m.elements, index * 4);
	}

	setFromMatrix3Column(m, index) {
		return this.fromArray(m.elements, index * 3);
	}

	equals(v) {
		return ((v.x === this.x) && (v.y === this.y) && (v.z === this.z));
	}

	fromArray(array, offset) {
		if (offset === undefined) offset = 0;
		this.x = array[offset];
		this.y = array[offset + 1];
		this.z = array[offset + 2];
		return this;
	}

	toArray(array, offset) {
		if (array === undefined) array = [];
		if (offset === undefined) offset = 0;
		array[offset] = this.x;
		array[offset + 1] = this.y;
		array[offset + 2] = this.z;
		return array;
	}

	fromBufferAttribute(attribute, index) {
		this.x = attribute.getX(index);
		this.y = attribute.getY(index);
		this.z = attribute.getZ(index);
		return this;
	}

	random() {
		this.x = Math.random();
		this.y = Math.random();
		this.z = Math.random();
		return this;
	}
	*/

}

