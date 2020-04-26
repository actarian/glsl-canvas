"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var vector3_1 = tslib_1.__importDefault(require("../math/vector3"));
var geometry_1 = tslib_1.__importDefault(require("./geometry"));
var SphereGeometry = /** @class */ (function (_super) {
    tslib_1.__extends(SphereGeometry, _super);
    function SphereGeometry() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SphereGeometry.prototype.createData_ = function () {
        var radius = 1.4;
        var widthDivisions = 80;
        var heightDivisions = 60;
        var phiStart = 0;
        var phiLength = Math.PI * 2;
        var thetaStart = 0;
        var thetaLength = Math.PI;
        var p = new vector3_1.default();
        var n = new vector3_1.default();
        // buffers
        var indices = [];
        var positions = [];
        var normals = [];
        var texcoords = [];
        var colors = [];
        //
        var thetaEnd = Math.min(thetaStart + thetaLength, Math.PI);
        var ix, iy;
        var index = 0;
        var grid = [];
        // generate positions, normals and uvs
        for (iy = 0; iy <= heightDivisions; iy++) {
            var positionRow = [];
            var v = iy / heightDivisions;
            // special case for the poles
            var uOffset = 0;
            if (iy == 0 && thetaStart == 0) {
                uOffset = 0.5 / widthDivisions;
            }
            else if (iy == heightDivisions && thetaEnd == Math.PI) {
                uOffset = -0.5 / widthDivisions;
            }
            for (ix = 0; ix <= widthDivisions; ix++) {
                var u = ix / widthDivisions;
                // position
                p.x = -radius * Math.cos(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);
                p.y = radius * Math.cos(thetaStart + v * thetaLength);
                p.z = radius * Math.sin(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);
                positions.push(p.x, p.y, p.z);
                // normal
                n.copy(p).normalize();
                normals.push(n.x, n.y, n.z);
                // uv
                var uvx = (u + uOffset);
                var uvy = (1 - v);
                texcoords.push(uvx, uvy);
                colors.push(1.0, 1.0, 1.0, 1.0);
                positionRow.push(index++);
            }
            grid.push(positionRow);
        }
        // indices
        for (iy = 0; iy < heightDivisions; iy++) {
            for (ix = 0; ix < widthDivisions; ix++) {
                var a = grid[iy][ix + 1];
                var b = grid[iy][ix];
                var c = grid[iy + 1][ix];
                var d = grid[iy + 1][ix + 1];
                if (iy !== 0 || thetaStart > 0)
                    indices.push(a, b, d);
                if (iy !== heightDivisions - 1 || thetaEnd < Math.PI)
                    indices.push(b, c, d);
            }
        }
        // build geometry
        this.size = indices.length;
        // Now create an array of positions for the cube.
        this.positions = geometry_1.default.fromIndices(indices, positions, 3);
        this.texcoords = geometry_1.default.fromIndices(indices, texcoords, 2);
        this.normals = geometry_1.default.fromIndices(indices, normals, 3);
        // Now set up the colors for the faces. We'll use solid colors
        // for each face.
        this.colors = geometry_1.default.fromIndices(indices, colors, 4);
        // this.unrapUvw(this.positions);
        // console.log('positions', this.positions.length);
        // console.log('normals', this.normals.length);
        // console.log('texcoords', this.texcoords.length);
        // console.log('colors', this.colors.length);
    };
    return SphereGeometry;
}(geometry_1.default));
exports.default = SphereGeometry;
