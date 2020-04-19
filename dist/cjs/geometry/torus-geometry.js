"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var vector3_1 = tslib_1.__importDefault(require("../math/vector3"));
var geometry_1 = tslib_1.__importDefault(require("./geometry"));
var TorusGeometry = /** @class */ (function (_super) {
    tslib_1.__extends(TorusGeometry, _super);
    function TorusGeometry() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TorusGeometry.prototype.createData_ = function () {
        var radius = 1;
        var tube = 0.25;
        var tubularDivisions = 200;
        var radialDivisions = 40;
        var p = 2;
        var q = 3;
        // buffers
        var indices = [];
        var positions = [];
        var normals = [];
        var texcoords = [];
        var colors = [];
        // helper variables
        var vertex = new vector3_1.default();
        var normal = new vector3_1.default();
        var p1 = new vector3_1.default();
        var p2 = new vector3_1.default();
        var B = new vector3_1.default();
        var T = new vector3_1.default();
        var N = new vector3_1.default();
        // generate positions, normals and uvs
        for (var i = 0; i <= tubularDivisions; ++i) {
            // the radian "u" is used to calculate the position on the torus curve of the current tubular segement
            var u = i / tubularDivisions * p * Math.PI * 2;
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
            for (var j = 0; j <= radialDivisions; ++j) {
                // now calculate the positions. they are nothing more than an extrusion of the torus curve.
                // because we extrude a shape in the xy-plane, there is no need to calculate a z-value.
                var v = j / radialDivisions * Math.PI * 2;
                var cx = -tube * Math.cos(v);
                var cy = tube * Math.sin(v);
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
        for (var j = 1; j <= tubularDivisions; j++) {
            for (var i = 1; i <= radialDivisions; i++) {
                // indices
                var a = (radialDivisions + 1) * (j - 1) + (i - 1);
                var b = (radialDivisions + 1) * j + (i - 1);
                var c = (radialDivisions + 1) * j + i;
                var d = (radialDivisions + 1) * (j - 1) + i;
                // faces
                indices.push(a, b, d);
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
        /*
        console.log('positions', this.positions.length);
        console.log('normals', this.normals.length);
        console.log('texcoords', this.texcoords.length);
        console.log('colors', this.colors.length);
        */
    };
    TorusGeometry.prototype.calculatePositionOnCurve = function (u, p, q, radius, position) {
        var cu = Math.cos(u);
        var su = Math.sin(u);
        var quOverP = q / p * u;
        var cs = Math.cos(quOverP);
        position.x = radius * (2 + cs) * 0.5 * cu;
        position.y = radius * (2 + cs) * su * 0.5;
        position.z = radius * Math.sin(quOverP) * 0.5;
    };
    return TorusGeometry;
}(geometry_1.default));
exports.default = TorusGeometry;
