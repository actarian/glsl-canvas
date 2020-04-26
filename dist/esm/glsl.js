export { Buffer, BufferFloatType, default as Buffers, IOBuffer } from './buffers/buffers';
export { default as OrbitCamera } from './camera/orbit-camera';
export { default as Canvas } from './canvas/canvas';
export { default as CanvasTimer } from './canvas/canvas-timer';
export { DefaultWebGL2BufferFragment, DefaultWebGL2BufferVertex, DefaultWebGL2FlatFragment, DefaultWebGL2MeshFragment, DefaultWebGL2MeshVertex, DefaultWebGLBufferFragment, DefaultWebGLBufferVertex, DefaultWebGLFlatFragment, DefaultWebGLMeshFragment, DefaultWebGLMeshVertex } from './context/chunks';
export { ContextError, ContextVersion, ContextVertexBuffers, default as Context } from './context/context';
export { default as Common } from './core/common';
export { default as IterableStringMap } from './core/iterable';
export { default as Subscriber, Listener } from './core/subscriber';
export { default as BoxGeometry } from './geometry/box-geometry';
export { default as FlatGeometry } from './geometry/flat-geometry';
export { default as Geometry } from './geometry/geometry';
export { default as SphereGeometry } from './geometry/sphere-geometry';
export { default as TorusGeometry } from './geometry/torus-geometry';
export { default as ObjLoader } from './loaders/obj-loader';
export { default as Logger } from './logger/logger';
export { default as Vector2 } from './math/vector2';
export { default as Vector3 } from './math/vector3';
export { default as Renderer } from './renderer/renderer';
export { default as Textures, isTextureData, Texture, TextureExtensions, TextureFilteringType, TextureImageExtensions, TextureSourceType, TextureVideoExtensions } from './textures/textures';
export { default as Uniforms, METHODS_FLOAT, METHODS_FLOATV, METHODS_INT, METHODS_INTV, Uniform, UniformMethod, UniformTexture, UniformType } from './uniforms/uniforms';
import Canvas from './canvas/canvas';
export function of(canvas, options) {
    return Canvas.items.find(x => x.canvas === canvas) || new Canvas(canvas, options);
}
export function loadAll() {
    const canvases = [].slice.call(document.getElementsByClassName('glsl-canvas')).filter((x) => x instanceof HTMLCanvasElement);
    return canvases.map(x => of(x));
}
if (document) {
    document.addEventListener('DOMContentLoaded', () => {
        loadAll();
    });
}
