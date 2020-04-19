export default class Vector2 {
    isVector2: boolean;
    x: number;
    y: number;
    constructor(x?: number, y?: number);
    copy(v: Vector2): Vector2;
    length(): number;
    normalize(): Vector2;
    divideScalar(scalar: number): Vector2;
    multiplyScalar(scalar: number): Vector2;
    subVectors(a: Vector2, b: Vector2): Vector2;
    addVectors(a: Vector2, b: Vector2): Vector2;
}
