"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
// import '@babel/polyfill';
require("promise-polyfill");
var buffers_1 = tslib_1.__importDefault(require("../buffers/buffers"));
var context_1 = tslib_1.__importStar(require("../context/context"));
var common_1 = tslib_1.__importDefault(require("../core/common"));
var subscriber_1 = tslib_1.__importDefault(require("../core/subscriber"));
var logger_1 = tslib_1.__importDefault(require("../logger/logger"));
var textures_1 = tslib_1.__importStar(require("../textures/textures"));
var uniforms_1 = tslib_1.__importStar(require("../uniforms/uniforms"));
var canvas_timer_1 = tslib_1.__importDefault(require("./canvas-timer"));
var Canvas = /** @class */ (function (_super) {
    tslib_1.__extends(Canvas, _super);
    function Canvas(canvas, options) {
        if (options === void 0) { options = {
        // alpha: true,
        // antialias: true,
        // premultipliedAlpha: true
        }; }
        var _this = _super.call(this) || this;
        _this.mouse = { x: 0, y: 0 };
        _this.uniforms = new uniforms_1.default();
        _this.buffers = new buffers_1.default();
        _this.textures = new textures_1.default();
        _this.textureList = [];
        _this.valid = false;
        _this.animated = false;
        _this.dirty = true;
        _this.visible = false;
        if (!canvas) {
            return _this;
        }
        _this.options = options;
        _this.canvas = canvas;
        _this.width = 0; // canvas.clientWidth;
        _this.height = 0; // canvas.clientHeight;
        _this.rect = canvas.getBoundingClientRect();
        _this.devicePixelRatio = window.devicePixelRatio || 1;
        canvas.style.backgroundColor = options.backgroundColor || 'rgba(0,0,0,0)';
        _this.getShaders_().then(function (success) {
            /*
            const v = this.vertexString = options.vertexString || this.vertexString;
            const f = this.fragmentString = options.fragmentString || this.fragmentString;
            this.vertexString = Context.getVertex(v, f);
            this.fragmentString = Context.getFragment(v, f);
            const gl = Context.tryInferContext(v, f, canvas, options, options.onError);
            if (!gl) {
                return;
            }
            this.gl = gl;
            */
            _this.load().then(function (success) {
                if (!_this.program) {
                    return;
                }
                _this.addListeners_();
                _this.onLoop();
            });
        }, function (error) {
            logger_1.default.log('GlslCanvas.getShaders_.error', error);
        });
        Canvas.items.push(_this);
        return _this;
    }
    Canvas.version = function () {
        return '0.1.6';
    };
    Canvas.of = function (canvas, options) {
        return Canvas.items.find(function (x) { return x.canvas === canvas; }) || new Canvas(canvas, options);
    };
    Canvas.loadAll = function () {
        var canvases = [].slice.call(document.getElementsByClassName('glsl-canvas')).filter(function (x) { return x instanceof HTMLCanvasElement; });
        return canvases.map(function (x) { return Canvas.of(x); });
    };
    Canvas.prototype.getShaders_ = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var canvas = _this.canvas;
            var urls = {};
            if (canvas.hasAttribute('data-vertex-url')) {
                urls.vertex = canvas.getAttribute('data-vertex-url');
            }
            if (canvas.hasAttribute('data-fragment-url')) {
                urls.fragment = canvas.getAttribute('data-fragment-url');
            }
            if (canvas.hasAttribute('data-vertex')) {
                _this.vertexString = canvas.getAttribute('data-vertex');
            }
            if (canvas.hasAttribute('data-fragment')) {
                _this.fragmentString = canvas.getAttribute('data-fragment');
            }
            if (Object.keys(urls).length) {
                Promise.all(Object.keys(urls).map(function (key, i) {
                    var url = urls[key];
                    return common_1.default.fetch(url)
                        // .then((response) => response.text())
                        .then(function (body) {
                        if (key === 'vertex') {
                            return _this.vertexString = body;
                        }
                        else {
                            return _this.fragmentString = body;
                        }
                    });
                })).then(function (shaders) {
                    resolve([_this.vertexString, _this.fragmentString]);
                });
            }
            else {
                resolve([_this.vertexString, _this.fragmentString]);
            }
        });
    };
    Canvas.prototype.addListeners_ = function () {
        /*
        const resize = (e: Event) => {
            this.rect = this.canvas.getBoundingClientRect();
            this.trigger('resize', e);
        };
        */
        this.onScroll = this.onScroll.bind(this);
        this.onClick = this.onClick.bind(this);
        this.onMove = this.onMove.bind(this);
        this.onMousemove = this.onMousemove.bind(this);
        this.onMouseover = this.onMouseover.bind(this);
        this.onMouseout = this.onMouseout.bind(this);
        this.onTouchmove = this.onTouchmove.bind(this);
        this.onTouchend = this.onTouchend.bind(this);
        this.onTouchstart = this.onTouchstart.bind(this);
        this.onLoop = this.onLoop.bind(this);
        // window.addEventListener('resize', this.onResize);
        window.addEventListener('scroll', this.onScroll);
        document.addEventListener('mousemove', this.onMousemove, false);
        document.addEventListener('touchmove', this.onTouchmove);
        this.addCanvasListeners_();
    };
    Canvas.prototype.addCanvasListeners_ = function () {
        if (this.canvas.hasAttribute('controls')) {
            this.canvas.addEventListener('click', this.onClick);
            this.canvas.addEventListener('mouseover', this.onMouseover);
            this.canvas.addEventListener('mouseout', this.onMouseout);
            this.canvas.addEventListener('touchstart', this.onTouchstart);
            if (!this.canvas.hasAttribute('data-autoplay')) {
                this.pause();
            }
        }
    };
    Canvas.prototype.removeCanvasListeners_ = function () {
        if (this.canvas.hasAttribute('controls')) {
            this.canvas.removeEventListener('click', this.onClick);
            this.canvas.removeEventListener('mouseover', this.onMouseover);
            this.canvas.removeEventListener('mouseout', this.onMouseout);
            this.canvas.removeEventListener('touchstart', this.onTouchstart);
        }
    };
    Canvas.prototype.removeListeners_ = function () {
        window.cancelAnimationFrame(this.rafId);
        // window.removeEventListener('resize', this.onResize);
        window.removeEventListener('scroll', this.onScroll);
        document.removeEventListener('mousemove', this.onMousemove);
        document.removeEventListener('touchmove', this.onTouchmove);
        this.removeCanvasListeners_();
    };
    Canvas.prototype.onScroll = function (e) {
        this.rect = this.canvas.getBoundingClientRect();
    };
    Canvas.prototype.onClick = function (e) {
        this.toggle();
        this.trigger('click', e);
    };
    Canvas.prototype.onMove = function (mx, my) {
        /*
        const rect = this.rect, gap = 20;
        const x = Math.max(-gap, Math.min(rect.width + gap, (mx - rect.left) * this.devicePixelRatio));
        const y = Math.max(-gap, Math.min(rect.height + gap, (this.canvas.height - (my - rect.top) * this.devicePixelRatio)));
        */
        var rect = this.rect;
        var x = (mx - rect.left) * this.devicePixelRatio;
        var y = (rect.height - (my - rect.top)) * this.devicePixelRatio;
        if (x !== this.mouse.x ||
            y !== this.mouse.y) {
            this.mouse.x = x;
            this.mouse.y = y;
            this.trigger('move', this.mouse);
        }
    };
    Canvas.prototype.onMousemove = function (e) {
        this.onMove(e.clientX || e.pageX, e.clientY || e.pageY);
    };
    Canvas.prototype.onMouseover = function (e) {
        this.play();
        this.trigger('over', e);
    };
    Canvas.prototype.onMouseout = function (e) {
        this.pause();
        this.trigger('out', e);
    };
    Canvas.prototype.onTouchmove = function (e) {
        var touch = [].slice.call(e.touches).reduce(function (p, touch) {
            p = p || { x: 0, y: 0 };
            p.x += touch.clientX;
            p.y += touch.clientY;
            return p;
        }, null);
        if (touch) {
            this.onMove(touch.x / e.touches.length, touch.y / e.touches.length);
        }
    };
    Canvas.prototype.onTouchend = function (e) {
        this.pause();
        this.trigger('out', e);
        document.removeEventListener('touchend', this.onTouchend);
    };
    Canvas.prototype.onTouchstart = function (e) {
        this.play();
        this.trigger('over', e);
        document.addEventListener('touchend', this.onTouchend);
        document.removeEventListener('mousemove', this.onMousemove);
        if (this.canvas.hasAttribute('controls')) {
            this.canvas.removeEventListener('mouseover', this.onMouseover);
            this.canvas.removeEventListener('mouseout', this.onMouseout);
        }
    };
    Canvas.prototype.onLoop = function (time) {
        this.checkRender();
        this.rafId = window.requestAnimationFrame(this.onLoop);
    };
    Canvas.prototype.setUniform_ = function (key, values, options, type) {
        var _this = this;
        if (options === void 0) { options = {}; }
        if (type === void 0) { type = null; }
        var uniform = uniforms_1.default.parseUniform(key, values, type);
        if (Array.isArray(uniform)) {
            if (uniforms_1.default.isArrayOfSampler2D(uniform)) {
                uniform.forEach(function (x) { return _this.loadTexture(x.key, x.values[0], options); });
            }
            else {
                uniform.forEach(function (x) { return _this.uniforms.set(x.key, x.values[0]); });
            }
        }
        else if (uniform) {
            switch (uniform.type) {
                case uniforms_1.UniformType.Sampler2D:
                    this.loadTexture(key, values[0], options);
                    break;
                default:
                    this.uniforms.set(key, uniform);
            }
        }
    };
    Canvas.prototype.parseTextures_ = function (fragmentString) {
        var _this = this;
        // const regexp = /uniform\s*sampler2D\s*([\w]*);(\s*\/\/\s*([\w|\:\/\/|\.|\-|\_]*)|\s*)/gm;
        var regexp = /uniform\s*sampler2D\s*([\w]*);(\s*\/\/\s*([\w|\:\/\/|\.|\-|\_|\?|\&|\=]*)|\s*)/gm;
        // const regexp = /uniform\s*sampler2D\s*([\w]*);(\s*\/\/\s*([\w|\://|\.|\-|\_]*)|\s*)((\s*\:\s)(\{(\s*\w*\:\s*['|"]{0,1}\w*['|"]{0,1}\s*[,]{0,1})+\}))*/gm;
        var matches;
        while ((matches = regexp.exec(fragmentString)) !== null) {
            var key = matches[1];
            var url = matches[3];
            if (textures_1.Texture.isTextureUrl(url)) {
                this.textureList.push({ key: key, url: url });
                /*
                if (matches[3]) {
                    const ext = matches[3].split('?')[0].split('.').pop().toLowerCase();
                    const url = matches[3];
                    if (url && TextureExtensions.indexOf(ext) !== -1) {
                        // let options;
                        // if (matches[6]) {
                        // 	try {
                        // 		options = new Function(`return ${matches[6]};`)();
                        // 	} catch (e) {
                        // 		// console.log('wrong texture options');
                        // 	}
                        // }
                        // console.log(options, matches[6]);
                        // this.textureList.push({ key, url, options });
                        this.textureList.push({ key, url });
                    }
                */
            }
            else if (!this.buffers.has(key)) {
                // create empty texture
                this.textureList.push({ key: key, url: null });
            }
        }
        if (this.canvas.hasAttribute('data-textures')) {
            var urls = this.canvas.getAttribute('data-textures').split(',');
            urls.forEach(function (url, i) {
                var key = 'u_texture' + i;
                _this.textureList.push({ key: key, url: url });
            });
        }
        return this.textureList.length > 0;
    };
    Canvas.prototype.createUniforms_ = function () {
        var _this = this;
        var gl = this.gl;
        var fragmentString = this.fragmentString;
        var BW = gl.drawingBufferWidth;
        var BH = gl.drawingBufferHeight;
        var timer = this.timer = new canvas_timer_1.default();
        var hasDelta = (fragmentString.match(/u_delta/g) || []).length > 1;
        var hasTime = (fragmentString.match(/u_time/g) || []).length > 1;
        var hasDate = (fragmentString.match(/u_date/g) || []).length > 1;
        var hasMouse = (fragmentString.match(/u_mouse/g) || []).length > 1;
        var hasTextures = this.parseTextures_(fragmentString);
        this.animated = hasTime || hasDate || hasMouse;
        if (this.animated) {
            this.canvas.classList.add('animated');
        }
        else {
            this.canvas.classList.remove('animated');
        }
        this.uniforms.create(uniforms_1.UniformMethod.Uniform2f, uniforms_1.UniformType.Float, 'u_resolution', [BW, BH]);
        if (hasDelta) {
            this.uniforms.create(uniforms_1.UniformMethod.Uniform1f, uniforms_1.UniformType.Float, 'u_delta', [timer.delta / 1000.0]);
        }
        if (hasTime) {
            this.uniforms.create(uniforms_1.UniformMethod.Uniform1f, uniforms_1.UniformType.Float, 'u_time', [timer.current / 1000.0]);
        }
        if (hasDate) {
            var date = new Date();
            this.uniforms.create(uniforms_1.UniformMethod.Uniform4f, uniforms_1.UniformType.Float, 'u_date', [date.getFullYear(), date.getMonth(), date.getDate(), date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds() + date.getMilliseconds() * 0.001]);
        }
        if (hasMouse) {
            this.uniforms.create(uniforms_1.UniformMethod.Uniform2f, uniforms_1.UniformType.Float, 'u_mouse', [0, 0]);
        }
        for (var key in this.buffers.values) {
            var buffer = this.buffers.values[key];
            this.uniforms.create(uniforms_1.UniformMethod.Uniform1i, uniforms_1.UniformType.Sampler2D, buffer.key, [buffer.input.index]);
        }
        if (hasTextures) {
            this.textureList.filter(function (x) { return x.url; }).forEach(function (x) {
                _this.setTexture(x.key, x.url, x.options);
            });
            this.textureList = [];
        }
    };
    Canvas.prototype.updateUniforms_ = function () {
        var gl = this.gl;
        var BW = gl.drawingBufferWidth;
        var BH = gl.drawingBufferHeight;
        if (!this.timer) {
            return;
        }
        var timer = this.timer.next();
        this.uniforms.update(uniforms_1.UniformMethod.Uniform2f, uniforms_1.UniformType.Float, 'u_resolution', [BW, BH]);
        if (this.uniforms.has('u_delta')) {
            this.uniforms.update(uniforms_1.UniformMethod.Uniform1f, uniforms_1.UniformType.Float, 'u_delta', [timer.delta / 1000.0]);
        }
        if (this.uniforms.has('u_time')) {
            this.uniforms.update(uniforms_1.UniformMethod.Uniform1f, uniforms_1.UniformType.Float, 'u_time', [timer.current / 1000.0]);
        }
        if (this.uniforms.has('u_date')) {
            var date = new Date();
            this.uniforms.update(uniforms_1.UniformMethod.Uniform4f, uniforms_1.UniformType.Float, 'u_date', [date.getFullYear(), date.getMonth(), date.getDate(), date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds() + date.getMilliseconds() * 0.001]);
        }
        if (this.uniforms.has('u_mouse')) {
            var mouse = this.mouse;
            this.uniforms.update(uniforms_1.UniformMethod.Uniform2f, uniforms_1.UniformType.Float, 'u_mouse', [mouse.x, mouse.y]);
            /*
            const rect = this.rect;
            if (mouse.x >= rect.left && mouse.x <= rect.right &&
                mouse.y >= rect.top && mouse.y <= rect.bottom) {
                const MX = (mouse.x - rect.left) * this.devicePixelRatio;
                const MY = (this.canvas.height - (mouse.y - rect.top) * this.devicePixelRatio);
                this.uniforms.update(UniformMethod.Uniform2f, UniformType.Float, 'u_mouse', [MX, MY]);
            }
            */
        }
        for (var key in this.buffers.values) {
            var buffer = this.buffers.values[key];
            this.uniforms.update(uniforms_1.UniformMethod.Uniform1i, uniforms_1.UniformType.Sampler2D, buffer.key, [buffer.input.index]);
        }
        for (var key in this.textures.values) {
            var texture = this.textures.values[key];
            texture.tryUpdate(gl);
            this.uniforms.update(uniforms_1.UniformMethod.Uniform1i, uniforms_1.UniformType.Sampler2D, texture.key, [texture.index]);
        }
    };
    Canvas.prototype.isVisible_ = function () {
        var rect = this.rect;
        return (rect.top + rect.height) > 0 && rect.top < (window.innerHeight || document.documentElement.clientHeight);
    };
    Canvas.prototype.isAnimated_ = function () {
        return (this.animated || this.textures.animated) && !this.timer.paused;
    };
    Canvas.prototype.isDirty_ = function () {
        return this.dirty || this.uniforms.dirty || this.textures.dirty;
    };
    // check size change at start of requestFrame
    Canvas.prototype.sizeDidChanged_ = function () {
        var gl = this.gl;
        var W = Math.ceil(this.canvas.clientWidth), H = Math.ceil(this.canvas.clientHeight);
        if (this.width !== W ||
            this.height !== H) {
            this.width = W;
            this.height = H;
            // Lookup the size the browser is displaying the canvas in CSS pixels
            // and compute a size needed to make our drawingbuffer match it in
            // device pixels.
            var BW = Math.ceil(W * this.devicePixelRatio);
            var BH = Math.ceil(H * this.devicePixelRatio);
            this.canvas.width = BW;
            this.canvas.height = BH;
            /*
            if (gl.canvas.width !== BW ||
                gl.canvas.height !== BH) {
                gl.canvas.width = BW;
                gl.canvas.height = BH;
                // Set the viewport to match
                // gl.viewport(0, 0, BW, BH);
            }
            */
            for (var key in this.buffers.values) {
                var buffer = this.buffers.values[key];
                buffer.resize(gl, BW, BH);
            }
            this.rect = this.canvas.getBoundingClientRect();
            this.trigger('resize');
            // gl.useProgram(this.program);
            return true;
        }
        else {
            return false;
        }
    };
    Canvas.prototype.load = function (fragmentString, vertexString) {
        var _this = this;
        return Promise.all([
            context_1.default.getIncludes(fragmentString || this.fragmentString),
            context_1.default.getIncludes(vertexString || this.vertexString)
        ]).then(function (array) {
            _this.fragmentString = array[0];
            _this.vertexString = array[1];
            return _this.createContext_();
        });
    };
    Canvas.prototype.getContext_ = function () {
        var vertexString = this.vertexString;
        var fragmentString = this.fragmentString;
        this.vertexString = context_1.default.getVertex(vertexString, fragmentString);
        this.fragmentString = context_1.default.getFragment(vertexString, fragmentString);
        if (context_1.default.versionDiffers(this.gl, vertexString, fragmentString)) {
            this.destroyContext_();
            this.swapCanvas_();
            this.uniforms = new uniforms_1.default();
            this.buffers = new buffers_1.default();
            this.textures = new textures_1.default();
            this.textureList = [];
        }
        if (!this.gl) {
            var gl = context_1.default.tryInferContext(vertexString, fragmentString, this.canvas, this.options, this.options.extensions, this.options.onError);
            if (!gl) {
                return null;
            }
            this.gl = gl;
        }
        return this.gl;
    };
    Canvas.prototype.createContext_ = function () {
        var gl = this.getContext_();
        if (!gl) {
            return false;
        }
        var vertexShader, fragmentShader;
        try {
            vertexShader = context_1.default.createShader(gl, this.vertexString, gl.VERTEX_SHADER);
            fragmentShader = context_1.default.createShader(gl, this.fragmentString, gl.FRAGMENT_SHADER);
            // If Fragment shader fails load a empty one to sign the error
            if (!fragmentShader) {
                fragmentShader = context_1.default.createShader(gl, context_1.ContextDefaultFragment, gl.FRAGMENT_SHADER);
                this.valid = false;
            }
            else {
                this.valid = true;
            }
        }
        catch (e) {
            // !!!
            // console.error(e);
            this.trigger('error', e);
            return false;
        }
        // Create and use program
        var program = context_1.default.createProgram(gl, [vertexShader, fragmentShader]); //, [0,1],['a_texcoord','a_position']);
        gl.useProgram(program);
        // Delete shaders
        // gl.detachShader(program, vertexShader);
        // gl.detachShader(program, fragmentShader);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        this.program = program;
        if (this.valid) {
            try {
                this.buffers = buffers_1.default.getBuffers(gl, this.fragmentString, this.vertexString);
            }
            catch (e) {
                // console.error('load', e);
                this.valid = false;
                this.trigger('error', e);
                return false;
            }
            this.vertexBuffers = context_1.default.createVertexBuffers(gl, program);
            this.createUniforms_();
        }
        // Trigger event
        this.trigger('load', this);
        return this.valid;
    };
    Canvas.prototype.test = function (fragmentString, vertexString) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var vertex = _this.vertexString;
            var fragment = _this.fragmentString;
            var paused = _this.timer.paused;
            // Thanks to @thespite for the help here
            // https://www.khronos.org/registry/webgl/extensions/EXT_disjoint_timer_query/
            var extension = _this.gl.getExtension('EXT_disjoint_timer_query');
            var query = extension.createQueryEXT();
            var wasValid = _this.valid;
            if (fragmentString || vertexString) {
                _this.load(fragmentString, vertexString);
                wasValid = _this.valid;
                _this.render();
            }
            _this.timer.paused = true;
            extension.beginQueryEXT(extension.TIME_ELAPSED_EXT, query);
            _this.render();
            extension.endQueryEXT(extension.TIME_ELAPSED_EXT);
            var waitForTest = function () {
                _this.render();
                var available = extension.getQueryObjectEXT(query, extension.QUERY_RESULT_AVAILABLE_EXT);
                var disjoint = _this.gl.getParameter(extension.GPU_DISJOINT_EXT);
                if (available && !disjoint) {
                    var result = {
                        wasValid: wasValid,
                        fragment: fragmentString || _this.fragmentString,
                        vertex: vertexString || _this.vertexString,
                        timeElapsedMs: extension.getQueryObjectEXT(query, extension.QUERY_RESULT_EXT) / 1000000.0
                    };
                    _this.timer.paused = paused;
                    if (fragmentString || vertexString) {
                        _this.load(fragment, vertex);
                    }
                    resolve(result);
                }
                else {
                    window.requestAnimationFrame(waitForTest);
                }
            };
            waitForTest();
        });
    };
    Canvas.prototype.destroyContext_ = function () {
        var gl = this.gl;
        gl.useProgram(null);
        if (this.program) {
            gl.deleteProgram(this.program);
        }
        for (var key in this.buffers.values) {
            var buffer = this.buffers.values[key];
            buffer.destroy(gl);
        }
        for (var key in this.textures.values) {
            var texture = this.textures.values[key];
            texture.destroy(gl);
        }
        this.buffers = null;
        this.textures = null;
        this.uniforms = null;
        this.program = null;
        this.gl = null;
    };
    Canvas.prototype.swapCanvas_ = function () {
        var canvas = this.canvas;
        var canvas_ = canvas.cloneNode();
        canvas.parentNode.replaceChild(canvas_, canvas);
        this.canvas = canvas_;
        this.addCanvasListeners_();
    };
    Canvas.prototype.destroy = function () {
        this.removeListeners_();
        this.destroyContext_();
        this.animated = false;
        this.valid = false;
        Canvas.items.splice(Canvas.items.indexOf(this), 1);
    };
    Canvas.prototype.loadTexture = function (key, urlElementOrData, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        if (this.valid) {
            // Logger.log('GlslCanvas.loadTexture', key, urlElementOrData);
            this.textures.createOrUpdate(this.gl, key, urlElementOrData, this.buffers.count, options, this.options.workpath).then(function (texture) {
                var index = texture.index;
                var uniform = _this.uniforms.createTexture(key, index);
                uniform.texture = texture;
                var keyResolution = key.indexOf('[') !== -1 ? key.replace('[', 'Resolution[') : key + 'Resolution';
                // const uniformResolution = ;
                _this.uniforms.create(uniforms_1.UniformMethod.Uniform2f, uniforms_1.UniformType.Float, keyResolution, [texture.width, texture.height]);
                // Logger.log('loadTexture', key, url, index, texture.width, texture.height);
                return texture;
            }, function (error) {
                var message = Array.isArray(error.path) ? error.path.map(function (x) { return x.error ? x.error.message : ''; }).join(', ') : error.message;
                logger_1.default.log('GlslCanvas.loadTexture.error', key, urlElementOrData, message);
                _this.trigger('textureError', { key: key, urlElementOrData: urlElementOrData, message: message });
            });
        }
        else {
            this.textureList.push({ key: key, url: urlElementOrData, options: options });
        }
    };
    Canvas.prototype.setTexture = function (key, urlElementOrData, options) {
        if (options === void 0) { options = {}; }
        return this.setUniform_(key, [urlElementOrData], options);
    };
    Canvas.prototype.setUniform = function (key) {
        var values = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            values[_i - 1] = arguments[_i];
        }
        return this.setUniform_(key, values);
    };
    Canvas.prototype.setUniformOfInt = function (key, values) {
        return this.setUniform_(key, values, null, uniforms_1.UniformType.Int);
    };
    Canvas.prototype.setUniforms = function (values) {
        for (var key in values) {
            this.setUniform(key, values[key]);
        }
    };
    Canvas.prototype.pause = function () {
        if (this.valid) {
            this.timer.pause();
            this.canvas.classList.add('paused');
            this.trigger('pause');
        }
    };
    Canvas.prototype.play = function () {
        if (this.valid) {
            this.timer.play();
            this.canvas.classList.remove('paused');
            this.trigger('play');
        }
    };
    Canvas.prototype.toggle = function () {
        if (this.valid) {
            if (this.timer.paused) {
                this.play();
            }
            else {
                this.pause();
            }
        }
    };
    Canvas.prototype.checkRender = function () {
        if (this.isVisible_() && (this.sizeDidChanged_() || this.isAnimated_() || this.isDirty_())) {
            this.render();
            this.canvas.classList.add('playing');
        }
        else {
            this.canvas.classList.remove('playing');
        }
    };
    Canvas.prototype.render = function () {
        var gl = this.gl;
        if (!gl) {
            return;
        }
        var BW = gl.drawingBufferWidth;
        var BH = gl.drawingBufferHeight;
        this.updateUniforms_();
        for (var key in this.buffers.values) {
            var buffer = this.buffers.values[key];
            this.uniforms.apply(gl, buffer.program);
            buffer.render(gl, BW, BH);
        }
        gl.useProgram(this.program);
        this.uniforms.apply(gl, this.program);
        gl.viewport(0, 0, BW, BH);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        this.uniforms.clean();
        this.textures.clean();
        this.dirty = false;
        this.trigger('render', this);
    };
    Canvas.logger = logger_1.default;
    Canvas.items = [];
    return Canvas;
}(subscriber_1.default));
exports.default = Canvas;
if (document) {
    document.addEventListener("DOMContentLoaded", function () {
        Canvas.loadAll();
    });
}
