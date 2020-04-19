
import Vector2 from '../math/vector2';
import Vector3 from '../math/vector3';

const PI = Math.PI;
const RAD = PI / 180;

export default class OrbitCamera extends Vector3 {

	theta: number;
	phi: number;
	radius: number;
	position: Vector3 = new Vector3();
	value: Float32Array = new Float32Array([0, 0, 0]);
	mouse: Vector2;
	dirty: boolean = false;

	constructor(theta?: number, phi?: number, radius?: number) {
		super();
		this.theta = (theta || 0) * RAD;
		this.phi = (phi || 0) * RAD;
		this.radius = radius || 6.0;
		// this.update();
	}

	down(x: number, y: number) {
		this.mouse = new Vector2(x, y);
	}

	move(x: number, y: number) {
		const mouse = this.mouse;
		if (mouse && (mouse.x !== x || mouse.y !== y)) {
			const theta = (x - mouse.x) * 180 * RAD;
			const phi = (y - mouse.y) * 180 * RAD;
			mouse.x = x;
			mouse.y = y;
			this.theta += theta;
			this.phi = Math.max(-60 * RAD, Math.min(60 * RAD, this.phi + phi));
			// this.update();
		}
	}

	up() {
		this.mouse = null;
	}

	wheel(d: number) {
		this.radius = Math.max(4.0, Math.min(10.0, this.radius + d * 0.02));
	}

	/*

	update() {
		const spr = Math.sin(this.phi) * this.radius;
		const x = spr * Math.sin(this.theta);
		const y = Math.cos(this.phi) * this.radius;
		const z = spr * Math.cos(this.theta);
		this.position.x = x;
		this.position.y = y;
		this.position.z = z;
		this.value[0] = x;
		this.value[1] = y;
		this.value[2] = z;
	}

	render(canvas: Canvas) {
		const vector = OrbitCamera.toVector(this);
		const array = new Float32Array([vector.x, vector.y, vector.z]);
		this.update_(canvas, '3fv', 'vec3', 'u_camera', array);
	}

	update_(canvas: Canvas, method, type, name, value) {
		try {
			const u = canvas.uniforms[name] = canvas.uniforms[name] || {};
			u.name = name;
			u.value = value;
			u.type = type;
			u.method = 'uniform' + method;
			u.location = canvas.gl.getUniformLocation(canvas.program, name);
			canvas.gl[u.method].apply(canvas.gl, [u.location].concat(u.value));
		} catch (e) {
			console.log('fastUpdate', e);
		}
	}

	static toVector(camera: OrbitCamera): Vector3 {
		camera.update();
		return camera.position;
		const spr = Math.sin(camera.phi) * camera.radius;
		const x = spr * Math.sin(camera.theta);
		const y = Math.cos(camera.phi) * camera.radius;
		const z = spr * Math.cos(camera.theta);
		return new Vector3(x, y, z);
	}
	*/

	static fromVector(vector: Vector3) {
		const radius = vector.length();
		const theta = Math.acos(vector.y / radius); //theta
		const phi = Math.atan(vector.x / vector.z); //phi
		return new OrbitCamera(theta, phi, radius);
	}

}
