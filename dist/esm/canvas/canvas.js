// import '@babel/polyfill';
import 'promise-polyfill';
import Buffers from '../buffers/buffers';
import Context, { ContextDefaultFragment } from '../context/context';
import Common from '../core/common';
import Subscriber from '../core/subscriber';
import Logger from '../logger/logger';
import Textures, { Texture } from '../textures/textures';
import Uniforms, { UniformMethod, UniformType } from '../uniforms/uniforms';
import CanvasTimer from './canvas-timer';
export default class Canvas extends Subscriber {
    constructor(canvas, options = {
    // alpha: true,
    // antialias: true,
    // premultipliedAlpha: true
    }) {
        super();
        this.mouse = { x: 0, y: 0 };
        this.uniforms = new Uniforms();
        this.buffers = new Buffers();
        this.textures = new Textures();
        this.textureList = [];
        this.valid = false;
        this.animated = false;
        this.dirty = true;
        this.visible = false;
        if (!canvas) {
            return;
        }
        this.options = options;
        this.canvas = canvas;
        this.width = 0; // canvas.clientWidth;
        this.height = 0; // canvas.clientHeight;
        this.rect = canvas.getBoundingClientRect();
        this.devicePixelRatio = window.devicePixelRatio || 1;
        canvas.style.backgroundColor = options.backgroundColor || 'rgba(0,0,0,0)';
        this.getShaders_().then((success) => {
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
            this.load().then(success => {
                if (!this.program) {
                    return;
                }
                this.addListeners_();
                this.onLoop();
            });
        }, (error) => {
            Logger.log('GlslCanvas.getShaders_.error', error);
        });
        Canvas.items.push(this);
    }
    static version() {
        return '0.1.6';
    }
    static of(canvas, options) {
        return Canvas.items.find(x => x.canvas === canvas) || new Canvas(canvas, options);
    }
    static loadAll() {
        const canvases = [].slice.call(document.getElementsByClassName('glsl-canvas')).filter((x) => x instanceof HTMLCanvasElement);
        return canvases.map(x => Canvas.of(x));
    }
    getShaders_() {
        return new Promise((resolve, reject) => {
            const canvas = this.canvas;
            const urls = {};
            if (canvas.hasAttribute('data-vertex-url')) {
                urls.vertex = canvas.getAttribute('data-vertex-url');
            }
            if (canvas.hasAttribute('data-fragment-url')) {
                urls.fragment = canvas.getAttribute('data-fragment-url');
            }
            if (canvas.hasAttribute('data-vertex')) {
                this.vertexString = canvas.getAttribute('data-vertex');
            }
            if (canvas.hasAttribute('data-fragment')) {
                this.fragmentString = canvas.getAttribute('data-fragment');
            }
            if (Object.keys(urls).length) {
                Promise.all(Object.keys(urls).map((key, i) => {
                    const url = urls[key];
                    return Common.fetch(url)
                        // .then((response) => response.text())
                        .then((body) => {
                        if (key === 'vertex') {
                            return this.vertexString = body;
                        }
                        else {
                            return this.fragmentString = body;
                        }
                    });
                })).then(shaders => {
                    resolve([this.vertexString, this.fragmentString]);
                });
            }
            else {
                resolve([this.vertexString, this.fragmentString]);
            }
        });
    }
    addListeners_() {
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
    }
    addCanvasListeners_() {
        if (this.canvas.hasAttribute('controls')) {
            this.canvas.addEventListener('click', this.onClick);
            this.canvas.addEventListener('mouseover', this.onMouseover);
            this.canvas.addEventListener('mouseout', this.onMouseout);
            this.canvas.addEventListener('touchstart', this.onTouchstart);
            if (!this.canvas.hasAttribute('data-autoplay')) {
                this.pause();
            }
        }
    }
    removeCanvasListeners_() {
        if (this.canvas.hasAttribute('controls')) {
            this.canvas.removeEventListener('click', this.onClick);
            this.canvas.removeEventListener('mouseover', this.onMouseover);
            this.canvas.removeEventListener('mouseout', this.onMouseout);
            this.canvas.removeEventListener('touchstart', this.onTouchstart);
        }
    }
    removeListeners_() {
        window.cancelAnimationFrame(this.rafId);
        // window.removeEventListener('resize', this.onResize);
        window.removeEventListener('scroll', this.onScroll);
        document.removeEventListener('mousemove', this.onMousemove);
        document.removeEventListener('touchmove', this.onTouchmove);
        this.removeCanvasListeners_();
    }
    onScroll(e) {
        this.rect = this.canvas.getBoundingClientRect();
    }
    onClick(e) {
        this.toggle();
        this.trigger('click', e);
    }
    onMove(mx, my) {
        /*
        const rect = this.rect, gap = 20;
        const x = Math.max(-gap, Math.min(rect.width + gap, (mx - rect.left) * this.devicePixelRatio));
        const y = Math.max(-gap, Math.min(rect.height + gap, (this.canvas.height - (my - rect.top) * this.devicePixelRatio)));
        */
        const rect = this.rect;
        const x = (mx - rect.left) * this.devicePixelRatio;
        const y = (rect.height - (my - rect.top)) * this.devicePixelRatio;
        if (x !== this.mouse.x ||
            y !== this.mouse.y) {
            this.mouse.x = x;
            this.mouse.y = y;
            this.trigger('move', this.mouse);
        }
    }
    onMousemove(e) {
        this.onMove(e.clientX || e.pageX, e.clientY || e.pageY);
    }
    onMouseover(e) {
        this.play();
        this.trigger('over', e);
    }
    onMouseout(e) {
        this.pause();
        this.trigger('out', e);
    }
    onTouchmove(e) {
        const touch = [].slice.call(e.touches).reduce((p, touch) => {
            p = p || { x: 0, y: 0 };
            p.x += touch.clientX;
            p.y += touch.clientY;
            return p;
        }, null);
        if (touch) {
            this.onMove(touch.x / e.touches.length, touch.y / e.touches.length);
        }
    }
    onTouchend(e) {
        this.pause();
        this.trigger('out', e);
        document.removeEventListener('touchend', this.onTouchend);
    }
    onTouchstart(e) {
        this.play();
        this.trigger('over', e);
        document.addEventListener('touchend', this.onTouchend);
        document.removeEventListener('mousemove', this.onMousemove);
        if (this.canvas.hasAttribute('controls')) {
            this.canvas.removeEventListener('mouseover', this.onMouseover);
            this.canvas.removeEventListener('mouseout', this.onMouseout);
        }
    }
    onLoop(time) {
        this.checkRender();
        this.rafId = window.requestAnimationFrame(this.onLoop);
    }
    setUniform_(key, values, options = {}, type = null) {
        const uniform = Uniforms.parseUniform(key, values, type);
        if (Array.isArray(uniform)) {
            if (Uniforms.isArrayOfSampler2D(uniform)) {
                uniform.forEach((x) => this.loadTexture(x.key, x.values[0], options));
            }
            else {
                uniform.forEach((x) => this.uniforms.set(x.key, x.values[0]));
            }
        }
        else if (uniform) {
            switch (uniform.type) {
                case UniformType.Sampler2D:
                    this.loadTexture(key, values[0], options);
                    break;
                default:
                    this.uniforms.set(key, uniform);
            }
        }
    }
    parseTextures_(fragmentString) {
        // const regexp = /uniform\s*sampler2D\s*([\w]*);(\s*\/\/\s*([\w|\:\/\/|\.|\-|\_]*)|\s*)/gm;
        const regexp = /uniform\s*sampler2D\s*([\w]*);(\s*\/\/\s*([\w|\:\/\/|\.|\-|\_|\?|\&|\=]*)|\s*)/gm;
        // const regexp = /uniform\s*sampler2D\s*([\w]*);(\s*\/\/\s*([\w|\://|\.|\-|\_]*)|\s*)((\s*\:\s)(\{(\s*\w*\:\s*['|"]{0,1}\w*['|"]{0,1}\s*[,]{0,1})+\}))*/gm;
        let matches;
        while ((matches = regexp.exec(fragmentString)) !== null) {
            const key = matches[1];
            const url = matches[3];
            if (Texture.isTextureUrl(url)) {
                this.textureList.push({ key, url });
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
                this.textureList.push({ key, url: null });
            }
        }
        if (this.canvas.hasAttribute('data-textures')) {
            const urls = this.canvas.getAttribute('data-textures').split(',');
            urls.forEach((url, i) => {
                const key = 'u_texture' + i;
                this.textureList.push({ key, url });
            });
        }
        return this.textureList.length > 0;
    }
    createUniforms_() {
        const gl = this.gl;
        const fragmentString = this.fragmentString;
        const BW = gl.drawingBufferWidth;
        const BH = gl.drawingBufferHeight;
        const timer = this.timer = new CanvasTimer();
        const hasDelta = (fragmentString.match(/u_delta/g) || []).length > 1;
        const hasTime = (fragmentString.match(/u_time/g) || []).length > 1;
        const hasDate = (fragmentString.match(/u_date/g) || []).length > 1;
        const hasMouse = (fragmentString.match(/u_mouse/g) || []).length > 1;
        const hasTextures = this.parseTextures_(fragmentString);
        this.animated = hasTime || hasDate || hasMouse;
        if (this.animated) {
            this.canvas.classList.add('animated');
        }
        else {
            this.canvas.classList.remove('animated');
        }
        this.uniforms.create(UniformMethod.Uniform2f, UniformType.Float, 'u_resolution', [BW, BH]);
        if (hasDelta) {
            this.uniforms.create(UniformMethod.Uniform1f, UniformType.Float, 'u_delta', [timer.delta / 1000.0]);
        }
        if (hasTime) {
            this.uniforms.create(UniformMethod.Uniform1f, UniformType.Float, 'u_time', [timer.current / 1000.0]);
        }
        if (hasDate) {
            const date = new Date();
            this.uniforms.create(UniformMethod.Uniform4f, UniformType.Float, 'u_date', [date.getFullYear(), date.getMonth(), date.getDate(), date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds() + date.getMilliseconds() * 0.001]);
        }
        if (hasMouse) {
            this.uniforms.create(UniformMethod.Uniform2f, UniformType.Float, 'u_mouse', [0, 0]);
        }
        for (const key in this.buffers.values) {
            const buffer = this.buffers.values[key];
            this.uniforms.create(UniformMethod.Uniform1i, UniformType.Sampler2D, buffer.key, [buffer.input.index]);
        }
        if (hasTextures) {
            this.textureList.filter(x => x.url).forEach(x => {
                this.setTexture(x.key, x.url, x.options);
            });
            this.textureList = [];
        }
    }
    updateUniforms_() {
        const gl = this.gl;
        const BW = gl.drawingBufferWidth;
        const BH = gl.drawingBufferHeight;
        if (!this.timer) {
            return;
        }
        const timer = this.timer.next();
        this.uniforms.update(UniformMethod.Uniform2f, UniformType.Float, 'u_resolution', [BW, BH]);
        if (this.uniforms.has('u_delta')) {
            this.uniforms.update(UniformMethod.Uniform1f, UniformType.Float, 'u_delta', [timer.delta / 1000.0]);
        }
        if (this.uniforms.has('u_time')) {
            this.uniforms.update(UniformMethod.Uniform1f, UniformType.Float, 'u_time', [timer.current / 1000.0]);
        }
        if (this.uniforms.has('u_date')) {
            const date = new Date();
            this.uniforms.update(UniformMethod.Uniform4f, UniformType.Float, 'u_date', [date.getFullYear(), date.getMonth(), date.getDate(), date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds() + date.getMilliseconds() * 0.001]);
        }
        if (this.uniforms.has('u_mouse')) {
            const mouse = this.mouse;
            this.uniforms.update(UniformMethod.Uniform2f, UniformType.Float, 'u_mouse', [mouse.x, mouse.y]);
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
        for (const key in this.buffers.values) {
            const buffer = this.buffers.values[key];
            this.uniforms.update(UniformMethod.Uniform1i, UniformType.Sampler2D, buffer.key, [buffer.input.index]);
        }
        for (const key in this.textures.values) {
            const texture = this.textures.values[key];
            texture.tryUpdate(gl);
            this.uniforms.update(UniformMethod.Uniform1i, UniformType.Sampler2D, texture.key, [texture.index]);
        }
    }
    isVisible_() {
        const rect = this.rect;
        return (rect.top + rect.height) > 0 && rect.top < (window.innerHeight || document.documentElement.clientHeight);
    }
    isAnimated_() {
        return (this.animated || this.textures.animated) && !this.timer.paused;
    }
    isDirty_() {
        return this.dirty || this.uniforms.dirty || this.textures.dirty;
    }
    // check size change at start of requestFrame
    sizeDidChanged_() {
        const gl = this.gl;
        const W = Math.ceil(this.canvas.clientWidth), H = Math.ceil(this.canvas.clientHeight);
        if (this.width !== W ||
            this.height !== H) {
            this.width = W;
            this.height = H;
            // Lookup the size the browser is displaying the canvas in CSS pixels
            // and compute a size needed to make our drawingbuffer match it in
            // device pixels.
            const BW = Math.ceil(W * this.devicePixelRatio);
            const BH = Math.ceil(H * this.devicePixelRatio);
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
            for (const key in this.buffers.values) {
                const buffer = this.buffers.values[key];
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
    }
    load(fragmentString, vertexString) {
        return Promise.all([
            Context.getIncludes(fragmentString || this.fragmentString),
            Context.getIncludes(vertexString || this.vertexString)
        ]).then(array => {
            this.fragmentString = array[0];
            this.vertexString = array[1];
            return this.createContext_();
        });
    }
    getContext_() {
        const vertexString = this.vertexString;
        const fragmentString = this.fragmentString;
        this.vertexString = Context.getVertex(vertexString, fragmentString);
        this.fragmentString = Context.getFragment(vertexString, fragmentString);
        if (Context.versionDiffers(this.gl, vertexString, fragmentString)) {
            this.destroyContext_();
            this.swapCanvas_();
            this.uniforms = new Uniforms();
            this.buffers = new Buffers();
            this.textures = new Textures();
            this.textureList = [];
        }
        if (!this.gl) {
            const gl = Context.tryInferContext(vertexString, fragmentString, this.canvas, this.options, this.options.extensions, this.options.onError);
            if (!gl) {
                return null;
            }
            this.gl = gl;
        }
        return this.gl;
    }
    createContext_() {
        const gl = this.getContext_();
        if (!gl) {
            return false;
        }
        let vertexShader, fragmentShader;
        try {
            vertexShader = Context.createShader(gl, this.vertexString, gl.VERTEX_SHADER);
            fragmentShader = Context.createShader(gl, this.fragmentString, gl.FRAGMENT_SHADER);
            // If Fragment shader fails load a empty one to sign the error
            if (!fragmentShader) {
                fragmentShader = Context.createShader(gl, ContextDefaultFragment, gl.FRAGMENT_SHADER);
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
        const program = Context.createProgram(gl, [vertexShader, fragmentShader]); //, [0,1],['a_texcoord','a_position']);
        gl.useProgram(program);
        // Delete shaders
        // gl.detachShader(program, vertexShader);
        // gl.detachShader(program, fragmentShader);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        this.program = program;
        if (this.valid) {
            try {
                this.buffers = Buffers.getBuffers(gl, this.fragmentString, this.vertexString);
            }
            catch (e) {
                // console.error('load', e);
                this.valid = false;
                this.trigger('error', e);
                return false;
            }
            this.vertexBuffers = Context.createVertexBuffers(gl, program);
            this.createUniforms_();
        }
        // Trigger event
        this.trigger('load', this);
        return this.valid;
    }
    test(fragmentString, vertexString) {
        return new Promise((resolve, reject) => {
            const vertex = this.vertexString;
            const fragment = this.fragmentString;
            const paused = this.timer.paused;
            // Thanks to @thespite for the help here
            // https://www.khronos.org/registry/webgl/extensions/EXT_disjoint_timer_query/
            const extension = this.gl.getExtension('EXT_disjoint_timer_query');
            const query = extension.createQueryEXT();
            let wasValid = this.valid;
            if (fragmentString || vertexString) {
                this.load(fragmentString, vertexString);
                wasValid = this.valid;
                this.render();
            }
            this.timer.paused = true;
            extension.beginQueryEXT(extension.TIME_ELAPSED_EXT, query);
            this.render();
            extension.endQueryEXT(extension.TIME_ELAPSED_EXT);
            const waitForTest = () => {
                this.render();
                const available = extension.getQueryObjectEXT(query, extension.QUERY_RESULT_AVAILABLE_EXT);
                const disjoint = this.gl.getParameter(extension.GPU_DISJOINT_EXT);
                if (available && !disjoint) {
                    const result = {
                        wasValid: wasValid,
                        fragment: fragmentString || this.fragmentString,
                        vertex: vertexString || this.vertexString,
                        timeElapsedMs: extension.getQueryObjectEXT(query, extension.QUERY_RESULT_EXT) / 1000000.0
                    };
                    this.timer.paused = paused;
                    if (fragmentString || vertexString) {
                        this.load(fragment, vertex);
                    }
                    resolve(result);
                }
                else {
                    window.requestAnimationFrame(waitForTest);
                }
            };
            waitForTest();
        });
    }
    destroyContext_() {
        const gl = this.gl;
        gl.useProgram(null);
        if (this.program) {
            gl.deleteProgram(this.program);
        }
        for (const key in this.buffers.values) {
            const buffer = this.buffers.values[key];
            buffer.destroy(gl);
        }
        for (const key in this.textures.values) {
            const texture = this.textures.values[key];
            texture.destroy(gl);
        }
        this.buffers = null;
        this.textures = null;
        this.uniforms = null;
        this.program = null;
        this.gl = null;
    }
    swapCanvas_() {
        const canvas = this.canvas;
        const canvas_ = canvas.cloneNode();
        canvas.parentNode.replaceChild(canvas_, canvas);
        this.canvas = canvas_;
        this.addCanvasListeners_();
    }
    destroy() {
        this.removeListeners_();
        this.destroyContext_();
        this.animated = false;
        this.valid = false;
        Canvas.items.splice(Canvas.items.indexOf(this), 1);
    }
    loadTexture(key, urlElementOrData, options = {}) {
        if (this.valid) {
            // Logger.log('GlslCanvas.loadTexture', key, urlElementOrData);
            this.textures.createOrUpdate(this.gl, key, urlElementOrData, this.buffers.count, options, this.options.workpath).then(texture => {
                const index = texture.index;
                const uniform = this.uniforms.createTexture(key, index);
                uniform.texture = texture;
                const keyResolution = key.indexOf('[') !== -1 ? key.replace('[', 'Resolution[') : key + 'Resolution';
                // const uniformResolution = ;
                this.uniforms.create(UniformMethod.Uniform2f, UniformType.Float, keyResolution, [texture.width, texture.height]);
                // Logger.log('loadTexture', key, url, index, texture.width, texture.height);
                return texture;
            }, error => {
                const message = Array.isArray(error.path) ? error.path.map((x) => x.error ? x.error.message : '').join(', ') : error.message;
                Logger.log('GlslCanvas.loadTexture.error', key, urlElementOrData, message);
                this.trigger('textureError', { key, urlElementOrData, message });
            });
        }
        else {
            this.textureList.push({ key, url: urlElementOrData, options });
        }
    }
    setTexture(key, urlElementOrData, options = {}) {
        return this.setUniform_(key, [urlElementOrData], options);
    }
    setUniform(key, ...values) {
        return this.setUniform_(key, values);
    }
    setUniformOfInt(key, values) {
        return this.setUniform_(key, values, null, UniformType.Int);
    }
    setUniforms(values) {
        for (const key in values) {
            this.setUniform(key, values[key]);
        }
    }
    pause() {
        if (this.valid) {
            this.timer.pause();
            this.canvas.classList.add('paused');
            this.trigger('pause');
        }
    }
    play() {
        if (this.valid) {
            this.timer.play();
            this.canvas.classList.remove('paused');
            this.trigger('play');
        }
    }
    toggle() {
        if (this.valid) {
            if (this.timer.paused) {
                this.play();
            }
            else {
                this.pause();
            }
        }
    }
    checkRender() {
        if (this.isVisible_() && (this.sizeDidChanged_() || this.isAnimated_() || this.isDirty_())) {
            this.render();
            this.canvas.classList.add('playing');
        }
        else {
            this.canvas.classList.remove('playing');
        }
    }
    render() {
        const gl = this.gl;
        if (!gl) {
            return;
        }
        const BW = gl.drawingBufferWidth;
        const BH = gl.drawingBufferHeight;
        this.updateUniforms_();
        for (const key in this.buffers.values) {
            const buffer = this.buffers.values[key];
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
    }
}
Canvas.logger = Logger;
Canvas.items = [];
if (document) {
    document.addEventListener("DOMContentLoaded", () => {
        Canvas.loadAll();
    });
}
