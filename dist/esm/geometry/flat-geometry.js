import Geometry from './geometry';
export default class FlatGeometry extends Geometry {
    createData_() {
        this.size = 6;
        this.positions = [
            -1.0, -1.0, 0.0, 1.0, -1.0, 0.0, 1.0, 1.0, 0.0,
            -1.0, -1.0, 0.0, 1.0, 1.0, 0.0, -1.0, 1.0, 0.0,
        ];
        this.texcoords = [
            0.0, 0.0, 1.0, 0.0, 1.0, 1.0,
            0.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        ];
        this.normals = [
            0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
        ];
        this.colors = [
            1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
        ];
        // console.log('positions', this.positions.length);
        // console.log('normals', this.normals.length);
        // console.log('texcoords', this.texcoords.length);
        // console.log('colors', this.colors.length);
    }
}
