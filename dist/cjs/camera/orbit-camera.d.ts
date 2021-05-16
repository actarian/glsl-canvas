import Vector2 from '../math/vector2';
import Vector3 from '../math/vector3';
export default class OrbitCamera extends Vector3 {
    theta: number;
    phi: number;
    radius: number;
    position: Vector3;
    value: Float32Array;
    mouse: Vector2;
    dirty: boolean;
    constructor(theta?: number, phi?: number, radius?: number);
    down(x: number, y: number): void;
    move(x: number, y: number): void;
    up(): void;
    wheel(d: number): void;
    static fromVector(vector: Vector3): OrbitCamera;
    static toArray(camera: OrbitCamera): number[];
}
