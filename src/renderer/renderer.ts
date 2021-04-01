import { mat4 } from 'gl-matrix';
import Buffers, { IOBuffer } from '../buffers/buffers';
import OrbitCamera from '../camera/orbit-camera';
import CanvasTimer from '../canvas/canvas-timer';
import { ContextMode, ContextVertexBuffers } from '../context/context';
import Common from '../core/common';
import Subscriber from '../core/subscriber';
import BoxGeometry from '../geometry/box-geometry';
import FlatGeometry from '../geometry/flat-geometry';
import Geometry from '../geometry/geometry';
import SphereGeometry from '../geometry/sphere-geometry';
import TorusGeometry from '../geometry/torus-geometry';
import ObjLoader from '../loaders/obj-loader';
import Logger from '../logger/logger';
import Vector2 from '../math/vector2';
import Textures, { ITextureInput } from '../textures/textures';
import Uniforms, { UniformMethod, UniformType } from '../uniforms/uniforms';

export default class Renderer extends Subscriber {

	gl: WebGLRenderingContext | WebGL2RenderingContext;
	program: WebGLProgram;
	timer: CanvasTimer;
	uniforms: Uniforms = new Uniforms();
	buffers: Buffers = new Buffers();
	textures: Textures = new Textures();
	textureList: ITextureInput[] = [];

	W: number = 0;
	H: number = 0;
	mouse: Vector2 = new Vector2();
	radians: number = 0;
	dirty: boolean = true;
	animated: boolean = false;
	drawFunc_: (deltaTime: number) => void;

	vertexString: string;
	fragmentString: string;

	camera: OrbitCamera = new OrbitCamera();
	geometry: Geometry;

	vertexBuffers: ContextVertexBuffers;

	projectionMatrix: mat4;
	modelViewMatrix: mat4;
	normalMatrix: mat4;

	mode: ContextMode;
	mesh: string;
	defaultMesh: string;
	doubleSided: boolean;
	cache: { [key: string]: Geometry } = {};
	workpath: string;

	constructor() {
		super();
		this.drawFunc_ = this.drawArrays_;
	}

	protected render(): void {
		const gl = this.gl;
		if (!gl) {
			return;
		}
		const BW = gl.drawingBufferWidth;
		const BH = gl.drawingBufferHeight;
		this.update_();
		gl.viewport(0, 0, BW, BH);
		const uniforms = this.uniforms;
		Object.keys(this.buffers.values).forEach((key) => {
			const buffer: IOBuffer = this.buffers.values[key];
			buffer.geometry.attachAttributes_(gl, buffer.program);
			// uniforms.get('u_resolution').values = [1024, 1024];
			uniforms.apply(gl, buffer.program);
			/*
			// console.log('uniforms');
			Object.keys(uniforms.values).forEach((key) => {
				if (key.indexOf('u_buff') === 0) {
					// console.log(key);
				}
			});
			*/
			buffer.render(gl, BW, BH);
		});
		// uniforms.get('u_resolution').values = [BW, BH];
		this.geometry.attachAttributes_(gl, this.program);
		uniforms.apply(gl, this.program);
		// gl.viewport(0, 0, BW, BH);
		this.drawFunc_(this.timer.delta);
		uniforms.clean();
		this.textures.clean();
		this.dirty = false;
		this.trigger('render', this);
	}

	protected drawArrays_(deltaTime: number) {
		const gl = this.gl;
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		// Clear
		gl.viewport(0, 0, this.W, this.H);
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clearDepth(1.0);
		// Clear the canvas before we start drawing on it.
		// gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL);
		gl.enable(gl.CULL_FACE);
		if (this.doubleSided && this.mode !== ContextMode.Flat) {
			// back
			// gl.frontFace(gl.CW);
			gl.cullFace(gl.FRONT);
			gl.drawArrays(gl.TRIANGLES, 0, this.geometry.size);
			// front
			gl.enable(gl.BLEND);
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		}
		// gl.frontFace(gl.CCW);
		gl.cullFace(gl.BACK);
		gl.drawArrays(gl.TRIANGLES, 0, this.geometry.size);
		// gl.drawElements(gl.TRIANGLES, this.geometry.size, gl.UNSIGNED_SHORT, 0);
	}

	protected create_(): void {
		this.createGeometry_();
		this.createUniforms_();
	}

	protected createGeometry_() {
		// console.log('Geometry', Geometry);
		// console.log('FlatGeometry', FlatGeometry);
		// console.log('BoxGeometry', BoxGeometry);
		this.parseGeometry_();
		this.setMode(this.mode);
	}

	protected parseGeometry_() {
		const regexp = /^attribute\s+vec4\s+a_position\s*;\s*\/\/\s*([\w|\:\/\/|\.|\-|\_|\?|\&|\=]+)/gm;
		const match = regexp.exec(this.vertexString);
		if (match && match.length > 1) {
			this.mesh = match[1];
		} else {
			this.mesh = this.defaultMesh;
		}
	}

	protected createUniforms_(): void {
		const gl = this.gl;
		const fragmentString = this.fragmentString;
		const BW = gl.drawingBufferWidth;
		const BH = gl.drawingBufferHeight;
		const timer = this.timer = new CanvasTimer();
		const hasDelta = (fragmentString.match(/u_delta/g) || []).length > 1;
		const hasTime = (fragmentString.match(/u_time/g) || []).length > 1;
		const hasDate = (fragmentString.match(/u_date/g) || []).length > 1;
		const hasMouse = (fragmentString.match(/u_mouse/g) || []).length > 1;
		const hasCamera = (fragmentString.match(/u_camera/g) || []).length > 1;
		// this.animated = hasTime || hasDate || hasMouse;
		this.animated = true; // !!!
		const uniforms = this.uniforms;
		uniforms.create(UniformMethod.Uniform2f, UniformType.Float, 'u_resolution', [BW, BH]);
		if (hasDelta) {
			uniforms.create(UniformMethod.Uniform1f, UniformType.Float, 'u_delta', [timer.delta / 1000.0]);
			this.updateUniformDelta_ = this.updateUniformDelta__;
		} else {
			this.updateUniformDelta_ = this.updateUniformNoop_;
		}
		if (hasTime) {
			uniforms.create(UniformMethod.Uniform1f, UniformType.Float, 'u_time', [timer.current / 1000.0]);
			this.updateUniformTime_ = this.updateUniformTime__;
		} else {
			this.updateUniformTime_ = this.updateUniformNoop_;
		}
		if (hasDate) {
			const date = new Date();
			uniforms.create(UniformMethod.Uniform4f, UniformType.Float, 'u_date', [date.getFullYear(), date.getMonth(), date.getDate(), date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds() + date.getMilliseconds() * 0.001]);
			this.updateUniformDate_ = this.updateUniformDate__;
		} else {
			this.updateUniformDate_ = this.updateUniformNoop_;
		}
		if (hasMouse) {
			uniforms.create(UniformMethod.Uniform2f, UniformType.Float, 'u_mouse', [0, 0]);
			this.updateUniformMouse_ = this.updateUniformMouse__;
		} else {
			this.updateUniformMouse_ = this.updateUniformNoop_;
		}
		if (hasCamera) {
			uniforms.create(UniformMethod.Uniform3f, UniformType.Float, 'u_camera', [0, 0, 0]);
			this.updateUniformCamera_ = this.updateUniformCamera__;
		} else {
			this.updateUniformCamera_ = this.updateUniformNoop_;
		}
		// if (this.mode !== ContextMode.Flat) {
		this.projectionMatrix = mat4.create();
		uniforms.create(UniformMethod.UniformMatrix4fv, UniformType.Float, 'u_projectionMatrix', this.projectionMatrix as number[]);
		this.modelViewMatrix = mat4.create();
		uniforms.create(UniformMethod.UniformMatrix4fv, UniformType.Float, 'u_modelViewMatrix', this.modelViewMatrix as number[]);
		this.normalMatrix = mat4.create();
		uniforms.create(UniformMethod.UniformMatrix4fv, UniformType.Float, 'u_normalMatrix', this.normalMatrix as number[]);
		// }
	}

	protected update_(): void {
		const gl = this.gl;
		const BW = gl.drawingBufferWidth;
		const BH = gl.drawingBufferHeight;
		if (!this.timer) {
			return;
		}
		const timer = this.timer.next();
		const uniforms = this.uniforms;
		uniforms.update(UniformMethod.Uniform2f, UniformType.Float, 'u_resolution', [BW, BH]);
		this.updateUniformDelta_(timer);
		this.updateUniformTime_(timer);
		this.updateUniformDate_();
		this.updateUniformMouse_();
		this.updateUniformCamera_();
		this.updateUniformMesh_();
	}

	updateUniformNoop_(): void {};
	updateUniformDelta_: (timer:CanvasTimer) => void;
	updateUniformTime_: (timer:CanvasTimer) => void;
	updateUniformDate_: () => void;
	updateUniformMouse_: () => void;
	updateUniformCamera_: () => void;
	updateUniformMesh_: () => void;

	protected updateUniformDelta__(timer:CanvasTimer):void {
		const uniforms = this.uniforms;
		uniforms.update(UniformMethod.Uniform1f, UniformType.Float, 'u_delta', [timer.delta / 1000.0]);
	};
	protected updateUniformTime__(timer:CanvasTimer):void {
		const uniforms = this.uniforms;
		uniforms.update(UniformMethod.Uniform1f, UniformType.Float, 'u_time', [timer.current / 1000.0]);
	};
	protected updateUniformDate__():void {
		const uniforms = this.uniforms;
		const date = new Date();
		uniforms.update(UniformMethod.Uniform4f, UniformType.Float, 'u_date', [date.getFullYear(), date.getMonth(), date.getDate(), date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds() + date.getMilliseconds() * 0.001]);
	};
	protected updateUniformMouse__():void {
		const uniforms = this.uniforms;
		const mouse = this.mouse;
		uniforms.update(UniformMethod.Uniform2f, UniformType.Float, 'u_mouse', [mouse.x, mouse.y]);
		/*
		const rect = this.rect;
		if (mouse.x >= rect.left && mouse.x <= rect.right &&
			mouse.y >= rect.top && mouse.y <= rect.bottom) {
			const MX = (mouse.x - rect.left) * this.devicePixelRatio;
			const MY = (this.canvas.height - (mouse.y - rect.top) * this.devicePixelRatio);
			uniforms.update(UniformMethod.Uniform2f, UniformType.Float, 'u_mouse', [MX, MY]);
		}
		*/
	};
	protected updateUniformCamera__():void {
		const uniforms = this.uniforms;
		const array = OrbitCamera.toFloat32Array(this.camera);
		uniforms.update(UniformMethod.Uniform3f, UniformType.Float, 'u_camera', array as number[]);
	};
	protected updateUniformMesh__():void {
		const uniforms = this.uniforms;
		uniforms.update(UniformMethod.UniformMatrix4fv, UniformType.Float, 'u_projectionMatrix', this.updateProjectionMatrix_() as number[]);
		uniforms.update(UniformMethod.UniformMatrix4fv, UniformType.Float, 'u_modelViewMatrix', this.updateModelViewMatrix_(this.timer.delta) as number[]);
		uniforms.update(UniformMethod.UniformMatrix4fv, UniformType.Float, 'u_normalMatrix', this.updateNormalMatrix_(this.modelViewMatrix) as number[]);
	};
	protected updateUniformFlat__():void {
		const uniforms = this.uniforms;
		uniforms.update(UniformMethod.UniformMatrix4fv, UniformType.Float, 'u_projectionMatrix', mat4.create() as number[]);
		uniforms.update(UniformMethod.UniformMatrix4fv, UniformType.Float, 'u_modelViewMatrix', mat4.create() as number[]);
		uniforms.update(UniformMethod.UniformMatrix4fv, UniformType.Float, 'u_normalMatrix', mat4.create() as number[]);
	}

	protected updateProjectionMatrix_(): mat4 {
		const gl = this.gl;
		const fieldOfView = 45 * Math.PI / 180;
		const aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
		const zNear = 0.1;
		const zFar = 100.0;
		mat4.perspective(this.projectionMatrix, fieldOfView, aspect, zNear, zFar);
		return this.projectionMatrix;
	}

	protected updateModelViewMatrix_(deltaTime: number): mat4 {
		const camera = this.camera;
		let modelViewMatrix = this.modelViewMatrix;
		modelViewMatrix = mat4.identity(modelViewMatrix);
		mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -camera.radius]); // amount to translate
		mat4.rotate(modelViewMatrix, modelViewMatrix, camera.theta + this.radians, [0, 1, 0]); // axis to rotate around (Y)
		mat4.rotate(modelViewMatrix, modelViewMatrix, camera.phi, [1, 0, 0]); // axis to rotate around (X)
		if (!camera.mouse) {
			camera.theta += (0 - camera.theta) / 20;
			camera.phi += (0 - camera.phi) / 20;
			this.radians += deltaTime * 0.0005;
		}
		return modelViewMatrix;
	}

	protected updateNormalMatrix_(modelViewMatrix: mat4): mat4 {
		// this.normalMatrix = mat4.create();
		let normalMatrix = this.normalMatrix;
		normalMatrix = mat4.identity(normalMatrix);
		mat4.invert(normalMatrix, modelViewMatrix);
		mat4.transpose(normalMatrix, normalMatrix);
		return normalMatrix;
	}

	public setMode(mode: ContextMode) {
		let geometry: Geometry;
		if (mode === ContextMode.Mesh) {
			geometry = this.cache[this.mesh];
			if (geometry) {
				this.geometry = geometry;
				this.mode = ContextMode.Mesh;
				this.updateUniformMesh_ = this.updateUniformMesh__;
				this.dirty = true;
				return;
			}
		}
		let loader: ObjLoader;
		switch (mode) {
			case ContextMode.Flat:
				geometry = new FlatGeometry();
				this.updateUniformMesh_ = this.updateUniformNoop_;
				this.updateUniformFlat__();
				break;
			case ContextMode.Box:
				geometry = new BoxGeometry();
				this.updateUniformMesh_ = this.updateUniformMesh__;
				break;
			case ContextMode.Sphere:
				geometry = new SphereGeometry();
				this.updateUniformMesh_ = this.updateUniformMesh__;
				break;
			case ContextMode.Torus:
				geometry = new TorusGeometry();
				this.updateUniformMesh_ = this.updateUniformMesh__;
				break;
			case ContextMode.Mesh:
				geometry = new FlatGeometry();
				if (this.mesh) {
					loader = new ObjLoader();
					loader.load(Common.getResource(this.mesh, this.workpath)).then(geometry => {
						geometry.createAttributes_(this.gl, this.program);
						const cache: { [key: string]: Geometry } = {};
						cache[this.mesh] = geometry;
						this.cache = cache;
						this.geometry = geometry;
						this.dirty = true;
					}, error => {
						Logger.warn('GlslCanvas', error);
						this.mode = ContextMode.Flat;
					});
				} else {
					mode = ContextMode.Flat;
				}
				this.updateUniformMesh_ = this.updateUniformMesh__;
				break;
		}
		geometry.create(this.gl, this.program);
		this.geometry = geometry;
		this.mode = mode;
		this.dirty = true;
	}

	public setMesh(mesh: string) {
		this.mesh = mesh;
	}
}
