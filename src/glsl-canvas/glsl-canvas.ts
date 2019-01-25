// import '@babel/polyfill';
import 'promise-polyfill';
import Buffers, { IOBuffer } from './buffers';
import Common from './common';
import Context, { ContextDefaultFragment, ContextDefaultVertex, ContextVertexBuffers, IContextOptions } from './context';
import Subscriber from './subscriber';
import Textures, { Texture, TextureData, TextureExtensions, TextureOptions } from './textures';
import Uniforms, { IUniformOption, Uniform, UniformMethod, UniformType } from './uniforms';

export interface IPoint {
	x: number,
	y: number,
}

export class GlslCanvasOptions {
	onError?: Function;
}

export class GlslCanvasTimer {

	start: number;
	previous: number;
	delay: number = 0.0;
	current: number = 0.0;
	delta: number = 0.0;
	paused: boolean = false;

	constructor() {
		this.start = this.previous = this.now();
	}

	now() {
		return performance.now();
	}

	play() {
		if (this.previous) {
			const now = this.now();
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
		const now = this.now();
		this.delta = now - this.previous;
		this.current = now - this.start - this.delay;
		this.previous = now;
		return this;
	}

}

export default class GlslCanvas extends Subscriber {

	canvas: HTMLCanvasElement;
	gl: WebGLRenderingContext;
	program: WebGLProgram;
	timer: GlslCanvasTimer;
	vertexBuffers: ContextVertexBuffers;
	rect: ClientRect | DOMRect;
	mouse: IPoint = { x: 0, y: 0 };
	uniforms: Uniforms = new Uniforms();
	buffers: Buffers = new Buffers();
	textures: Textures = new Textures();
	textureList: any[] = [];

	vertexString: string;
	fragmentString: string;
	width: number;
	height: number;
	devicePixelRatio: number;

	valid: boolean = false;
	animated: boolean = false;
	dirty: boolean = true;
	visible: boolean = false;

	loop: Function;
	private removeListeners_: Function = () => { };

	constructor(
		canvas: HTMLCanvasElement,
		contextOptions: IContextOptions = {
			// alpha: true,
			// antialias: true,
			// premultipliedAlpha: true
		},
		options: GlslCanvasOptions = {}
	) {
		super();
		if (!canvas) {
			return;
		}
		this.canvas = canvas;
		this.width = 0; // canvas.clientWidth;
		this.height = 0; // canvas.clientHeight;
		this.rect = canvas.getBoundingClientRect();
		this.vertexString = contextOptions.vertexString || ContextDefaultVertex;
		this.fragmentString = contextOptions.fragmentString || ContextDefaultFragment;
		const gl = Context.tryGetContext(canvas, contextOptions, options.onError);
		if (!gl) {
			return;
		}
		this.gl = gl;
		this.devicePixelRatio = window.devicePixelRatio || 1;
		canvas.style.backgroundColor = contextOptions.backgroundColor || 'rgba(0,0,0,0)';
		this.getShaders_().then(
			(success) => {
				this.load();
				if (!this.program) {
					return;
				}
				this.addListeners_();
				this.loop();
			},
			(error) => {
				console.log('GlslCanvas.getShaders_.error', error);
			});
		GlslCanvas.items.push(this);
	}

	static items: GlslCanvas[] = [];

	static version(): string {
		return '0.2.0';
	}

	static of(canvas: HTMLCanvasElement): GlslCanvas {
		return GlslCanvas.items.find(x => x.canvas === canvas) || new GlslCanvas(canvas);
	}

	static loadAll(): GlslCanvas[] {
		const canvases: HTMLCanvasElement[] = <HTMLCanvasElement[]>[].slice.call(document.getElementsByClassName('glsl-canvas')).filter((x: HTMLElement) => x instanceof HTMLCanvasElement);
		return canvases.map(x => GlslCanvas.of(x));
	}

	private getShaders_(): Promise<string[]> {
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
					return Common.fetch(url)
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

	private addListeners_(): void {
        /*
        const resize = (e: Event) => {
            this.rect = this.canvas.getBoundingClientRect();
            this.trigger('resize', e);
        };
        */

		const scroll = (e: Event) => {
			this.rect = this.canvas.getBoundingClientRect();
		};

		const click = (e: MouseEvent) => {
			this.toggle();
			this.trigger('click', e);
		};

		const move = (mx: number, my: number) => {
			const rect = this.rect, gap = 20;
			const x = Math.max(-gap, Math.min(rect.width + gap, (mx - rect.left) * this.devicePixelRatio));
			const y = Math.max(-gap, Math.min(rect.height + gap, (this.canvas.height - (my - rect.top) * this.devicePixelRatio)));
			if (x !== this.mouse.x ||
				y !== this.mouse.y) {
				this.mouse.x = x;
				this.mouse.y = y;
				this.trigger('move', this.mouse);
			}
		};

		const mousemove = (e: MouseEvent) => {
			move(e.clientX || e.pageX, e.clientY || e.pageY);
		};

		const mouseover = (e: MouseEvent) => {
			this.play();
			this.trigger('over', e);
		};

		const mouseout = (e: MouseEvent) => {
			this.pause();
			this.trigger('out', e);
		};

		const touchmove = (e: TouchEvent) => {
			const touch = [].slice.call(e.touches).reduce((p: IPoint, touch: Touch) => {
				p = p || { x: 0, y: 0 };
				p.x += touch.clientX;
				p.y += touch.clientY;
				return p;
			}, null);
			if (touch) {
				move(touch.x / e.touches.length, touch.y / e.touches.length);
			}
		};

		const touchend = (e: TouchEvent) => {
			this.pause();
			this.trigger('out', e);
			document.removeEventListener('touchend', touchend);
		};

		const touchstart = (e: TouchEvent) => {
			this.play();
			this.trigger('over', e);
			document.addEventListener('touchend', touchend);
			document.removeEventListener('mousemove', mousemove);
			if (this.canvas.hasAttribute('controls')) {
				this.canvas.removeEventListener('mouseover', mouseover);
				this.canvas.removeEventListener('mouseout', mouseout);
			}
		};

		const loop: FrameRequestCallback = (time: number) => {
			this.checkRender();
			window.requestAnimationFrame(loop);
		};

		this.loop = loop;

		// window.addEventListener('resize', resize);
		window.addEventListener('scroll', scroll);
		document.addEventListener('mousemove', mousemove, false);
		document.addEventListener('touchmove', touchmove);
		if (this.canvas.hasAttribute('controls')) {
			this.canvas.addEventListener('click', click);
			this.canvas.addEventListener('mouseover', mouseover);
			this.canvas.addEventListener('mouseout', mouseout);
			this.canvas.addEventListener('touchstart', touchstart);
			if (!this.canvas.hasAttribute('data-autoplay')) {
				this.pause();
			}
		}

		this.removeListeners_ = () => {
			// window.removeEventListener('resize', resize);
			window.removeEventListener('scroll', scroll);
			document.removeEventListener('mousemove', mousemove);
			document.removeEventListener('touchmove', touchmove);
			if (this.canvas.hasAttribute('controls')) {
				this.canvas.removeEventListener('click', click);
				this.canvas.removeEventListener('mouseover', mouseover);
				this.canvas.removeEventListener('mouseout', mouseout);
				this.canvas.removeEventListener('touchstart', touchstart);
			}
		}
	}

	private setUniform_(
		key: string,
		values: any[],
		options: TextureOptions = {},
		type: UniformType = null
	): void {
		const uniform: Uniform | Uniform[] = Uniforms.parseUniform(key, values, type);
		if (Array.isArray(uniform)) {
			if (Uniforms.isArrayOfSampler2D(uniform)) {
				uniform.forEach((x) => this.loadTexture(x.key, x.values[0], options));
			} else {
				uniform.forEach((x) => this.uniforms.set(x.key, x.values[0]));
			}
		} else if (uniform) {
			switch (uniform.type) {
				case UniformType.Sampler2D:
					this.loadTexture(key, values[0], options);
					break;
				default:
					this.uniforms.set(key, uniform);
			}
		}
	}

	private parseTextures_(fragmentString: string): boolean {
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
				const key = 'u_texture' + i;
				this.textureList.push({ key, url });
			});
		}
		return this.textureList.length > 0;
	}

	private createUniforms_(): void {
		const gl = this.gl;
		const fragmentString = this.fragmentString;
		const BW = gl.drawingBufferWidth;
		const BH = gl.drawingBufferHeight;
		const timer = this.timer = new GlslCanvasTimer();
		const hasDelta = (fragmentString.match(/u_delta/g) || []).length > 1;
		const hasTime = (fragmentString.match(/u_time/g) || []).length > 1;
		const hasDate = (fragmentString.match(/u_date/g) || []).length > 1;
		const hasMouse = (fragmentString.match(/u_mouse/g) || []).length > 1;
		const hasTextures = this.parseTextures_(fragmentString);
		this.animated = hasTime || hasDate || hasMouse;
		if (this.animated) {
			this.canvas.classList.add('animated');
		} else {
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
			const buffer: IOBuffer = this.buffers.values[key];
			this.uniforms.create(UniformMethod.Uniform1i, UniformType.Sampler2D, buffer.key, [buffer.input.index]);
		}
		if (hasTextures) {
			this.textureList.filter(x => x.url).forEach(x => {
				this.setTexture(x.key, x.url, x.options);
			});
			this.textureList = [];
		}
	}

	private updateUniforms_(): void {
		const gl = this.gl;
		const BW = gl.drawingBufferWidth;
		const BH = gl.drawingBufferHeight;
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
			const buffer: IOBuffer = this.buffers.values[key];
			this.uniforms.update(UniformMethod.Uniform1i, UniformType.Sampler2D, buffer.key, [buffer.input.index]);
		}
		for (const key in this.textures.values) {
			const texture: Texture = this.textures.values[key];
			texture.tryUpdate(gl);
			this.uniforms.update(UniformMethod.Uniform1i, UniformType.Sampler2D, texture.key, [texture.index]);
		}
	}

	private isVisible_(): boolean {
		const rect = this.rect;
		return (rect.top + rect.height) > 0 && rect.top < (window.innerHeight || document.documentElement.clientHeight);
	}

	private isAnimated_(): boolean {
		return (this.animated || this.textures.animated) && !this.timer.paused;
	}

	private isDirty_(): boolean {
		return this.dirty || this.uniforms.dirty || this.textures.dirty;
	}

	// check size change at start of requestFrame
	private sizeDidChanged_(): boolean {
		const gl = this.gl;
		const W = Math.ceil(this.canvas.clientWidth),
			H = Math.ceil(this.canvas.clientHeight);
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
				const buffer: IOBuffer = this.buffers.values[key];
				buffer.resize(gl, BW, BH);
			}
			this.rect = this.canvas.getBoundingClientRect();
			this.trigger('resize');
			// gl.useProgram(this.program);
			return true;
		} else {
			return false;
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
		let vertexShader, fragmentShader;
		try {
			vertexShader = Context.createShader(gl, this.vertexString, gl.VERTEX_SHADER);
			fragmentShader = Context.createShader(gl, this.fragmentString, gl.FRAGMENT_SHADER);
			// If Fragment shader fails load a empty one to sign the error
			if (!fragmentShader) {
				fragmentShader = Context.createShader(gl, ContextDefaultFragment, gl.FRAGMENT_SHADER);
				this.valid = false;
			} else {
				this.valid = true;
			}
		} catch (e) {
			this.trigger('error', e);
			return;
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
			this.createUniforms_();
		}
		// Trigger event
		this.trigger('load', this);
	}

	test(
		fragmentString?: string,
		vertexString?: string
	): Promise<any> {
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
				} else {
					window.requestAnimationFrame(waitForTest);
				}
			}
			waitForTest();
		});
	}

	destroy(): void {
		this.removeListeners_();
		this.animated = false;
		this.valid = false;
		const gl = this.gl;
		gl.useProgram(null);
		gl.deleteProgram(this.program);
		for (const key in this.buffers.values) {
			const buffer: IOBuffer = this.buffers.values[key];
			buffer.destroy(gl);
		}
		for (const key in this.textures.values) {
			const texture: Texture = this.textures.values[key];
			texture.destroy(gl);
		}
		this.buffers = null;
		this.textures = null;
		this.uniforms = null;
		this.program = null;
		this.gl = null;
		GlslCanvas.items.splice(GlslCanvas.items.indexOf(this), 1);
	}

	loadTexture(
		key: string,
		urlElementOrData: string | HTMLCanvasElement | HTMLImageElement | HTMLVideoElement | Element | TextureData,
		options: TextureOptions = {}
	) {
		if (this.valid) {
			// console.log(key, urlElementOrData);
			this.textures.createOrUpdate(this.gl, key, urlElementOrData, this.buffers.count, options).then(
				texture => {
					const index = texture.index;
					const uniform = this.uniforms.createTexture(key, index);
					uniform.texture = texture;
					const keyResolution = key.indexOf('[') !== -1 ? key.replace('[', 'Resolution[') : key + 'Resolution';
					const uniformResolution = this.uniforms.create(UniformMethod.Uniform2f, UniformType.Float, keyResolution, [texture.width, texture.height]);
					// console.log('loadTexture', key, url, index, texture.width, texture.height);
					return texture;
				},
				error => {
					console.log('GlslCanvas.loadTexture.error', error, key, urlElementOrData);
				});
		} else {
			this.textureList.push({ key, url: urlElementOrData, options });
		}
	}

	setTexture(
		key: string,
		urlElementOrData: string | HTMLCanvasElement | HTMLImageElement | HTMLVideoElement | Element | TextureData,
		options: TextureOptions = {}
	): void {
		return this.setUniform_(key, [urlElementOrData], options);
	}

	setUniform(key: string, ...values: any[]): void {
		return this.setUniform_(key, values);
	}

	setUniformOfInt(key: string, values: any[]): void {
		return this.setUniform_(key, values, null, UniformType.Int);
	}

	setUniforms(values: IUniformOption): void {
		for (const key in values) {
			this.setUniform(key, values[key]);
		}
	}

	pause(): void {
		if (this.valid) {
			this.timer.pause();
			this.canvas.classList.add('paused');
			this.trigger('pause');
		}
	}

	play(): void {
		if (this.valid) {
			this.timer.play();
			this.canvas.classList.remove('paused');
			this.trigger('play');
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

	checkRender(): void {
		if (this.isVisible_() && (this.sizeDidChanged_() || this.isAnimated_() || this.isDirty_())) {
			this.render();
			this.canvas.classList.add('playing');
		} else {
			this.canvas.classList.remove('playing');
		}
	}

	render(): void {
		const gl = this.gl;
		const BW = gl.drawingBufferWidth;
		const BH = gl.drawingBufferHeight;
		this.updateUniforms_();
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
		this.trigger('render', this);
	}

}

declare global {
	interface Window { GlslCanvas: any; }
}

window.GlslCanvas = window.GlslCanvas || GlslCanvas;
// (<any>(window)).GlslCanvas = GlslCanvas;

if (document) {
	document.addEventListener("DOMContentLoaded", () => {
		GlslCanvas.loadAll();
	});
}
