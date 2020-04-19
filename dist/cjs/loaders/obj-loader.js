"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var common_1 = tslib_1.__importDefault(require("../core/common"));
var geometry_1 = tslib_1.__importDefault(require("../geometry/geometry"));
var vector3_1 = tslib_1.__importDefault(require("../math/vector3"));
var COLORS = [
    [1, 1, 1],
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
    [1, 1, 0],
    [0, 1, 1],
];
var CI = 0;
var ObjLoader = /** @class */ (function () {
    function ObjLoader() {
    }
    ObjLoader.prototype.load = function (url) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            common_1.default.fetch(url)
                // .then((response) => response.text())
                .then(function (text) {
                // console.log(text);
                var data = _this.parse(text);
                if (data.positions.length) {
                    var geometry = new geometry_1.default(data);
                    resolve(geometry);
                }
                else {
                    reject('ObjLoader error: empty positions');
                }
            }, function (error) {
                reject(error);
            });
        });
    };
    ObjLoader.prototype.parseIndices = function (faceIndices, k, l, source, output, name) {
        var i = 0;
        while (i <= faceIndices.length - 3) {
            var a = void 0, b = void 0, c = void 0;
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
            var indices = [a, b, c];
            for (var j = 0; j < indices.length; j++) {
                var index = faceIndices[indices[j]][k];
                var values = void 0;
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
    };
    ObjLoader.prototype.parseFaces = function (F, V, VN, VT, positions, normals, texcoords, colors) {
        var _this = this;
        var si = positions.length;
        F.forEach(function (faceIndices) {
            // console.log(faceIndices);
            _this.parseIndices(faceIndices, 0, 3, V, positions, 'positions');
            _this.parseIndices(faceIndices, 2, 3, VN, normals, 'normals');
            _this.parseIndices(faceIndices, 1, 2, VT, texcoords, 'texcoords');
        });
        var vl = positions.length - si;
        if (vl > 0) {
            // console.log(faceIndices.length - 2);
            var c = new Array(vl / 3).fill(0);
            c.forEach(function () {
                var rgb = COLORS[CI % COLORS.length];
                colors.push(rgb[0], rgb[1], rgb[2], 1.0);
            });
            CI++;
            /*
            console.log(positions.length, normals.length, texcoords.length, colors.length,
                positions.length / 3 * 2 === texcoords.length,
                positions.length / 3 * 4 === colors.length);
            */
        }
    };
    ObjLoader.prototype.parse = function (text) {
        var _this = this;
        var positions = [], normals = [], texcoords = [], colors = [];
        CI = 0;
        var V = [], VN = [], VT = [], F = [];
        if (text.indexOf('\r\n') !== -1) {
            text = text.replace(/\r\n/g, '\n');
        }
        /*
        if (text.indexOf('\\\n') !== - 1) {
            text = text.replace(/\\\n/g, '');
        }
        */
        text = text.replace(/  /g, ' ');
        var lines = text.split('\n');
        lines.forEach(function (line, i) {
            if (line.indexOf('v ') === 0) {
                if (F.length) {
                    _this.parseFaces(F, V, VN, VT, positions, normals, texcoords, colors);
                    F = [];
                    // V = [];
                    // VN = [];
                    // VT = [];
                }
                // v  0.0012 -0.0055 0.0090
                var a = line.replace('v', '').trim().split(' ');
                var v = a.map(function (x) { return parseFloat(x); });
                V.push(v);
            }
            else if (line.indexOf('vn ') === 0) {
                // vn 0.0128 0.9896 0.1431
                var a = line.replace('vn', '').trim().split(' ');
                var v = a.map(function (x) { return parseFloat(x); });
                var n = new vector3_1.default(v[0], v[1], v[2]).normalize();
                VN.push([n.x, n.y, n.z]);
            }
            else if (line.indexOf('vt ') === 0) {
                // vt 0.5955 0.0054 0.0000
                var a = line.replace('vt', '').trim().split(' ');
                var v = a.map(function (x) { return parseFloat(x); });
                VT.push(v);
            }
            else if (line.indexOf('f ') === 0) {
                // f 1//1 2//2 3//3 4//4
                var a = line.replace('f', '').trim().split(' ');
                var f = a.map(function (x) {
                    var indices = x.split('/').map(function (y) { return parseInt(y); });
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
        var boundingBox = { min: new vector3_1.default(Number.POSITIVE_INFINITY), max: new vector3_1.default(Number.NEGATIVE_INFINITY) };
        for (var i = 0; i < positions.length; i += 3) {
            boundingBox.min.x = Math.min(boundingBox.min.x, positions[i]);
            boundingBox.min.y = Math.min(boundingBox.min.y, positions[i + 1]);
            boundingBox.min.z = Math.min(boundingBox.min.z, positions[i + 2]);
            boundingBox.max.x = Math.max(boundingBox.max.x, positions[i]);
            boundingBox.max.y = Math.max(boundingBox.max.y, positions[i + 1]);
            boundingBox.max.z = Math.max(boundingBox.max.z, positions[i + 2]);
        }
        var centerX = true, centerY = true, centerZ = true;
        var dx = -(boundingBox.min.x + boundingBox.max.x) / 2;
        var dy = -(boundingBox.min.y + boundingBox.max.y) / 2;
        var dz = -(boundingBox.min.z + boundingBox.max.z) / 2;
        // console.log(dx, dy, dz);
        for (var i = 0; i < positions.length; i += 3) {
            positions[i] += centerX ? dx : 0;
            positions[i + 1] += centerY ? dy : 0;
            positions[i + 2] += centerZ ? dz : 0;
        }
        var radius = positions.reduce(function (p, c) {
            return Math.max(p, c);
        }, 0);
        positions.forEach(function (x, i) { return positions[i] = x / radius * 2.0; });
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
            positions: positions, normals: normals, texcoords: texcoords, colors: colors
        };
    };
    ObjLoader.prototype.unrapUvw = function (positions) {
        var texcoords = [];
        for (var i = 0; i < positions.length; i += 3) {
            var v = new vector3_1.default(positions[i], positions[i + 1], positions[i + 2]);
            v.normalize();
            var pitch = Math.asin(-v.y);
            var yaw = Math.atan2(v.x, v.z);
            var tx = 0.5 + pitch / Math.PI; // * 360;
            var ty = 0.5 + yaw / (Math.PI * 2); // * 180;
            texcoords.push(tx, ty);
        }
        return texcoords;
    };
    return ObjLoader;
}());
exports.default = ObjLoader;
