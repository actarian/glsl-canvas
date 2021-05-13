import Vector2 from '../math/vector2';
import Vector3 from '../math/vector3';
const PI = Math.PI;
const RAD = PI / 180;
export default class OrbitCamera extends Vector3 {
    constructor(theta, phi, radius) {
        super();
        this.position = new Vector3();
        this.value = new Float32Array([0, 0, 0]);
        this.mouse = null;
        this.dirty = false;
        this.theta = (theta || 0) * RAD;
        this.phi = (phi || 0) * RAD;
        this.radius = radius || 6.0;
        // this.update();
    }
    down(x, y) {
        this.mouse = new Vector2(x, y);
    }
    move(x, y) {
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
    wheel(d) {
        this.radius = Math.max(4.0, Math.min(10.0, this.radius + d * 0.02));
    }
    static fromVector(vector) {
        const radius = vector.length();
        const theta = Math.acos(vector.y / radius); //theta
        const phi = Math.atan(vector.x / vector.z); //phi
        return new OrbitCamera(theta, phi, radius);
    }
    static toArray(camera) {
        const spr = Math.sin(camera.phi) * camera.radius;
        const x = spr * Math.sin(camera.theta);
        const y = Math.cos(camera.phi) * camera.radius;
        const z = spr * Math.cos(camera.theta);
        return [x, y, z];
    }
}
