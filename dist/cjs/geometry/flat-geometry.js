"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var geometry_1 = tslib_1.__importDefault(require("./geometry"));
var FlatGeometry = /** @class */ (function (_super) {
    tslib_1.__extends(FlatGeometry, _super);
    function FlatGeometry() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FlatGeometry.prototype.createData_ = function () {
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
        /*
        console.log('positions', this.positions.length);
        console.log('normals', this.normals.length);
        console.log('texcoords', this.texcoords.length);
        console.log('colors', this.colors.length);
        */
    };
    return FlatGeometry;
}(geometry_1.default));
exports.default = FlatGeometry;
