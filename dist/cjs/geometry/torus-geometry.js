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
        var indices = [];
        var positions = [];
        var normals = [];
        var texcoords = [];
        var colors = [];
        var vertex = new vector3_1.default();
        var normal = new vector3_1.default();
        var p1 = new vector3_1.default();
        var p2 = new vector3_1.default();
        var B = new vector3_1.default();
        var T = new vector3_1.default();
        var N = new vector3_1.default();
        for (var i = 0; i <= tubularDivisions; ++i) {
            var u = i / tubularDivisions * p * Math.PI * 2;
            this.calculatePositionOnCurve(u, p, q, radius, p1);
            this.calculatePositionOnCurve(u + 0.01, p, q, radius, p2);
            T.subVectors(p2, p1);
            N.addVectors(p2, p1);
            B.crossVectors(T, N);
            N.crossVectors(B, T);
            B.normalize();
            N.normalize();
            for (var j = 0; j <= radialDivisions; ++j) {
                var v = j / radialDivisions * Math.PI * 2;
                var cx = -tube * Math.cos(v);
                var cy = tube * Math.sin(v);
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
        for (var j = 1; j <= tubularDivisions; j++) {
            for (var i = 1; i <= radialDivisions; i++) {
                var a = (radialDivisions + 1) * (j - 1) + (i - 1);
                var b = (radialDivisions + 1) * j + (i - 1);
                var c = (radialDivisions + 1) * j + i;
                var d = (radialDivisions + 1) * (j - 1) + i;
                indices.push(a, b, d);
                indices.push(b, c, d);
            }
        }
        this.size = indices.length;
        this.positions = geometry_1.default.fromIndices(indices, positions, 3);
        this.texcoords = geometry_1.default.fromIndices(indices, texcoords, 2);
        this.normals = geometry_1.default.fromIndices(indices, normals, 3);
        this.colors = geometry_1.default.fromIndices(indices, colors, 4);
        // console.log('positions', this.positions.length);
        // console.log('normals', this.normals.length);
        // console.log('texcoords', this.texcoords.length);
        // console.log('colors', this.colors.length);
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
