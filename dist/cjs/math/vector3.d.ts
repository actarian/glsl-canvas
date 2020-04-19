export default class Vector3 {
    isVector3: boolean;
    x: number;
    y: number;
    z: number;
    constructor(x?: number, y?: number, z?: number);
    copy(v: Vector3): Vector3;
    length(): number;
    normalize(): Vector3;
    divideScalar(scalar: number): Vector3;
    multiplyScalar(scalar: number): Vector3;
    subVectors(a: Vector3, b: Vector3): Vector3;
    addVectors(a: Vector3, b: Vector3): Vector3;
    crossVectors(a: Vector3, b: Vector3): Vector3;
}
