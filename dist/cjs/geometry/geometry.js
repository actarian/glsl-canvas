"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Geometry = /** @class */ (function () {
    function Geometry(options) {
        if (options) {
            Object.assign(this, options);
            if (this.positions) {
                this.size = this.positions.length / 3;
            }
            // this.positions = Geometry.fromIndices(options.indices, options.positions, 3);
            // this.normals = Geometry.fromIndices(options.indices, options.normals, 3);
            // this.texcoords = Geometry.fromIndices(options.indices, options.texcoords, 2);
            // this.colors = Geometry.fromIndices(options.indices, options.colors, 4);
        }
    }
    Geometry.prototype.create = function (gl, program) {
        this.createData_();
        this.createAttributes_(gl, program);
    };
    Geometry.prototype.createBufferData_ = function (gl, type, array) {
        var buffer = gl.createBuffer();
        gl.bindBuffer(type, buffer);
        gl.bufferData(type, array, gl.STATIC_DRAW);
        return buffer;
    };
    Geometry.prototype.createAttribLocation_ = function (gl, program, name, size, type) {
        var location = gl.getAttribLocation(program, name);
        gl.enableVertexAttribArray(location);
        gl.vertexAttribPointer(location, size, type, false, 0, 0);
        return location;
    };
    Geometry.prototype.createAttributes_ = function (gl, program) {
        if (this.positions) {
            this.positionBuffer = this.createBufferData_(gl, gl.ARRAY_BUFFER, new Float32Array(this.positions));
            this.positionLocation = this.createAttribLocation_(gl, program, 'a_position', this.positions.length / this.size, gl.FLOAT);
            gl.bindAttribLocation(program, this.positionLocation, 'a_position');
        }
        if (this.texcoords) {
            this.texcoordBuffer = this.createBufferData_(gl, gl.ARRAY_BUFFER, new Float32Array(this.texcoords));
            this.texcoordLocation = this.createAttribLocation_(gl, program, 'a_texcoord', this.texcoords.length / this.size, gl.FLOAT);
            gl.bindAttribLocation(program, this.texcoordLocation, 'a_texcoord');
        }
        if (this.normals) {
            this.normalBuffer = this.createBufferData_(gl, gl.ARRAY_BUFFER, new Float32Array(this.normals));
            this.normalLocation = this.createAttribLocation_(gl, program, 'a_normal', this.normals.length / this.size, gl.FLOAT);
            gl.bindAttribLocation(program, this.normalLocation, 'a_normal');
        }
        if (this.colors) {
            this.colorBuffer = this.createBufferData_(gl, gl.ARRAY_BUFFER, new Float32Array(this.colors));
            this.colorLocation = this.createAttribLocation_(gl, program, 'a_color', this.colors.length / this.size, gl.FLOAT);
            gl.bindAttribLocation(program, this.colorLocation, 'a_color');
        }
        // console.log('positionLocation', this.positionLocation);
        // console.log('texcoordLocation', this.texcoordLocation);
        // console.log('normalLocation', this.normalLocation);
        // console.log('colorLocation', this.colorLocation);
    };
    Geometry.prototype.attachAttributes_ = function (gl, program) {
        var attribLocation;
        if (this.positions) {
            // this.positionLocation = this.createAttribLocation_(gl, program, 'a_position', this.positions.length / this.size, gl.FLOAT);
            attribLocation = gl.getAttribLocation(program, 'a_position');
            gl.enableVertexAttribArray(attribLocation);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
            gl.vertexAttribPointer(attribLocation, this.positions.length / this.size, gl.FLOAT, false, 0, 0);
            // gl.bindAttribLocation(program, this.positionLocation, 'a_position');
            // console.log('positionLocation', attribLocation);
        }
        if (this.texcoords) {
            // this.texcoordLocation = this.createAttribLocation_(gl, program, 'a_texcoord', this.texcoords.length / this.size, gl.FLOAT);
            attribLocation = gl.getAttribLocation(program, 'a_texcoord');
            gl.enableVertexAttribArray(this.texcoordLocation);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);
            gl.vertexAttribPointer(this.texcoordLocation, this.texcoords.length / this.size, gl.FLOAT, false, 0, 0);
            // gl.bindAttribLocation(program, this.texcoordLocation, 'a_texcoord');
            // console.log('texcoordLocation', attribLocation);
        }
        if (this.normals) {
            // this.normalLocation = this.createAttribLocation_(gl, program, 'a_normal', this.normals.length / this.size, gl.FLOAT);
            attribLocation = gl.getAttribLocation(program, 'a_normal');
            gl.enableVertexAttribArray(this.normalLocation);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            gl.vertexAttribPointer(this.normalLocation, this.normals.length / this.size, gl.FLOAT, false, 0, 0);
            // gl.bindAttribLocation(program, this.normalLocation, 'a_normal');
            // console.log('normalLocation', attribLocation);
        }
        if (this.colors) {
            // this.colorLocation = this.createAttribLocation_(gl, program, 'a_color', this.colors.length / this.size, gl.FLOAT);
            attribLocation = gl.getAttribLocation(program, 'a_color');
            gl.enableVertexAttribArray(this.colorLocation);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
            gl.vertexAttribPointer(this.colorLocation, this.colors.length / this.size, gl.FLOAT, false, 0, 0);
            // gl.bindAttribLocation(program, this.colorLocation, 'a_color');
            // console.log('colorLocation', attribLocation);
        }
    };
    Geometry.prototype.bindAttributes_ = function (gl, program) {
        if (this.positions) {
            gl.bindAttribLocation(program, this.positionLocation, 'a_position');
        }
        if (this.texcoords) {
            gl.bindAttribLocation(program, this.texcoordLocation, 'a_texcoord');
        }
        if (this.normals) {
            gl.bindAttribLocation(program, this.normalLocation, 'a_normal');
        }
        if (this.colors) {
            gl.bindAttribLocation(program, this.colorLocation, 'a_color');
        }
    };
    Geometry.prototype.createData_ = function () {
        // Now create an array of positions for the cube.
        this.positions = [];
        this.normals = [];
        this.texcoords = [];
        this.colors = [];
        this.size = 0;
        // console.log('positions', this.positions.length);
        // console.log('normals', this.normals.length);
        // console.log('texcoords', this.texcoords.length);
        // console.log('colors', this.colors.length);
    };
    Geometry.fromIndices = function (indices, array, size) {
        var buffer = [];
        indices.forEach(function (i) {
            buffer.push.apply(buffer, array.slice(i * size, i * size + size));
        });
        return buffer;
    };
    return Geometry;
}());
exports.default = Geometry;
