"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var iterable_1 = tslib_1.__importDefault(require("../core/iterable"));
var logger_1 = tslib_1.__importDefault(require("../logger/logger"));
var textures_1 = require("../textures/textures");
var UniformMethod;
(function (UniformMethod) {
    UniformMethod[UniformMethod["Unknown"] = 0] = "Unknown";
    UniformMethod["Uniform1i"] = "uniform1i";
    // Uniform1i  = 'uniform1i', // (boolUniformLoc,   v);                // for bool
    // Uniform1i  = 'uniform1i', // (sampler2DUniformLoc,   v);           // for sampler2D
    // Uniform1i  = 'uniform1i', // (samplerCubeUniformLoc,   v);         // for samplerCube
    UniformMethod["Uniform2i"] = "uniform2i";
    UniformMethod["Uniform3i"] = "uniform3i";
    UniformMethod["Uniform4i"] = "uniform4i";
    UniformMethod["Uniform1f"] = "uniform1f";
    UniformMethod["Uniform2f"] = "uniform2f";
    UniformMethod["Uniform3f"] = "uniform3f";
    UniformMethod["Uniform4f"] = "uniform4f";
    //
    UniformMethod["Uniform1iv"] = "uniform1iv";
    // Uniform1iv = 'uniform1iv', // (boolUniformLoc, [v]);                // for bool or bool array
    // Uniform1iv = 'uniform1iv', // (sampler2DUniformLoc, [v]);           // for sampler2D or sampler2D array
    // Uniform1iv = 'uniform1iv', // (samplerCubeUniformLoc, [v]);         // for samplerCube or samplerCube array
    UniformMethod["Uniform2iv"] = "uniform2iv";
    UniformMethod["Uniform3iv"] = "uniform3iv";
    UniformMethod["Uniform4iv"] = "uniform4iv";
    //
    UniformMethod["Uniform1fv"] = "uniform1fv";
    UniformMethod["Uniform2fv"] = "uniform2fv";
    UniformMethod["Uniform3fv"] = "uniform3fv";
    UniformMethod["Uniform4fv"] = "uniform4fv";
    //
    UniformMethod["UniformMatrix2fv"] = "uniformMatrix2fv";
    UniformMethod["UniformMatrix3fv"] = "uniformMatrix3fv";
    UniformMethod["UniformMatrix4fv"] = "uniformMatrix4fv";
})(UniformMethod = exports.UniformMethod || (exports.UniformMethod = {}));
var UniformType;
(function (UniformType) {
    UniformType[UniformType["Unknown"] = 0] = "Unknown";
    UniformType[UniformType["Float"] = 1] = "Float";
    UniformType[UniformType["Int"] = 2] = "Int";
    UniformType[UniformType["Bool"] = 3] = "Bool";
    UniformType[UniformType["Sampler2D"] = 4] = "Sampler2D";
    UniformType[UniformType["SamplerCube"] = 5] = "SamplerCube";
    UniformType[UniformType["Matrix2fv"] = 6] = "Matrix2fv";
    UniformType[UniformType["Matrix3fv"] = 7] = "Matrix3fv";
    UniformType[UniformType["Matrix4fv"] = 8] = "Matrix4fv";
})(UniformType = exports.UniformType || (exports.UniformType = {}));
exports.METHODS_INT = [UniformMethod.Uniform1i, UniformMethod.Uniform2i, UniformMethod.Uniform3i, UniformMethod.Uniform4i];
exports.METHODS_FLOAT = [UniformMethod.Uniform1f, UniformMethod.Uniform2f, UniformMethod.Uniform3f, UniformMethod.Uniform4f];
exports.METHODS_INTV = [UniformMethod.Uniform1iv, UniformMethod.Uniform2iv, UniformMethod.Uniform3iv, UniformMethod.Uniform4iv];
exports.METHODS_FLOATV = [UniformMethod.Uniform1fv, UniformMethod.Uniform2fv, UniformMethod.Uniform3fv, UniformMethod.Uniform4fv];
var Uniform = /** @class */ (function () {
    function Uniform(options) {
        var _this = this;
        this.dirty = true;
        if (options) {
            Object.assign(this, options);
        }
        this.apply = function (gl, program) {
            if (_this.dirty) {
                gl.useProgram(program);
                var location_1 = gl.getUniformLocation(program, _this.key);
                // Logger.log(this.key, this.method, this.values);
                // (gl as any)[this.method].apply(gl, [location].concat(this.values));
                gl[_this.method].apply(gl, [location_1].concat(_this.values));
            }
        };
    }
    return Uniform;
}());
exports.Uniform = Uniform;
var UniformTexture = /** @class */ (function (_super) {
    tslib_1.__extends(UniformTexture, _super);
    function UniformTexture(options) {
        return _super.call(this, options) || this;
    }
    return UniformTexture;
}(Uniform));
exports.UniformTexture = UniformTexture;
var Uniforms = /** @class */ (function (_super) {
    tslib_1.__extends(Uniforms, _super);
    function Uniforms() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.dirty = false;
        return _this;
    }
    /*
    // slow
    static isDifferent(a: any, b: any): boolean {
        return JSON.stringify(a) !== JSON.stringify(b);
    }
    */
    Uniforms.isDifferent = function (a, b) {
        return a.length !== b.length ||
            a.reduce(function (f, v, i) {
                return f || v !== b[i];
            }, false);
    };
    Uniforms.isArrayOfInteger = function (array) {
        return array.reduce(function (flag, value) {
            return flag && Number.isInteger(value);
        }, true);
    };
    Uniforms.isArrayOfNumber = function (array) {
        return array.reduce(function (flag, value) {
            return flag && typeof value === 'number';
        }, true);
    };
    Uniforms.isArrayOfBoolean = function (array) {
        return array.reduce(function (flag, value) {
            return flag && typeof value === 'boolean';
        }, true);
    };
    Uniforms.isArrayOfTexture = function (array) {
        return array.reduce(function (flag, value) {
            return flag && textures_1.Texture.isTexture(value);
        }, true);
    };
    Uniforms.isArrayOfSampler2D = function (array) {
        return array.reduce(function (flag, value) {
            return flag && value.type === UniformType.Sampler2D;
        }, true);
    };
    Uniforms.getType_ = function (values) {
        var type = UniformType.Unknown;
        var isVector = values.length === 1 && Array.isArray(values[0]);
        var subject = isVector ? values[0] : values;
        if (Uniforms.isArrayOfNumber(subject)) {
            type = UniformType.Float;
        }
        else if (Uniforms.isArrayOfBoolean(subject)) {
            type = UniformType.Bool;
        }
        else if (Uniforms.isArrayOfTexture(subject)) {
            type = UniformType.Sampler2D;
        }
        return type;
    };
    Uniforms.getMethod_ = function (type, values) {
        var method = UniformMethod.Unknown;
        var isVector = values.length === 1 && Array.isArray(values[0]);
        var subject = isVector ? values[0] : values;
        var length = subject.length;
        var i = length - 1;
        switch (type) {
            case UniformType.Float:
                if (isVector) {
                    method = i < exports.METHODS_FLOATV.length ? exports.METHODS_FLOATV[i] : UniformMethod.Unknown;
                }
                else {
                    method = i < exports.METHODS_FLOAT.length ? exports.METHODS_FLOAT[i] : UniformMethod.Uniform1fv;
                }
                break;
            case UniformType.Int:
            case UniformType.Bool:
                if (isVector) {
                    method = i < exports.METHODS_INTV.length ? exports.METHODS_INTV[i] : UniformMethod.Unknown;
                }
                else {
                    method = i < exports.METHODS_INT.length ? exports.METHODS_INT[i] : UniformMethod.Uniform1iv;
                }
                break;
            case UniformType.Sampler2D:
                if (isVector) {
                    method = UniformMethod.Uniform1iv;
                }
                else {
                    method = length === 1 ? UniformMethod.Uniform1i : UniformMethod.Uniform1iv;
                }
                break;
        }
        return method;
    };
    Uniforms.parseUniform = function (key, values, type) {
        if (type === void 0) { type = null; }
        var uniform;
        type = type || Uniforms.getType_(values);
        var method = Uniforms.getMethod_(type, values);
        if (type !== UniformType.Unknown && method !== UniformMethod.Unknown) {
            // Logger.log('Uniforms.parseUniform', key, UniformType[type], method, values);
            if (type === UniformType.Sampler2D && method === UniformMethod.Uniform1iv) {
                return values[0].map(function (texture, index) {
                    return new Uniform({
                        method: method,
                        type: type,
                        key: key + "[" + index + "]",
                        values: [texture]
                    });
                });
            }
            else {
                uniform = new Uniform({
                    method: method,
                    type: type,
                    key: key,
                    values: values
                });
            }
        }
        else {
            logger_1.default.error('Uniforms.parseUniform.Unknown', key, values);
        }
        // return this.parseUniform__bak(key, values);
        return uniform;
    };
    Uniforms.prototype.create = function (method, type, key, values) {
        var uniform = new Uniform({
            method: method,
            type: type,
            key: key,
            values: values,
        });
        this.set(key, uniform);
        this.dirty = true;
        return uniform;
    };
    Uniforms.prototype.createTexture = function (key, index) {
        var uniform;
        if (key.indexOf(']') !== -1) {
            uniform = new UniformTexture({
                method: UniformMethod.Uniform1iv,
                type: UniformType.Sampler2D,
                key: key,
                values: [[index]],
            });
        }
        else {
            uniform = new UniformTexture({
                method: UniformMethod.Uniform1i,
                type: UniformType.Sampler2D,
                key: key,
                values: [index],
            });
        }
        this.set(key, uniform);
        this.dirty = true;
        return uniform;
    };
    Uniforms.prototype.update = function (method, type, key, values) {
        var uniform = this.get(key);
        if (uniform &&
            (uniform.method !== method ||
                uniform.type !== type ||
                Uniforms.isDifferent(uniform.values, values))) {
            uniform.method = method;
            uniform.type = type;
            uniform.values = values;
            uniform.dirty = true;
            this.dirty = true;
        }
    };
    Uniforms.prototype.createOrUpdate = function (method, type, key, values) {
        if (this.has(key)) {
            this.update(method, type, key, values);
        }
        else {
            this.create(method, type, key, values);
        }
    };
    Uniforms.prototype.apply = function (gl, program) {
        for (var key in this.values) {
            // if (typeof this.values[key].apply === 'function') {
            this.values[key].apply(gl, program);
            // }
        }
        // this.forEach(uniform => uniform.apply(gl, program));
    };
    Uniforms.prototype.clean = function () {
        for (var key in this.values) {
            this.values[key].dirty = false;
        }
        this.dirty = false;
    };
    return Uniforms;
}(iterable_1.default));
exports.default = Uniforms;
