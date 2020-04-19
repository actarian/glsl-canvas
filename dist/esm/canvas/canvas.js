// import '@babel/polyfill';
import 'promise-polyfill';
import Buffers from '../buffers/buffers';
import Context, { ContextMode } from '../context/context';
import Common from '../core/common';
import Logger from '../logger/logger';
import Vector2 from '../math/vector2';
import Renderer from '../renderer/renderer';
import Textures, { Texture } from '../textures/textures';
import Uniforms, { UniformMethod, UniformType } from '../uniforms/uniforms';
export default class Canvas extends Renderer {
    constructor(canvas, options = {
    // alpha: true,
    // antialias: true,
    // premultipliedAlpha: true
    }) {
        super();
        this.valid = false;
        this.visible = false;
        this.controls = false;
        if (!canvas) {
            return;
        }
        this.options = options;
        this.canvas = canvas;
        this.width = 0;
        this.height = 0;
        this.rect = canvas.getBoundingClientRect();
        this.devicePixelRatio = window.devicePixelRatio || 1;
        this.mode = options.mode || ContextMode.Flat;
        this.mesh = options.mesh || undefined;
        this.doubleSided = options.doubleSided || false;
        this.defaultMesh = this.mesh;
        this.workpath = options.workpath;
        canvas.style.backgroundColor = options.backgroundColor || 'rgba(0,0,0,0)';
        this.getShaders_().then((success) => {
            this.load().then(success => {
                if (!this.program) {
                    return;
                }
                this.addListeners_();
                this.onLoop();
            });
        }, (error) => {
            Logger.error('GlslCanvas.getShaders_.error', error);
        });
        Canvas.items.push(this);
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
            this.vertexString = this.options.vertexString || this.vertexString;
            this.fragmentString = this.options.fragmentString || this.fragmentString;
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
        this.onWheel = this.onWheel.bind(this);
        this.onClick = this.onClick.bind(this);
        this.onMove = this.onMove.bind(this);
        this.onMousedown = this.onMousedown.bind(this);
        this.onMousemove = this.onMousemove.bind(this);
        this.onMouseover = this.onMouseover.bind(this);
        this.onMouseout = this.onMouseout.bind(this);
        this.onMouseup = this.onMouseup.bind(this);
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
        this.controls = this.canvas.hasAttribute('controls');
        this.canvas.addEventListener('wheel', this.onWheel);
        this.canvas.addEventListener('click', this.onClick);
        this.canvas.addEventListener('mousedown', this.onMousedown);
        this.canvas.addEventListener('touchstart', this.onTouchstart);
        if (this.controls) {
            this.canvas.addEventListener('mouseover', this.onMouseover);
            this.canvas.addEventListener('mouseout', this.onMouseout);
            if (!this.canvas.hasAttribute('data-autoplay')) {
                this.pause();
            }
        }
    }
    removeCanvasListeners_() {
        this.canvas.removeEventListener('wheel', this.onWheel);
        this.canvas.removeEventListener('click', this.onClick);
        this.canvas.removeEventListener('mousedown', this.onMousedown);
        this.canvas.removeEventListener('mouseup', this.onMouseup);
        this.canvas.removeEventListener('touchstart', this.onTouchstart);
        this.canvas.removeEventListener('touchend', this.onTouchend);
        if (this.controls) {
            this.canvas.removeEventListener('mouseover', this.onMouseover);
            this.canvas.removeEventListener('mouseout', this.onMouseout);
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
    onWheel(e) {
        this.camera.wheel(e.deltaY);
        this.trigger('wheel', e);
    }
    onClick(e) {
        if (this.controls) {
            this.toggle();
        }
        this.trigger('click', e);
    }
    onDown(mx, my) {
        mx *= this.devicePixelRatio;
        my *= this.devicePixelRatio;
        this.mouse.x = mx;
        this.mouse.y = my;
        const rect = this.rect;
        const min = Math.min(rect.width, rect.height);
        this.camera.down(mx / min, my / min);
        this.trigger('down', this.mouse);
    }
    onMove(mx, my) {
        const rect = this.rect;
        const x = (mx - rect.left) * this.devicePixelRatio;
        const y = (rect.height - (my - rect.top)) * this.devicePixelRatio;
        if (x !== this.mouse.x ||
            y !== this.mouse.y) {
            this.mouse.x = x;
            this.mouse.y = y;
            const min = Math.min(rect.width, rect.height);
            this.camera.move(mx / min, my / min);
            this.trigger('move', this.mouse);
        }
    }
    onUp(e) {
        this.camera.up();
        if (this.controls) {
            this.pause();
        }
        this.trigger('out', e);
    }
    onMousedown(e) {
        this.onDown(e.clientX || e.pageX, e.clientY || e.pageY);
        document.addEventListener('mouseup', this.onMouseup);
        document.removeEventListener('touchstart', this.onTouchstart);
        document.removeEventListener('touchmove', this.onTouchmove);
    }
    onMousemove(e) {
        this.onMove(e.clientX || e.pageX, e.clientY || e.pageY);
    }
    onMouseup(e) {
        this.onUp(e);
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
            p = p || new Vector2();
            p.x += touch.clientX;
            p.y += touch.clientY;
            return p;
        }, null);
        if (touch) {
            this.onMove(touch.x / e.touches.length, touch.y / e.touches.length);
        }
    }
    onTouchend(e) {
        this.onUp(e);
        document.removeEventListener('touchend', this.onTouchend);
    }
    onTouchstart(e) {
        const touch = [].slice.call(e.touches).reduce((p, touch) => {
            p = p || new Vector2();
            p.x += touch.clientX;
            p.y += touch.clientY;
            return p;
        }, null);
        if (touch) {
            this.onDown(touch.x / e.touches.length, touch.y / e.touches.length);
        }
        if (this.controls) {
            this.play();
        }
        this.trigger('over', e);
        document.addEventListener('touchend', this.onTouchend);
        document.removeEventListener('mousedown', this.onMousedown);
        document.removeEventListener('mousemove', this.onMousemove);
        if (this.controls) {
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
        const CW = Math.ceil(this.canvas.clientWidth), CH = Math.ceil(this.canvas.clientHeight);
        if (this.width !== CW ||
            this.height !== CH) {
            this.width = CW;
            this.height = CH;
            // Lookup the size the browser is displaying the canvas in CSS pixels
            // and compute a size needed to make our drawingbuffer match it in
            // device pixels.
            const W = Math.ceil(CW * this.devicePixelRatio);
            const H = Math.ceil(CH * this.devicePixelRatio);
            this.W = W;
            this.H = H;
            this.canvas.width = W;
            this.canvas.height = H;
            /*
            if (gl.canvas.width !== W ||
                gl.canvas.height !== H) {
                gl.canvas.width = W;
                gl.canvas.height = H;
                // Set the viewport to match
                // gl.viewport(0, 0, W, H);
            }
            */
            for (const key in this.buffers.values) {
                const buffer = this.buffers.values[key];
                buffer.resize(gl, W, H);
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
    load(fragmentString, vertexString) {
        const fragmentVertexString = Context.getFragmentVertex(this.gl, fragmentString || this.fragmentString);
        return Promise.all([
            Context.getIncludes(fragmentString || this.fragmentString),
            Context.getIncludes(fragmentVertexString || vertexString || this.vertexString)
        ]).then(array => {
            this.fragmentString = array[0];
            this.vertexString = array[1];
            return this.createContext_();
        });
    }
    getContext_() {
        const vertexString = this.vertexString;
        const fragmentString = this.fragmentString;
        this.vertexString = Context.getVertex(vertexString, fragmentString, this.mode);
        this.fragmentString = Context.getFragment(vertexString, fragmentString, this.mode);
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
            Context.inferPrecision(this.fragmentString);
            vertexShader = Context.createShader(gl, this.vertexString, gl.VERTEX_SHADER);
            fragmentShader = Context.createShader(gl, this.fragmentString, gl.FRAGMENT_SHADER);
            // If Fragment shader fails load a empty one to sign the error
            if (!fragmentShader) {
                const defaultFragment = Context.getFragment(null, null, this.mode);
                fragmentShader = Context.createShader(gl, defaultFragment, gl.FRAGMENT_SHADER);
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
        if (!program) {
            this.trigger('error', Context.lastError);
            return false;
        }
        // console.log(this.vertexString, this.fragmentString, program);
        // Delete shaders
        // gl.detachShader(program, vertexShader);
        // gl.detachShader(program, fragmentShader);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        this.program = program;
        if (this.valid) {
            try {
                this.buffers = Buffers.getBuffers(gl, this.fragmentString, Context.getBufferVertex(gl));
            }
            catch (e) {
                // console.error('load', e);
                this.valid = false;
                this.trigger('error', e);
                return false;
            }
            this.create_();
            if (this.animated) {
                this.canvas.classList.add('animated');
            }
            else {
                this.canvas.classList.remove('animated');
            }
        }
        // Trigger event
        this.trigger('load', this);
        return this.valid;
    }
    create_() {
        this.parseMode_();
        this.parseMesh_();
        super.create_();
        this.createBuffers_();
        this.createTextures_();
    }
    parseMode_() {
        if (this.canvas.hasAttribute('data-mode')) {
            const data = this.canvas.getAttribute('data-mode');
            if (['flat', 'box', 'sphere', 'torus', 'mesh'].indexOf(data) !== -1) {
                this.mode = data;
            }
        }
    }
    parseMesh_() {
        if (this.canvas.hasAttribute('data-mesh')) {
            const data = this.canvas.getAttribute('data-mesh');
            if (data.indexOf('.obj') !== -1) {
                this.mesh = this.defaultMesh = data;
            }
        }
    }
    createBuffers_() {
        for (const key in this.buffers.values) {
            const buffer = this.buffers.values[key];
            this.uniforms.create(UniformMethod.Uniform1i, UniformType.Sampler2D, buffer.key, [buffer.input.index]);
        }
    }
    createTextures_() {
        const hasTextures = this.parseTextures_(this.fragmentString);
        if (hasTextures) {
            this.textureList.filter(x => x.url).forEach(x => {
                this.setTexture(x.key, x.url, x.options);
            });
            this.textureList = [];
        }
    }
    update_() {
        super.update_();
        this.updateBuffers_();
        this.updateTextures_();
    }
    updateBuffers_() {
        for (const key in this.buffers.values) {
            const buffer = this.buffers.values[key];
            this.uniforms.update(UniformMethod.Uniform1i, UniformType.Sampler2D, buffer.key, [buffer.input.index]);
        }
    }
    updateTextures_() {
        const gl = this.gl;
        for (const key in this.textures.values) {
            const texture = this.textures.values[key];
            texture.tryUpdate(gl);
            this.uniforms.update(UniformMethod.Uniform1i, UniformType.Sampler2D, texture.key, [texture.index]);
        }
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
                Logger.error('GlslCanvas.loadTexture.error', key, urlElementOrData, message);
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
        if (this.isVisible_() && (this.sizeDidChanged_() || this.isDirty_() || this.isAnimated_())) {
            this.render();
            this.canvas.classList.add('playing');
        }
        else {
            this.canvas.classList.remove('playing');
        }
    }
}
Canvas.logger = Logger;
Canvas.items = [];
if (document) {
    document.addEventListener("DOMContentLoaded", () => {
        Canvas.loadAll();
    });
}
