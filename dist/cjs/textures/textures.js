"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
// import 'promise-polyfill';
var iterable_1 = tslib_1.__importDefault(require("../core/iterable"));
var subscriber_1 = tslib_1.__importDefault(require("../core/subscriber"));
var logger_1 = tslib_1.__importDefault(require("../logger/logger"));
exports.TextureImageExtensions = ['jpg', 'jpeg', 'png'];
exports.TextureVideoExtensions = ['ogv', 'webm', 'mp4'];
exports.TextureExtensions = exports.TextureImageExtensions.concat(exports.TextureVideoExtensions);
var TextureSourceType;
(function (TextureSourceType) {
    TextureSourceType[TextureSourceType["Data"] = 0] = "Data";
    TextureSourceType[TextureSourceType["Element"] = 1] = "Element";
    TextureSourceType[TextureSourceType["Url"] = 2] = "Url";
})(TextureSourceType = exports.TextureSourceType || (exports.TextureSourceType = {}));
var TextureFilteringType;
(function (TextureFilteringType) {
    TextureFilteringType["MipMap"] = "mipmap";
    TextureFilteringType["Linear"] = "linear";
    TextureFilteringType["Nearest"] = "nearest";
})(TextureFilteringType = exports.TextureFilteringType || (exports.TextureFilteringType = {}));
function isTextureData(object) {
    return 'data' in object && 'width' in object && 'height' in object;
}
exports.isTextureData = isTextureData;
// GL texture wrapper object for keeping track of a global set of textures, keyed by a unique user-defined name
var Texture = /** @class */ (function (_super) {
    tslib_1.__extends(Texture, _super);
    function Texture(gl, key, index, options, workpath) {
        if (options === void 0) { options = { filtering: TextureFilteringType.Linear }; }
        var _this = _super.call(this) || this;
        _this.valid = false;
        _this.dirty = false;
        _this.animated = false;
        _this.powerOf2 = false;
        _this.key = key;
        _this.index = index;
        _this.options = options;
        _this.workpath = workpath;
        _this.create(gl);
        return _this;
    }
    Texture.isPowerOf2 = function (value) {
        return (value & (value - 1)) === 0;
    };
    Texture.isSafari = function () {
        return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    };
    Texture.isTextureUrl = function (text) {
        return text && (/\.(jpg|jpeg|png|ogv|webm|mp4)$/i).test(text.split('?')[0]);
    };
    Texture.isTexture = function (urlElementOrData) {
        var options = Texture.getTextureOptions(urlElementOrData);
        return options !== undefined;
    };
    Texture.getMaxTextureSize = function (gl) {
        return gl.getParameter(gl.MAX_TEXTURE_SIZE);
    };
    ;
    Texture.getTextureOptions = function (urlElementOrData, options) {
        if (options === void 0) { options = {}; }
        if (typeof urlElementOrData === 'string' && urlElementOrData !== '') {
            if (Texture.isTextureUrl(urlElementOrData)) {
                options.url = urlElementOrData;
                if (urlElementOrData.indexOf('?') !== -1) {
                    options = urlElementOrData.split('?')[1].split('&').reduce(function (prev, curr) {
                        var params = curr.split('=');
                        var key = decodeURIComponent(params[0]);
                        var value = decodeURIComponent(params[1]);
                        switch (key) {
                            case 'filtering':
                                prev[key] = value;
                                break;
                            case 'repeat':
                            case 'UNPACK_FLIP_Y_WEBGL':
                                prev[key] = Boolean(value);
                                break;
                            case 'UNPACK_PREMULTIPLY_ALPHA_WEBGL':
                            case 'TEXTURE_WRAP_S':
                            case 'TEXTURE_WRAP_T':
                                prev[key] = Number(value);
                                break;
                        }
                        return prev;
                    }, options);
                }
                return options;
            }
            if (document) {
                urlElementOrData = document.querySelector(urlElementOrData);
                // Logger.log(urlElementOrData);
            }
        }
        if (urlElementOrData instanceof HTMLCanvasElement || urlElementOrData instanceof HTMLImageElement || urlElementOrData instanceof HTMLVideoElement) {
            options.element = urlElementOrData;
            return options;
        }
        else if (isTextureData(urlElementOrData)) {
            options.data = urlElementOrData.data;
            options.width = urlElementOrData.width;
            options.height = urlElementOrData.height;
            return options;
        }
        else {
            return null;
        }
    };
    Texture.prototype.create = function (gl) {
        this.texture = gl.createTexture();
        if (this.texture) {
            this.valid = true;
        }
        // Default to a 1-pixel black texture so we can safely render while we wait for an image to load
        // See: http://stackoverflow.com/questions/19722247/webgl-wait-for-texture-to-load
        // [255, 255, 255, 255]
        this.setData(gl, 1, 1, new Uint8Array([0, 0, 0, 0]), this.options);
        // this.bindTexture();
        // this.load(options);
    };
    Texture.prototype.load = function (gl, options) {
        if (options === void 0) { options = {}; }
        this.options = options;
        if (typeof options.url === 'string') {
            if (this.url === undefined || options.url !== this.url) {
                return this.setUrl(gl, options.url, options);
            }
            else {
                return Promise.resolve(this);
            }
        }
        else if (options.element) {
            return this.setElement(gl, options.element, options);
        }
        else if (options.data && options.width && options.height) {
            return this.setData(gl, options.width, options.height, options.data, options);
        }
        else {
            return Promise.reject(this);
        }
    };
    Texture.prototype.setUrl = function (gl, url, options) {
        if (options === void 0) { options = {}; }
        if (!this.valid) {
            return Promise.reject(this);
        }
        this.url = url; // save URL reference (will be overwritten when element is loaded below)
        this.source = url;
        this.sourceType = TextureSourceType.Url;
        this.options = Object.assign(this.options, options);
        var src = String((url.indexOf(':/') === -1 && this.workpath !== undefined) ? this.workpath + "/" + url : url);
        var ext = url.split('?')[0].split('.').pop().toLowerCase();
        var isVideo = exports.TextureVideoExtensions.indexOf(ext) !== -1;
        var element;
        var promise;
        if (isVideo) {
            logger_1.default.log('GlslCanvas.setUrl video', src);
            element = document.createElement('video'); // new HTMLVideoElement();
            element.setAttribute('preload', 'auto');
            // element.setAttribute('autoplay', 'true');
            element.setAttribute('loop', 'true');
            element.setAttribute('muted', 'true');
            element.setAttribute('playsinline', 'true');
            // element.autoplay = true;
            element.loop = true;
            element.muted = true;
            /*
            if (!(Texture.isSafari() && /(?<!http|https):\//.test(url))) {
                element.crossOrigin = 'anonymous';
            }
            */
            promise = this.setElement(gl, element, options);
            element.src = src;
            element.addEventListener('canplay', function () {
                element.play();
            });
        }
        else {
            logger_1.default.log('GlslCanvas.setUrl image', src);
            element = document.createElement('img'); // new HTMLImageElement();
            promise = this.setElement(gl, element, options);
            if (!(Texture.isSafari() && url.slice(0, 5) === 'data:')) {
                element.crossOrigin = 'anonymous';
            }
            element.src = src;
        }
        return promise;
    };
    Texture.prototype.setElement = function (gl, element, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        options = this.options = Object.assign(this.options, options);
        return new Promise(function (resolve, reject) {
            var originalElement = element;
            // a string element is interpeted as a CSS selector
            if (typeof element === 'string') {
                element = document.querySelector(element);
            }
            if (element instanceof HTMLCanvasElement ||
                element instanceof HTMLImageElement ||
                element instanceof HTMLVideoElement) {
                _this.source = element;
                _this.sourceType = TextureSourceType.Element;
                if (element instanceof HTMLVideoElement) {
                    var video = element;
                    video.addEventListener('loadeddata', function (event) {
                        _this.update(gl, options);
                        _this.setFiltering(gl, options);
                        resolve(_this);
                    });
                    video.addEventListener('error', function (error) {
                        reject(error);
                    });
                    video.load();
                }
                else if (element instanceof HTMLImageElement) {
                    element.addEventListener('load', function () {
                        _this.update(gl, options);
                        _this.setFiltering(gl, options);
                        resolve(_this);
                    });
                    element.addEventListener('error', function (error) {
                        reject(error);
                    });
                }
                else {
                    _this.update(gl, options);
                    _this.setFiltering(gl, options);
                    resolve(_this);
                }
            }
            else {
                var message = "the 'element' parameter (`element: " + JSON.stringify(originalElement) + "`) must be a CSS selector string, or a <canvas>, <image> or <video> object";
                logger_1.default.log("Texture '" + _this.key + "': " + message, options);
                reject(message);
            }
        });
    };
    Texture.prototype.setData = function (gl, width, height, data, options) {
        if (options === void 0) { options = {}; }
        this.width = width;
        this.height = height;
        this.options = Object.assign(this.options, options);
        this.source = data;
        this.sourceType = TextureSourceType.Data;
        this.update(gl, options);
        this.setFiltering(gl, options);
        return Promise.resolve(this);
    };
    // Uploads current image or buffer to the GPU (can be used to update animated textures on the fly)
    Texture.prototype.update = function (gl, options) {
        if (!this.valid) {
            return;
        }
        gl.activeTexture(gl.TEXTURE0 + this.index);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, (options.UNPACK_FLIP_Y_WEBGL === false ? 0 : 1));
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, options.UNPACK_PREMULTIPLY_ALPHA_WEBGL || 0);
        if (this.sourceType === TextureSourceType.Element) {
            if (this.source instanceof HTMLImageElement && this.source.naturalWidth && this.source.naturalHeight) {
                this.width = this.source.naturalWidth;
                this.height = this.source.naturalHeight;
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.source);
            }
            else if (this.source instanceof HTMLVideoElement && this.source.videoWidth && this.source.videoHeight) {
                this.width = this.source.videoWidth;
                this.height = this.source.videoHeight;
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.source);
            }
            else if (this.source instanceof HTMLCanvasElement) {
                this.width = this.source.width;
                this.height = this.source.height;
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.source);
            }
        }
        else if (this.sourceType === TextureSourceType.Data) {
            var imageBuffer = this.source;
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, imageBuffer);
        }
        this.trigger('loaded', this);
    };
    Texture.prototype.tryUpdate = function (gl) {
        var dirty = false;
        if (this.animated) {
            dirty = true;
            this.update(gl, this.options);
        }
        return dirty;
    };
    Texture.prototype.destroy = function (gl) {
        if (!this.valid) {
            return;
        }
        gl.deleteTexture(this.texture);
        this.texture = null;
        delete this.source;
        this.source = null;
        this.valid = false;
    };
    Texture.prototype.setFiltering = function (gl, options) {
        if (!this.valid) {
            return;
        }
        var powerOf2 = Texture.isPowerOf2(this.width) && Texture.isPowerOf2(this.height);
        var filtering = options.filtering || TextureFilteringType.MipMap;
        var wrapS = options.TEXTURE_WRAP_S || (options.repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE);
        var wrapT = options.TEXTURE_WRAP_T || (options.repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE);
        if (!powerOf2) {
            filtering = filtering === TextureFilteringType.MipMap ? TextureFilteringType.Linear : filtering;
            wrapS = wrapT = gl.CLAMP_TO_EDGE;
            if (options.repeat || options.TEXTURE_WRAP_S || options.TEXTURE_WRAP_T) {
                logger_1.default.warn("GlslCanvas: cannot repeat texture " + options.url + " cause is not power of 2.");
            }
        }
        this.powerOf2 = powerOf2;
        this.filtering = filtering;
        // this.bindTexture();
        // WebGL has strict requirements on non-power-of-2 textures:
        // No mipmaps and must clamp to edge
        // For power-of-2 textures, the following presets are available:
        // mipmap: linear blend from nearest mip
        // linear: linear blend from original image (no mips)
        // nearest: nearest pixel from original image (no mips, 'blocky' look)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);
        if (this.filtering === TextureFilteringType.MipMap) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); // TODO: use trilinear filtering by defualt instead?
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.generateMipmap(gl.TEXTURE_2D);
        }
        else if (this.filtering === TextureFilteringType.Nearest) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        }
        else if (this.filtering === TextureFilteringType.Linear) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        }
    };
    return Texture;
}(subscriber_1.default));
exports.Texture = Texture;
var Textures = /** @class */ (function (_super) {
    tslib_1.__extends(Textures, _super);
    function Textures() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.count = 0;
        _this.dirty = false;
        _this.animated = false;
        return _this;
    }
    Textures.prototype.clean = function () {
        for (var key in this.values) {
            this.values[key].dirty = false;
        }
        this.dirty = false;
    };
    Textures.prototype.createOrUpdate = function (gl, key, urlElementOrData, index, options, workpath) {
        var _this = this;
        if (index === void 0) { index = 0; }
        if (options === void 0) { options = {}; }
        var texture;
        var textureOptions = Texture.getTextureOptions(urlElementOrData, options);
        texture = this.get(key);
        if (!texture) {
            texture = new Texture(gl, key, index + this.count, textureOptions, workpath);
            this.count++;
            this.set(key, texture);
        }
        if (textureOptions !== undefined) {
            return texture.load(gl, textureOptions).then(function (texture) {
                if (texture.source instanceof HTMLVideoElement) {
                    var video = texture.source;
                    // Logger.log('video', video);
                    video.addEventListener('play', function () {
                        // Logger.log('play', texture.key);
                        texture.animated = true;
                        _this.animated = true;
                    });
                    video.addEventListener('pause', function () {
                        // Logger.log('pause', texture.key);
                        texture.animated = false;
                        _this.animated = _this.reduce(function (flag, texture) {
                            return flag || texture.animated;
                        }, false);
                    });
                    video.addEventListener('seeked', function () {
                        // Logger.log('seeked');
                        texture.update(gl, texture.options);
                        _this.dirty = true;
                    });
                    // Logger.log('video');
                    /*
                    video.addEventListener('canplaythrough', () => {
                        // !!!
                        this.intervalID = setInterval(() => {
                            this.update(gl, options);
                        }, 15);
                    }, true);
                    video.addEventListener('ended', () => {
                        video.currentTime = 0;
                        video.play();
                    }, true);
                    */
                }
                return texture;
            });
        }
        else {
            return Promise.resolve(texture);
        }
    };
    return Textures;
}(iterable_1.default));
exports.default = Textures;
