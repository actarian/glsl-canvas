/**
 * @license glsl-canvas-js v0.2.1
 * (c) 2020 Luca Zampetti <lzampetti@gmail.com>
 * License: MIT
 */

var glsl = (function (exports) {
  'use strict';

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    subClass.__proto__ = superClass;
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  /**
   * @this {Promise}
   */
  function finallyConstructor(callback) {
    var constructor = this.constructor;
    return this.then(
      function(value) {
        // @ts-ignore
        return constructor.resolve(callback()).then(function() {
          return value;
        });
      },
      function(reason) {
        // @ts-ignore
        return constructor.resolve(callback()).then(function() {
          // @ts-ignore
          return constructor.reject(reason);
        });
      }
    );
  }

  // Store setTimeout reference so promise-polyfill will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var setTimeoutFunc = setTimeout;

  function isArray(x) {
    return Boolean(x && typeof x.length !== 'undefined');
  }

  function noop() {}

  // Polyfill for Function.prototype.bind
  function bind(fn, thisArg) {
    return function() {
      fn.apply(thisArg, arguments);
    };
  }

  /**
   * @constructor
   * @param {Function} fn
   */
  function Promise$1(fn) {
    if (!(this instanceof Promise$1))
      throw new TypeError('Promises must be constructed via new');
    if (typeof fn !== 'function') throw new TypeError('not a function');
    /** @type {!number} */
    this._state = 0;
    /** @type {!boolean} */
    this._handled = false;
    /** @type {Promise|undefined} */
    this._value = undefined;
    /** @type {!Array<!Function>} */
    this._deferreds = [];

    doResolve(fn, this);
  }

  function handle(self, deferred) {
    while (self._state === 3) {
      self = self._value;
    }
    if (self._state === 0) {
      self._deferreds.push(deferred);
      return;
    }
    self._handled = true;
    Promise$1._immediateFn(function() {
      var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
      if (cb === null) {
        (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
        return;
      }
      var ret;
      try {
        ret = cb(self._value);
      } catch (e) {
        reject(deferred.promise, e);
        return;
      }
      resolve(deferred.promise, ret);
    });
  }

  function resolve(self, newValue) {
    try {
      // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
      if (newValue === self)
        throw new TypeError('A promise cannot be resolved with itself.');
      if (
        newValue &&
        (typeof newValue === 'object' || typeof newValue === 'function')
      ) {
        var then = newValue.then;
        if (newValue instanceof Promise$1) {
          self._state = 3;
          self._value = newValue;
          finale(self);
          return;
        } else if (typeof then === 'function') {
          doResolve(bind(then, newValue), self);
          return;
        }
      }
      self._state = 1;
      self._value = newValue;
      finale(self);
    } catch (e) {
      reject(self, e);
    }
  }

  function reject(self, newValue) {
    self._state = 2;
    self._value = newValue;
    finale(self);
  }

  function finale(self) {
    if (self._state === 2 && self._deferreds.length === 0) {
      Promise$1._immediateFn(function() {
        if (!self._handled) {
          Promise$1._unhandledRejectionFn(self._value);
        }
      });
    }

    for (var i = 0, len = self._deferreds.length; i < len; i++) {
      handle(self, self._deferreds[i]);
    }
    self._deferreds = null;
  }

  /**
   * @constructor
   */
  function Handler(onFulfilled, onRejected, promise) {
    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
    this.onRejected = typeof onRejected === 'function' ? onRejected : null;
    this.promise = promise;
  }

  /**
   * Take a potentially misbehaving resolver function and make sure
   * onFulfilled and onRejected are only called once.
   *
   * Makes no guarantees about asynchrony.
   */
  function doResolve(fn, self) {
    var done = false;
    try {
      fn(
        function(value) {
          if (done) return;
          done = true;
          resolve(self, value);
        },
        function(reason) {
          if (done) return;
          done = true;
          reject(self, reason);
        }
      );
    } catch (ex) {
      if (done) return;
      done = true;
      reject(self, ex);
    }
  }

  Promise$1.prototype['catch'] = function(onRejected) {
    return this.then(null, onRejected);
  };

  Promise$1.prototype.then = function(onFulfilled, onRejected) {
    // @ts-ignore
    var prom = new this.constructor(noop);

    handle(this, new Handler(onFulfilled, onRejected, prom));
    return prom;
  };

  Promise$1.prototype['finally'] = finallyConstructor;

  Promise$1.all = function(arr) {
    return new Promise$1(function(resolve, reject) {
      if (!isArray(arr)) {
        return reject(new TypeError('Promise.all accepts an array'));
      }

      var args = Array.prototype.slice.call(arr);
      if (args.length === 0) return resolve([]);
      var remaining = args.length;

      function res(i, val) {
        try {
          if (val && (typeof val === 'object' || typeof val === 'function')) {
            var then = val.then;
            if (typeof then === 'function') {
              then.call(
                val,
                function(val) {
                  res(i, val);
                },
                reject
              );
              return;
            }
          }
          args[i] = val;
          if (--remaining === 0) {
            resolve(args);
          }
        } catch (ex) {
          reject(ex);
        }
      }

      for (var i = 0; i < args.length; i++) {
        res(i, args[i]);
      }
    });
  };

  Promise$1.resolve = function(value) {
    if (value && typeof value === 'object' && value.constructor === Promise$1) {
      return value;
    }

    return new Promise$1(function(resolve) {
      resolve(value);
    });
  };

  Promise$1.reject = function(value) {
    return new Promise$1(function(resolve, reject) {
      reject(value);
    });
  };

  Promise$1.race = function(arr) {
    return new Promise$1(function(resolve, reject) {
      if (!isArray(arr)) {
        return reject(new TypeError('Promise.race accepts an array'));
      }

      for (var i = 0, len = arr.length; i < len; i++) {
        Promise$1.resolve(arr[i]).then(resolve, reject);
      }
    });
  };

  // Use polyfill for setImmediate for performance gains
  Promise$1._immediateFn =
    // @ts-ignore
    (typeof setImmediate === 'function' &&
      function(fn) {
        // @ts-ignore
        setImmediate(fn);
      }) ||
    function(fn) {
      setTimeoutFunc(fn, 0);
    };

  Promise$1._unhandledRejectionFn = function _unhandledRejectionFn(err) {
    if (typeof console !== 'undefined' && console) {
      console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
    }
  };

  var Common = function () {
    function Common() {}

    Common.fetch = function fetch(url) {
      return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();

        xhr.onload = function () {
          resolve(xhr.response || xhr.responseText);
        };

        xhr.onerror = function (error) {
          reject(new Error("Network request failed for url " + url));
        };

        xhr.ontimeout = function (error) {
          reject(new Error("Network request failed for url " + url));
        };

        xhr.onabort = function () {
          reject(new Error('Aborted'));
        };

        xhr.open('GET', url, true);
        xhr.send(null);
      });
    };

    return Common;
  }();

  var LoggerLevel;

  (function (LoggerLevel) {
    LoggerLevel[LoggerLevel["None"] = 0] = "None";
    LoggerLevel[LoggerLevel["Error"] = 1] = "Error";
    LoggerLevel[LoggerLevel["Warn"] = 2] = "Warn";
    LoggerLevel[LoggerLevel["Log"] = 3] = "Log";
  })(LoggerLevel || (LoggerLevel = {}));

  var Logger = function () {
    function Logger() {}

    Logger.log = function log() {
      if (Logger.enabled && Logger.level >= LoggerLevel.Log) {
        var _console;

        (_console = console).log.apply(_console, arguments);
      }
    };

    Logger.warn = function warn() {
      if (Logger.enabled && Logger.level >= LoggerLevel.Warn) {
        var _console2;

        (_console2 = console).warn.apply(_console2, arguments);
      }
    };

    Logger.error = function error() {
      if (Logger.enabled && Logger.level >= LoggerLevel.Error) {
        var _console3;

        (_console3 = console).error.apply(_console3, arguments);
      }
    };

    return Logger;
  }();
  Logger.level = LoggerLevel.Warn;
  Logger.enabled = true;

  var ContextDefaultVertex = "\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\nattribute vec2 a_position;\nattribute vec2 a_texcoord;\n\nvarying vec2 v_texcoord;\n\nvoid main(){\n\tgl_Position = vec4(a_position, 0.0, 1.0);\n\tv_texcoord = a_texcoord;\n}\n";
  var ContextDefaultFragment = "\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\nvoid main(){\n\tgl_FragColor = vec4(0.0);\n}\n";
  var ContextDefaultVertex2 = "#version 300 es\n\nin vec2 a_position;\nin vec2 a_texcoord;\n\nout vec2 v_texcoord;\n\nvoid main() {\n\tgl_Position = vec4(a_position, 0.0, 1.0);\n\tv_texcoord = a_texcoord;\n}\n";
  var ContextDefaultFragment2 = "#version 300 es\n\nprecision mediump float;\n\nout vec4 outColor;\n\nvoid main() {\n\toutColor = vec4(0.0);\n}\n";

  (function (ContextVersion) {
    ContextVersion[ContextVersion["WebGl"] = 1] = "WebGl";
    ContextVersion[ContextVersion["WebGl2"] = 2] = "WebGl2";
  })(exports.ContextVersion || (exports.ContextVersion = {}));

  (function (ContextError) {
    ContextError[ContextError["BrowserSupport"] = 1] = "BrowserSupport";
    ContextError[ContextError["Other"] = 2] = "Other";
  })(exports.ContextError || (exports.ContextError = {}));

  var ContextVertexBuffers = function ContextVertexBuffers() {};

  var Context = function () {
    function Context() {}

    Context.getContext_ = function getContext_(canvas, options) {
      var names = ['webgl', 'experimental-webgl'];
      var context = null;

      for (var i = 0; i < names.length; ++i) {
        try {
          context = canvas.getContext(names[i], options);
        } catch (e) {
          if (context) {
            break;
          }
        }
      }

      return context;
    };

    Context.getContext2_ = function getContext2_(canvas, options) {
      var context = null;

      try {
        context = canvas.getContext('webgl2', options);
      } catch (e) {}

      return context;
    };

    Context.getIncludes = function getIncludes(input) {
      if (input === undefined) {
        return Promise.resolve(input);
      }

      var regex = /#include\s*['|"](.*.glsl)['|"]/gm;
      var promises = [];
      var i = 0;
      var match;

      while ((match = regex.exec(input)) !== null) {
        promises.push(Promise.resolve(input.slice(i, match.index)));
        i = match.index + match[0].length;
        promises.push(Common.fetch(match[1]));
      }

      promises.push(Promise.resolve(input.slice(i)));
      return Promise.all(promises).then(function (chunks) {
        return chunks.join('');
      });
    };

    Context.isWebGl = function isWebGl(context) {
      return context instanceof WebGLRenderingContext;
    };

    Context.isWebGl2 = function isWebGl2(context) {
      return window.WebGL2RenderingContext && context instanceof WebGL2RenderingContext;
    };

    Context.inferVersion = function inferVersion(vertexString, fragmentString) {
      var source = vertexString || fragmentString;

      if (source) {
        return source.indexOf('#version 300 es') === 0 ? exports.ContextVersion.WebGl2 : exports.ContextVersion.WebGl;
      } else {
        return exports.ContextVersion.WebGl;
      }
    };

    Context.versionDiffers = function versionDiffers(gl, vertexString, fragmentString) {
      if (gl) {
        var currentVersion = this.isWebGl2(gl) ? exports.ContextVersion.WebGl2 : exports.ContextVersion.WebGl;
        var newVersion = Context.inferVersion(vertexString, fragmentString);
        return newVersion !== currentVersion;
      } else {
        return false;
      }
    };

    Context.getVertex = function getVertex(vertexString, fragmentString) {
      if (vertexString) {
        return vertexString;
      } else {
        var version = this.inferVersion(vertexString, fragmentString);
        return version === exports.ContextVersion.WebGl2 ? ContextDefaultVertex2 : ContextDefaultVertex;
      }
    };

    Context.getFragment = function getFragment(vertexString, fragmentString) {
      if (fragmentString) {
        return fragmentString;
      } else {
        var version = this.inferVersion(vertexString, fragmentString);
        return version === exports.ContextVersion.WebGl2 ? ContextDefaultFragment2 : ContextDefaultFragment;
      }
    };

    Context.tryInferContext = function tryInferContext(vertexString, fragmentString, canvas, attributes, extensions, errorCallback) {
      if (extensions === void 0) {
        extensions = [];
      }

      function handleError(errorCode, html) {
        if (typeof errorCallback === 'function') {
          errorCallback(errorCode);
        } else {
          var container = canvas.parentNode;

          if (container) {
            container.innerHTML = "<div class=\"glsl-canvas--error\">" + html + "</div>";
          }
        }
      }

      if (!WebGLRenderingContext) {
        handleError(exports.ContextError.BrowserSupport, "This page requires a browser that supports WebGL.<br/>\n\t\t\t<a href=\"http://get.webgl.org\">Click here to upgrade your browser.</a>");
        return null;
      }

      var context = Context.inferContext(vertexString, fragmentString, canvas, attributes);

      if (!context) {
        handleError(exports.ContextError.Other, "It does not appear your computer can support WebGL.<br/>\n\t\t\t<a href=\"http://get.webgl.org/troubleshooting/\">Click here for more information.</a>");
      } else {
        if (!this.isWebGl2(context) && extensions.indexOf('OES_standard_derivatives') === -1) {
          extensions.push('OES_standard_derivatives');
        }

        var supportedExtensions = context.getSupportedExtensions();
        extensions.forEach(function (key) {
          if (supportedExtensions.indexOf(key) !== -1) {
            context.getExtension(key);
          } else {
            Logger.warn("GlslCanvas " + key + " not supported");
          }
        });
      }

      return context;
    };

    Context.tryGetContext = function tryGetContext(canvas, attributes, errorCallback) {
      function handleError(errorCode, html) {
        if (typeof errorCallback === 'function') {
          errorCallback(errorCode);
        } else {
          var container = canvas.parentNode;

          if (container) {
            container.innerHTML = "<div class=\"glsl-canvas--error\">" + html + "</div>";
          }
        }
      }

      if (!WebGLRenderingContext) {
        handleError(exports.ContextError.BrowserSupport, "This page requires a browser that supports WebGL.<br/>\n\t\t\t<a href=\"http://get.webgl.org\">Click here to upgrade your browser.</a>");
        return null;
      }

      var context = Context.getContext_(canvas, attributes);

      if (!context) {
        handleError(exports.ContextError.Other, "It does not appear your computer can support WebGL.<br/>\n\t\t\t<a href=\"http://get.webgl.org/troubleshooting/\">Click here for more information.</a>");
      } else {
        context.getExtension('OES_standard_derivatives');
      }

      return context;
    };

    Context.inferContext = function inferContext(vertexString, fragmentString, canvas, options) {
      var version = this.inferVersion(vertexString, fragmentString);
      return version === exports.ContextVersion.WebGl2 ? this.getContext2_(canvas, options) : this.getContext_(canvas, options);
    };

    Context.createShader = function createShader(gl, source, type, offset) {
      if (offset === void 0) {
        offset = 0;
      }

      var shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

      if (!compiled) {
        Context.lastError = gl.getShaderInfoLog(shader);
        Logger.error("*** Error compiling shader " + shader + ": " + Context.lastError);
        gl.deleteShader(shader);
        throw {
          shader: shader,
          source: source,
          type: type,
          error: Context.lastError,
          offset: offset
        };
      }

      return shader;
    };

    Context.createProgram = function createProgram(gl, shaders, attributes, locations) {
      var program = gl.createProgram();

      for (var i = 0; i < shaders.length; ++i) {
        gl.attachShader(program, shaders[i]);
      }

      if (attributes && locations) {
        for (var _i = 0; _i < attributes.length; ++_i) {
          gl.bindAttribLocation(program, locations ? locations[_i] : _i, attributes[_i]);
        }
      }

      gl.linkProgram(program);
      var linked = gl.getProgramParameter(program, gl.LINK_STATUS);

      if (!linked) {
        Context.lastError = gl.getProgramInfoLog(program);
        Logger.log("Error in program linking: " + Context.lastError);
        gl.deleteProgram(program);
        return null;
      }

      return program;
    };

    Context.createVertexBuffers = function createVertexBuffers(gl, program) {
      var vertexBuffers = new ContextVertexBuffers();
      var texcoordIndex = gl.getAttribLocation(program, 'a_texcoord');
      vertexBuffers.texcoord = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers.texcoord);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(texcoordIndex);
      gl.vertexAttribPointer(texcoordIndex, 2, gl.FLOAT, false, 0, 0);
      var positionIndex = gl.getAttribLocation(program, 'a_position');
      vertexBuffers.position = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers.position);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(positionIndex);
      gl.vertexAttribPointer(positionIndex, 2, gl.FLOAT, false, 0, 0);
      return vertexBuffers;
    };

    return Context;
  }();
  Context.lastError = '';

  var StringMap = function StringMap() {};

  var IterableStringMap = function () {
    function IterableStringMap() {
      this.values = new StringMap();
    }

    var _proto = IterableStringMap.prototype;

    _proto.has = function has(key) {
      return this.values.hasOwnProperty(key);
    };

    _proto.set = function set(key, item) {
      this.values[key] = item;
    };

    _proto.get = function get(key) {
      return this.values[key];
    };

    _proto.forEach = function forEach(callbackfn) {
      var i = 0;

      for (var key in this.values) {
        callbackfn(this.values[key], i, this.values);
        i++;
      }
    };

    _proto.reduce = function reduce(callbackfn, initialValue) {
      var previous = initialValue,
          i = 0;

      for (var key in this.values) {
        previous = callbackfn(previous, this.values[key], i, this.values);
        i++;
      }

      return previous;
    };

    return IterableStringMap;
  }();

  var BuffersDefaultFragment = "\nvoid main(){\n\tgl_FragColor = vec4(1.0);\n}";
  var BuffersDefaultFragment2 = "#version 300 es\n\nprecision mediump float;\n\nout vec4 outColor;\n\nvoid main() {\n\toutColor = vec4(1.0);\n}\n";

  (function (BufferFloatType) {
    BufferFloatType[BufferFloatType["FLOAT"] = 0] = "FLOAT";
    BufferFloatType[BufferFloatType["HALF_FLOAT"] = 1] = "HALF_FLOAT";
  })(exports.BufferFloatType || (exports.BufferFloatType = {}));

  var Buffer = function () {
    function Buffer(gl, BW, BH, index) {
      var buffer = gl.createFramebuffer();
      var texture = this.getTexture(gl, BW, BH, index);
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

    var _proto = Buffer.prototype;

    _proto.getFloatType = function getFloatType(gl) {
      var floatType, extension;

      if (Buffer.floatType === exports.BufferFloatType.FLOAT) {
        var extensionName = Context.isWebGl2(gl) ? 'EXT_color_buffer_float' : 'OES_texture_float';
        extension = gl.getExtension(extensionName);

        if (extension) {
          floatType = gl.FLOAT;
        } else {
          Buffer.floatType = exports.BufferFloatType.HALF_FLOAT;
          return this.getFloatType(gl);
        }
      } else {
        var _extensionName = Context.isWebGl2(gl) ? 'EXT_color_buffer_half_float' : 'OES_texture_half_float';

        extension = gl.getExtension(_extensionName);

        if (extension) {
          floatType = extension.HALF_FLOAT_OES;
        } else {
          Buffer.floatType = exports.BufferFloatType.FLOAT;
          return this.getFloatType(gl);
        }
      }

      return floatType;
    };

    _proto.getTexture = function getTexture(gl, BW, BH, index) {
      var floatType = this.getFloatType(gl);
      var texture = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + index);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, Context.isWebGl2(gl) ? gl.RGBA16F : gl.RGBA, BW, BH, 0, gl.RGBA, floatType, null);
      var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);

      if (status !== gl.FRAMEBUFFER_COMPLETE) {
        if (Buffer.floatType === exports.BufferFloatType.FLOAT) {
          Buffer.floatType = exports.BufferFloatType.HALF_FLOAT;
        } else {
          Buffer.floatType = exports.BufferFloatType.FLOAT;
        }

        return this.getTexture(gl, BW, BH, index);
      }

      return texture;
    };

    _proto.resize = function resize(gl, BW, BH) {
      if (BW !== this.BW || BH !== this.BH) {
        var buffer = this.buffer;
        var texture = this.texture;
        var index = this.index;
        gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
        var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        var minW = Math.min(BW, this.BW);
        var minH = Math.min(BH, this.BH);
        var pixels;
        var floatType = this.getFloatType(gl);

        if (status === gl.FRAMEBUFFER_COMPLETE) {
          pixels = new Float32Array(minW * minH * 4);
          gl.readPixels(0, 0, minW, minH, gl.RGBA, floatType, pixels);
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        var newIndex = index + 1;
        var newTexture = this.getTexture(gl, BW, BH, newIndex);
        floatType = this.getFloatType(gl);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        if (pixels) {
          gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, minW, minH, gl.RGBA, floatType, pixels);
        }

        var newBuffer = gl.createFramebuffer();
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
    };

    return Buffer;
  }();
  Buffer.floatType = exports.BufferFloatType.HALF_FLOAT;
  var IOBuffer = function () {
    function IOBuffer(index, key, vertexString, fragmentString) {
      this.isValid = false;
      this.index = index;
      this.key = key;
      this.vertexString = vertexString;
      this.fragmentString = fragmentString;
    }

    var _proto2 = IOBuffer.prototype;

    _proto2.create = function create(gl, BW, BH) {
      var vertexShader = Context.createShader(gl, this.vertexString, gl.VERTEX_SHADER);
      var fragmentShader = Context.createShader(gl, this.fragmentString, gl.FRAGMENT_SHADER, 1);

      if (!fragmentShader) {
        fragmentShader = Context.createShader(gl, Context.isWebGl2(gl) ? BuffersDefaultFragment2 : BuffersDefaultFragment, gl.FRAGMENT_SHADER);
        this.isValid = false;
      } else {
        this.isValid = true;
      }

      var program = Context.createProgram(gl, [vertexShader, fragmentShader]);
      gl.linkProgram(program);
      var input = new Buffer(gl, BW, BH, this.index + 0);
      var output = new Buffer(gl, BW, BH, this.index + 2);
      this.program = program;
      this.input = input;
      this.output = output;
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };

    _proto2.render = function render(gl, BW, BH) {
      gl.useProgram(this.program);
      gl.viewport(0, 0, BW, BH);
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.output.buffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.output.texture, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      var input = this.input;
      var output = this.output;
      this.input = output;
      this.output = input;
    };

    _proto2.resize = function resize(gl, BW, BH) {
      gl.useProgram(this.program);
      gl.viewport(0, 0, BW, BH);
      this.input.resize(gl, BW, BH);
      this.output.resize(gl, BW, BH);
    };

    _proto2.destroy = function destroy(gl) {
      gl.deleteProgram(this.program);
      this.program = null;
      this.input = null;
      this.output = null;
    };

    return IOBuffer;
  }();

  var Buffers = function (_IterableStringMap) {
    _inheritsLoose(Buffers, _IterableStringMap);

    function Buffers() {
      return _IterableStringMap.apply(this, arguments) || this;
    }

    Buffers.getBuffers = function getBuffers(gl, fragmentString, vertexString) {
      var buffers = new Buffers();
      var count = 0;

      if (fragmentString) {
        if (Context.isWebGl2(gl)) {
          fragmentString = fragmentString.replace(/^\#version\s*300\s*es\s*\n/, '');
        }

        var regexp = /(?:^\s*)((?:#if|#elif)(?:\s*)(defined\s*\(\s*BUFFER_)(\d+)(?:\s*\))|(?:#ifdef)(?:\s*BUFFER_)(\d+)(?:\s*))/gm;
        var matches;

        while ((matches = regexp.exec(fragmentString)) !== null) {
          var i = matches[3] || matches[4];
          var key = 'u_buffer' + i;
          var bufferFragmentString = Context.isWebGl2(gl) ? "#version 300 es\n#define BUFFER_" + i + "\n" + fragmentString : "#define BUFFER_" + i + "\n" + fragmentString;
          var buffer = new IOBuffer(count, key, vertexString, bufferFragmentString);
          buffer.create(gl, gl.drawingBufferWidth, gl.drawingBufferHeight);
          buffers.set(key, buffer);
          count += 4;
        }
      }

      return buffers;
    };

    _createClass(Buffers, [{
      key: "count",
      get: function get() {
        return Object.keys(this.values).length * 4;
      }
    }]);

    return Buffers;
  }(IterableStringMap);

  var Listener = function Listener(event, callback) {
    this.event = event;
    this.callback = callback;
  };

  var Subscriber = function () {
    function Subscriber() {
      this.listeners = new Set();
    }

    var _proto = Subscriber.prototype;

    _proto.logListeners = function logListeners() {
      this.listeners.forEach(function (x) {
        return Logger.log(x);
      });
    };

    _proto.subscribe = function subscribe(listener) {
      this.listeners.add(listener);
    };

    _proto.unsubscribe = function unsubscribe(listener) {
      this.listeners.delete(listener);
    };

    _proto.unsubscribeAll = function unsubscribeAll() {
      this.listeners.clear();
    };

    _proto.on = function on(event, callback) {
      this.listeners.add(new Listener(event, callback));
      return this;
    };

    _proto.off = function off(event, callback) {
      var _this = this;

      if (callback) {
        this.listeners.delete(new Listener(event, callback));
      } else {
        this.listeners.forEach(function (x) {
          if (x.event === event) {
            _this.listeners.delete(x);
          }
        });
      }

      return this;
    };

    _proto.trigger = function trigger(event) {
      for (var _len = arguments.length, data = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        data[_key - 1] = arguments[_key];
      }

      this.listeners.forEach(function (x) {
        if (x.event === event && typeof x.callback === 'function') {
          x.callback.apply(x, data);
        }
      });
      return this;
    };

    return Subscriber;
  }();

  var TextureImageExtensions = ['jpg', 'jpeg', 'png'];
  var TextureVideoExtensions = ['ogv', 'webm', 'mp4'];
  var TextureExtensions = TextureImageExtensions.concat(TextureVideoExtensions);

  (function (TextureSourceType) {
    TextureSourceType[TextureSourceType["Data"] = 0] = "Data";
    TextureSourceType[TextureSourceType["Element"] = 1] = "Element";
    TextureSourceType[TextureSourceType["Url"] = 2] = "Url";
  })(exports.TextureSourceType || (exports.TextureSourceType = {}));

  (function (TextureFilteringType) {
    TextureFilteringType["MipMap"] = "mipmap";
    TextureFilteringType["Linear"] = "linear";
    TextureFilteringType["Nearest"] = "nearest";
  })(exports.TextureFilteringType || (exports.TextureFilteringType = {}));

  function isTextureData(object) {
    return 'data' in object && 'width' in object && 'height' in object;
  }
  var Texture = function (_Subscriber) {
    _inheritsLoose(Texture, _Subscriber);

    function Texture(gl, key, index, options, workpath) {
      var _this;

      if (options === void 0) {
        options = {
          filtering: exports.TextureFilteringType.Linear
        };
      }

      _this = _Subscriber.call(this) || this;
      _this.valid = false;
      _this.dirty = false;
      _this.animated = false;
      _this.powerOf2 = false;
      _this.key = key;
      _this.index = index;
      _this.options = options;
      _this.workpath = workpath;

      _this.create(gl);

      return _this;
    }

    Texture.isPowerOf2 = function isPowerOf2(value) {
      return (value & value - 1) === 0;
    };

    Texture.isSafari = function isSafari() {
      return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    };

    Texture.isTextureUrl = function isTextureUrl(text) {
      return text && /\.(jpg|jpeg|png|ogv|webm|mp4)$/i.test(text.split('?')[0]);
    };

    Texture.isTexture = function isTexture(urlElementOrData) {
      var options = Texture.getTextureOptions(urlElementOrData);
      return options !== undefined;
    };

    Texture.getMaxTextureSize = function getMaxTextureSize(gl) {
      return gl.getParameter(gl.MAX_TEXTURE_SIZE);
    };

    Texture.getTextureOptions = function getTextureOptions(urlElementOrData, options) {
      if (options === void 0) {
        options = {};
      }

      if (typeof urlElementOrData === 'string' && urlElementOrData !== '') {
        if (Texture.isTextureUrl(urlElementOrData)) {
          options.url = urlElementOrData;

          if (urlElementOrData.indexOf('?') !== -1) {
            options = urlElementOrData.split('?')[1].split('&').reduce(function (prev, curr) {
              var params = curr.split('=');
              var key = decodeURIComponent(params[0]);
              var value = decodeURIComponent(params[1]);

              switch (key) {
                case 'filtering':
                  prev[key] = value;
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
    };

    var _proto = Texture.prototype;

    _proto.create = function create(gl) {
      this.texture = gl.createTexture();

      if (this.texture) {
        this.valid = true;
      }

      this.setData(gl, 1, 1, new Uint8Array([0, 0, 0, 0]), this.options);
    };

    _proto.load = function load(gl, options) {
      if (options === void 0) {
        options = {};
      }

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
    };

    _proto.setUrl = function setUrl(gl, url, options) {
      if (options === void 0) {
        options = {};
      }

      if (!this.valid) {
        return Promise.reject(this);
      }

      this.url = url;
      this.source = url;
      this.sourceType = exports.TextureSourceType.Url;
      this.options = Object.assign(this.options, options);
      var src = String(url.indexOf(':/') === -1 && this.workpath !== undefined ? this.workpath + "/" + url : url);
      var ext = url.split('?')[0].split('.').pop().toLowerCase();
      var isVideo = TextureVideoExtensions.indexOf(ext) !== -1;
      var element;
      var promise;

      if (isVideo) {
        Logger.log('GlslCanvas.setUrl video', src);
        element = document.createElement('video');
        element.setAttribute('preload', 'auto');
        element.setAttribute('loop', 'true');
        element.setAttribute('muted', 'true');
        element.setAttribute('playsinline', 'true');
        element.loop = true;
        element.muted = true;
        promise = this.setElement(gl, element, options);
        element.src = src;
        element.addEventListener('canplay', function () {
          element.play();
        });
      } else {
        Logger.log('GlslCanvas.setUrl image', src);
        element = document.createElement('img');
        promise = this.setElement(gl, element, options);

        if (!(Texture.isSafari() && url.slice(0, 5) === 'data:')) {
          element.crossOrigin = 'anonymous';
        }

        element.src = src;
      }

      return promise;
    };

    _proto.setElement = function setElement(gl, element, options) {
      var _this2 = this;

      if (options === void 0) {
        options = {};
      }

      options = this.options = Object.assign(this.options, options);
      return new Promise(function (resolve, reject) {
        var originalElement = element;

        if (typeof element === 'string') {
          element = document.querySelector(element);
        }

        if (element instanceof HTMLCanvasElement || element instanceof HTMLImageElement || element instanceof HTMLVideoElement) {
          _this2.source = element;
          _this2.sourceType = exports.TextureSourceType.Element;

          if (element instanceof HTMLVideoElement) {
            var video = element;
            video.addEventListener('loadeddata', function (event) {
              _this2.update(gl, options);

              _this2.setFiltering(gl, options);

              resolve(_this2);
            });
            video.addEventListener('error', function (error) {
              reject(error);
            });
            video.load();
          } else if (element instanceof HTMLImageElement) {
            element.addEventListener('load', function () {
              _this2.update(gl, options);

              _this2.setFiltering(gl, options);

              resolve(_this2);
            });
            element.addEventListener('error', function (error) {
              reject(error);
            });
          } else {
            _this2.update(gl, options);

            _this2.setFiltering(gl, options);

            resolve(_this2);
          }
        } else {
          var message = "the 'element' parameter (`element: " + JSON.stringify(originalElement) + "`) must be a CSS selector string, or a <canvas>, <image> or <video> object";
          Logger.log("Texture '" + _this2.key + "': " + message, options);
          reject(message);
        }
      });
    };

    _proto.setData = function setData(gl, width, height, data, options) {
      if (options === void 0) {
        options = {};
      }

      this.width = width;
      this.height = height;
      this.options = Object.assign(this.options, options);
      this.source = data;
      this.sourceType = exports.TextureSourceType.Data;
      this.update(gl, options);
      this.setFiltering(gl, options);
      return Promise.resolve(this);
    };

    _proto.update = function update(gl, options) {
      if (!this.valid) {
        return;
      }

      gl.activeTexture(gl.TEXTURE0 + this.index);
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, options.UNPACK_FLIP_Y_WEBGL === false ? 0 : 1);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, options.UNPACK_PREMULTIPLY_ALPHA_WEBGL || 0);

      if (this.sourceType === exports.TextureSourceType.Element) {
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
      } else if (this.sourceType === exports.TextureSourceType.Data) {
        var imageBuffer = this.source;
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, imageBuffer);
      }

      this.trigger('loaded', this);
    };

    _proto.tryUpdate = function tryUpdate(gl) {
      var dirty = false;

      if (this.animated) {
        dirty = true;
        this.update(gl, this.options);
      }

      return dirty;
    };

    _proto.destroy = function destroy(gl) {
      if (!this.valid) {
        return;
      }

      gl.deleteTexture(this.texture);
      this.texture = null;
      delete this.source;
      this.source = null;
      this.valid = false;
    };

    _proto.setFiltering = function setFiltering(gl, options) {
      if (!this.valid) {
        return;
      }

      var powerOf2 = Texture.isPowerOf2(this.width) && Texture.isPowerOf2(this.height);
      var filtering = options.filtering || exports.TextureFilteringType.MipMap;
      var wrapS = options.TEXTURE_WRAP_S || (options.repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE);
      var wrapT = options.TEXTURE_WRAP_T || (options.repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE);

      if (!powerOf2) {
        filtering = filtering === exports.TextureFilteringType.MipMap ? exports.TextureFilteringType.Linear : filtering;
        wrapS = wrapT = gl.CLAMP_TO_EDGE;

        if (options.repeat || options.TEXTURE_WRAP_S || options.TEXTURE_WRAP_T) {
          Logger.warn("GlslCanvas: cannot repeat texture " + options.url + " cause is not power of 2.");
        }
      }

      this.powerOf2 = powerOf2;
      this.filtering = filtering;
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);

      if (this.filtering === exports.TextureFilteringType.MipMap) {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.generateMipmap(gl.TEXTURE_2D);
      } else if (this.filtering === exports.TextureFilteringType.Nearest) {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      } else if (this.filtering === exports.TextureFilteringType.Linear) {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      }
    };

    return Texture;
  }(Subscriber);

  var Textures = function (_IterableStringMap) {
    _inheritsLoose(Textures, _IterableStringMap);

    function Textures() {
      var _this3;

      _this3 = _IterableStringMap.apply(this, arguments) || this;
      _this3.count = 0;
      _this3.dirty = false;
      _this3.animated = false;
      return _this3;
    }

    var _proto2 = Textures.prototype;

    _proto2.clean = function clean() {
      for (var key in this.values) {
        this.values[key].dirty = false;
      }

      this.dirty = false;
    };

    _proto2.createOrUpdate = function createOrUpdate(gl, key, urlElementOrData, index, options, workpath) {
      var _this4 = this;

      if (index === void 0) {
        index = 0;
      }

      if (options === void 0) {
        options = {};
      }

      var texture;
      var textureOptions = Texture.getTextureOptions(urlElementOrData, options);
      texture = this.get(key);

      if (!texture) {
        texture = new Texture(gl, key, index + this.count, textureOptions, workpath);
        this.count++;
        this.set(key, texture);
      }

      if (textureOptions !== undefined) {
        return texture.load(gl, textureOptions).then(function (texture) {
          if (texture.source instanceof HTMLVideoElement) {
            var video = texture.source;
            video.addEventListener('play', function () {
              texture.animated = true;
              _this4.animated = true;
            });
            video.addEventListener('pause', function () {
              texture.animated = false;
              _this4.animated = _this4.reduce(function (flag, texture) {
                return flag || texture.animated;
              }, false);
            });
            video.addEventListener('seeked', function () {
              texture.update(gl, texture.options);
              _this4.dirty = true;
            });
          }

          return texture;
        });
      } else {
        return Promise.resolve(texture);
      }
    };

    return Textures;
  }(IterableStringMap);

  (function (UniformMethod) {
    UniformMethod[UniformMethod["Unknown"] = 0] = "Unknown";
    UniformMethod["Uniform1i"] = "uniform1i";
    UniformMethod["Uniform2i"] = "uniform2i";
    UniformMethod["Uniform3i"] = "uniform3i";
    UniformMethod["Uniform4i"] = "uniform4i";
    UniformMethod["Uniform1f"] = "uniform1f";
    UniformMethod["Uniform2f"] = "uniform2f";
    UniformMethod["Uniform3f"] = "uniform3f";
    UniformMethod["Uniform4f"] = "uniform4f";
    UniformMethod["Uniform1iv"] = "uniform1iv";
    UniformMethod["Uniform2iv"] = "uniform2iv";
    UniformMethod["Uniform3iv"] = "uniform3iv";
    UniformMethod["Uniform4iv"] = "uniform4iv";
    UniformMethod["Uniform1fv"] = "uniform1fv";
    UniformMethod["Uniform2fv"] = "uniform2fv";
    UniformMethod["Uniform3fv"] = "uniform3fv";
    UniformMethod["Uniform4fv"] = "uniform4fv";
    UniformMethod["UniformMatrix2fv"] = "uniformMatrix2fv";
    UniformMethod["UniformMatrix3fv"] = "uniformMatrix3fv";
    UniformMethod["UniformMatrix4fv"] = "uniformMatrix4fv";
  })(exports.UniformMethod || (exports.UniformMethod = {}));

  (function (UniformType) {
    UniformType[UniformType["Unknown"] = 0] = "Unknown";
    UniformType[UniformType["Float"] = 1] = "Float";
    UniformType[UniformType["Int"] = 2] = "Int";
    UniformType[UniformType["Bool"] = 3] = "Bool";
    UniformType[UniformType["Sampler2D"] = 4] = "Sampler2D";
    UniformType[UniformType["SamplerCube"] = 5] = "SamplerCube";
    UniformType[UniformType["Matrix2fv"] = 6] = "Matrix2fv";
    UniformType[UniformType["Matrix3fv"] = 7] = "Matrix3fv";
    UniformType[UniformType["Matrix4fv"] = 8] = "Matrix4fv";
  })(exports.UniformType || (exports.UniformType = {}));

  var METHODS_INT = [exports.UniformMethod.Uniform1i, exports.UniformMethod.Uniform2i, exports.UniformMethod.Uniform3i, exports.UniformMethod.Uniform4i];
  var METHODS_FLOAT = [exports.UniformMethod.Uniform1f, exports.UniformMethod.Uniform2f, exports.UniformMethod.Uniform3f, exports.UniformMethod.Uniform4f];
  var METHODS_INTV = [exports.UniformMethod.Uniform1iv, exports.UniformMethod.Uniform2iv, exports.UniformMethod.Uniform3iv, exports.UniformMethod.Uniform4iv];
  var METHODS_FLOATV = [exports.UniformMethod.Uniform1fv, exports.UniformMethod.Uniform2fv, exports.UniformMethod.Uniform3fv, exports.UniformMethod.Uniform4fv];
  var Uniform = function Uniform(options) {
    var _this = this;

    this.dirty = true;

    if (options) {
      Object.assign(this, options);
    }

    this.apply = function (gl, program) {
      if (_this.dirty) {
        gl.useProgram(program);
        var location = gl.getUniformLocation(program, _this.key);

        gl[_this.method].apply(gl, [location].concat(_this.values));
      }
    };
  };
  var UniformTexture = function (_Uniform) {
    _inheritsLoose(UniformTexture, _Uniform);

    function UniformTexture(options) {
      return _Uniform.call(this, options) || this;
    }

    return UniformTexture;
  }(Uniform);

  var Uniforms = function (_IterableStringMap) {
    _inheritsLoose(Uniforms, _IterableStringMap);

    function Uniforms() {
      var _this2;

      _this2 = _IterableStringMap.apply(this, arguments) || this;
      _this2.dirty = false;
      return _this2;
    }

    Uniforms.isDifferent = function isDifferent(a, b) {
      return a.length !== b.length || a.reduce(function (f, v, i) {
        return f || v !== b[i];
      }, false);
    };

    Uniforms.isArrayOfInteger = function isArrayOfInteger(array) {
      return array.reduce(function (flag, value) {
        return flag && Number.isInteger(value);
      }, true);
    };

    Uniforms.isArrayOfNumber = function isArrayOfNumber(array) {
      return array.reduce(function (flag, value) {
        return flag && typeof value === 'number';
      }, true);
    };

    Uniforms.isArrayOfBoolean = function isArrayOfBoolean(array) {
      return array.reduce(function (flag, value) {
        return flag && typeof value === 'boolean';
      }, true);
    };

    Uniforms.isArrayOfTexture = function isArrayOfTexture(array) {
      return array.reduce(function (flag, value) {
        return flag && Texture.isTexture(value);
      }, true);
    };

    Uniforms.isArrayOfSampler2D = function isArrayOfSampler2D(array) {
      return array.reduce(function (flag, value) {
        return flag && value.type === exports.UniformType.Sampler2D;
      }, true);
    };

    Uniforms.getType_ = function getType_(values) {
      var type = exports.UniformType.Unknown;
      var isVector = values.length === 1 && Array.isArray(values[0]);
      var subject = isVector ? values[0] : values;

      if (Uniforms.isArrayOfNumber(subject)) {
        type = exports.UniformType.Float;
      } else if (Uniforms.isArrayOfBoolean(subject)) {
        type = exports.UniformType.Bool;
      } else if (Uniforms.isArrayOfTexture(subject)) {
        type = exports.UniformType.Sampler2D;
      }

      return type;
    };

    Uniforms.getMethod_ = function getMethod_(type, values) {
      var method = exports.UniformMethod.Unknown;
      var isVector = values.length === 1 && Array.isArray(values[0]);
      var subject = isVector ? values[0] : values;
      var length = subject.length;
      var i = length - 1;

      switch (type) {
        case exports.UniformType.Float:
          if (isVector) {
            method = i < METHODS_FLOATV.length ? METHODS_FLOATV[i] : exports.UniformMethod.Unknown;
          } else {
            method = i < METHODS_FLOAT.length ? METHODS_FLOAT[i] : exports.UniformMethod.Uniform1fv;
          }

          break;

        case exports.UniformType.Int:
        case exports.UniformType.Bool:
          if (isVector) {
            method = i < METHODS_INTV.length ? METHODS_INTV[i] : exports.UniformMethod.Unknown;
          } else {
            method = i < METHODS_INT.length ? METHODS_INT[i] : exports.UniformMethod.Uniform1iv;
          }

          break;

        case exports.UniformType.Sampler2D:
          if (isVector) {
            method = exports.UniformMethod.Uniform1iv;
          } else {
            method = length === 1 ? exports.UniformMethod.Uniform1i : exports.UniformMethod.Uniform1iv;
          }

          break;
      }

      return method;
    };

    Uniforms.parseUniform = function parseUniform(key, values, type) {
      if (type === void 0) {
        type = null;
      }

      var uniform;
      type = type || Uniforms.getType_(values);
      var method = Uniforms.getMethod_(type, values);

      if (type !== exports.UniformType.Unknown && method !== exports.UniformMethod.Unknown) {
        if (type === exports.UniformType.Sampler2D && method === exports.UniformMethod.Uniform1iv) {
          return values[0].map(function (texture, index) {
            return new Uniform({
              method: method,
              type: type,
              key: key + "[" + index + "]",
              values: [texture]
            });
          });
        } else {
          uniform = new Uniform({
            method: method,
            type: type,
            key: key,
            values: values
          });
        }
      } else {
        Logger.error('Uniforms.parseUniform.Unknown', key, values);
      }

      return uniform;
    };

    var _proto = Uniforms.prototype;

    _proto.create = function create(method, type, key, values) {
      var uniform = new Uniform({
        method: method,
        type: type,
        key: key,
        values: values
      });
      this.set(key, uniform);
      this.dirty = true;
      return uniform;
    };

    _proto.createTexture = function createTexture(key, index) {
      var uniform;

      if (key.indexOf(']') !== -1) {
        uniform = new UniformTexture({
          method: exports.UniformMethod.Uniform1iv,
          type: exports.UniformType.Sampler2D,
          key: key,
          values: [[index]]
        });
      } else {
        uniform = new UniformTexture({
          method: exports.UniformMethod.Uniform1i,
          type: exports.UniformType.Sampler2D,
          key: key,
          values: [index]
        });
      }

      this.set(key, uniform);
      this.dirty = true;
      return uniform;
    };

    _proto.update = function update(method, type, key, values) {
      var uniform = this.get(key);

      if (uniform && (uniform.method !== method || uniform.type !== type || Uniforms.isDifferent(uniform.values, values))) {
        uniform.method = method;
        uniform.type = type;
        uniform.values = values;
        uniform.dirty = true;
        this.dirty = true;
      }
    };

    _proto.createOrUpdate = function createOrUpdate(method, type, key, values) {
      if (this.has(key)) {
        this.update(method, type, key, values);
      } else {
        this.create(method, type, key, values);
      }
    };

    _proto.apply = function apply(gl, program) {
      for (var key in this.values) {
        this.values[key].apply(gl, program);
      }
    };

    _proto.clean = function clean() {
      for (var key in this.values) {
        this.values[key].dirty = false;
      }

      this.dirty = false;
    };

    return Uniforms;
  }(IterableStringMap);

  var CanvasTimer = function () {
    function CanvasTimer() {
      this.delay = 0.0;
      this.current = 0.0;
      this.delta = 0.0;
      this.paused = false;
      this.start = this.previous = this.now();
    }

    var _proto = CanvasTimer.prototype;

    _proto.now = function now() {
      return performance.now();
    };

    _proto.play = function play() {
      if (this.previous) {
        var now = this.now();
        this.delay += now - this.previous;
        this.previous = now;
      }

      this.paused = false;
    };

    _proto.pause = function pause() {
      this.paused = true;
    };

    _proto.next = function next() {
      var now = this.now();
      this.delta = now - this.previous;
      this.current = now - this.start - this.delay;
      this.previous = now;
      return this;
    };

    return CanvasTimer;
  }();

  var Canvas = function (_Subscriber) {
    _inheritsLoose(Canvas, _Subscriber);

    function Canvas(canvas, options) {
      var _this;

      if (options === void 0) {
        options = {};
      }

      _this = _Subscriber.call(this) || this;
      _this.mouse = {
        x: 0,
        y: 0
      };
      _this.uniforms = new Uniforms();
      _this.buffers = new Buffers();
      _this.textures = new Textures();
      _this.textureList = [];
      _this.valid = false;
      _this.animated = false;
      _this.dirty = true;
      _this.visible = false;

      if (!canvas) {
        return _assertThisInitialized(_this);
      }

      _this.options = options;
      _this.canvas = canvas;
      _this.width = 0;
      _this.height = 0;
      _this.rect = canvas.getBoundingClientRect();
      _this.devicePixelRatio = window.devicePixelRatio || 1;
      canvas.style.backgroundColor = options.backgroundColor || 'rgba(0,0,0,0)';

      _this.getShaders_().then(function (success) {
        _this.load().then(function (success) {
          if (!_this.program) {
            return;
          }

          _this.addListeners_();

          _this.onLoop();
        });
      }, function (error) {
        Logger.log('GlslCanvas.getShaders_.error', error);
      });

      Canvas.items.push(_assertThisInitialized(_this));
      return _this;
    }

    Canvas.version = function version() {
      return '0.1.6';
    };

    Canvas.of = function of(canvas, options) {
      return Canvas.items.find(function (x) {
        return x.canvas === canvas;
      }) || new Canvas(canvas, options);
    };

    Canvas.loadAll = function loadAll() {
      var canvases = [].slice.call(document.getElementsByClassName('glsl-canvas')).filter(function (x) {
        return x instanceof HTMLCanvasElement;
      });
      return canvases.map(function (x) {
        return Canvas.of(x);
      });
    };

    var _proto = Canvas.prototype;

    _proto.getShaders_ = function getShaders_() {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        _this2.vertexString = _this2.options.vertexString || _this2.vertexString;
        _this2.fragmentString = _this2.options.fragmentString || _this2.fragmentString;
        var canvas = _this2.canvas;
        var urls = {};

        if (canvas.hasAttribute('data-vertex-url')) {
          urls.vertex = canvas.getAttribute('data-vertex-url');
        }

        if (canvas.hasAttribute('data-fragment-url')) {
          urls.fragment = canvas.getAttribute('data-fragment-url');
        }

        if (canvas.hasAttribute('data-vertex')) {
          _this2.vertexString = canvas.getAttribute('data-vertex');
        }

        if (canvas.hasAttribute('data-fragment')) {
          _this2.fragmentString = canvas.getAttribute('data-fragment');
        }

        if (Object.keys(urls).length) {
          Promise.all(Object.keys(urls).map(function (key, i) {
            var url = urls[key];
            return Common.fetch(url).then(function (body) {
              if (key === 'vertex') {
                return _this2.vertexString = body;
              } else {
                return _this2.fragmentString = body;
              }
            });
          })).then(function (shaders) {
            resolve([_this2.vertexString, _this2.fragmentString]);
          });
        } else {
          resolve([_this2.vertexString, _this2.fragmentString]);
        }
      });
    };

    _proto.addListeners_ = function addListeners_() {
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
      window.addEventListener('scroll', this.onScroll);
      document.addEventListener('mousemove', this.onMousemove, false);
      document.addEventListener('touchmove', this.onTouchmove);
      this.addCanvasListeners_();
    };

    _proto.addCanvasListeners_ = function addCanvasListeners_() {
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

    _proto.removeCanvasListeners_ = function removeCanvasListeners_() {
      if (this.canvas.hasAttribute('controls')) {
        this.canvas.removeEventListener('click', this.onClick);
        this.canvas.removeEventListener('mouseover', this.onMouseover);
        this.canvas.removeEventListener('mouseout', this.onMouseout);
        this.canvas.removeEventListener('touchstart', this.onTouchstart);
      }
    };

    _proto.removeListeners_ = function removeListeners_() {
      window.cancelAnimationFrame(this.rafId);
      window.removeEventListener('scroll', this.onScroll);
      document.removeEventListener('mousemove', this.onMousemove);
      document.removeEventListener('touchmove', this.onTouchmove);
      this.removeCanvasListeners_();
    };

    _proto.onScroll = function onScroll(e) {
      this.rect = this.canvas.getBoundingClientRect();
    };

    _proto.onClick = function onClick(e) {
      this.toggle();
      this.trigger('click', e);
    };

    _proto.onMove = function onMove(mx, my) {
      var rect = this.rect;
      var x = (mx - rect.left) * this.devicePixelRatio;
      var y = (rect.height - (my - rect.top)) * this.devicePixelRatio;

      if (x !== this.mouse.x || y !== this.mouse.y) {
        this.mouse.x = x;
        this.mouse.y = y;
        this.trigger('move', this.mouse);
      }
    };

    _proto.onMousemove = function onMousemove(e) {
      this.onMove(e.clientX || e.pageX, e.clientY || e.pageY);
    };

    _proto.onMouseover = function onMouseover(e) {
      this.play();
      this.trigger('over', e);
    };

    _proto.onMouseout = function onMouseout(e) {
      this.pause();
      this.trigger('out', e);
    };

    _proto.onTouchmove = function onTouchmove(e) {
      var touch = [].slice.call(e.touches).reduce(function (p, touch) {
        p = p || {
          x: 0,
          y: 0
        };
        p.x += touch.clientX;
        p.y += touch.clientY;
        return p;
      }, null);

      if (touch) {
        this.onMove(touch.x / e.touches.length, touch.y / e.touches.length);
      }
    };

    _proto.onTouchend = function onTouchend(e) {
      this.pause();
      this.trigger('out', e);
      document.removeEventListener('touchend', this.onTouchend);
    };

    _proto.onTouchstart = function onTouchstart(e) {
      this.play();
      this.trigger('over', e);
      document.addEventListener('touchend', this.onTouchend);
      document.removeEventListener('mousemove', this.onMousemove);

      if (this.canvas.hasAttribute('controls')) {
        this.canvas.removeEventListener('mouseover', this.onMouseover);
        this.canvas.removeEventListener('mouseout', this.onMouseout);
      }
    };

    _proto.onLoop = function onLoop(time) {
      this.checkRender();
      this.rafId = window.requestAnimationFrame(this.onLoop);
    };

    _proto.setUniform_ = function setUniform_(key, values, options, type) {
      var _this3 = this;

      if (options === void 0) {
        options = {};
      }

      if (type === void 0) {
        type = null;
      }

      var uniform = Uniforms.parseUniform(key, values, type);

      if (Array.isArray(uniform)) {
        if (Uniforms.isArrayOfSampler2D(uniform)) {
          uniform.forEach(function (x) {
            return _this3.loadTexture(x.key, x.values[0], options);
          });
        } else {
          uniform.forEach(function (x) {
            return _this3.uniforms.set(x.key, x.values[0]);
          });
        }
      } else if (uniform) {
        switch (uniform.type) {
          case exports.UniformType.Sampler2D:
            this.loadTexture(key, values[0], options);
            break;

          default:
            this.uniforms.set(key, uniform);
        }
      }
    };

    _proto.parseTextures_ = function parseTextures_(fragmentString) {
      var _this4 = this;

      var regexp = /uniform\s*sampler2D\s*([\w]*);(\s*\/\/\s*([\w|\:\/\/|\.|\-|\_|\?|\&|\=]*)|\s*)/gm;
      var matches;

      while ((matches = regexp.exec(fragmentString)) !== null) {
        var key = matches[1];
        var url = matches[3];

        if (Texture.isTextureUrl(url)) {
          this.textureList.push({
            key: key,
            url: url
          });
        } else if (!this.buffers.has(key)) {
          this.textureList.push({
            key: key,
            url: null
          });
        }
      }

      if (this.canvas.hasAttribute('data-textures')) {
        var urls = this.canvas.getAttribute('data-textures').split(',');
        urls.forEach(function (url, i) {
          var key = 'u_texture' + i;

          _this4.textureList.push({
            key: key,
            url: url
          });
        });
      }

      return this.textureList.length > 0;
    };

    _proto.createUniforms_ = function createUniforms_() {
      var _this5 = this;

      var gl = this.gl;
      var fragmentString = this.fragmentString;
      var BW = gl.drawingBufferWidth;
      var BH = gl.drawingBufferHeight;
      var timer = this.timer = new CanvasTimer();
      var hasDelta = (fragmentString.match(/u_delta/g) || []).length > 1;
      var hasTime = (fragmentString.match(/u_time/g) || []).length > 1;
      var hasDate = (fragmentString.match(/u_date/g) || []).length > 1;
      var hasMouse = (fragmentString.match(/u_mouse/g) || []).length > 1;
      var hasTextures = this.parseTextures_(fragmentString);
      this.animated = hasTime || hasDate || hasMouse;

      if (this.animated) {
        this.canvas.classList.add('animated');
      } else {
        this.canvas.classList.remove('animated');
      }

      this.uniforms.create(exports.UniformMethod.Uniform2f, exports.UniformType.Float, 'u_resolution', [BW, BH]);

      if (hasDelta) {
        this.uniforms.create(exports.UniformMethod.Uniform1f, exports.UniformType.Float, 'u_delta', [timer.delta / 1000.0]);
      }

      if (hasTime) {
        this.uniforms.create(exports.UniformMethod.Uniform1f, exports.UniformType.Float, 'u_time', [timer.current / 1000.0]);
      }

      if (hasDate) {
        var date = new Date();
        this.uniforms.create(exports.UniformMethod.Uniform4f, exports.UniformType.Float, 'u_date', [date.getFullYear(), date.getMonth(), date.getDate(), date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds() + date.getMilliseconds() * 0.001]);
      }

      if (hasMouse) {
        this.uniforms.create(exports.UniformMethod.Uniform2f, exports.UniformType.Float, 'u_mouse', [0, 0]);
      }

      for (var key in this.buffers.values) {
        var buffer = this.buffers.values[key];
        this.uniforms.create(exports.UniformMethod.Uniform1i, exports.UniformType.Sampler2D, buffer.key, [buffer.input.index]);
      }

      if (hasTextures) {
        this.textureList.filter(function (x) {
          return x.url;
        }).forEach(function (x) {
          _this5.setTexture(x.key, x.url, x.options);
        });
        this.textureList = [];
      }
    };

    _proto.updateUniforms_ = function updateUniforms_() {
      var gl = this.gl;
      var BW = gl.drawingBufferWidth;
      var BH = gl.drawingBufferHeight;

      if (!this.timer) {
        return;
      }

      var timer = this.timer.next();
      this.uniforms.update(exports.UniformMethod.Uniform2f, exports.UniformType.Float, 'u_resolution', [BW, BH]);

      if (this.uniforms.has('u_delta')) {
        this.uniforms.update(exports.UniformMethod.Uniform1f, exports.UniformType.Float, 'u_delta', [timer.delta / 1000.0]);
      }

      if (this.uniforms.has('u_time')) {
        this.uniforms.update(exports.UniformMethod.Uniform1f, exports.UniformType.Float, 'u_time', [timer.current / 1000.0]);
      }

      if (this.uniforms.has('u_date')) {
        var date = new Date();
        this.uniforms.update(exports.UniformMethod.Uniform4f, exports.UniformType.Float, 'u_date', [date.getFullYear(), date.getMonth(), date.getDate(), date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds() + date.getMilliseconds() * 0.001]);
      }

      if (this.uniforms.has('u_mouse')) {
        var mouse = this.mouse;
        this.uniforms.update(exports.UniformMethod.Uniform2f, exports.UniformType.Float, 'u_mouse', [mouse.x, mouse.y]);
      }

      for (var key in this.buffers.values) {
        var buffer = this.buffers.values[key];
        this.uniforms.update(exports.UniformMethod.Uniform1i, exports.UniformType.Sampler2D, buffer.key, [buffer.input.index]);
      }

      for (var _key in this.textures.values) {
        var texture = this.textures.values[_key];
        texture.tryUpdate(gl);
        this.uniforms.update(exports.UniformMethod.Uniform1i, exports.UniformType.Sampler2D, texture.key, [texture.index]);
      }
    };

    _proto.isVisible_ = function isVisible_() {
      var rect = this.rect;
      return rect.top + rect.height > 0 && rect.top < (window.innerHeight || document.documentElement.clientHeight);
    };

    _proto.isAnimated_ = function isAnimated_() {
      return (this.animated || this.textures.animated) && !this.timer.paused;
    };

    _proto.isDirty_ = function isDirty_() {
      return this.dirty || this.uniforms.dirty || this.textures.dirty;
    };

    _proto.sizeDidChanged_ = function sizeDidChanged_() {
      var gl = this.gl;
      var W = Math.ceil(this.canvas.clientWidth),
          H = Math.ceil(this.canvas.clientHeight);

      if (this.width !== W || this.height !== H) {
        this.width = W;
        this.height = H;
        var BW = Math.ceil(W * this.devicePixelRatio);
        var BH = Math.ceil(H * this.devicePixelRatio);
        this.canvas.width = BW;
        this.canvas.height = BH;

        for (var key in this.buffers.values) {
          var buffer = this.buffers.values[key];
          buffer.resize(gl, BW, BH);
        }

        this.rect = this.canvas.getBoundingClientRect();
        this.trigger('resize');
        return true;
      } else {
        return false;
      }
    };

    _proto.load = function load(fragmentString, vertexString) {
      var _this6 = this;

      return Promise.all([Context.getIncludes(fragmentString || this.fragmentString), Context.getIncludes(vertexString || this.vertexString)]).then(function (array) {
        _this6.fragmentString = array[0];
        _this6.vertexString = array[1];
        return _this6.createContext_();
      });
    };

    _proto.getContext_ = function getContext_() {
      var vertexString = this.vertexString;
      var fragmentString = this.fragmentString;
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
        var gl = Context.tryInferContext(vertexString, fragmentString, this.canvas, this.options, this.options.extensions, this.options.onError);

        if (!gl) {
          return null;
        }

        this.gl = gl;
      }

      return this.gl;
    };

    _proto.createContext_ = function createContext_() {
      var gl = this.getContext_();

      if (!gl) {
        return false;
      }

      var vertexShader, fragmentShader;

      try {
        vertexShader = Context.createShader(gl, this.vertexString, gl.VERTEX_SHADER);
        fragmentShader = Context.createShader(gl, this.fragmentString, gl.FRAGMENT_SHADER);

        if (!fragmentShader) {
          fragmentShader = Context.createShader(gl, ContextDefaultFragment, gl.FRAGMENT_SHADER);
          this.valid = false;
        } else {
          this.valid = true;
        }
      } catch (e) {
        this.trigger('error', e);
        return false;
      }

      var program = Context.createProgram(gl, [vertexShader, fragmentShader]);
      gl.useProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      this.program = program;

      if (this.valid) {
        try {
          this.buffers = Buffers.getBuffers(gl, this.fragmentString, this.vertexString);
        } catch (e) {
          this.valid = false;
          this.trigger('error', e);
          return false;
        }

        this.vertexBuffers = Context.createVertexBuffers(gl, program);
        this.createUniforms_();
      }

      this.trigger('load', this);
      return this.valid;
    };

    _proto.test = function test(fragmentString, vertexString) {
      var _this7 = this;

      return new Promise(function (resolve, reject) {
        var vertex = _this7.vertexString;
        var fragment = _this7.fragmentString;
        var paused = _this7.timer.paused;

        var extension = _this7.gl.getExtension('EXT_disjoint_timer_query');

        var query = extension.createQueryEXT();
        var wasValid = _this7.valid;

        if (fragmentString || vertexString) {
          _this7.load(fragmentString, vertexString);

          wasValid = _this7.valid;

          _this7.render();
        }

        _this7.timer.paused = true;
        extension.beginQueryEXT(extension.TIME_ELAPSED_EXT, query);

        _this7.render();

        extension.endQueryEXT(extension.TIME_ELAPSED_EXT);

        var waitForTest = function waitForTest() {
          _this7.render();

          var available = extension.getQueryObjectEXT(query, extension.QUERY_RESULT_AVAILABLE_EXT);

          var disjoint = _this7.gl.getParameter(extension.GPU_DISJOINT_EXT);

          if (available && !disjoint) {
            var result = {
              wasValid: wasValid,
              fragment: fragmentString || _this7.fragmentString,
              vertex: vertexString || _this7.vertexString,
              timeElapsedMs: extension.getQueryObjectEXT(query, extension.QUERY_RESULT_EXT) / 1000000.0
            };
            _this7.timer.paused = paused;

            if (fragmentString || vertexString) {
              _this7.load(fragment, vertex);
            }

            resolve(result);
          } else {
            window.requestAnimationFrame(waitForTest);
          }
        };

        waitForTest();
      });
    };

    _proto.destroyContext_ = function destroyContext_() {
      var gl = this.gl;
      gl.useProgram(null);

      if (this.program) {
        gl.deleteProgram(this.program);
      }

      for (var key in this.buffers.values) {
        var buffer = this.buffers.values[key];
        buffer.destroy(gl);
      }

      for (var _key2 in this.textures.values) {
        var texture = this.textures.values[_key2];
        texture.destroy(gl);
      }

      this.buffers = null;
      this.textures = null;
      this.uniforms = null;
      this.program = null;
      this.gl = null;
    };

    _proto.swapCanvas_ = function swapCanvas_() {
      var canvas = this.canvas;
      var canvas_ = canvas.cloneNode();
      canvas.parentNode.replaceChild(canvas_, canvas);
      this.canvas = canvas_;
      this.addCanvasListeners_();
    };

    _proto.destroy = function destroy() {
      this.removeListeners_();
      this.destroyContext_();
      this.animated = false;
      this.valid = false;
      Canvas.items.splice(Canvas.items.indexOf(this), 1);
    };

    _proto.loadTexture = function loadTexture(key, urlElementOrData, options) {
      var _this8 = this;

      if (options === void 0) {
        options = {};
      }

      if (this.valid) {
        this.textures.createOrUpdate(this.gl, key, urlElementOrData, this.buffers.count, options, this.options.workpath).then(function (texture) {
          var index = texture.index;

          var uniform = _this8.uniforms.createTexture(key, index);

          uniform.texture = texture;
          var keyResolution = key.indexOf('[') !== -1 ? key.replace('[', 'Resolution[') : key + 'Resolution';

          _this8.uniforms.create(exports.UniformMethod.Uniform2f, exports.UniformType.Float, keyResolution, [texture.width, texture.height]);

          return texture;
        }, function (error) {
          var message = Array.isArray(error.path) ? error.path.map(function (x) {
            return x.error ? x.error.message : '';
          }).join(', ') : error.message;
          Logger.log('GlslCanvas.loadTexture.error', key, urlElementOrData, message);

          _this8.trigger('textureError', {
            key: key,
            urlElementOrData: urlElementOrData,
            message: message
          });
        });
      } else {
        this.textureList.push({
          key: key,
          url: urlElementOrData,
          options: options
        });
      }
    };

    _proto.setTexture = function setTexture(key, urlElementOrData, options) {
      if (options === void 0) {
        options = {};
      }

      return this.setUniform_(key, [urlElementOrData], options);
    };

    _proto.setUniform = function setUniform(key) {
      for (var _len = arguments.length, values = new Array(_len > 1 ? _len - 1 : 0), _key3 = 1; _key3 < _len; _key3++) {
        values[_key3 - 1] = arguments[_key3];
      }

      return this.setUniform_(key, values);
    };

    _proto.setUniformOfInt = function setUniformOfInt(key, values) {
      return this.setUniform_(key, values, null, exports.UniformType.Int);
    };

    _proto.setUniforms = function setUniforms(values) {
      for (var key in values) {
        this.setUniform(key, values[key]);
      }
    };

    _proto.pause = function pause() {
      if (this.valid) {
        this.timer.pause();
        this.canvas.classList.add('paused');
        this.trigger('pause');
      }
    };

    _proto.play = function play() {
      if (this.valid) {
        this.timer.play();
        this.canvas.classList.remove('paused');
        this.trigger('play');
      }
    };

    _proto.toggle = function toggle() {
      if (this.valid) {
        if (this.timer.paused) {
          this.play();
        } else {
          this.pause();
        }
      }
    };

    _proto.checkRender = function checkRender() {
      if (this.isVisible_() && (this.sizeDidChanged_() || this.isAnimated_() || this.isDirty_())) {
        this.render();
        this.canvas.classList.add('playing');
      } else {
        this.canvas.classList.remove('playing');
      }
    };

    _proto.render = function render() {
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

    return Canvas;
  }(Subscriber);
  Canvas.logger = Logger;
  Canvas.items = [];

  if (document) {
    document.addEventListener("DOMContentLoaded", function () {
      Canvas.loadAll();
    });
  }

  exports.Buffer = Buffer;
  exports.Buffers = Buffers;
  exports.BuffersDefaultFragment = BuffersDefaultFragment;
  exports.BuffersDefaultFragment2 = BuffersDefaultFragment2;
  exports.Canvas = Canvas;
  exports.CanvasTimer = CanvasTimer;
  exports.Common = Common;
  exports.Context = Context;
  exports.ContextDefaultFragment = ContextDefaultFragment;
  exports.ContextDefaultFragment2 = ContextDefaultFragment2;
  exports.ContextDefaultVertex = ContextDefaultVertex;
  exports.ContextDefaultVertex2 = ContextDefaultVertex2;
  exports.ContextVertexBuffers = ContextVertexBuffers;
  exports.IOBuffer = IOBuffer;
  exports.IterableStringMap = IterableStringMap;
  exports.Listener = Listener;
  exports.Logger = Logger;
  exports.METHODS_FLOAT = METHODS_FLOAT;
  exports.METHODS_FLOATV = METHODS_FLOATV;
  exports.METHODS_INT = METHODS_INT;
  exports.METHODS_INTV = METHODS_INTV;
  exports.Subscriber = Subscriber;
  exports.Texture = Texture;
  exports.TextureExtensions = TextureExtensions;
  exports.TextureImageExtensions = TextureImageExtensions;
  exports.TextureVideoExtensions = TextureVideoExtensions;
  exports.Textures = Textures;
  exports.Uniform = Uniform;
  exports.UniformTexture = UniformTexture;
  exports.Uniforms = Uniforms;
  exports.isTextureData = isTextureData;

  return exports;

}({}));
