import Vector3 from '../math/vector3';
import Geometry from './geometry';
export default class TorusGeometry extends Geometry {
    protected createData_(): void;
    protected calculatePositionOnCurve(u: number, p: number, q: number, radius: number, position: Vector3): void;
}
