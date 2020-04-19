import Common from "../core/common";
import Geometry from "../geometry/geometry";
import Vector3 from "../math/vector3";
const COLORS = [
    [1, 1, 1],
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
    [1, 1, 0],
    [0, 1, 1],
];
let CI = 0;
export default class ObjLoader {
    load(url) {
        return new Promise((resolve, reject) => {
            Common.fetch(url)
                // .then((response) => response.text())
                .then((text) => {
                // console.log(text);
                const data = this.parse(text);
                if (data.positions.length) {
                    const geometry = new Geometry(data);
                    resolve(geometry);
                }
                else {
                    reject('ObjLoader error: empty positions');
                }
            }, error => {
                reject(error);
            });
        });
    }
    parseIndices(faceIndices, k, l, source, output, name) {
        let i = 0;
        while (i <= faceIndices.length - 3) {
            let a, b, c;
            if (i === 0) {
                a = i;
                b = i + 1;
                c = i + 2;
            }
            else {
                a = i - 1;
                b = i + 1;
                c = i + 2;
            }
            i++;
            const indices = [a, b, c];
            for (let j = 0; j < indices.length; j++) {
                const index = faceIndices[indices[j]][k];
                let values;
                if (index && index !== NaN) {
                    values = source[index - 1];
                    if (values) {
                        values = values.slice(0, l);
                        output.push.apply(output, values);
                    }
                    /*
                    else {
                        console.log('error', name, source.length, index - 1);
                    }
                    */
                }
                /*
                else {
                    values = new Array(l).fill(0);
                    output.push.apply(output, values);
                }
                */
            }
        }
    }
    parseFaces(F, V, VN, VT, positions, normals, texcoords, colors) {
        const si = positions.length;
        F.forEach(faceIndices => {
            // console.log(faceIndices);
            this.parseIndices(faceIndices, 0, 3, V, positions, 'positions');
            this.parseIndices(faceIndices, 2, 3, VN, normals, 'normals');
            this.parseIndices(faceIndices, 1, 2, VT, texcoords, 'texcoords');
        });
        const vl = positions.length - si;
        if (vl > 0) {
            // console.log(faceIndices.length - 2);
            const c = new Array(vl / 3).fill(0);
            c.forEach(() => {
                const rgb = COLORS[CI % COLORS.length];
                colors.push(rgb[0], rgb[1], rgb[2], 1.0);
            });
            CI++;
            /*
            console.log(positions.length, normals.length, texcoords.length, colors.length,
                positions.length / 3 * 2 === texcoords.length,
                positions.length / 3 * 4 === colors.length);
            */
        }
    }
    parse(text) {
        let positions = [], normals = [], texcoords = [], colors = [];
        CI = 0;
        let V = [], VN = [], VT = [], F = [];
        if (text.indexOf('\r\n') !== -1) {
            text = text.replace(/\r\n/g, '\n');
        }
        /*
        if (text.indexOf('\\\n') !== - 1) {
            text = text.replace(/\\\n/g, '');
        }
        */
        text = text.replace(/  /g, ' ');
        const lines = text.split('\n');
        lines.forEach((line, i) => {
            if (line.indexOf('v ') === 0) {
                if (F.length) {
                    this.parseFaces(F, V, VN, VT, positions, normals, texcoords, colors);
                    F = [];
                    // V = [];
                    // VN = [];
                    // VT = [];
                }
                // v  0.0012 -0.0055 0.0090
                const a = line.replace('v', '').trim().split(' ');
                const v = a.map(x => parseFloat(x));
                V.push(v);
            }
            else if (line.indexOf('vn ') === 0) {
                // vn 0.0128 0.9896 0.1431
                const a = line.replace('vn', '').trim().split(' ');
                const v = a.map(x => parseFloat(x));
                const n = new Vector3(v[0], v[1], v[2]).normalize();
                VN.push([n.x, n.y, n.z]);
            }
            else if (line.indexOf('vt ') === 0) {
                // vt 0.5955 0.0054 0.0000
                const a = line.replace('vt', '').trim().split(' ');
                const v = a.map(x => parseFloat(x));
                VT.push(v);
            }
            else if (line.indexOf('f ') === 0) {
                // f 1//1 2//2 3//3 4//4
                const a = line.replace('f', '').trim().split(' ');
                const f = a.map((x) => {
                    const indices = x.split('/').map(y => parseInt(y));
                    if (indices.length === 2) {
                        indices.push(null);
                    }
                    return indices;
                });
                F[F.length] = f;
            } /*
            else if (line.indexOf('polygons') !== -1) {
                // # 8588 polygons
                const poly = parseInt(line.split(' ')[1]);
                console.log('poly', poly);
            }
            */
        });
        if (F.length) {
            this.parseFaces(F, V, VN, VT, positions, normals, texcoords, colors);
        }
        const boundingBox = { min: new Vector3(Number.POSITIVE_INFINITY), max: new Vector3(Number.NEGATIVE_INFINITY) };
        for (let i = 0; i < positions.length; i += 3) {
            boundingBox.min.x = Math.min(boundingBox.min.x, positions[i]);
            boundingBox.min.y = Math.min(boundingBox.min.y, positions[i + 1]);
            boundingBox.min.z = Math.min(boundingBox.min.z, positions[i + 2]);
            boundingBox.max.x = Math.max(boundingBox.max.x, positions[i]);
            boundingBox.max.y = Math.max(boundingBox.max.y, positions[i + 1]);
            boundingBox.max.z = Math.max(boundingBox.max.z, positions[i + 2]);
        }
        const centerX = true, centerY = true, centerZ = true;
        const dx = -(boundingBox.min.x + boundingBox.max.x) / 2;
        const dy = -(boundingBox.min.y + boundingBox.max.y) / 2;
        const dz = -(boundingBox.min.z + boundingBox.max.z) / 2;
        // console.log(dx, dy, dz);
        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += centerX ? dx : 0;
            positions[i + 1] += centerY ? dy : 0;
            positions[i + 2] += centerZ ? dz : 0;
        }
        const radius = positions.reduce((p, c) => {
            return Math.max(p, c);
        }, 0);
        positions.forEach((x, i) => positions[i] = x / radius * 2.0);
        if (!normals.length) {
            normals = positions.slice();
        }
        if (!texcoords.length) {
            texcoords = this.unrapUvw(positions);
        }
        /*
        console.log(positions.length, normals.length, texcoords.length, colors.length,
            positions.length / 3 * 2 === texcoords.length,
            positions.length / 3 * 4 === colors.length);
        */
        return {
            positions, normals, texcoords, colors
        };
    }
    unrapUvw(positions) {
        const texcoords = [];
        for (let i = 0; i < positions.length; i += 3) {
            const v = new Vector3(positions[i], positions[i + 1], positions[i + 2]);
            v.normalize();
            const pitch = Math.asin(-v.y);
            const yaw = Math.atan2(v.x, v.z);
            const tx = 0.5 + pitch / Math.PI; // * 360;
            const ty = 0.5 + yaw / (Math.PI * 2); // * 180;
            texcoords.push(tx, ty);
        }
        return texcoords;
    }
}
