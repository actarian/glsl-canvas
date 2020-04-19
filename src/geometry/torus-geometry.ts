import Vector3 from "../math/vector3";
import Geometry from "./geometry";
export default class TorusGeometry extends Geometry {
	protected createData_() {
		const radius: number = 1;
		const tube: number = 0.25;
		const tubularDivisions: number = 200;
		const radialDivisions: number = 40;
		const p: number = 2;
		const q: number = 3;
		// buffers
		const indices: number[] = [];
		const positions: number[] = [];
		const normals: number[] = [];
		const texcoords: number[] = [];
		const colors: number[] = [];
		// helper variables
		const vertex = new Vector3();
		const normal = new Vector3();
		const p1 = new Vector3();
		const p2 = new Vector3();
		const B = new Vector3();
		const T = new Vector3();
		const N = new Vector3();
		// generate positions, normals and uvs
		for (let i: number = 0; i <= tubularDivisions; ++i) {
			// the radian "u" is used to calculate the position on the torus curve of the current tubular segement
			const u = i / tubularDivisions * p * Math.PI * 2;
			// now we calculate two points. p1 is our current position on the curve, p2 is a little farther ahead.
			// these points are used to create a special "coordinate space", which is necessary to calculate the correct vertex positions
			this.calculatePositionOnCurve(u, p, q, radius, p1);
			this.calculatePositionOnCurve(u + 0.01, p, q, radius, p2);
			// calculate orthonormal basis
			T.subVectors(p2, p1);
			N.addVectors(p2, p1);
			B.crossVectors(T, N);
			N.crossVectors(B, T);
			// normalize B, N. T can be ignored, we don't use it
			B.normalize();
			N.normalize();
			for (let j: number = 0; j <= radialDivisions; ++j) {
				// now calculate the positions. they are nothing more than an extrusion of the torus curve.
				// because we extrude a shape in the xy-plane, there is no need to calculate a z-value.
				const v: number = j / radialDivisions * Math.PI * 2;
				const cx: number = - tube * Math.cos(v);
				const cy: number = tube * Math.sin(v);
				// now calculate the final vertex position.
				// first we orient the extrusion with our basis vectos, then we add it to the current position on the curve
				vertex.x = p1.x + (cx * N.x + cy * B.x);
				vertex.y = p1.y + (cx * N.y + cy * B.y);
				vertex.z = p1.z + (cx * N.z + cy * B.z);
				positions.push(vertex.x, vertex.y, vertex.z);
				// normal (p1 is always the center/origin of the extrusion, thus we can use it to calculate the normal)
				normal.subVectors(vertex, p1).normalize();
				normals.push(normal.x, normal.y, normal.z);
				// uv
				texcoords.push(i / tubularDivisions);
				texcoords.push(j / radialDivisions);
				colors.push(1.0, 1.0, 1.0, 1.0);
			}
		}
		// generate indices
		for (let j: number = 1; j <= tubularDivisions; j++) {
			for (let i: number = 1; i <= radialDivisions; i++) {
				// indices
				const a: number = (radialDivisions + 1) * (j - 1) + (i - 1);
				const b: number = (radialDivisions + 1) * j + (i - 1);
				const c: number = (radialDivisions + 1) * j + i;
				const d: number = (radialDivisions + 1) * (j - 1) + i;
				// faces
				indices.push(a, b, d);
				indices.push(b, c, d);
			}
		}
		// build geometry
		this.size = indices.length;
		// Now create an array of positions for the cube.
		this.positions = Geometry.fromIndices(indices, positions, 3);
		this.texcoords = Geometry.fromIndices(indices, texcoords, 2);
		this.normals = Geometry.fromIndices(indices, normals, 3);
		// Now set up the colors for the faces. We'll use solid colors
		// for each face.
		this.colors = Geometry.fromIndices(indices, colors, 4);
		/*
		console.log('positions', this.positions.length);
		console.log('normals', this.normals.length);
		console.log('texcoords', this.texcoords.length);
		console.log('colors', this.colors.length);
		*/
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
