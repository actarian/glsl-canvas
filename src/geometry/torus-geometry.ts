import Vector3 from '../math/vector3';
import Geometry from './geometry';

export default class TorusGeometry extends Geometry {

	protected createData_() {
		const radius: number = 1;
		const tube: number = 0.25;
		const tubularDivisions: number = 200;
		const radialDivisions: number = 40;
		const p: number = 2;
		const q: number = 3;
		const indices: number[] = [];
		const positions: number[] = [];
		const normals: number[] = [];
		const texcoords: number[] = [];
		const colors: number[] = [];
		const vertex = new Vector3();
		const normal = new Vector3();
		const p1 = new Vector3();
		const p2 = new Vector3();
		const B = new Vector3();
		const T = new Vector3();
		const N = new Vector3();
		for (let i: number = 0; i <= tubularDivisions; ++i) {
			const u = i / tubularDivisions * p * Math.PI * 2;
			this.calculatePositionOnCurve(u, p, q, radius, p1);
			this.calculatePositionOnCurve(u + 0.01, p, q, radius, p2);
			T.subVectors(p2, p1);
			N.addVectors(p2, p1);
			B.crossVectors(T, N);
			N.crossVectors(B, T);
			B.normalize();
			N.normalize();
			for (let j: number = 0; j <= radialDivisions; ++j) {
				const v: number = j / radialDivisions * Math.PI * 2;
				const cx: number = - tube * Math.cos(v);
				const cy: number = tube * Math.sin(v);
				vertex.x = p1.x + (cx * N.x + cy * B.x);
				vertex.y = p1.y + (cx * N.y + cy * B.y);
				vertex.z = p1.z + (cx * N.z + cy * B.z);
				positions.push(vertex.x, vertex.y, vertex.z);
				normal.subVectors(vertex, p1).normalize();
				normals.push(normal.x, normal.y, normal.z);
				texcoords.push(i / tubularDivisions * 2.0 * Math.round(q));
				texcoords.push(j / radialDivisions);
				colors.push(1.0, 1.0, 1.0, 1.0);
			}
		}
		for (let j: number = 1; j <= tubularDivisions; j++) {
			for (let i: number = 1; i <= radialDivisions; i++) {
				const a: number = (radialDivisions + 1) * (j - 1) + (i - 1);
				const b: number = (radialDivisions + 1) * j + (i - 1);
				const c: number = (radialDivisions + 1) * j + i;
				const d: number = (radialDivisions + 1) * (j - 1) + i;
				indices.push(a, b, d);
				indices.push(b, c, d);
			}
		}
		this.size = indices.length;
		this.positions = Geometry.fromIndices(indices, positions, 3);
		this.texcoords = Geometry.fromIndices(indices, texcoords, 2);
		this.normals = Geometry.fromIndices(indices, normals, 3);
		this.colors = Geometry.fromIndices(indices, colors, 4);
		// console.log('positions', this.positions.length);
		// console.log('normals', this.normals.length);
		// console.log('texcoords', this.texcoords.length);
		// console.log('colors', this.colors.length);
	}

	protected calculatePositionOnCurve(u: number, p: number, q: number, radius: number, position: Vector3): void {
		const cu: number = Math.cos(u);
		const su: number = Math.sin(u);
		const quOverP: number = q / p * u;
		const cs: number = Math.cos(quOverP);
		position.x = radius * (2 + cs) * 0.5 * cu;
		position.y = radius * (2 + cs) * su * 0.5;
		position.z = radius * Math.sin(quOverP) * 0.5;
	}

}
