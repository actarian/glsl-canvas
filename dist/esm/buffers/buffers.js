import Context from '../context/context';
import IterableStringMap from '../core/iterable';
export const BuffersDefaultFragment = `
void main(){
	gl_FragColor = vec4(1.0);
}`;
export const BuffersDefaultFragment2 = `#version 300 es

precision mediump float;

out vec4 outColor;

void main() {
	outColor = vec4(1.0);
}
`;
export var BufferFloatType;
(function (BufferFloatType) {
    BufferFloatType[BufferFloatType["FLOAT"] = 0] = "FLOAT";
    BufferFloatType[BufferFloatType["HALF_FLOAT"] = 1] = "HALF_FLOAT";
})(BufferFloatType || (BufferFloatType = {}));
export class Buffer {
    constructor(gl, BW, BH, index) {
        const buffer = gl.createFramebuffer();
        const texture = this.getTexture(gl, BW, BH, index);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        this.texture = texture;
        this.buffer = buffer;
        this.BW = BW;
        this.BH = BH;
        this.index = index;
    }
    getFloatType(gl) {
        let floatType, extension;
        if (Buffer.floatType === BufferFloatType.FLOAT) {
            const extensionName = Context.isWebGl2(gl) ? 'EXT_color_buffer_float' : 'OES_texture_float';
            extension = gl.getExtension(extensionName);
            if (extension) {
                floatType = gl.FLOAT;
            }
            else {
                Buffer.floatType = BufferFloatType.HALF_FLOAT;
                return this.getFloatType(gl);
            }
        }
        else {
            const extensionName = Context.isWebGl2(gl) ? 'EXT_color_buffer_half_float' : 'OES_texture_half_float';
            extension = gl.getExtension(extensionName);
            if (extension) {
                floatType = extension.HALF_FLOAT_OES;
            }
            else {
                Buffer.floatType = BufferFloatType.FLOAT;
                return this.getFloatType(gl);
            }
        }
        return floatType;
    }
    getTexture(gl, BW, BH, index) {
        const floatType = this.getFloatType(gl);
        const texture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + index);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, (Context.isWebGl2(gl) ? gl.RGBA16F : gl.RGBA), BW, BH, 0, gl.RGBA, floatType, null);
        const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (status !== gl.FRAMEBUFFER_COMPLETE) {
            if (Buffer.floatType === BufferFloatType.FLOAT) {
                Buffer.floatType = BufferFloatType.HALF_FLOAT;
            }
            else {
                Buffer.floatType = BufferFloatType.FLOAT;
            }
            return this.getTexture(gl, BW, BH, index);
        }
        return texture;
    }
    resize(gl, BW, BH) {
        if (BW !== this.BW || BH !== this.BH) {
            const buffer = this.buffer;
            const texture = this.texture;
            const index = this.index;
            gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
            const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
            const minW = Math.min(BW, this.BW);
            const minH = Math.min(BH, this.BH);
            let pixels;
            let floatType = this.getFloatType(gl);
            if (status === gl.FRAMEBUFFER_COMPLETE) {
                pixels = new Float32Array(minW * minH * 4);
                gl.readPixels(0, 0, minW, minH, gl.RGBA, floatType, pixels);
            }
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            const newIndex = index + 1; // temporary index
            const newTexture = this.getTexture(gl, BW, BH, newIndex);
            floatType = this.getFloatType(gl);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            if (pixels) {
                gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, minW, minH, gl.RGBA, floatType, pixels);
            }
            const newBuffer = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.deleteTexture(texture);
            gl.activeTexture(gl.TEXTURE0 + index);
            gl.bindTexture(gl.TEXTURE_2D, newTexture);
            this.index = index;
            this.texture = newTexture;
            this.buffer = newBuffer;
            this.BW = BW;
            this.BH = BH;
        }
    }
}
Buffer.floatType = BufferFloatType.HALF_FLOAT;
export class IOBuffer {
    constructor(index, key, vertexString, fragmentString) {
        this.isValid = false;
        this.index = index;
        this.key = key;
        this.vertexString = vertexString;
        this.fragmentString = fragmentString;
    }
    create(gl, BW, BH) {
        // console.log('create', this.vertexString, this.fragmentString);
        const vertexShader = Context.createShader(gl, this.vertexString, gl.VERTEX_SHADER);
        let fragmentShader = Context.createShader(gl, this.fragmentString, gl.FRAGMENT_SHADER, 1);
        if (!fragmentShader) {
            fragmentShader = Context.createShader(gl, Context.isWebGl2(gl) ?
                BuffersDefaultFragment2 : BuffersDefaultFragment, gl.FRAGMENT_SHADER);
            this.isValid = false;
        }
        else {
            this.isValid = true;
        }
        const program = Context.createProgram(gl, [vertexShader, fragmentShader]);
        gl.linkProgram(program);
        const input = new Buffer(gl, BW, BH, this.index + 0);
        const output = new Buffer(gl, BW, BH, this.index + 2);
        this.program = program;
        this.input = input;
        this.output = output;
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
    }
    render(gl, BW, BH) {
        gl.useProgram(this.program);
        gl.viewport(0, 0, BW, BH);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.output.buffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.output.texture, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        // swap
        const input = this.input;
        const output = this.output;
        this.input = output;
        this.output = input;
    }
    resize(gl, BW, BH) {
        gl.useProgram(this.program);
        gl.viewport(0, 0, BW, BH);
        this.input.resize(gl, BW, BH);
        this.output.resize(gl, BW, BH);
    }
    destroy(gl) {
        gl.deleteProgram(this.program);
        this.program = null;
        this.input = null;
        this.output = null;
    }
}
export default class Buffers extends IterableStringMap {
    get count() {
        return Object.keys(this.values).length * 4;
    }
    static getBuffers(gl, fragmentString, vertexString) {
        const buffers = new Buffers();
        let count = 0;
        if (fragmentString) {
            if (Context.isWebGl2(gl)) {
                fragmentString = fragmentString.replace(/^\#version\s*300\s*es\s*\n/, '');
            }
            const regexp = /(?:^\s*)((?:#if|#elif)(?:\s*)(defined\s*\(\s*BUFFER_)(\d+)(?:\s*\))|(?:#ifdef)(?:\s*BUFFER_)(\d+)(?:\s*))/gm;
            let matches;
            while ((matches = regexp.exec(fragmentString)) !== null) {
                const i = matches[3] || matches[4];
                const key = 'u_buffer' + i;
                const bufferFragmentString = Context.isWebGl2(gl) ? `#version 300 es
#define BUFFER_${i}
${fragmentString}` : `#define BUFFER_${i}
${fragmentString}`;
                const buffer = new IOBuffer(count, key, vertexString, bufferFragmentString);
                buffer.create(gl, gl.drawingBufferWidth, gl.drawingBufferHeight);
                buffers.set(key, buffer);
                count += 4;
            }
        }
        return buffers;
    }
}
