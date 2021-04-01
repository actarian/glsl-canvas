// import 'promise-polyfill';
import Common from '../core/common';
import IterableStringMap from '../core/iterable';
import Subscriber from '../core/subscriber';
import Logger from '../logger/logger';

export const TextureImageExtensions = ['jpg', 'jpeg', 'png'];
export const TextureVideoExtensions = ['ogv', 'webm', 'mp4'];
export const TextureExtensions = TextureImageExtensions.concat(TextureVideoExtensions);

export enum TextureSourceType {
	Data = 0,
	Element = 1,
	Url = 2,
}

export enum TextureFilteringType {
	MipMap = 'mipmap',
	Linear = 'linear',
	Nearest = 'nearest',
}

export interface ITextureData {
	data: Uint8Array;
	width: number;
	height: number;
}

export interface ITextureOptions {
	url?: string;
	element?: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement | HTMLElement | Element;
	data?: Uint8Array;
	width?: number;
	height?: number;
	filtering?: TextureFilteringType;
	repeat?: boolean;
	UNPACK_FLIP_Y_WEBGL?: boolean;
	UNPACK_PREMULTIPLY_ALPHA_WEBGL?: number;
	TEXTURE_WRAP_S?: number; // gl.REPEAT | gl.CLAMP_TO_EDGE | gl.MIRRORED_REPEAT;
	TEXTURE_WRAP_T?: number; // gl.REPEAT | gl.CLAMP_TO_EDGE | gl.MIRRORED_REPEAT;
}

export interface ITextureInput {
	key: string;
	url: string | HTMLCanvasElement | HTMLImageElement | HTMLVideoElement | Element | ITextureData;
	options?: ITextureOptions;
}

export function isTextureData(object: any): object is ITextureData {
	return 'data' in object && 'width' in object && 'height' in object;
}

// GL texture wrapper object for keeping track of a global set of textures, keyed by a unique user-defined name
export class Texture extends Subscriber {

	key: string;
	index: number;
	options: ITextureOptions;
	workpath: string;
	width: number;
	height: number;

	texture: WebGLTexture;
	source: string | HTMLCanvasElement | HTMLImageElement | HTMLVideoElement | Element | Uint8Array;
	sourceType: TextureSourceType;
	filtering: TextureFilteringType;
	url: string;
	valid: boolean = false;
	dirty: boolean = false;
	animated: boolean = false;
	powerOf2: boolean = false;

	constructor(
		gl: WebGLRenderingContext | WebGL2RenderingContext,
		key: string,
		index: number,
		options: ITextureOptions = { filtering: TextureFilteringType.Linear },
		workpath?: string,
	) {
		super();
		this.key = key;
		this.index = index;
		this.options = options;
		this.workpath = workpath;
		this.create(gl);
	}

	static isPowerOf2(value: number): boolean {
		return (value & (value - 1)) === 0;
	}

	static isSafari(): boolean {
		return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
	}

	static isTextureUrl(text: string): boolean {
		return text && (/\.(jpg|jpeg|png|ogv|webm|mp4)$/i).test(text.split('?')[0]);
	}

	static isTexture(
		urlElementOrData: string | HTMLCanvasElement | HTMLImageElement | HTMLVideoElement | Element | ITextureData,
	): boolean {
		const options = Texture.getTextureOptions(urlElementOrData);
		return options !== undefined;
	}

	static getMaxTextureSize(gl: WebGLRenderingContext | WebGL2RenderingContext): number {
		return gl.getParameter(gl.MAX_TEXTURE_SIZE);
	};

	static getTextureOptions(
		urlElementOrData: string | HTMLCanvasElement | HTMLImageElement | HTMLVideoElement | Element | ITextureData,
		options: ITextureOptions = {}
	): ITextureOptions {
		if (typeof urlElementOrData === 'string' && urlElementOrData !== '') {
			if (Texture.isTextureUrl(urlElementOrData)) {
				options.url = urlElementOrData;
				if (urlElementOrData.indexOf('?') !== -1) {
					options = urlElementOrData.split('?')[1].split('&').reduce(function (prev: ITextureOptions, curr) {
						const params = curr.split('=');
						const key = decodeURIComponent(params[0]);
						const value = decodeURIComponent(params[1]);
						switch (key) {
							case 'filtering':
								prev[key] = value as TextureFilteringType;
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
		} else if (isTextureData(urlElementOrData)) {
			options.data = urlElementOrData.data;
			options.width = urlElementOrData.width;
			options.height = urlElementOrData.height;
			return options;
		} else {
			return null;
		}
	}

	create(
		gl: WebGLRenderingContext | WebGL2RenderingContext
	): void {
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
	}

	load(
		gl: WebGLRenderingContext | WebGL2RenderingContext,
		options: ITextureOptions = {}
	): Promise<Texture> {
		this.options = options;
		if (typeof options.url === 'string') {
			if (this.url === undefined || options.url !== this.url) {
				return this.setUrl(gl, options.url, options);
			} else {
				return Promise.resolve(this);
			}
		} else if (options.element) {
			return this.setElement(gl, options.element, options);
		} else if (options.data && options.width && options.height) {
			return this.setData(gl, options.width, options.height, options.data, options);
		} else {
			return Promise.reject(this);
		}
	}

	setUrl(
		gl: WebGLRenderingContext | WebGL2RenderingContext,
		url: string,
		options: ITextureOptions = {}
	): Promise<Texture> {
		if (!this.valid) {
			return Promise.reject(this);
		}
		this.url = url; // save URL reference (will be overwritten when element is loaded below)
		this.source = url;
		this.sourceType = TextureSourceType.Url;
		this.options = Object.assign(this.options, options);
		const ext = url.split('?')[0].split('.').pop().toLowerCase();
		const isVideo = TextureVideoExtensions.indexOf(ext) !== -1;
		const src = Common.getResource(url, this.workpath);
		let element: HTMLVideoElement | HTMLImageElement;
		let promise: Promise<Texture>;
		if (isVideo) {
			Logger.log('GlslCanvas.setUrl video', src);
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
			element.addEventListener('canplay', () => {
				(element as HTMLVideoElement).play();
			});
		} else {
			Logger.log('GlslCanvas.setUrl image', src);
			element = document.createElement('img'); // new HTMLImageElement();
			promise = this.setElement(gl, element, options);
			if (!(Texture.isSafari() && url.slice(0, 5) === 'data:')) {
				element.crossOrigin = 'anonymous';
			}
			element.src = src;
		}
		return promise;
	}

	setElement(
		gl: WebGLRenderingContext | WebGL2RenderingContext,
		element: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement | HTMLElement | Element,
		options: ITextureOptions = {}
	): Promise<Texture> {
		options = this.options = Object.assign(this.options, options);
		return new Promise((resolve, reject) => {
			const originalElement = element;
			// a string element is interpeted as a CSS selector
			if (typeof element === 'string') {
				element = document.querySelector(element);
			}
			if (element instanceof HTMLCanvasElement ||
				element instanceof HTMLImageElement ||
				element instanceof HTMLVideoElement) {
				this.source = element;
				this.sourceType = TextureSourceType.Element;
				if (element instanceof HTMLVideoElement) {
					const video = element as HTMLVideoElement;
					video.addEventListener('loadeddata', (event) => {
						this.update(gl, options);
						this.setFiltering(gl, options);
						resolve(this);
					});
					video.addEventListener('error', (error) => {
						reject(error);
					});
					video.load();
				} else if (element instanceof HTMLImageElement) {
					element.addEventListener('load', () => {
						this.update(gl, options);
						this.setFiltering(gl, options);
						resolve(this);
					});
					element.addEventListener('error', (error) => {
						reject(error);
					});
				} else {
					this.update(gl, options);
					this.setFiltering(gl, options);
					resolve(this);
				}
			} else {
				let message = `the 'element' parameter (\`element: ${JSON.stringify(originalElement)}\`) must be a CSS selector string, or a <canvas>, <image> or <video> object`;
				Logger.log(`Texture '${this.key}': ${message}`, options);
				reject(message);
			}
		});
	}

	setData(
		gl: WebGLRenderingContext | WebGL2RenderingContext,
		width: number,
		height: number,
		data: Uint8Array,
		options: ITextureOptions = {}
	): Promise<Texture> {
		this.width = width;
		this.height = height;
		this.options = Object.assign(this.options, options);
		this.source = data;
		this.sourceType = TextureSourceType.Data;
		this.update(gl, options);
		this.setFiltering(gl, options);
		return Promise.resolve(this);
	}

	// Uploads current image or buffer to the GPU (can be used to update animated textures on the fly)
	update(
		gl: WebGLRenderingContext | WebGL2RenderingContext,
		options: ITextureOptions
	): void {
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
			} else if (this.source instanceof HTMLVideoElement && this.source.videoWidth && this.source.videoHeight) {
				this.width = this.source.videoWidth;
				this.height = this.source.videoHeight;
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.source);
			} else if (this.source instanceof HTMLCanvasElement) {
				this.width = this.source.width;
				this.height = this.source.height;
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.source);
			}
		} else if (this.sourceType === TextureSourceType.Data) {
			const imageBuffer: ArrayBufferView = this.source as ArrayBufferView;
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, imageBuffer);
		}
		this.trigger('loaded', this);
	}

	tryUpdate(gl: WebGLRenderingContext | WebGL2RenderingContext): boolean {
		let dirty = false;
		if (this.animated) {
			dirty = true;
			this.update(gl, this.options);
		}
		return dirty;
	}

	destroy(gl: WebGLRenderingContext | WebGL2RenderingContext): void {
		if (!this.valid) {
			return;
		}
		gl.deleteTexture(this.texture);
		this.texture = null;
		delete this.source;
		this.source = null;
		this.valid = false;
	}

	setFiltering(
		gl: WebGLRenderingContext | WebGL2RenderingContext,
		options: ITextureOptions
	): void {
		if (!this.valid) {
			return;
		}
		const powerOf2 = Texture.isPowerOf2(this.width) && Texture.isPowerOf2(this.height);
		let filtering = options.filtering || TextureFilteringType.MipMap;
		let wrapS = options.TEXTURE_WRAP_S || (options.repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE);
		let wrapT = options.TEXTURE_WRAP_T || (options.repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE);
		if (!powerOf2) {
			filtering = filtering === TextureFilteringType.MipMap ? TextureFilteringType.Linear : filtering;
			wrapS = wrapT = gl.CLAMP_TO_EDGE;
			if (options.repeat || options.TEXTURE_WRAP_S || options.TEXTURE_WRAP_T) {
				Logger.warn(`GlslCanvas: cannot repeat texture ${options.url} cause is not power of 2.`);
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
		} else if (this.filtering === TextureFilteringType.Nearest) {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		} else if (this.filtering === TextureFilteringType.Linear) {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		}
	}
}

export default class Textures extends IterableStringMap<Texture> {

	count: number = 0;
	dirty: boolean = false;
	animated: boolean = false;

	clean() {
		Object.keys(this.values).forEach((key) => {
			this.values[key].dirty = false;
		});
		this.dirty = false;
	}

	createOrUpdate(
		gl: WebGLRenderingContext | WebGL2RenderingContext,
		key: string,
		urlElementOrData: string | HTMLCanvasElement | HTMLImageElement | HTMLVideoElement | Element | ITextureData,
		index: number = 0,
		options: ITextureOptions = {},
		workpath: string,
	): Promise<Texture> {
		let texture;
		const textureOptions = Texture.getTextureOptions(urlElementOrData, options);
		texture = this.get(key);
		if (!texture) {
			texture = new Texture(gl, key, index + this.count, textureOptions, workpath);
			this.count++;
			this.set(key, texture);
		}
		if (textureOptions !== undefined) {
			return texture.load(gl, textureOptions).then(
				(texture) => {
					if (texture.source instanceof HTMLVideoElement) {
						const video = texture.source as HTMLVideoElement;
						// Logger.log('video', video);
						video.addEventListener('play', () => {
							// Logger.log('play', texture.key);
							texture.animated = true;
							this.animated = true;
						});
						video.addEventListener('pause', () => {
							// Logger.log('pause', texture.key);
							texture.animated = false;
							this.animated = this.reduce((flag: boolean, texture: Texture) => {
								return flag || texture.animated;
							}, false);
						});
						video.addEventListener('seeked', () => {
							// Logger.log('seeked');
							texture.update(gl, texture.options);
							this.dirty = true;
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
				}
			);
		} else {
			return Promise.resolve(texture);
		}
	}
}
