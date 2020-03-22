"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var buffers_1 = require("./buffers/buffers");
exports.Buffer = buffers_1.Buffer;
exports.BufferFloatType = buffers_1.BufferFloatType;
exports.BuffersDefaultFragment = buffers_1.BuffersDefaultFragment;
exports.BuffersDefaultFragment2 = buffers_1.BuffersDefaultFragment2;
exports.Buffers = buffers_1.default;
exports.IOBuffer = buffers_1.IOBuffer;
var canvas_1 = require("./canvas/canvas");
exports.Canvas = canvas_1.default;
var canvas_timer_1 = require("./canvas/canvas-timer");
exports.CanvasTimer = canvas_timer_1.default;
var context_1 = require("./context/context");
exports.ContextDefaultFragment = context_1.ContextDefaultFragment;
exports.ContextDefaultFragment2 = context_1.ContextDefaultFragment2;
exports.ContextDefaultVertex = context_1.ContextDefaultVertex;
exports.ContextDefaultVertex2 = context_1.ContextDefaultVertex2;
exports.ContextError = context_1.ContextError;
exports.ContextVersion = context_1.ContextVersion;
exports.ContextVertexBuffers = context_1.ContextVertexBuffers;
exports.Context = context_1.default;
var common_1 = require("./core/common");
exports.Common = common_1.default;
var iterable_1 = require("./core/iterable");
exports.IterableStringMap = iterable_1.default;
var subscriber_1 = require("./core/subscriber");
exports.Subscriber = subscriber_1.default;
exports.Listener = subscriber_1.Listener;
var logger_1 = require("./logger/logger");
exports.Logger = logger_1.default;
var textures_1 = require("./textures/textures");
exports.Textures = textures_1.default;
exports.isTextureData = textures_1.isTextureData;
exports.Texture = textures_1.Texture;
exports.TextureExtensions = textures_1.TextureExtensions;
exports.TextureFilteringType = textures_1.TextureFilteringType;
exports.TextureImageExtensions = textures_1.TextureImageExtensions;
exports.TextureSourceType = textures_1.TextureSourceType;
exports.TextureVideoExtensions = textures_1.TextureVideoExtensions;
var uniforms_1 = require("./uniforms/uniforms");
exports.Uniforms = uniforms_1.default;
exports.METHODS_FLOAT = uniforms_1.METHODS_FLOAT;
exports.METHODS_FLOATV = uniforms_1.METHODS_FLOATV;
exports.METHODS_INT = uniforms_1.METHODS_INT;
exports.METHODS_INTV = uniforms_1.METHODS_INTV;
exports.Uniform = uniforms_1.Uniform;
exports.UniformMethod = uniforms_1.UniformMethod;
exports.UniformTexture = uniforms_1.UniformTexture;
exports.UniformType = uniforms_1.UniformType;
/*
declare global {
    interface Window { GlslCanvas: any; }
}
window.GlslCanvas = window.GlslCanvas || Canvas;
// (<any>(window)).GlslCanvas = Canvas;
*/
