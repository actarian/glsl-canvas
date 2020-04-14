import Vector3 from "../math/vector3";
import Geometry from "./geometry";

export default class SphereGeometry extends Geometry {

	protected createData_() {
		const radius = 1.4;
		const widthDivisions = 80;
		const heightDivisions = 60;
		const phiStart = 0;
		const phiLength = Math.PI * 2;
		const thetaStart = 0;
		const thetaLength = Math.PI;
		const p = new Vector3();
		const n = new Vector3();
		// buffers
		const indices = [];
		const positions = [];
		const normals = [];
		const texcoords = [];
		const colors = [];
		//
		let thetaEnd = Math.min(thetaStart + thetaLength, Math.PI);
		let ix, iy;
		let index = 0;
		let grid = [];
		// generate positions, normals and uvs
		for (iy = 0; iy <= heightDivisions; iy++) {
			let positionRow = [];
			let v = iy / heightDivisions;
			// special case for the poles
			let uOffset = 0;
			if (iy == 0 && thetaStart == 0) {
				uOffset = 0.5 / widthDivisions;
			} else if (iy == heightDivisions && thetaEnd == Math.PI) {
				uOffset = -0.5 / widthDivisions;
			}
			for (ix = 0; ix <= widthDivisions; ix++) {
				let u = ix / widthDivisions;
				// position
				p.x = -radius * Math.cos(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);
				p.y = radius * Math.cos(thetaStart + v * thetaLength);
				p.z = radius * Math.sin(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);
				positions.push(p.x, p.y, p.z);
				// normal
				n.copy(p).normalize();
				normals.push(n.x, n.y, n.z);
				// uv
				const uvx = (u + uOffset);
				const uvy = (1 - v);
				texcoords.push(uvx, uvy);
				colors.push(1.0, 1.0, 1.0, 1.0);
				positionRow.push(index++);
			}
			grid.push(positionRow);
		}
		// indices
		for (iy = 0; iy < heightDivisions; iy++) {
			for (ix = 0; ix < widthDivisions; ix++) {
				const a = grid[iy][ix + 1];
				const b = grid[iy][ix];
				const c = grid[iy + 1][ix];
				const d = grid[iy + 1][ix + 1];
				if (iy !== 0 || thetaStart > 0) indices.push(a, b, d);
				if (iy !== heightDivisions - 1 || thetaEnd < Math.PI) indices.push(b, c, d);
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
		// this.unrapUvw(this.positions);
		/*
		console.log('positions', this.positions.length);
		console.log('normal', this.normal.length);
		console.log('texcoords', this.texcoords.length);
		console.log('color', this.color.length);
		*/
	}

	/*
	unrapUvw(positions: number[]): void {
		const texcoords: number[] = this.texcoords = [];
		for (let i = 0; i < positions.length; i += 3) {
			const v = new Vector3(positions[i], positions[i + 1], positions[i + 2]);
			v.normalize();
			const pitch = Math.asin(-v.y);
			const yaw = Math.atan2(v.x, v.z);
			const tx = 0.5 + pitch / Math.PI; // * 360;
			const ty = 0.5 + yaw / (Math.PI * 2); // * 180;
			texcoords.push(tx, ty);
		}
	}
	*/

}
