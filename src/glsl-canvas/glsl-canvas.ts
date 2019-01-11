// import '@babel/polyfill';
// import 'whatwg-fetch';
// import 'promise-polyfill';
import Buffers, { IOBuffer } from './buffers';
import Context, { ContextVertexBuffers } from './context';
import Subscriber from './subscriber';
import Textures, { Texture, TextureExtensions } from './textures';
import Uniforms, { Uniform, UniformMethod, UniformType } from './uniforms';

const GlslCanvasDefaultVertex = `
#ifdef GL_ES
precision mediump float;
#endif

attribute vec2 a_position;
attribute vec2 a_texcoord;

varying vec2 v_texcoord;

void main(){
	gl_Position = vec4(a_position, 0.0, 1.0);
	v_texcoord = a_texcoord;
}
`;

const GlslCanvasDefaultFragment = `
#ifdef GL_ES
precision mediump float;
#endif

varying vec2 v_texcoord;

void main(){
	gl_FragColor = vec4(0.0);
}
`;

export interface ICanvasContextOptions {
    backgroundColor?: string;
    vertexString?: string;
    fragmentString?: string;
    alpha?: GLboolean;
    antialias?: GLboolean;
    depth?: GLboolean;
    failIfMajorPerformanceCaveat?: boolean;
    // powerPreference?: WebGLPowerPreference;
    premultipliedAlpha?: GLboolean;
    preserveDrawingBuffer?: GLboolean;
    stencil?: GLboolean;
}

export interface IPoint {
    x: number,
    y: number,
}

export class GlslCanvasOptions {

}

export class GlslCanvasTimer {
    start: number;
    previous: number;
    delay: number = 0.0;
    current: number = 0.0;
    delta: number = 0.0;
    paused: boolean = false;

    constructor() {
        this.start = this.previous = performance.now() / 1000.0;
    }

    play() {
        if (this.previous) {
            const now = performance.now() / 1000.0;
            this.delay += (now - this.previous);
            this.previous = now;
        }
        // console.log(this.delay);
        this.paused = false;
    }

    pause() {
        this.paused = true;
    }

    next(): GlslCanvasTimer {
        const now = performance.now() / 1000.0;
        this.delta = now - this.previous;
        this.current = now - this.start - this.delay;
        this.previous = now;
        return this;
    }

}

export default class GlslCanvas extends Subscriber {

    canvas: HTMLCanvasElement;
    width: number;
    height: number;
    timer: GlslCanvasTimer;
    dirty: boolean = true;
    animated: boolean = false;
    nDelta: number = 0;
    nTime: number = 0;
    nDate: number = 0;
    nMouse: number = 0;

    pixelRatio: number;
    gl: WebGLRenderingContext;
    program: WebGLProgram;
    textureList: any[] = [];
    textures: Textures = new Textures();
    buffers: Buffers = new Buffers();
    uniforms: Uniforms = new Uniforms();
    vertexBuffers: ContextVertexBuffers;
    rect: ClientRect | DOMRect;
    mouse: IPoint = { x: 0, y: 0 };
    valid: boolean = false;
    visible: boolean = false;
    vertexString: string;
    fragmentString: string;
    resize: Function;
    scroll: Function;
    mousemove: Function;
    click: Function;
    loop: Function;

    constructor(
        canvas: HTMLCanvasElement,
        contextOptions: ICanvasContextOptions = {},
        options: any = {}
    ) {
        super();
        if (!canvas) {
            return;
        }
        this.canvas = canvas;
        this.width = canvas.clientWidth;
        this.height = canvas.clientHeight;
        this.rect = canvas.getBoundingClientRect();
        this.vertexString = contextOptions.vertexString || GlslCanvasDefaultVertex;
        this.fragmentString = contextOptions.fragmentString || GlslCanvasDefaultFragment;
        const gl = Context.tryGetContext(canvas, contextOptions, options.onError);
        if (!gl) {
            return;
        }
        this.gl = gl;
        this.pixelRatio = window.devicePixelRatio || 1;
        canvas.style.backgroundColor = contextOptions.backgroundColor || 'rgba(0,0,0,0)';
        this.getShaders().then(
            (success) => {
                this.load();
                if (!this.program) {
                    return;
                }
                this.addListeners();
                this.loop();
                // this.animated = false;
            },
            (error) => {
                console.log('error', error);
            });
        GlslCanvas.items.push(this);
    }

    static items: GlslCanvas[] = [];

    static version(): string {
        return '0.2.0';
    }

    static isDifferent(a: any, b: any): boolean {
        if (a && b) {
            return a.toString() !== b.toString();
        }
        return false;
    }

    static of(canvas: HTMLCanvasElement): GlslCanvas {
        return GlslCanvas.items.find(x => x.canvas === canvas) || new GlslCanvas(canvas);
    }

    static loadAll(): GlslCanvas[] {
        const canvases: HTMLCanvasElement[] = <HTMLCanvasElement[]>[].slice.call(document.getElementsByClassName('glsl-canvas')).filter((x: HTMLElement) => x instanceof HTMLCanvasElement);
        return canvases.map(x => GlslCanvas.of(x));
    }

    fetch(url: string): Promise<string> {
        return new Promise(function (resolve, reject) {
            const xhr: XMLHttpRequest = new XMLHttpRequest();
            xhr.onload = function () {
                resolve(xhr.response || xhr.responseText);
            };
            xhr.onerror = function () {
                reject(new Error('Network request failed'));
            };
            xhr.ontimeout = function () {
                reject(new Error('Network request failed'));
            };
            xhr.onabort = function () {
                reject(new Error('Aborted'));
            };
            xhr.open('GET', url, true);
            xhr.send(null);
        })
    }

    getShaders(): Promise<string[]> {
        return new Promise((resolve, reject) => {
            const canvas = this.canvas;
            const urls: any = {};
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
                    const url: string = urls[key];
                    return this.fetch(url)
                        // .then((response) => response.text())
                        .then((body) => {
                            if (key === 'vertex') {
                                return this.vertexString = body;
                            } else {
                                return this.fragmentString = body;
                            }
                        })
                }
                )).then(shaders => {
                    resolve([this.vertexString, this.fragmentString]);
                });
            } else {
                resolve([this.vertexString, this.fragmentString]);
            }
        });
    }

    addListeners(): void {
        // resize buffers on canvas resize
        // consider applying a throttle of 50 ms on canvas resize
        // to avoid requestAnimationFrame and Gl violations
        const resize = (e: Event) => {
            this.rect = this.canvas.getBoundingClientRect();
        };

        const scroll = (e: Event) => {
            this.rect = this.canvas.getBoundingClientRect();
        };

        const mousemove = (e: MouseEvent) => {
            this.mouse.x = e.clientX || e.pageX;
            this.mouse.y = e.clientY || e.pageY;
        };

        const click = (e: MouseEvent) => {
            this.toggle();
        };

        const loop: FrameRequestCallback = (time: number) => {
            this.checkRender();
            window.requestAnimationFrame(loop);
        };

        this.resize = resize;
        this.scroll = scroll;
        this.mousemove = mousemove;
        this.click = click;
        this.loop = loop;

        window.addEventListener('resize', resize);
        window.addEventListener('scroll', scroll);
        document.addEventListener('mousemove', mousemove, false);
        if (this.canvas.hasAttribute('controls')) {
            this.canvas.addEventListener('click', click);
            if (!this.canvas.hasAttribute('data-autoplay')) {
                this.pause();
            }
        }
    }

    load(
        fragmentString?: string,
        vertexString?: string
    ): void {
        if (vertexString) {
            this.vertexString = vertexString;
        }
        if (fragmentString) {
            this.fragmentString = fragmentString;
        }
        const gl = this.gl;
        const vertexShader = Context.createShader(gl, this.vertexString, gl.VERTEX_SHADER);
        let fragmentShader = Context.createShader(gl, this.fragmentString, gl.FRAGMENT_SHADER);
        // If Fragment shader fails load a empty one to sign the error
        if (!fragmentShader) {
            fragmentShader = Context.createShader(gl, `void main(){
				gl_FragColor = vec4(1.0);
			}`, gl.FRAGMENT_SHADER);
            this.valid = false;
        } else {
            this.valid = true;
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
            this.buffers = Buffers.getBuffers(gl, this.fragmentString, this.vertexString);
            this.vertexBuffers = Context.createVertexBuffers(gl, program);
            this.createUniforms();
            // this.getBuffers(this.fragmentString);
        }
        // Trigger event
        this.trigger('load', {});
        // this.render();
    }

    test(
        fragmentString?: string,
        vertexString?: string
    ): Promise<any> {
        return new Promise((resolve, reject) => {
            // Thanks to @thespite for the help here
            // https://www.khronos.org/registry/webgl/extensions/EXT_disjoint_timer_query/
            const vertex = this.vertexString;
            const fragment = this.fragmentString;
            const paused = this.timer.paused;
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
                } else {
                    window.requestAnimationFrame(waitForTest);
                }
            }
            waitForTest();
        });
    }

    destroy(): void {
        this.animated = false;
        this.valid = false;
        const gl = this.gl;
        /*
        // !!!
        for (let texture in this.textures) {
            if (texture.destroy) {
                texture.destroy(gl);
            }
        }
        */
        gl.useProgram(null);
        gl.deleteProgram(this.program);
        // this.buffers.forEach((buffer: IOBuffer) => buffer.destroy(gl));
        for (const key in this.buffers.values) {
            const buffer: IOBuffer = this.buffers.values[key];
            buffer.destroy(gl)
        }
        this.buffers = null;
        this.textures = null;
        this.uniforms = null;
        this.program = null;
        this.gl = null;
        GlslCanvas.items.splice(GlslCanvas.items.indexOf(this), 1);
    }

    setUniform(key: string, ...values: any[]): void {
        const uniform: Uniform = Uniforms.parseUniform(key, ...values);
        if (uniform) {
            if (uniform.type === UniformType.Sampler2D) {
                this.loadTexture(key, values[0]);
            } else {
                this.uniforms.set(key, uniform);
            }
        }
    }

    setUniforms(values: Map<string, any[]>): void {
        values.forEach((value: any[], key: string) => {
            this.setUniform(key, ...value);
        });
    }

    pause(): void {
        if (this.valid) {
            this.timer.pause();
            this.canvas.classList.add('paused');
        }
    }

    play(): void {
        if (this.valid) {
            this.timer.play();
            this.canvas.classList.remove('paused');
        }
    }

    toggle(): void {
        if (this.valid) {
            if (this.timer.paused) {
                this.play();
            } else {
                this.pause();
            }
        }
    }

    isVisible(): boolean {
        const rect = this.rect;
        return (rect.top + rect.height) > 0 && rect.top < (window.innerHeight || document.documentElement.clientHeight);
    }

    isAnimated(): boolean {
        return (this.animated || this.textures.animated) && !this.timer.paused;
    }

    isDirty(): boolean {
        return this.dirty || this.uniforms.dirty || this.textures.dirty;
        // [].slice.call(this.textures.values()).reduce((p, texture) => p || texture.dirty, false);
        // this.textures.dirty;
    }

    // check size change at start of requestFrame
    sizeDidChanged(): boolean {
        const gl = this.gl;
        const rect = this.rect;
        const W = rect.width,
            H = rect.height;
        if (this.width !== W ||
            this.height !== H) {
            this.width = W;
            this.height = H;
            // Lookup the size the browser is displaying the canvas in CSS pixels
            // and compute a size needed to make our drawingbuffer match it in
            // device pixels.
            const BW = Math.floor(W * this.pixelRatio);
            const BH = Math.floor(H * this.pixelRatio);
            // Check if the canvas is not the same size.
            if (gl.canvas.width !== BW ||
                gl.canvas.height !== BH) {
                // Make the canvas the same size
                gl.canvas.width = BW;
                gl.canvas.height = BH;
                // Set the viewport to match
                // gl.viewport(0, 0, BW, BH);
            }
            /*
            this.buffers.forEach((buffer: IOBuffer) => {
                buffer.resize(gl, BW, BH);
            });            
            */
            for (const key in this.buffers.values) {
                const buffer: IOBuffer = this.buffers.values[key];
                buffer.resize(gl, BW, BH);
            }
            // gl.useProgram(this.program);
            return true;
        } else {
            return false;
        }
    }

    checkRender(): void {
        if (this.isVisible() && (this.sizeDidChanged() || this.isAnimated() || this.isDirty())) {
            this.render();
            this.canvas.classList.add('playing');
        } else {
            this.canvas.classList.remove('playing');
        }
    }

    createUniforms(): void {
        const gl = this.gl;
        const fragmentString = this.fragmentString;
        const BW = gl.drawingBufferWidth;
        const BH = gl.drawingBufferHeight;
        const timer = this.timer = new GlslCanvasTimer();
        const hasDelta = (fragmentString.match(/u_delta/g) || []).length > 1;
        const hasTime = (fragmentString.match(/u_time/g) || []).length > 1;
        const hasDate = (fragmentString.match(/u_date/g) || []).length > 1;
        const hasMouse = (fragmentString.match(/u_mouse/g) || []).length > 1;
        const hasTextures = this.parseTextures(fragmentString);
        this.animated = hasTime || hasDate || hasMouse;
        if (this.animated) {
            this.canvas.classList.add('animated');
        } else {
            this.canvas.classList.remove('animated');
        }
        this.uniforms.create(UniformMethod.Uniform2f, UniformType.FloatVec2, 'u_resolution', BW, BH);
        if (hasDelta) {
            this.uniforms.create(UniformMethod.Uniform1f, UniformType.Float, 'u_delta', timer.delta);
        }
        if (hasTime) {
            this.uniforms.create(UniformMethod.Uniform1f, UniformType.Float, 'u_time', timer.current);
        }
        if (hasDate) {
            const date = new Date();
            this.uniforms.create(UniformMethod.Uniform4f, UniformType.Float, 'u_date', date.getFullYear(), date.getMonth(), date.getDate(), date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds() + date.getMilliseconds() * 0.001);
        }
        if (hasMouse) {
            this.uniforms.create(UniformMethod.Uniform2f, UniformType.FloatVec2, 'u_mouse', 0, 0);
        }
        for (const key in this.buffers.values) {
            const buffer: IOBuffer = this.buffers.values[key];
            this.uniforms.create(UniformMethod.Uniform1i, UniformType.Sampler2D, buffer.key, buffer.input.index);
        }
        /*
        this.buffers.forEach((buffer: IOBuffer) => {
            this.uniforms.create(UniformMethod.Uniform1i, UniformType.Sampler2D, buffer.key, buffer.input.index);
        });
        */
        if (hasTextures) {
            this.textureList.forEach(x => {
                this.loadTexture(x.key, x.url);
            });
        }
        /*
        while (this.textureList.length > 0) {
            const x = this.textureList.shift();
            this.loadTexture(x.key, x.url);
        }
        */
    }

    parseTextures(fragmentString: string): boolean {
        const regexp = /uniform\s*sampler2D\s*([\w]*);(\s*\/\/\s*([\w|\:\/\/|\.|\-|\_]*)|\s*)/gm;
        let matches;
        while ((matches = regexp.exec(fragmentString)) !== null) {
            const key = matches[1];
            if (matches[3]) {
                const ext = matches[3].split('.').pop().toLowerCase();
                const url = matches[3];
                if (url && TextureExtensions.indexOf(ext) !== -1) {
                    this.textureList.push({ key, url });
                }
            } else if (!this.buffers.has(key)) {
                // create empty texture
                this.textureList.push({ key, url: null });
            }
        }
        if (this.canvas.hasAttribute('data-textures')) {
            const urls = this.canvas.getAttribute('data-textures').split(',');
            urls.forEach((url: string, i: number) => {
                const key = 'u_tex' + i;
                this.textureList.push({ key, url });
            });
        }
        return this.textureList.length > 0;
    }

    loadTexture(key: string, url: string): Promise<Texture> {
        if (this.valid) {
            return this.textures.createOrUpdate(this.gl, key, url, this.buffers.count).then(texture => {
                const index = texture.index;
                const uniform = this.uniforms.createTexture(key, index);
                uniform.texture = texture;
                const uniformResolution = this.uniforms.create(UniformMethod.Uniform2f, UniformType.FloatVec2, key + 'Resolution', texture.width, texture.height);
                // console.log('loadTexture', key, url, index, texture.width, texture.height);
                return texture;
            });
        } else {
            this.textureList.push({ key, url });
        }
    }

    updateUniforms(): void {
        const gl = this.gl;
        const BW = gl.drawingBufferWidth;
        const BH = gl.drawingBufferHeight;
        const timer = this.timer.next();
        this.uniforms.update(UniformMethod.Uniform2f, UniformType.FloatVec2, 'u_resolution', BW, BH);
        if (this.uniforms.has('u_delta')) {
            this.uniforms.update(UniformMethod.Uniform1f, UniformType.Float, 'u_delta', timer.delta);
        }
        if (this.uniforms.has('u_time')) {
            this.uniforms.update(UniformMethod.Uniform1f, UniformType.Float, 'u_time', timer.current);
        }
        if (this.uniforms.has('u_date')) {
            const date = new Date();
            this.uniforms.update(UniformMethod.Uniform4f, UniformType.Float, 'u_date', date.getFullYear(), date.getMonth(), date.getDate(), date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds() + date.getMilliseconds() * 0.001);
        }
        if (this.uniforms.has('u_mouse')) {
            const rect = this.rect;
            const mouse = this.mouse;
            if (mouse.x >= rect.left && mouse.x <= rect.right &&
                mouse.y >= rect.top && mouse.y <= rect.bottom) {
                const MX = (mouse.x - rect.left) * this.pixelRatio;
                const MY = (this.canvas.height - (mouse.y - rect.top) * this.pixelRatio);
                this.uniforms.update(UniformMethod.Uniform2f, UniformType.FloatVec2, 'u_mouse', MX, MY);
            }
        }
        for (const key in this.buffers.values) {
            const buffer: IOBuffer = this.buffers.values[key];
            this.uniforms.update(UniformMethod.Uniform1i, UniformType.Sampler2D, buffer.key, buffer.input.index);
        }
        /*
        this.buffers.forEach((buffer: IOBuffer) => {
            this.uniforms.update(UniformMethod.Uniform1i, UniformType.Sampler2D, buffer.key, buffer.input.index);
        });
        */
        for (const key in this.textures.values) {
            const texture: Texture = this.textures.values[key];
            texture.tryUpdate(gl);
            // console.log(texture.key, texture.index);
            this.uniforms.update(UniformMethod.Uniform1i, UniformType.Sampler2D, texture.key, texture.index);
        }
        /*
        this.textures.forEach((texture: Texture) => {
            texture.tryUpdate(gl);
            // console.log(texture.key, texture.index);
            this.uniforms.update(UniformMethod.Uniform1i, UniformType.Sampler2D, texture.key, texture.index);
        });
        */
    }

    render(): void {
        const gl = this.gl;
        const BW = gl.drawingBufferWidth;
        const BH = gl.drawingBufferHeight;
        this.updateUniforms();
        /*
        this.buffers.forEach((buffer: IOBuffer) => {
            this.uniforms.apply(gl, buffer.program);
            buffer.render(gl, BW, BH);
        });
        */
        for (const key in this.buffers.values) {
            const buffer: IOBuffer = this.buffers.values[key];
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
        this.trigger('render', {});
    }

}

(<any>window).GlslCanvas = GlslCanvas;

document.addEventListener("DOMContentLoaded", GlslCanvas.loadAll);