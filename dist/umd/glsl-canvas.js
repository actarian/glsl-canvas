/**
 * @license glsl-canvas-js v0.2.8
 * (c) 2022 Luca Zampetti <lzampetti@gmail.com>
 * License: MIT
 */

(function(g,f){typeof exports==='object'&&typeof module!=='undefined'?f(exports):typeof define==='function'&&define.amd?define(['exports'],f):(g=typeof globalThis!=='undefined'?globalThis:g||self,f(g.glsl={}));}(this,(function(exports){'use strict';function _defineProperties(target, props) {
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

  _setPrototypeOf(subClass, superClass);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}var DefaultWebGLVertexAttributes_ = "\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\nattribute vec4 a_position;\nattribute vec4 a_normal;\nattribute vec2 a_texcoord;\nattribute vec4 a_color;\n\nvarying vec4 v_position;\nvarying vec4 v_normal;\nvarying vec2 v_texcoord;\nvarying vec4 v_color;\n";
var DefaultWebGLFragmentAttributes_ = "\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\nvarying vec4 v_position;\nvarying vec4 v_normal;\nvarying vec2 v_texcoord;\nvarying vec4 v_color;\n";
var DefaultWebGL2VertexAttributes_ = "#version 300 es\n\nprecision mediump float;\n\nin vec4 a_position;\nin vec4 a_normal;\nin vec2 a_texcoord;\nin vec4 a_color;\n\nout vec4 v_position;\nout vec4 v_normal;\nout vec2 v_texcoord;\nout vec4 v_color;\n";
var DefaultWebGL2FragmentAttributes_ = "#version 300 es\n\nprecision mediump float;\n\nin vec4 v_position;\nin vec4 v_normal;\nin vec2 v_texcoord;\nin vec4 v_color;\n\nout vec4 outColor;\n";
var DefaultWebGLUniform_ = "\nuniform mat4 u_projectionMatrix;\nuniform mat4 u_modelViewMatrix;\nuniform mat4 u_normalMatrix;\n\nuniform vec2 u_resolution;\nuniform float u_time;\n";
var DefaultWebGLFlatVertex_ = "\nvoid main() {\n\tv_position = a_position;\n\tv_normal = a_normal;\n\tv_texcoord = a_texcoord;\n\tv_color = a_color;\n\tgl_Position = a_position;\n}\n";
var DefaultWebGLMeshVertex_ = "\nvoid main(void) {\n\tv_position = u_projectionMatrix * u_modelViewMatrix * a_position;\n\tv_normal = u_normalMatrix * a_normal;\n\tv_texcoord = a_texcoord;\n\tv_color = a_color;\n\tgl_Position = v_position;\n}\n";
var DefaultWebGLFlatFragment_ = "\nvoid main() {\n\tvec2 st = gl_FragCoord.xy / u_resolution.xy;\n\tst.x *= u_resolution.x / u_resolution.y;\n\tvec3 color = vec3(\n\t\tabs(cos(u_time * 0.1)) * st.y,\n\t\tabs(cos(u_time * 0.2)) * st.y,\n\t\tabs(sin(u_time)) * st.y\n\t);\n\tgl_FragColor = vec4(color, 1.0);\n}\n";
var DefaultWebGL2FlatFragment_ = "\nvoid main() {\n\tvec2 st = gl_FragCoord.xy / u_resolution.xy;\n\tst.x *= u_resolution.x / u_resolution.y;\n\tvec3 color = vec3(\n\t\tabs(cos(u_time * 0.1)) * st.y,\n\t\tabs(cos(u_time * 0.2)) * st.y,\n\t\tabs(sin(u_time)) * st.y\n\t);\n\toutColor = vec4(color, 1.0);\n}\n";
var DefaultWebGLMeshFragment_ = "\nvoid main() {\n\tvec2 uv = v_texcoord;\n\tvec3 color = vec3(\n\t\tabs(cos(u_time * 0.1)) * uv.y,\n\t\tabs(cos(u_time * 0.2)) * uv.y,\n\t\tabs(sin(u_time)) * uv.y\n\t);\n\tfloat incidence = max(dot(v_normal.xyz, vec3(0.0, 1.0, 0.0)), 0.0);\n\tvec3 light = vec3(0.2) + (vec3(1.0) * incidence);\n\tgl_FragColor = vec4(v_color.rgb * color * light, 1.0);\n}\n";
var DefaultWebGL2MeshFragment_ = "\nvoid main() {\n\tvec2 uv = v_texcoord;\n\tvec3 color = vec3(\n\t\tabs(cos(u_time * 0.1)) * uv.y,\n\t\tabs(cos(u_time * 0.2)) * uv.y,\n\t\tabs(sin(u_time)) * uv.y\n\t);\n\tfloat incidence = max(dot(v_normal.xyz, vec3(0.0, 1.0, 0.0)), 0.0);\n\tvec3 light = vec3(0.2) + (vec3(1.0) * incidence);\n\toutColor = vec4(v_color.rgb * color * light, 1.0);\n}\n";
var DefaultWebGLBufferFragment_ = "\nvoid main(){\n\tgl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n}";
var DefaultWebGL2BufferFragment_ = "\nvoid main() {\n\toutColor = vec4(0.0, 0.0, 0.0, 1.0);\n}\n"; //

var DefaultWebGLMeshVertex = DefaultWebGLVertexAttributes_ + DefaultWebGLUniform_ + DefaultWebGLMeshVertex_;
var DefaultWebGL2MeshVertex = DefaultWebGL2VertexAttributes_ + DefaultWebGLUniform_ + DefaultWebGLMeshVertex_;
var DefaultWebGLFlatFragment = DefaultWebGLFragmentAttributes_ + DefaultWebGLUniform_ + DefaultWebGLFlatFragment_;
var DefaultWebGL2FlatFragment = DefaultWebGL2FragmentAttributes_ + DefaultWebGLUniform_ + DefaultWebGL2FlatFragment_;
var DefaultWebGLMeshFragment = DefaultWebGLFragmentAttributes_ + DefaultWebGLUniform_ + DefaultWebGLMeshFragment_;
var DefaultWebGL2MeshFragment = DefaultWebGL2FragmentAttributes_ + DefaultWebGLUniform_ + DefaultWebGL2MeshFragment_; //

var DefaultWebGLBufferVertex = DefaultWebGLVertexAttributes_ + DefaultWebGLUniform_ + DefaultWebGLFlatVertex_;
var DefaultWebGL2BufferVertex = DefaultWebGL2VertexAttributes_ + DefaultWebGLUniform_ + DefaultWebGLFlatVertex_;
var DefaultWebGLBufferFragment = DefaultWebGLFragmentAttributes_ + DefaultWebGLUniform_ + DefaultWebGLBufferFragment_;
var DefaultWebGL2BufferFragment = DefaultWebGL2FragmentAttributes_ + DefaultWebGLUniform_ + DefaultWebGL2BufferFragment_; //
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
}function allSettled(arr) {
  var P = this;
  return new P(function(resolve, reject) {
    if (!(arr && typeof arr.length !== 'undefined')) {
      return reject(
        new TypeError(
          typeof arr +
            ' ' +
            arr +
            ' is not iterable(cannot read property Symbol(Symbol.iterator))'
        )
      );
    }
    var args = Array.prototype.slice.call(arr);
    if (args.length === 0) return resolve([]);
    var remaining = args.length;

    function res(i, val) {
      if (val && (typeof val === 'object' || typeof val === 'function')) {
        var then = val.then;
        if (typeof then === 'function') {
          then.call(
            val,
            function(val) {
              res(i, val);
            },
            function(e) {
              args[i] = { status: 'rejected', reason: e };
              if (--remaining === 0) {
                resolve(args);
              }
            }
          );
          return;
        }
      }
      args[i] = { status: 'fulfilled', value: val };
      if (--remaining === 0) {
        resolve(args);
      }
    }

    for (var i = 0; i < args.length; i++) {
      res(i, args[i]);
    }
  });
}// Store setTimeout reference so promise-polyfill will be unaffected by
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

Promise$1.allSettled = allSettled;

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
};var Common = /*#__PURE__*/function () {
  function Common() {}

  Common.fetch = function fetch(url) {
    // console.log('Common.fetch', url);
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();

      xhr.onload = function () {
        resolve(xhr.response || xhr.responseText);
      };

      xhr.onerror = function (error) {
        console.log('Common.error', error);
        reject(new Error("Network request failed for url " + url));
      };

      xhr.ontimeout = function (error) {
        // console.log(error);
        reject(new Error("Network request failed for url " + url));
      };

      xhr.onabort = function () {
        reject(new Error('Aborted'));
      };

      xhr.open('GET', url, true);
      xhr.send(null);
    });
  };

  Common.getResource = function getResource(filepath, workpath) {
    if (workpath === void 0) {
      workpath = '';
    }

    var resource = filepath.indexOf(':/') === -1 ? Common.join(workpath, filepath) : filepath;
    return resource;
  };

  Common.join = function join() {
    var comps = [];

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    args.forEach(function (a) {
      if (a.indexOf('/') === 0) {
        comps = [];
      }

      var parts = Common.comps(a);
      parts.forEach(function (x) {
        switch (x) {
          case '.':
            break;

          case '..':
            comps.pop();
            break;

          default:
            comps.push(x);
        }
      });
    });
    return comps.join('/');
  };

  Common.dirname = function dirname(path) {
    // return path.replace(/\/[^\/]+\.\w+/, '');
    var comps = Common.comps(path);
    comps.pop();
    return comps.join('/');
  };

  Common.comps = function comps(path) {
    return path.replace(/\/$/, '').split(/\/+/);
  };

  return Common;
}();var LoggerLevel;

(function (LoggerLevel) {
  LoggerLevel[LoggerLevel["None"] = 0] = "None";
  LoggerLevel[LoggerLevel["Error"] = 1] = "Error";
  LoggerLevel[LoggerLevel["Warn"] = 2] = "Warn";
  LoggerLevel[LoggerLevel["Log"] = 3] = "Log";
})(LoggerLevel || (LoggerLevel = {}));

var Logger = /*#__PURE__*/function () {
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
Logger.enabled = true;(function (ContextVersion) {
  ContextVersion["WebGl"] = "webgl";
  ContextVersion["WebGl2"] = "webgl2";
})(exports.ContextVersion || (exports.ContextVersion = {}));

var ContextPrecision;

(function (ContextPrecision) {
  ContextPrecision["LowP"] = "lowp";
  ContextPrecision["MediumP"] = "mediump";
  ContextPrecision["HighP"] = "highp";
})(ContextPrecision || (ContextPrecision = {}));

var ContextMode;

(function (ContextMode) {
  ContextMode["Flat"] = "flat";
  ContextMode["Box"] = "box";
  ContextMode["Sphere"] = "sphere";
  ContextMode["Torus"] = "torus";
  ContextMode["Mesh"] = "mesh";
})(ContextMode || (ContextMode = {}));

var ContextDefault = {
  'webgl': {
    'flat': {
      vertex: DefaultWebGLMeshVertex,
      fragment: DefaultWebGLFlatFragment
    },
    'mesh': {
      vertex: DefaultWebGLMeshVertex,
      fragment: DefaultWebGLMeshFragment
    }
  },
  'webgl2': {
    'flat': {
      vertex: DefaultWebGL2MeshVertex,
      fragment: DefaultWebGL2FlatFragment
    },
    'mesh': {
      vertex: DefaultWebGL2MeshVertex,
      fragment: DefaultWebGL2MeshFragment
    }
  }
};

(function (ContextError) {
  ContextError[ContextError["BrowserSupport"] = 1] = "BrowserSupport";
  ContextError[ContextError["Other"] = 2] = "Other";
})(exports.ContextError || (exports.ContextError = {}));

var ContextVertexBuffers = function ContextVertexBuffers() {};

var Context = /*#__PURE__*/function () {
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
    } catch (e) {// console.error('GlslCanvas.Context.getContext2_.error', e);
    }

    return context;
  };

  Context.getFragmentVertex = function getFragmentVertex(gl, fragmentString) {
    var vertexString;

    if (fragmentString) {
      var version = Context.inferVersion(fragmentString);

      if (version === exports.ContextVersion.WebGl2) {
        fragmentString = fragmentString.replace(/^\#version\s*300\s*es.*?\n/, '');
      }

      var regexp = /(?:^\s*)((?:#if|#elif)(?:\s*)(defined\s*\(\s*VERTEX)(?:\s*\))|(?:#ifdef)(?:\s*VERTEX)(?:\s*))/gm;
      var matches = regexp.exec(fragmentString);

      if (matches !== null) {
        vertexString = version === exports.ContextVersion.WebGl2 ? "#version 300 es\n#define VERTEX\n" + fragmentString : "#define VERTEX\n" + fragmentString;
      }
    }

    return vertexString;
  };

  Context.getIncludes = function getIncludes(input, workpath) {
    if (workpath === void 0) {
      workpath = '';
    }

    if (input === undefined) {
      return Promise.resolve(input);
    }

    var regex = /#include\s*['|"](.*.glsl)['|"]/gm;
    var promises = [];
    var i = 0;
    var match;

    var _loop = function _loop() {
      promises.push(Promise.resolve(input.slice(i, match.index)));
      i = match.index + match[0].length;
      var filePath = match[1];
      var url = Common.getResource(filePath, workpath);
      var nextWorkpath = filePath.indexOf(':/') === -1 ? Common.dirname(url) : '';
      promises.push(Common.fetch(url).then(function (input) {
        return Context.getIncludes(input, nextWorkpath);
      }));
    };

    while ((match = regex.exec(input)) !== null) {
      _loop();
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
    // console.log(context);
    // return context !== undefined && typeof (context as any).bindBufferRange === 'function';
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

  Context.inferPrecision = function inferPrecision(fragmentString) {
    var precision = fragmentString.match(/precision\s+(.+)\s+float/);

    if (precision && precision.length > 1) {
      Context.precision = precision[1];
    } // console.log('precision', Context.precision);


    return Context.precision;
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

  Context.getBufferVertex = function getBufferVertex(gl) {
    return this.isWebGl2(gl) ? DefaultWebGL2BufferVertex : DefaultWebGLBufferVertex;
  };

  Context.getVertex = function getVertex(vertexString, fragmentString, mode) {
    if (mode === void 0) {
      mode = ContextMode.Flat;
    }

    if (vertexString) {
      return vertexString;
    } else {
      var version = this.inferVersion(vertexString, fragmentString);
      return ContextDefault[version][mode === ContextMode.Flat ? 'flat' : 'mesh'].vertex;
    }
  };

  Context.getFragment = function getFragment(vertexString, fragmentString, mode) {
    if (mode === void 0) {
      mode = ContextMode.Flat;
    }

    if (fragmentString) {
      return fragmentString;
    } else {
      var version = this.inferVersion(vertexString, fragmentString);
      return ContextDefault[version][mode === ContextMode.Flat ? 'flat' : 'mesh'].fragment;
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
      }); // context.getExtension('OES_standard_derivatives');
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
    source = source.replace(/precision\s+(.+)\s+float/, "precision " + Context.precision + " float");
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

    if (!compiled) {
      // Something went wrong during compilation; get the error
      Context.lastError = gl.getShaderInfoLog(shader); // console.log('lastError', Context.lastError);

      Logger.error("*** Error compiling shader: " + Context.lastError); // main.trigger('error', {

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
    gl.validateProgram(program); // Check the link status

    var linked = gl.getProgramParameter(program, gl.LINK_STATUS);

    if (!linked) {
      // something went wrong with the link
      Context.lastError = gl.getProgramInfoLog(program);
      Logger.error("Error in program linking: " + Context.lastError);
      gl.deleteProgram(program);
      return null;
    }

    gl.useProgram(program);
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
Context.precision = ContextPrecision.MediumP;
Context.lastError = '';var StringMap = function StringMap() {};

var IterableStringMap = /*#__PURE__*/function () {
  function IterableStringMap() {
    this.values = new StringMap();
  }

  var _proto = IterableStringMap.prototype;

  _proto.has = function has(key) {
    return key in this.values; // return this.values.hasOwnProperty(key);
  };

  _proto.set = function set(key, item) {
    this.values[key] = item;
  };

  _proto.get = function get(key) {
    return this.values[key];
  };

  _proto.forEach = function forEach(callbackfn) {
    var _this = this;

    var i = 0;
    Object.keys(this.values).forEach(function (key) {
      callbackfn(_this.values[key], i, _this.values);
      i++;
    });
  };

  _proto.reduce = function reduce(callbackfn, initialValue) {
    var _this2 = this;

    var previous = initialValue,
        i = 0;
    Object.keys(this.values).forEach(function (key) {
      previous = callbackfn(previous, _this2.values[key], i, _this2.values);
      i++;
    });
    return previous;
  };

  return IterableStringMap;
}();var Geometry = /*#__PURE__*/function () {
  function Geometry(options) {
    if (options) {
      Object.assign(this, options);

      if (this.positions) {
        this.size = this.positions.length / 3;
      } // this.positions = Geometry.fromIndices(options.indices, options.positions, 3);
      // this.normals = Geometry.fromIndices(options.indices, options.normals, 3);
      // this.texcoords = Geometry.fromIndices(options.indices, options.texcoords, 2);
      // this.colors = Geometry.fromIndices(options.indices, options.colors, 4);

    }
  }

  var _proto = Geometry.prototype;

  _proto.create = function create(gl, program) {
    this.createData_();
    this.createAttributes_(gl, program);
  };

  _proto.createBufferData_ = function createBufferData_(gl, type, array) {
    var buffer = gl.createBuffer();
    gl.bindBuffer(type, buffer);
    gl.bufferData(type, array, gl.STATIC_DRAW);
    return buffer;
  };

  _proto.createAttribLocation_ = function createAttribLocation_(gl, program, name, size, type) {
    var location = gl.getAttribLocation(program, name);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, size, type, false, 0, 0);
    return location;
  };

  _proto.createAttributes_ = function createAttributes_(gl, program) {
    if (this.positions) {
      this.positionBuffer = this.createBufferData_(gl, gl.ARRAY_BUFFER, new Float32Array(this.positions));
      this.positionLocation = this.createAttribLocation_(gl, program, 'a_position', this.positions.length / this.size, gl.FLOAT);
      gl.bindAttribLocation(program, this.positionLocation, 'a_position');
    }

    if (this.texcoords) {
      this.texcoordBuffer = this.createBufferData_(gl, gl.ARRAY_BUFFER, new Float32Array(this.texcoords));
      this.texcoordLocation = this.createAttribLocation_(gl, program, 'a_texcoord', this.texcoords.length / this.size, gl.FLOAT);
      gl.bindAttribLocation(program, this.texcoordLocation, 'a_texcoord');
    }

    if (this.normals) {
      this.normalBuffer = this.createBufferData_(gl, gl.ARRAY_BUFFER, new Float32Array(this.normals));
      this.normalLocation = this.createAttribLocation_(gl, program, 'a_normal', this.normals.length / this.size, gl.FLOAT);
      gl.bindAttribLocation(program, this.normalLocation, 'a_normal');
    }

    if (this.colors) {
      this.colorBuffer = this.createBufferData_(gl, gl.ARRAY_BUFFER, new Float32Array(this.colors));
      this.colorLocation = this.createAttribLocation_(gl, program, 'a_color', this.colors.length / this.size, gl.FLOAT);
      gl.bindAttribLocation(program, this.colorLocation, 'a_color');
    } // console.log('positionLocation', this.positionLocation);
    // console.log('texcoordLocation', this.texcoordLocation);
    // console.log('normalLocation', this.normalLocation);
    // console.log('colorLocation', this.colorLocation);

  };

  _proto.attachAttributes_ = function attachAttributes_(gl, program) {
    var attribLocation;

    if (this.positions) {
      // this.positionLocation = this.createAttribLocation_(gl, program, 'a_position', this.positions.length / this.size, gl.FLOAT);
      attribLocation = gl.getAttribLocation(program, 'a_position');
      gl.enableVertexAttribArray(attribLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
      gl.vertexAttribPointer(attribLocation, this.positions.length / this.size, gl.FLOAT, false, 0, 0); // gl.bindAttribLocation(program, this.positionLocation, 'a_position');
      // console.log('positionLocation', attribLocation);
    }

    if (this.texcoords) {
      // this.texcoordLocation = this.createAttribLocation_(gl, program, 'a_texcoord', this.texcoords.length / this.size, gl.FLOAT);
      attribLocation = gl.getAttribLocation(program, 'a_texcoord');
      gl.enableVertexAttribArray(this.texcoordLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);
      gl.vertexAttribPointer(this.texcoordLocation, this.texcoords.length / this.size, gl.FLOAT, false, 0, 0); // gl.bindAttribLocation(program, this.texcoordLocation, 'a_texcoord');
      // console.log('texcoordLocation', attribLocation);
    }

    if (this.normals) {
      // this.normalLocation = this.createAttribLocation_(gl, program, 'a_normal', this.normals.length / this.size, gl.FLOAT);
      attribLocation = gl.getAttribLocation(program, 'a_normal');
      gl.enableVertexAttribArray(this.normalLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
      gl.vertexAttribPointer(this.normalLocation, this.normals.length / this.size, gl.FLOAT, false, 0, 0); // gl.bindAttribLocation(program, this.normalLocation, 'a_normal');
      // console.log('normalLocation', attribLocation);
    }

    if (this.colors) {
      // this.colorLocation = this.createAttribLocation_(gl, program, 'a_color', this.colors.length / this.size, gl.FLOAT);
      attribLocation = gl.getAttribLocation(program, 'a_color');
      gl.enableVertexAttribArray(this.colorLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
      gl.vertexAttribPointer(this.colorLocation, this.colors.length / this.size, gl.FLOAT, false, 0, 0); // gl.bindAttribLocation(program, this.colorLocation, 'a_color');
      // console.log('colorLocation', attribLocation);
    }
  };

  _proto.bindAttributes_ = function bindAttributes_(gl, program) {
    if (this.positions) {
      gl.bindAttribLocation(program, this.positionLocation, 'a_position');
    }

    if (this.texcoords) {
      gl.bindAttribLocation(program, this.texcoordLocation, 'a_texcoord');
    }

    if (this.normals) {
      gl.bindAttribLocation(program, this.normalLocation, 'a_normal');
    }

    if (this.colors) {
      gl.bindAttribLocation(program, this.colorLocation, 'a_color');
    }
  };

  _proto.createData_ = function createData_() {
    // Now create an array of positions for the cube.
    this.positions = [];
    this.normals = [];
    this.texcoords = [];
    this.colors = [];
    this.size = 0; // console.log('positions', this.positions.length);
    // console.log('normals', this.normals.length);
    // console.log('texcoords', this.texcoords.length);
    // console.log('colors', this.colors.length);
  };

  Geometry.fromIndices = function fromIndices(indices, array, size) {
    var buffer = [];
    indices.forEach(function (i) {
      buffer.push.apply(buffer, array.slice(i * size, i * size + size));
    });
    return buffer;
  };

  return Geometry;
}();var FlatGeometry = /*#__PURE__*/function (_Geometry) {
  _inheritsLoose(FlatGeometry, _Geometry);

  function FlatGeometry() {
    return _Geometry.apply(this, arguments) || this;
  }

  var _proto = FlatGeometry.prototype;

  _proto.createData_ = function createData_() {
    this.size = 6;
    this.positions = [-1.0, -1.0, 0.0, 1.0, -1.0, 0.0, 1.0, 1.0, 0.0, -1.0, -1.0, 0.0, 1.0, 1.0, 0.0, -1.0, 1.0, 0.0];
    this.texcoords = [0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0];
    this.normals = [0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0];
    this.colors = [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]; // console.log('positions', this.positions.length);
    // console.log('normals', this.normals.length);
    // console.log('texcoords', this.texcoords.length);
    // console.log('colors', this.colors.length);
  };

  return FlatGeometry;
}(Geometry);(function (BufferFloatType) {
  BufferFloatType[BufferFloatType["FLOAT"] = 0] = "FLOAT";
  BufferFloatType[BufferFloatType["HALF_FLOAT"] = 1] = "HALF_FLOAT";
})(exports.BufferFloatType || (exports.BufferFloatType = {}));

var Buffer = /*#__PURE__*/function () {
  function Buffer(gl, BW, BH, index) {
    var buffer = gl.createFramebuffer();
    var texture = Buffer.getTexture(gl, BW, BH, index);
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

  Buffer.getFloatType = function getFloatType(gl) {
    var extension;

    if (Context.isWebGl2(gl)) {
      extension = gl.getExtension('EXT_color_buffer_float');

      if (extension) {
        return gl.FLOAT;
      }
    }

    extension = gl.getExtension('OES_texture_float');

    if (extension) {
      return gl.FLOAT;
    }

    return null;
  };

  Buffer.getHalfFloatType = function getHalfFloatType(gl) {
    var extension;

    if (Context.isWebGl2(gl)) {
      extension = gl.getExtension('EXT_color_buffer_half_float') || gl.getExtension('EXT_color_buffer_float');

      if (extension) {
        return gl.HALF_FLOAT;
      }
    }

    extension = gl.getExtension('OES_texture_half_float');

    if (extension) {
      return extension.HALF_FLOAT_OES || null;
    }

    return null;
  };

  Buffer.getInternalFormat = function getInternalFormat(gl) {
    return Context.isWebGl2(gl) ? gl.RGBA16F : gl.RGBA;
  };

  Buffer.getType = function getType(gl) {
    var type;

    if (Buffer.type === exports.BufferFloatType.HALF_FLOAT) {
      type = Buffer.getHalfFloatType(gl);

      if (type) {
        return type;
      } else {
        Buffer.type = exports.BufferFloatType.FLOAT;
        return Buffer.getType(gl);
      }
    } else {
      type = Buffer.getFloatType(gl);

      if (type) {
        return type;
      } else {
        Buffer.type = exports.BufferFloatType.HALF_FLOAT;
        return Buffer.getType(gl);
      }
    }
  };

  Buffer.getTexture = function getTexture(gl, BW, BH, index) {
    var internalFormat = Buffer.getInternalFormat(gl);
    var format = gl.RGBA;
    var type = Buffer.getType(gl);
    var texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + index);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, BW, BH, 0, format, type, null);
    var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);

    if (status !== gl.FRAMEBUFFER_COMPLETE) {
      if (Buffer.type === exports.BufferFloatType.FLOAT) {
        Buffer.type = exports.BufferFloatType.HALF_FLOAT;
      } else {
        Buffer.type = exports.BufferFloatType.FLOAT;
      }

      return Buffer.getTexture(gl, BW, BH, index);
    } // console.log('getTexture', 'internalFormat', internalFormat === (gl as WebGL2RenderingContext).RGBA16F, 'format', format === gl.RGBA, 'type', type === (gl as WebGL2RenderingContext).HALF_FLOAT, 'status', status === gl.FRAMEBUFFER_COMPLETE);


    return texture;
  };

  var _proto = Buffer.prototype;

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
      var type = Buffer.getType(gl);

      if (status === gl.FRAMEBUFFER_COMPLETE) {
        pixels = new Float32Array(minW * minH * 4);
        gl.readPixels(0, 0, minW, minH, gl.RGBA, type, pixels);
      }

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      var newIndex = index + 1; // temporary index

      var newTexture = Buffer.getTexture(gl, BW, BH, newIndex);
      type = Buffer.getType(gl);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      if (pixels) {
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, minW, minH, gl.RGBA, type, pixels);
      }

      var newBuffer = gl.createFramebuffer();
      /*
      if (!newBuffer) {
          Logger.error('Failed to create the frame buffer object');
          return null;
      }
      */

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.deleteTexture(texture);
      gl.activeTexture(gl.TEXTURE0 + index);
      gl.bindTexture(gl.TEXTURE_2D, newTexture);
      this.index = index;
      this.texture = newTexture;
      this.buffer = newBuffer;
      this.BW = BW;
      this.BH = BH; // console.log('resize', newBuffer);
    }
  };

  return Buffer;
}();
Buffer.type = exports.BufferFloatType.HALF_FLOAT;
var IOBuffer = /*#__PURE__*/function () {
  function IOBuffer(index, key, vertexString, fragmentString) {
    this.isValid = false;
    this.index = index;
    this.key = key;
    this.vertexString = vertexString;
    this.fragmentString = fragmentString;
    this.geometry = new FlatGeometry();
  }

  var _proto2 = IOBuffer.prototype;

  _proto2.create = function create(gl, BW, BH) {
    // BW = BH = 1024;
    var vertexShader = Context.createShader(gl, this.vertexString, gl.VERTEX_SHADER);
    var fragmentShader = Context.createShader(gl, this.fragmentString, gl.FRAGMENT_SHADER, 1);

    if (!fragmentShader) {
      fragmentShader = Context.createShader(gl, Context.isWebGl2(gl) ? DefaultWebGL2BufferFragment : DefaultWebGLBufferFragment, gl.FRAGMENT_SHADER);
      this.isValid = false;
    } else {
      this.isValid = true;
    }

    var program = Context.createProgram(gl, [vertexShader, fragmentShader]);

    if (!program) {
      this.isValid = false;
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      return;
    }

    this.geometry.create(gl, program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    var input = new Buffer(gl, BW, BH, this.index + 0);
    var output = new Buffer(gl, BW, BH, this.index + 2);
    this.program = program;
    this.input = input;
    this.output = output; // console.log(geometry.position.length / 3, geometry.size);
    // console.log(gl.getProgramInfoLog(program));
    // Context.lastError = gl.getProgramInfoLog(program);
    // Logger.warn(`Error in program linking: ${Context.lastError}`);
  };

  _proto2.render = function render(gl, BW, BH) {
    // BW = BH = 1024;
    gl.useProgram(this.program); // gl.activeTexture(gl.TEXTURE0);
    // gl.bindTexture(gl.TEXTURE_2D, this.input.texture);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.output.buffer); // gl.bindTexture(gl.TEXTURE_2D, this.output.texture);
    // console.log(this.output.texture);
    // console.log('binding', gl.getParameter(gl.FRAMEBUFFER_BINDING));
    // gl.enable(gl.DEPTH_TEST); // Enable depth testing
    // gl.depthFunc(gl.LEQUAL); // Near things obscure far things

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.output.texture, 0);
    var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);

    if (status === gl.FRAMEBUFFER_COMPLETE) {
      // Clear the canvas before we start drawing on it.
      gl.clearColor(0, 0, 0, 1); // black

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    } // this.geometry.createAttributes_(gl, this.program);
    // this.geometry.bindAttributes_(gl, this.program);


    gl.viewport(0, 0, BW, BH);
    gl.drawArrays(gl.TRIANGLES, 0, this.geometry.size); // console.log(this.geometry.size);
    // gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    // console.log(BW, BH);
    // console.log(gl.getProgramInfoLog(this.program));
    // swap

    var input = this.input; // const output = this.output;

    this.input = this.output;
    this.output = input; // console.log('swap');
  };

  _proto2.resize = function resize(gl, BW, BH) {
    // BW = BH = 1024;
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

var Buffers = /*#__PURE__*/function (_IterableStringMap) {
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

        if (buffer.program) {
          buffers.set(key, buffer);
        } else {
          throw "buffer error " + key;
        }

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
}(IterableStringMap);var Vector2 = /*#__PURE__*/function () {
  function Vector2(x, y) {
    if (x === void 0) {
      x = 0;
    }

    if (y === void 0) {
      y = 0;
    }

    this.isVector2 = true;
    this.x = x;
    this.y = y;
  }

  var _proto = Vector2.prototype;

  _proto.copy = function copy(v) {
    this.x = v.x;
    this.y = v.y;
    return this;
  };

  _proto.length = function length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  };

  _proto.normalize = function normalize() {
    return this.divideScalar(this.length() || 1);
  };

  _proto.divideScalar = function divideScalar(scalar) {
    return this.multiplyScalar(1 / scalar);
  };

  _proto.multiplyScalar = function multiplyScalar(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  };

  _proto.subVectors = function subVectors(a, b) {
    this.x = a.x - b.x;
    this.y = a.y - b.y;
    return this;
  };

  _proto.addVectors = function addVectors(a, b) {
    this.x = a.x + b.x;
    this.y = a.y + b.y;
    return this;
  };

  return Vector2;
}();var Vector3 = /*#__PURE__*/function () {
  function Vector3(x, y, z) {
    if (x === void 0) {
      x = 0;
    }

    if (y === void 0) {
      y = 0;
    }

    if (z === void 0) {
      z = 0;
    }

    this.isVector3 = true;
    this.x = x;
    this.y = y;
    this.z = z;
  }

  var _proto = Vector3.prototype;

  _proto.copy = function copy(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  };

  _proto.length = function length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  };

  _proto.normalize = function normalize() {
    return this.divideScalar(this.length() || 1);
  };

  _proto.divideScalar = function divideScalar(scalar) {
    return this.multiplyScalar(1 / scalar);
  };

  _proto.multiplyScalar = function multiplyScalar(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    this.z *= scalar;
    return this;
  };

  _proto.subVectors = function subVectors(a, b) {
    this.x = a.x - b.x;
    this.y = a.y - b.y;
    this.z = a.z - b.z;
    return this;
  };

  _proto.addVectors = function addVectors(a, b) {
    this.x = a.x + b.x;
    this.y = a.y + b.y;
    this.z = a.z + b.z;
    return this;
  };

  _proto.crossVectors = function crossVectors(a, b) {
    var ax = a.x,
        ay = a.y,
        az = a.z;
    var bx = b.x,
        by = b.y,
        bz = b.z;
    this.x = ay * bz - az * by;
    this.y = az * bx - ax * bz;
    this.z = ax * by - ay * bx;
    return this;
  };

  return Vector3;
}();var PI = Math.PI;
var RAD = PI / 180;

var OrbitCamera = /*#__PURE__*/function (_Vector) {
  _inheritsLoose(OrbitCamera, _Vector);

  function OrbitCamera(theta, phi, radius) {
    var _this;

    _this = _Vector.call(this) || this;
    _this.position = new Vector3();
    _this.value = new Float32Array([0, 0, 0]);
    _this.mouse = null;
    _this.dirty = false;
    _this.theta = (theta || 0) * RAD;
    _this.phi = (phi || 0) * RAD;
    _this.radius = radius || 6.0; // this.update();

    return _this;
  }

  var _proto = OrbitCamera.prototype;

  _proto.down = function down(x, y) {
    this.mouse = new Vector2(x, y);
  };

  _proto.move = function move(x, y) {
    var mouse = this.mouse;

    if (mouse && (mouse.x !== x || mouse.y !== y)) {
      var theta = (x - mouse.x) * 180 * RAD;
      var phi = (y - mouse.y) * 180 * RAD;
      mouse.x = x;
      mouse.y = y;
      this.theta += theta;
      this.phi = Math.max(-60 * RAD, Math.min(60 * RAD, this.phi + phi)); // this.update();
    }
  };

  _proto.up = function up() {
    this.mouse = null;
  };

  _proto.wheel = function wheel(d) {
    this.radius = Math.max(4.0, Math.min(10.0, this.radius + d * 0.02));
  };

  OrbitCamera.fromVector = function fromVector(vector) {
    var radius = vector.length();
    var theta = Math.acos(vector.y / radius); //theta

    var phi = Math.atan(vector.x / vector.z); //phi

    return new OrbitCamera(theta, phi, radius);
  };

  OrbitCamera.toArray = function toArray(camera) {
    var spr = Math.sin(camera.phi) * camera.radius;
    var x = spr * Math.sin(camera.theta);
    var y = Math.cos(camera.phi) * camera.radius;
    var z = spr * Math.cos(camera.theta);
    return [x, y, z];
  };

  return OrbitCamera;
}(Vector3);/**
 * Common utilities
 * @module glMatrix
 */
// Configuration Constants
var EPSILON = 0.000001;
var ARRAY_TYPE = typeof Float32Array !== 'undefined' ? Float32Array : Array;
if (!Math.hypot) Math.hypot = function () {
  var y = 0,
      i = arguments.length;

  while (i--) {
    y += arguments[i] * arguments[i];
  }

  return Math.sqrt(y);
};/**
 * 4x4 Matrix<br>Format: column-major, when typed out it looks like row-major<br>The matrices are being post multiplied.
 * @module mat4
 */

/**
 * Creates a new identity mat4
 *
 * @returns {mat4} a new 4x4 matrix
 */

function create() {
  var out = new ARRAY_TYPE(16);

  if (ARRAY_TYPE != Float32Array) {
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
  }

  out[0] = 1;
  out[5] = 1;
  out[10] = 1;
  out[15] = 1;
  return out;
}
/**
 * Set a mat4 to the identity matrix
 *
 * @param {mat4} out the receiving matrix
 * @returns {mat4} out
 */

function identity(out) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
/**
 * Transpose the values of a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the source matrix
 * @returns {mat4} out
 */

function transpose(out, a) {
  // If we are transposing ourselves we can skip a few steps but have to cache some values
  if (out === a) {
    var a01 = a[1],
        a02 = a[2],
        a03 = a[3];
    var a12 = a[6],
        a13 = a[7];
    var a23 = a[11];
    out[1] = a[4];
    out[2] = a[8];
    out[3] = a[12];
    out[4] = a01;
    out[6] = a[9];
    out[7] = a[13];
    out[8] = a02;
    out[9] = a12;
    out[11] = a[14];
    out[12] = a03;
    out[13] = a13;
    out[14] = a23;
  } else {
    out[0] = a[0];
    out[1] = a[4];
    out[2] = a[8];
    out[3] = a[12];
    out[4] = a[1];
    out[5] = a[5];
    out[6] = a[9];
    out[7] = a[13];
    out[8] = a[2];
    out[9] = a[6];
    out[10] = a[10];
    out[11] = a[14];
    out[12] = a[3];
    out[13] = a[7];
    out[14] = a[11];
    out[15] = a[15];
  }

  return out;
}
/**
 * Inverts a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the source matrix
 * @returns {mat4} out
 */

function invert(out, a) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a03 = a[3];
  var a10 = a[4],
      a11 = a[5],
      a12 = a[6],
      a13 = a[7];
  var a20 = a[8],
      a21 = a[9],
      a22 = a[10],
      a23 = a[11];
  var a30 = a[12],
      a31 = a[13],
      a32 = a[14],
      a33 = a[15];
  var b00 = a00 * a11 - a01 * a10;
  var b01 = a00 * a12 - a02 * a10;
  var b02 = a00 * a13 - a03 * a10;
  var b03 = a01 * a12 - a02 * a11;
  var b04 = a01 * a13 - a03 * a11;
  var b05 = a02 * a13 - a03 * a12;
  var b06 = a20 * a31 - a21 * a30;
  var b07 = a20 * a32 - a22 * a30;
  var b08 = a20 * a33 - a23 * a30;
  var b09 = a21 * a32 - a22 * a31;
  var b10 = a21 * a33 - a23 * a31;
  var b11 = a22 * a33 - a23 * a32; // Calculate the determinant

  var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

  if (!det) {
    return null;
  }

  det = 1.0 / det;
  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
  out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
  out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
  out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
  out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
  out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
  out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
  out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
  out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
  out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
  out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
  out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
  return out;
}
/**
 * Translate a mat4 by the given vector
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the matrix to translate
 * @param {ReadonlyVec3} v vector to translate by
 * @returns {mat4} out
 */

function translate(out, a, v) {
  var x = v[0],
      y = v[1],
      z = v[2];
  var a00, a01, a02, a03;
  var a10, a11, a12, a13;
  var a20, a21, a22, a23;

  if (a === out) {
    out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
    out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
    out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
    out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
  } else {
    a00 = a[0];
    a01 = a[1];
    a02 = a[2];
    a03 = a[3];
    a10 = a[4];
    a11 = a[5];
    a12 = a[6];
    a13 = a[7];
    a20 = a[8];
    a21 = a[9];
    a22 = a[10];
    a23 = a[11];
    out[0] = a00;
    out[1] = a01;
    out[2] = a02;
    out[3] = a03;
    out[4] = a10;
    out[5] = a11;
    out[6] = a12;
    out[7] = a13;
    out[8] = a20;
    out[9] = a21;
    out[10] = a22;
    out[11] = a23;
    out[12] = a00 * x + a10 * y + a20 * z + a[12];
    out[13] = a01 * x + a11 * y + a21 * z + a[13];
    out[14] = a02 * x + a12 * y + a22 * z + a[14];
    out[15] = a03 * x + a13 * y + a23 * z + a[15];
  }

  return out;
}
/**
 * Rotates a mat4 by the given angle around the given axis
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @param {ReadonlyVec3} axis the axis to rotate around
 * @returns {mat4} out
 */

function rotate(out, a, rad, axis) {
  var x = axis[0],
      y = axis[1],
      z = axis[2];
  var len = Math.hypot(x, y, z);
  var s, c, t;
  var a00, a01, a02, a03;
  var a10, a11, a12, a13;
  var a20, a21, a22, a23;
  var b00, b01, b02;
  var b10, b11, b12;
  var b20, b21, b22;

  if (len < EPSILON) {
    return null;
  }

  len = 1 / len;
  x *= len;
  y *= len;
  z *= len;
  s = Math.sin(rad);
  c = Math.cos(rad);
  t = 1 - c;
  a00 = a[0];
  a01 = a[1];
  a02 = a[2];
  a03 = a[3];
  a10 = a[4];
  a11 = a[5];
  a12 = a[6];
  a13 = a[7];
  a20 = a[8];
  a21 = a[9];
  a22 = a[10];
  a23 = a[11]; // Construct the elements of the rotation matrix

  b00 = x * x * t + c;
  b01 = y * x * t + z * s;
  b02 = z * x * t - y * s;
  b10 = x * y * t - z * s;
  b11 = y * y * t + c;
  b12 = z * y * t + x * s;
  b20 = x * z * t + y * s;
  b21 = y * z * t - x * s;
  b22 = z * z * t + c; // Perform rotation-specific matrix multiplication

  out[0] = a00 * b00 + a10 * b01 + a20 * b02;
  out[1] = a01 * b00 + a11 * b01 + a21 * b02;
  out[2] = a02 * b00 + a12 * b01 + a22 * b02;
  out[3] = a03 * b00 + a13 * b01 + a23 * b02;
  out[4] = a00 * b10 + a10 * b11 + a20 * b12;
  out[5] = a01 * b10 + a11 * b11 + a21 * b12;
  out[6] = a02 * b10 + a12 * b11 + a22 * b12;
  out[7] = a03 * b10 + a13 * b11 + a23 * b12;
  out[8] = a00 * b20 + a10 * b21 + a20 * b22;
  out[9] = a01 * b20 + a11 * b21 + a21 * b22;
  out[10] = a02 * b20 + a12 * b21 + a22 * b22;
  out[11] = a03 * b20 + a13 * b21 + a23 * b22;

  if (a !== out) {
    // If the source and destination differ, copy the unchanged last row
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }

  return out;
}
/**
 * Generates a perspective projection matrix with the given bounds.
 * Passing null/undefined/no value for far will generate infinite projection matrix.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} fovy Vertical field of view in radians
 * @param {number} aspect Aspect ratio. typically viewport width/height
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum, can be null or Infinity
 * @returns {mat4} out
 */

function perspective(out, fovy, aspect, near, far) {
  var f = 1.0 / Math.tan(fovy / 2),
      nf;
  out[0] = f / aspect;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = f;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[15] = 0;

  if (far != null && far !== Infinity) {
    nf = 1 / (near - far);
    out[10] = (far + near) * nf;
    out[14] = 2 * far * near * nf;
  } else {
    out[10] = -1;
    out[14] = -2 * near;
  }

  return out;
}var CanvasTimer = /*#__PURE__*/function () {
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
    } // Logger.log(this.delay);


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
}();var Listener = function Listener(event, callback) {
  this.event = event;
  this.callback = callback;
};

var Subscriber = /*#__PURE__*/function () {
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
}();var BoxGeometry = /*#__PURE__*/function (_Geometry) {
  _inheritsLoose(BoxGeometry, _Geometry);

  function BoxGeometry() {
    return _Geometry.apply(this, arguments) || this;
  }

  var _proto = BoxGeometry.prototype;

  _proto.createData_ = function createData_() {
    this.size = 36; // Now create an array of positions for the cube.

    this.positions = [// Front face
    -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, // Back face
    -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, // Top face
    -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, // Bottom face
    -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, // Right face
    1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, // Left face
    -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0];
    this.texcoords = [// Front
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, // Back
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, // Top
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, // Bottom
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, // Right
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, // Left
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0];
    this.normals = [// Front
    0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, // Back
    0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, // Top
    0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, // Bottom
    0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, // Right
    1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, // Left
    -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0]; // Now set up the colors for the faces. We'll use solid colors
    // for each face.

    var faceColors = [[1.0, 1.0, 1.0, 1.0], [1.0, 0.0, 0.0, 1.0], [0.0, 1.0, 0.0, 1.0], [0.0, 0.0, 1.0, 1.0], [1.0, 1.0, 0.0, 1.0], [1.0, 0.0, 1.0, 1.0]]; // Convert the array of colors into a table for all the vertices.

    var colors = [];

    for (var j = 0; j < faceColors.length; ++j) {
      var c = faceColors[j]; // Repeat each color four times for the four vertices of the face

      colors = colors.concat(c, c, c, c, c, c);
    }

    this.colors = colors; // console.log('positions', this.positions.length);
    // console.log('normals', this.normals.length);
    // console.log('texcoords', this.texcoords.length);
    // console.log('colors', this.colors.length);
  };

  return BoxGeometry;
}(Geometry);var SphereGeometry = /*#__PURE__*/function (_Geometry) {
  _inheritsLoose(SphereGeometry, _Geometry);

  function SphereGeometry() {
    return _Geometry.apply(this, arguments) || this;
  }

  var _proto = SphereGeometry.prototype;

  _proto.createData_ = function createData_() {
    var radius = 1.4;
    var widthDivisions = 80;
    var heightDivisions = 60;
    var phiStart = 0;
    var phiLength = Math.PI * 2;
    var thetaStart = 0;
    var thetaLength = Math.PI;
    var p = new Vector3();
    var n = new Vector3(); // buffers

    var indices = [];
    var positions = [];
    var normals = [];
    var texcoords = [];
    var colors = []; //

    var thetaEnd = Math.min(thetaStart + thetaLength, Math.PI);
    var ix, iy;
    var index = 0;
    var grid = []; // generate positions, normals and uvs

    for (iy = 0; iy <= heightDivisions; iy++) {
      var positionRow = [];
      var v = iy / heightDivisions; // special case for the poles

      var uOffset = 0;

      if (iy == 0 && thetaStart == 0) {
        uOffset = 0.5 / widthDivisions;
      } else if (iy == heightDivisions && thetaEnd == Math.PI) {
        uOffset = -0.5 / widthDivisions;
      }

      for (ix = 0; ix <= widthDivisions; ix++) {
        var u = ix / widthDivisions; // position

        p.x = -radius * Math.cos(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);
        p.y = radius * Math.cos(thetaStart + v * thetaLength);
        p.z = radius * Math.sin(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);
        positions.push(p.x, p.y, p.z); // normal

        n.copy(p).normalize();
        normals.push(n.x, n.y, n.z); // uv

        var uvx = u + uOffset;
        var uvy = 1 - v;
        texcoords.push(uvx, uvy);
        colors.push(1.0, 1.0, 1.0, 1.0);
        positionRow.push(index++);
      }

      grid.push(positionRow);
    } // indices


    for (iy = 0; iy < heightDivisions; iy++) {
      for (ix = 0; ix < widthDivisions; ix++) {
        var a = grid[iy][ix + 1];
        var b = grid[iy][ix];
        var c = grid[iy + 1][ix];
        var d = grid[iy + 1][ix + 1];
        if (iy !== 0 || thetaStart > 0) indices.push(a, b, d);
        if (iy !== heightDivisions - 1 || thetaEnd < Math.PI) indices.push(b, c, d);
      }
    } // build geometry


    this.size = indices.length; // Now create an array of positions for the cube.

    this.positions = Geometry.fromIndices(indices, positions, 3);
    this.texcoords = Geometry.fromIndices(indices, texcoords, 2);
    this.normals = Geometry.fromIndices(indices, normals, 3); // Now set up the colors for the faces. We'll use solid colors
    // for each face.

    this.colors = Geometry.fromIndices(indices, colors, 4); // this.unrapUvw(this.positions);
    // console.log('positions', this.positions.length);
    // console.log('normals', this.normals.length);
    // console.log('texcoords', this.texcoords.length);
    // console.log('colors', this.colors.length);
  };

  return SphereGeometry;
}(Geometry);var TorusGeometry = /*#__PURE__*/function (_Geometry) {
  _inheritsLoose(TorusGeometry, _Geometry);

  function TorusGeometry() {
    return _Geometry.apply(this, arguments) || this;
  }

  var _proto = TorusGeometry.prototype;

  _proto.createData_ = function createData_() {
    var radius = 1;
    var tube = 0.25;
    var tubularDivisions = 200;
    var radialDivisions = 40;
    var p = 2;
    var q = 3;
    var indices = [];
    var positions = [];
    var normals = [];
    var texcoords = [];
    var colors = [];
    var vertex = new Vector3();
    var normal = new Vector3();
    var p1 = new Vector3();
    var p2 = new Vector3();
    var B = new Vector3();
    var T = new Vector3();
    var N = new Vector3();

    for (var i = 0; i <= tubularDivisions; ++i) {
      var u = i / tubularDivisions * p * Math.PI * 2;
      this.calculatePositionOnCurve(u, p, q, radius, p1);
      this.calculatePositionOnCurve(u + 0.01, p, q, radius, p2);
      T.subVectors(p2, p1);
      N.addVectors(p2, p1);
      B.crossVectors(T, N);
      N.crossVectors(B, T);
      B.normalize();
      N.normalize();

      for (var j = 0; j <= radialDivisions; ++j) {
        var v = j / radialDivisions * Math.PI * 2;
        var cx = -tube * Math.cos(v);
        var cy = tube * Math.sin(v);
        vertex.x = p1.x + (cx * N.x + cy * B.x);
        vertex.y = p1.y + (cx * N.y + cy * B.y);
        vertex.z = p1.z + (cx * N.z + cy * B.z);
        positions.push(vertex.x, vertex.y, vertex.z);
        normal.subVectors(vertex, p1).normalize();
        normals.push(normal.x, normal.y, normal.z);
        texcoords.push(i / tubularDivisions * 2.0 * Math.round(q));
        texcoords.push(j / radialDivisions);
        colors.push(1.0, 1.0, 1.0, 1.0);
      }
    }

    for (var _j = 1; _j <= tubularDivisions; _j++) {
      for (var _i = 1; _i <= radialDivisions; _i++) {
        var a = (radialDivisions + 1) * (_j - 1) + (_i - 1);
        var b = (radialDivisions + 1) * _j + (_i - 1);
        var c = (radialDivisions + 1) * _j + _i;
        var d = (radialDivisions + 1) * (_j - 1) + _i;
        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    this.size = indices.length;
    this.positions = Geometry.fromIndices(indices, positions, 3);
    this.texcoords = Geometry.fromIndices(indices, texcoords, 2);
    this.normals = Geometry.fromIndices(indices, normals, 3);
    this.colors = Geometry.fromIndices(indices, colors, 4); // console.log('positions', this.positions.length);
    // console.log('normals', this.normals.length);
    // console.log('texcoords', this.texcoords.length);
    // console.log('colors', this.colors.length);
  };

  _proto.calculatePositionOnCurve = function calculatePositionOnCurve(u, p, q, radius, position) {
    var cu = Math.cos(u);
    var su = Math.sin(u);
    var quOverP = q / p * u;
    var cs = Math.cos(quOverP);
    position.x = radius * (2 + cs) * 0.5 * cu;
    position.y = radius * (2 + cs) * su * 0.5;
    position.z = radius * Math.sin(quOverP) * 0.5;
  };

  return TorusGeometry;
}(Geometry);var COLORS = [[1, 1, 1], [1, 0, 0], [0, 1, 0], [0, 0, 1], [1, 1, 0], [0, 1, 1]];
var CI = 0;

var ObjLoader = /*#__PURE__*/function () {
  function ObjLoader() {}

  var _proto = ObjLoader.prototype;

  _proto.load = function load(url) {
    var _this = this;

    return new Promise(function (resolve, reject) {
      Common.fetch(url) // .then((response) => response.text())
      .then(function (text) {
        // console.log(text);
        var data = _this.parse(text);

        if (data.positions.length) {
          var geometry = new Geometry(data);
          resolve(geometry);
        } else {
          reject("ObjLoader error: empty positions " + url);
        }
      }, function (error) {
        console.log('ObjLoader error:', error, url);
        reject(error);
      });
    });
  };

  _proto.parseIndices = function parseIndices(faceIndices, k, l, source, output, name) {
    var i = 0;

    while (i <= faceIndices.length - 3) {
      var a = void 0,
          b = void 0,
          c = void 0;

      if (i === 0) {
        a = i;
        b = i + 1;
        c = i + 2;
      } else {
        a = i - 1;
        b = i + 1;
        c = i + 2;
      }

      i++;
      var indices = [a, b, c];

      for (var j = 0; j < indices.length; j++) {
        var index = faceIndices[indices[j]][k];
        var values = void 0;

        if (index && index !== NaN) {
          values = source[index - 1];

          if (values) {
            values = values.slice(0, l);
            output.push.apply(output, values);
          }
          /*
          else {
              // console.log('error', name, source.length, index - 1);
          }
          */

        }
        /*
        else {
            values = new Array(l).fill(0);
            output.push.apply(output, values);
        }
        */

      }
    }
  };

  _proto.parseFaces = function parseFaces(F, V, VN, VT, positions, normals, texcoords, colors) {
    var _this2 = this;

    var si = positions.length;
    F.forEach(function (faceIndices) {
      // console.log(faceIndices);
      _this2.parseIndices(faceIndices, 0, 3, V, positions, 'positions');

      _this2.parseIndices(faceIndices, 2, 3, VN, normals, 'normals');

      _this2.parseIndices(faceIndices, 1, 2, VT, texcoords, 'texcoords');
    });
    var vl = positions.length - si;

    if (vl > 0) {
      // console.log(faceIndices.length - 2);
      var c = new Array(vl / 3).fill(0);
      c.forEach(function () {
        var rgb = COLORS[CI % COLORS.length];
        colors.push(rgb[0], rgb[1], rgb[2], 1.0);
      });
      CI++; // console.log(positions.length, normals.length, texcoords.length, colors.length, positions.length / 3 * 2 === texcoords.length, positions.length / 3 * 4 === colors.length);
    }
  };

  _proto.parse = function parse(text) {
    var _this3 = this;

    var positions = [],
        normals = [],
        texcoords = [],
        colors = [];
    CI = 0;
    var V = [],
        VN = [],
        VT = [],
        F = [];

    if (text.indexOf('\r\n') !== -1) {
      text = text.replace(/\r\n/g, '\n');
    }
    /*
    if (text.indexOf('\\\n') !== - 1) {
        text = text.replace(/\\\n/g, '');
    }
    */


    text = text.replace(/  /g, ' ');
    var lines = text.split('\n');
    lines.forEach(function (line, i) {
      if (line.indexOf('v ') === 0) {
        if (F.length) {
          _this3.parseFaces(F, V, VN, VT, positions, normals, texcoords, colors);

          F = []; // V = [];
          // VN = [];
          // VT = [];
        } // v  0.0012 -0.0055 0.0090


        var a = line.replace('v', '').trim().split(' ');
        var v = a.map(function (x) {
          return parseFloat(x);
        });
        V.push(v);
      } else if (line.indexOf('vn ') === 0) {
        // vn 0.0128 0.9896 0.1431
        var _a = line.replace('vn', '').trim().split(' ');

        var _v = _a.map(function (x) {
          return parseFloat(x);
        });

        var n = new Vector3(_v[0], _v[1], _v[2]).normalize();
        VN.push([n.x, n.y, n.z]);
      } else if (line.indexOf('vt ') === 0) {
        // vt 0.5955 0.0054 0.0000
        var _a2 = line.replace('vt', '').trim().split(' ');

        var _v2 = _a2.map(function (x) {
          return parseFloat(x);
        });

        VT.push(_v2);
      } else if (line.indexOf('f ') === 0) {
        // f 1//1 2//2 3//3 4//4
        var _a3 = line.replace('f', '').trim().split(' ');

        var f = _a3.map(function (x) {
          var indices = x.split('/').map(function (y) {
            return parseInt(y);
          });

          if (indices.length === 2) {
            indices.push(null);
          }

          return indices;
        });

        F[F.length] = f;
      }
    });

    if (F.length) {
      this.parseFaces(F, V, VN, VT, positions, normals, texcoords, colors);
    }

    var boundingBox = {
      min: new Vector3(Number.POSITIVE_INFINITY),
      max: new Vector3(Number.NEGATIVE_INFINITY)
    };

    for (var i = 0; i < positions.length; i += 3) {
      boundingBox.min.x = Math.min(boundingBox.min.x, positions[i]);
      boundingBox.min.y = Math.min(boundingBox.min.y, positions[i + 1]);
      boundingBox.min.z = Math.min(boundingBox.min.z, positions[i + 2]);
      boundingBox.max.x = Math.max(boundingBox.max.x, positions[i]);
      boundingBox.max.y = Math.max(boundingBox.max.y, positions[i + 1]);
      boundingBox.max.z = Math.max(boundingBox.max.z, positions[i + 2]);
    }
    var dx = -(boundingBox.min.x + boundingBox.max.x) / 2;
    var dy = -(boundingBox.min.y + boundingBox.max.y) / 2;
    var dz = -(boundingBox.min.z + boundingBox.max.z) / 2; // console.log(dx, dy, dz);

    for (var _i = 0; _i < positions.length; _i += 3) {
      positions[_i] +=  dx ;
      positions[_i + 1] +=  dy ;
      positions[_i + 2] +=  dz ;
    }

    var radius = positions.reduce(function (p, c) {
      return Math.max(p, c);
    }, 0);
    positions.forEach(function (x, i) {
      return positions[i] = x / radius * 2.0;
    });

    if (!normals.length) {
      normals = positions.slice();
    }

    if (!texcoords.length) {
      texcoords = this.unrapUvw(positions);
    }
    /*
    // console.log(positions.length, normals.length, texcoords.length, colors.length,
    //	positions.length / 3 * 2 === texcoords.length,
    //	positions.length / 3 * 4 === colors.length);
    */


    return {
      positions: positions,
      normals: normals,
      texcoords: texcoords,
      colors: colors
    };
  };

  _proto.unrapUvw = function unrapUvw(positions) {
    var texcoords = [];

    for (var i = 0; i < positions.length; i += 3) {
      var v = new Vector3(positions[i], positions[i + 1], positions[i + 2]);
      v.normalize();
      var pitch = Math.asin(-v.y);
      var yaw = Math.atan2(v.x, v.z);
      var tx = 0.5 + pitch / Math.PI; // * 360;

      var ty = 0.5 + yaw / (Math.PI * 2); // * 180;

      texcoords.push(tx, ty);
    }

    return texcoords;
  };

  return ObjLoader;
}();var TextureImageExtensions = ['jpg', 'jpeg', 'png'];
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
} // GL texture wrapper object for keeping track of a global set of textures, keyed by a unique user-defined name

var Texture = /*#__PURE__*/function (_Subscriber) {
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
        urlElementOrData = document.querySelector(urlElementOrData); // Logger.log(urlElementOrData);
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
    } // Default to a 1-pixel black texture so we can safely render while we wait for an image to load
    // See: http://stackoverflow.com/questions/19722247/webgl-wait-for-texture-to-load
    // [255, 255, 255, 255]


    this.setData(gl, 1, 1, new Uint8Array([0, 0, 0, 0]), this.options); // this.bindTexture();
    // this.load(options);
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

    this.url = url; // save URL reference (will be overwritten when element is loaded below)

    this.source = url;
    this.sourceType = exports.TextureSourceType.Url;
    this.options = Object.assign(this.options, options);
    var ext = url.split('?')[0].split('.').pop().toLowerCase();
    var isVideo = TextureVideoExtensions.indexOf(ext) !== -1;
    var src = Common.getResource(url, this.workpath);
    var element;
    var promise;

    if (isVideo) {
      Logger.log('GlslCanvas.setUrl video', src);
      element = document.createElement('video'); // new HTMLVideoElement();

      element.setAttribute('preload', 'auto'); // element.setAttribute('autoplay', 'true');

      element.setAttribute('loop', 'true');
      element.setAttribute('muted', 'true');
      element.setAttribute('playsinline', 'true'); // element.autoplay = true;

      element.loop = true;
      element.muted = true;
      /*
      if (!(Texture.isSafari() && /(?<!http|https):\//.test(url))) {
          element.crossOrigin = 'anonymous';
      }
      */

      promise = this.setElement(gl, element, options);
      element.src = src;
      element.addEventListener('canplay', function () {
        element.play();
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
  };

  _proto.setElement = function setElement(gl, element, options) {
    var _this2 = this;

    if (options === void 0) {
      options = {};
    }

    options = this.options = Object.assign(this.options, options);
    return new Promise(function (resolve, reject) {
      var originalElement = element; // a string element is interpeted as a CSS selector

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
  } // Uploads current image or buffer to the GPU (can be used to update animated textures on the fly)
  ;

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
    this.filtering = filtering; // this.bindTexture();
    // WebGL has strict requirements on non-power-of-2 textures:
    // No mipmaps and must clamp to edge
    // For power-of-2 textures, the following presets are available:
    // mipmap: linear blend from nearest mip
    // linear: linear blend from original image (no mips)
    // nearest: nearest pixel from original image (no mips, 'blocky' look)

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);

    if (this.filtering === exports.TextureFilteringType.MipMap) {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); // TODO: use trilinear filtering by defualt instead?

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

var Textures = /*#__PURE__*/function (_IterableStringMap) {
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
    var _this4 = this;

    Object.keys(this.values).forEach(function (key) {
      _this4.values[key].dirty = false;
    });
    this.dirty = false;
  };

  _proto2.createOrUpdate = function createOrUpdate(gl, key, urlElementOrData, index, options, workpath) {
    var _this5 = this;

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
          var video = texture.source; // Logger.log('video', video);

          video.addEventListener('play', function () {
            // Logger.log('play', texture.key);
            texture.animated = true;
            _this5.animated = true;
          });
          video.addEventListener('pause', function () {
            // Logger.log('pause', texture.key);
            texture.animated = false;
            _this5.animated = _this5.reduce(function (flag, texture) {
              return flag || texture.animated;
            }, false);
          });
          video.addEventListener('seeked', function () {
            // Logger.log('seeked');
            texture.update(gl, texture.options);
            _this5.dirty = true;
          }); // Logger.log('video');

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
      });
    } else {
      return Promise.resolve(texture);
    }
  };

  return Textures;
}(IterableStringMap);(function (UniformMethod) {
  UniformMethod[UniformMethod["Unknown"] = 0] = "Unknown";
  UniformMethod["Uniform1i"] = "uniform1i"; // Uniform1i  = 'uniform1i', // (boolUniformLoc,   v);                // for bool
  // Uniform1i  = 'uniform1i', // (sampler2DUniformLoc,   v);           // for sampler2D
  // Uniform1i  = 'uniform1i', // (samplerCubeUniformLoc,   v);         // for samplerCube

  UniformMethod["Uniform2i"] = "uniform2i";
  UniformMethod["Uniform3i"] = "uniform3i";
  UniformMethod["Uniform4i"] = "uniform4i";
  UniformMethod["Uniform1f"] = "uniform1f";
  UniformMethod["Uniform2f"] = "uniform2f";
  UniformMethod["Uniform3f"] = "uniform3f";
  UniformMethod["Uniform4f"] = "uniform4f"; //

  UniformMethod["Uniform1iv"] = "uniform1iv"; // Uniform1iv = 'uniform1iv', // (boolUniformLoc, [v]);                // for bool or bool array
  // Uniform1iv = 'uniform1iv', // (sampler2DUniformLoc, [v]);           // for sampler2D or sampler2D array
  // Uniform1iv = 'uniform1iv', // (samplerCubeUniformLoc, [v]);         // for samplerCube or samplerCube array

  UniformMethod["Uniform2iv"] = "uniform2iv";
  UniformMethod["Uniform3iv"] = "uniform3iv";
  UniformMethod["Uniform4iv"] = "uniform4iv"; //

  UniformMethod["Uniform1fv"] = "uniform1fv";
  UniformMethod["Uniform2fv"] = "uniform2fv";
  UniformMethod["Uniform3fv"] = "uniform3fv";
  UniformMethod["Uniform4fv"] = "uniform4fv"; //

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

  switch (this.method) {
    case exports.UniformMethod.UniformMatrix2fv:
    case exports.UniformMethod.UniformMatrix3fv:
    case exports.UniformMethod.UniformMatrix4fv:
      this.apply = function (gl, program) {
        if (_this.dirty) {
          gl.useProgram(program);
          var location = gl.getUniformLocation(program, _this.key); // Logger.log(this.key, this.method, this.values);
          // (gl as any)[this.method].apply(gl, [location].concat(this.values));

          gl[_this.method].apply(gl, [location, false].concat(_this.values));
        }
      };

      break;

    default:
      this.apply = function (gl, program) {
        if (_this.dirty) {
          gl.useProgram(program);
          var location = gl.getUniformLocation(program, _this.key); // Logger.log(this.key, this.method, this.values);
          // (gl as any)[this.method].apply(gl, [location].concat(this.values));

          gl[_this.method].apply(gl, [location].concat(_this.values));
        }
      };

  }
};
var UniformTexture = /*#__PURE__*/function (_Uniform) {
  _inheritsLoose(UniformTexture, _Uniform);

  function UniformTexture(options) {
    return _Uniform.call(this, options) || this;
  }

  return UniformTexture;
}(Uniform);

var Uniforms = /*#__PURE__*/function (_IterableStringMap) {
  _inheritsLoose(Uniforms, _IterableStringMap);

  function Uniforms() {
    var _this2;

    _this2 = _IterableStringMap.apply(this, arguments) || this;
    _this2.dirty = false;
    return _this2;
  }

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
      // Logger.log('Uniforms.parseUniform', key, UniformType[type], method, values);
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
    } // return this.parseUniform__bak(key, values);


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

    if (uniform) {
      // !!! consider performance
      // && (uniform.method !== method || uniform.type !== type || Uniforms.isDifferent(uniform.values, values))) {
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
    var _this3 = this;

    gl.useProgram(program);
    Object.keys(this.values).forEach(function (key) {
      // if (typeof this.values[key].apply === 'function') {
      _this3.values[key].apply(gl, program); // }

    }); // this.forEach(uniform => uniform.apply(gl, program));
  };

  _proto.clean = function clean() {
    var _this4 = this;

    Object.keys(this.values).forEach(function (key) {
      _this4.values[key].dirty = false;
    });
    this.dirty = false;
  }
  /*
  // slow
  static isDifferent(a: any, b: any): boolean {
      return JSON.stringify(a) !== JSON.stringify(b);
  }
  */
  ;

  Uniforms.isDifferent = function isDifferent(a, b) {
    return a.length !== b.length || a.reduce(function (f, v, i) {
      return f || v !== b[i];
    }, false);
  };

  return Uniforms;
}(IterableStringMap);var Renderer = /*#__PURE__*/function (_Subscriber) {
  _inheritsLoose(Renderer, _Subscriber);

  function Renderer() {
    var _this;

    _this = _Subscriber.call(this) || this;
    _this.uniforms = new Uniforms();
    _this.buffers = new Buffers();
    _this.textures = new Textures();
    _this.textureList = [];
    _this.W = 0;
    _this.H = 0;
    _this.mouse = new Vector2();
    _this.radians = 0;
    _this.dirty = true;
    _this.animated = false;
    _this.camera = new OrbitCamera();
    _this.cache = {};
    _this.drawFunc_ = _this.drawArrays_;
    return _this;
  }

  var _proto = Renderer.prototype;

  _proto.render = function render() {
    var _this2 = this;

    var gl = this.gl;

    if (!gl) {
      return;
    }

    var BW = gl.drawingBufferWidth;
    var BH = gl.drawingBufferHeight;
    this.update_();
    gl.viewport(0, 0, BW, BH);
    var uniforms = this.uniforms;
    Object.keys(this.buffers.values).forEach(function (key) {
      var buffer = _this2.buffers.values[key];
      buffer.geometry.attachAttributes_(gl, buffer.program); // uniforms.get('u_resolution').values = [1024, 1024];

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
    }); // uniforms.get('u_resolution').values = [BW, BH];

    this.geometry.attachAttributes_(gl, this.program);
    uniforms.apply(gl, this.program); // gl.viewport(0, 0, BW, BH);

    this.drawFunc_(this.timer.delta);
    uniforms.clean();
    this.textures.clean();
    this.dirty = false;
    this.trigger('render', this);
  };

  _proto.drawArrays_ = function drawArrays_(deltaTime) {
    var gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); // Clear

    gl.viewport(0, 0, this.W, this.H);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0); // Clear the canvas before we start drawing on it.
    // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.CULL_FACE);

    if (this.doubleSided && this.mode !== ContextMode.Flat) {
      // back
      // gl.frontFace(gl.CW);
      gl.cullFace(gl.FRONT);
      gl.drawArrays(gl.TRIANGLES, 0, this.geometry.size); // front

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    } // gl.frontFace(gl.CCW);


    gl.cullFace(gl.BACK);
    gl.drawArrays(gl.TRIANGLES, 0, this.geometry.size); // gl.drawElements(gl.TRIANGLES, this.geometry.size, gl.UNSIGNED_SHORT, 0);
  };

  _proto.create_ = function create_() {
    this.createGeometry_();
    this.createUniforms_();
  };

  _proto.createGeometry_ = function createGeometry_() {
    // console.log('Geometry', Geometry);
    // console.log('FlatGeometry', FlatGeometry);
    // console.log('BoxGeometry', BoxGeometry);
    this.parseGeometry_();
    this.setMode(this.mode);
  };

  _proto.parseGeometry_ = function parseGeometry_() {
    var regexp = /^attribute\s+vec4\s+a_position\s*;\s*\/\/\s*([\w|\:\/\/|\.|\-|\_|\?|\&|\=]+)/gm;
    var match = regexp.exec(this.vertexString);

    if (match && match.length > 1) {
      this.mesh = match[1];
    } else {
      this.mesh = this.defaultMesh;
    }
  };

  _proto.createUniforms_ = function createUniforms_() {
    var gl = this.gl;
    var fragmentString = this.fragmentString;
    var BW = gl.drawingBufferWidth;
    var BH = gl.drawingBufferHeight;
    var timer = this.timer = new CanvasTimer();
    var hasDelta = (fragmentString.match(/u_delta/g) || []).length > 1;
    var hasTime = (fragmentString.match(/u_time/g) || []).length > 1;
    var hasDate = (fragmentString.match(/u_date/g) || []).length > 1;
    var hasMouse = (fragmentString.match(/u_mouse/g) || []).length > 1;
    var hasCamera = (fragmentString.match(/u_camera/g) || []).length > 1; // this.animated = hasTime || hasDate || hasMouse;

    this.animated = true; // !!!

    var uniforms = this.uniforms;
    uniforms.create(exports.UniformMethod.Uniform2f, exports.UniformType.Float, 'u_resolution', [BW, BH]);

    if (hasDelta) {
      uniforms.create(exports.UniformMethod.Uniform1f, exports.UniformType.Float, 'u_delta', [timer.delta / 1000.0]);
      this.updateUniformDelta_ = this.updateUniformDelta__;
    } else {
      this.updateUniformDelta_ = this.updateUniformNoop_;
    }

    if (hasTime) {
      uniforms.create(exports.UniformMethod.Uniform1f, exports.UniformType.Float, 'u_time', [timer.current / 1000.0]);
      this.updateUniformTime_ = this.updateUniformTime__;
    } else {
      this.updateUniformTime_ = this.updateUniformNoop_;
    }

    if (hasDate) {
      var date = new Date();
      uniforms.create(exports.UniformMethod.Uniform4f, exports.UniformType.Float, 'u_date', [date.getFullYear(), date.getMonth(), date.getDate(), date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds() + date.getMilliseconds() * 0.001]);
      this.updateUniformDate_ = this.updateUniformDate__;
    } else {
      this.updateUniformDate_ = this.updateUniformNoop_;
    }

    if (hasMouse) {
      uniforms.create(exports.UniformMethod.Uniform2f, exports.UniformType.Float, 'u_mouse', [0, 0]);
      this.updateUniformMouse_ = this.updateUniformMouse__;
    } else {
      this.updateUniformMouse_ = this.updateUniformNoop_;
    }

    if (hasCamera) {
      uniforms.create(exports.UniformMethod.Uniform3f, exports.UniformType.Float, 'u_camera', [0, 0, 0]);
      this.updateUniformCamera_ = this.updateUniformCamera__;
    } else {
      this.updateUniformCamera_ = this.updateUniformNoop_;
    } // if (this.mode !== ContextMode.Flat) {


    this.projectionMatrix = create();
    uniforms.create(exports.UniformMethod.UniformMatrix4fv, exports.UniformType.Float, 'u_projectionMatrix', this.projectionMatrix);
    this.modelViewMatrix = create();
    uniforms.create(exports.UniformMethod.UniformMatrix4fv, exports.UniformType.Float, 'u_modelViewMatrix', this.modelViewMatrix);
    this.normalMatrix = create();
    uniforms.create(exports.UniformMethod.UniformMatrix4fv, exports.UniformType.Float, 'u_normalMatrix', this.normalMatrix); // }
  };

  _proto.update_ = function update_() {
    var gl = this.gl;
    var BW = gl.drawingBufferWidth;
    var BH = gl.drawingBufferHeight;

    if (!this.timer) {
      return;
    }

    var timer = this.timer.next();
    var uniforms = this.uniforms;
    uniforms.update(exports.UniformMethod.Uniform2f, exports.UniformType.Float, 'u_resolution', [BW, BH]);
    this.updateUniformDelta_(timer);
    this.updateUniformTime_(timer);
    this.updateUniformDate_();
    this.updateUniformMouse_();
    this.updateUniformCamera_();
    this.updateUniformMesh_();
  };

  _proto.updateUniformNoop_ = function updateUniformNoop_() {};

  _proto.updateUniformDelta__ = function updateUniformDelta__(timer) {
    var uniforms = this.uniforms;
    uniforms.update(exports.UniformMethod.Uniform1f, exports.UniformType.Float, 'u_delta', [timer.delta / 1000.0]);
  };

  _proto.updateUniformTime__ = function updateUniformTime__(timer) {
    var uniforms = this.uniforms;
    uniforms.update(exports.UniformMethod.Uniform1f, exports.UniformType.Float, 'u_time', [timer.current / 1000.0]);
  };

  _proto.updateUniformDate__ = function updateUniformDate__() {
    var uniforms = this.uniforms;
    var date = new Date();
    uniforms.update(exports.UniformMethod.Uniform4f, exports.UniformType.Float, 'u_date', [date.getFullYear(), date.getMonth(), date.getDate(), date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds() + date.getMilliseconds() * 0.001]);
  };

  _proto.updateUniformMouse__ = function updateUniformMouse__() {
    var uniforms = this.uniforms;
    var mouse = this.mouse;
    uniforms.update(exports.UniformMethod.Uniform2f, exports.UniformType.Float, 'u_mouse', [mouse.x, mouse.y]);
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

  _proto.updateUniformCamera__ = function updateUniformCamera__() {
    var uniforms = this.uniforms;
    var array = OrbitCamera.toArray(this.camera);
    uniforms.update(exports.UniformMethod.Uniform3f, exports.UniformType.Float, 'u_camera', array);
  };

  _proto.updateUniformMesh__ = function updateUniformMesh__() {
    var uniforms = this.uniforms;
    uniforms.update(exports.UniformMethod.UniformMatrix4fv, exports.UniformType.Float, 'u_projectionMatrix', this.updateProjectionMatrix_());
    uniforms.update(exports.UniformMethod.UniformMatrix4fv, exports.UniformType.Float, 'u_modelViewMatrix', this.updateModelViewMatrix_(this.timer.delta));
    uniforms.update(exports.UniformMethod.UniformMatrix4fv, exports.UniformType.Float, 'u_normalMatrix', this.updateNormalMatrix_(this.modelViewMatrix));
  };

  _proto.updateUniformFlat__ = function updateUniformFlat__() {
    var uniforms = this.uniforms;
    uniforms.update(exports.UniformMethod.UniformMatrix4fv, exports.UniformType.Float, 'u_projectionMatrix', create());
    uniforms.update(exports.UniformMethod.UniformMatrix4fv, exports.UniformType.Float, 'u_modelViewMatrix', create());
    uniforms.update(exports.UniformMethod.UniformMatrix4fv, exports.UniformType.Float, 'u_normalMatrix', create());
  };

  _proto.updateProjectionMatrix_ = function updateProjectionMatrix_() {
    var gl = this.gl;
    var fieldOfView = 45 * Math.PI / 180;
    var aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
    var zNear = 0.1;
    var zFar = 100.0;
    perspective(this.projectionMatrix, fieldOfView, aspect, zNear, zFar);
    return this.projectionMatrix;
  };

  _proto.updateModelViewMatrix_ = function updateModelViewMatrix_(deltaTime) {
    var camera = this.camera;
    var modelViewMatrix = this.modelViewMatrix;
    modelViewMatrix = identity(modelViewMatrix);
    translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -camera.radius]); // amount to translate

    rotate(modelViewMatrix, modelViewMatrix, camera.theta + this.radians, [0, 1, 0]); // axis to rotate around (Y)

    rotate(modelViewMatrix, modelViewMatrix, camera.phi, [1, 0, 0]); // axis to rotate around (X)

    if (!camera.mouse) {
      camera.theta += (0 - camera.theta) / 20;
      camera.phi += (0 - camera.phi) / 20;
      this.radians += deltaTime * 0.0005;
    }

    return modelViewMatrix;
  };

  _proto.updateNormalMatrix_ = function updateNormalMatrix_(modelViewMatrix) {
    // this.normalMatrix = mat4.create();
    var normalMatrix = this.normalMatrix;
    normalMatrix = identity(normalMatrix);
    invert(normalMatrix, modelViewMatrix);
    transpose(normalMatrix, normalMatrix);
    return normalMatrix;
  };

  _proto.setMode = function setMode(mode) {
    var _this3 = this;

    var geometry;

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

    var loader;

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
          loader.load(Common.getResource(this.mesh, this.workpath)).then(function (geometry) {
            geometry.createAttributes_(_this3.gl, _this3.program);
            var cache = {};
            cache[_this3.mesh] = geometry;
            _this3.cache = cache;
            _this3.geometry = geometry;
            _this3.dirty = true;
          }, function (error) {
            Logger.warn('GlslCanvas', error);
            _this3.mode = ContextMode.Flat;
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
  };

  _proto.setMesh = function setMesh(mesh) {
    this.mesh = mesh;
  };

  return Renderer;
}(Subscriber);var Canvas = /*#__PURE__*/function (_Renderer) {
  _inheritsLoose(Canvas, _Renderer);

  function Canvas(canvas, options) {
    var _this;

    if (options === void 0) {
      options = {// alpha: true,
        // antialias: true,
        // premultipliedAlpha: true
      };
    }

    _this = _Renderer.call(this) || this;
    _this.valid = false;
    _this.visible = false;
    _this.controls = false;
    _this.vertexPath = '';
    _this.fragmentPath = '';

    if (!canvas) {
      return _assertThisInitialized(_this);
    }

    _this.options = options;
    _this.canvas = canvas;
    _this.width = 0;
    _this.height = 0;
    _this.rect = canvas.getBoundingClientRect();
    _this.devicePixelRatio = window.devicePixelRatio || 1;
    _this.mode = options.mode || ContextMode.Flat;
    _this.mesh = options.mesh || undefined;
    _this.doubleSided = options.doubleSided || false;
    _this.defaultMesh = _this.mesh;
    _this.workpath = options.workpath;
    canvas.style.backgroundColor = options.backgroundColor || 'rgba(0,0,0,0)';

    _this.getShaders_().then(function (_) {
      _this.load().then(function (_) {
        if (!_this.program) {
          return;
        }

        _this.addListeners_();

        _this.onLoop();
      });
    }, function (error) {
      Logger.error('GlslCanvas.getShaders_.error', error);
    });

    Canvas.items.push(_assertThisInitialized(_this));
    return _this;
  }

  var _proto = Canvas.prototype;

  _proto.getShaders_ = function getShaders_() {
    var _this2 = this;

    return new Promise(function (resolve) {
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
        Promise.all(Object.keys(urls).map(function (key) {
          var url = Common.getResource(urls[key], _this2.workpath);
          return Common.fetch(url) // .then((response) => response.text())
          .then(function (body) {
            var path = Common.dirname(urls[key]);

            if (key === 'vertex') {
              _this2.vertexPath = path;
              return _this2.vertexString = body;
            } else {
              _this2.fragmentPath = path;
              return _this2.fragmentString = body;
            }
          });
        })).then(function (_) {
          resolve([_this2.vertexString, _this2.fragmentString]);
        });
      } else {
        resolve([_this2.vertexString, _this2.fragmentString]);
      }
    });
  };

  _proto.addListeners_ = function addListeners_() {
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
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseOver = this.onMouseOver.bind(this);
    this.onMouseOut = this.onMouseOut.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onLoop = this.onLoop.bind(this); // window.addEventListener('resize', this.onResize);

    window.addEventListener('scroll', this.onScroll);
    document.addEventListener('mousemove', this.onMouseMove, false);
    document.addEventListener('touchmove', this.onTouchMove);
    this.addCanvasListeners_();
  };

  _proto.addCanvasListeners_ = function addCanvasListeners_() {
    this.controls = this.canvas.hasAttribute('controls');
    this.canvas.addEventListener('wheel', this.onWheel);
    this.canvas.addEventListener('click', this.onClick);
    this.canvas.addEventListener('mousedown', this.onMouseDown);
    this.canvas.addEventListener('touchstart', this.onTouchStart);

    if (this.controls) {
      this.canvas.addEventListener('mouseover', this.onMouseOver);
      this.canvas.addEventListener('mouseout', this.onMouseOut);

      if (!this.canvas.hasAttribute('data-autoplay')) {
        this.pause();
      }
    }
  };

  _proto.removeCanvasListeners_ = function removeCanvasListeners_() {
    this.canvas.removeEventListener('wheel', this.onWheel);
    this.canvas.removeEventListener('click', this.onClick);
    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    this.canvas.removeEventListener('mouseup', this.onMouseUp);
    this.canvas.removeEventListener('touchstart', this.onTouchStart);
    this.canvas.removeEventListener('touchend', this.onTouchEnd);

    if (this.controls) {
      this.canvas.removeEventListener('mouseover', this.onMouseOver);
      this.canvas.removeEventListener('mouseout', this.onMouseOut);
    }
  };

  _proto.removeListeners_ = function removeListeners_() {
    window.cancelAnimationFrame(this.rafId); // window.removeEventListener('resize', this.onResize);

    window.removeEventListener('scroll', this.onScroll);
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('touchmove', this.onTouchMove);
    this.removeCanvasListeners_();
  };

  _proto.onScroll = function onScroll(_) {
    this.rect = this.canvas.getBoundingClientRect();
  };

  _proto.onWheel = function onWheel(e) {
    this.camera.wheel(e.deltaY);
    this.dirty = this.mode !== ContextMode.Flat;
    this.trigger('wheel', e);
  };

  _proto.onClick = function onClick(e) {
    if (this.controls) {
      this.toggle();
    }

    this.trigger('click', e);
  };

  _proto.onDown = function onDown(mx, my) {
    var rect = this.rect;
    mx = mx - rect.left;
    my = rect.height - (my - rect.top);
    var x = mx * this.devicePixelRatio;
    var y = my * this.devicePixelRatio;
    this.mouse.x = x;
    this.mouse.y = y;
    var min = Math.min(rect.width, rect.height);
    this.camera.down(mx / min, my / min);
    this.trigger('down', this.mouse);
  };

  _proto.onMove = function onMove(mx, my) {
    var rect = this.rect;
    mx = mx - rect.left;
    my = rect.height - (my - rect.top);
    var x = mx * this.devicePixelRatio;
    var y = my * this.devicePixelRatio;

    if (x !== this.mouse.x || y !== this.mouse.y) {
      this.mouse.x = x;
      this.mouse.y = y;
      var min = Math.min(rect.width, rect.height);
      this.camera.move(mx / min, my / min);
      this.dirty = this.mode !== ContextMode.Flat && this.camera.mouse !== null;
      this.trigger('move', this.mouse);
    }
  };

  _proto.onUp = function onUp(e) {
    this.camera.up();

    if (this.controls) {
      this.pause();
    }

    this.trigger('out', e);
  };

  _proto.onMouseDown = function onMouseDown(e) {
    this.onDown(e.clientX, e.clientY);
    document.addEventListener('mouseup', this.onMouseUp);
    document.removeEventListener('touchstart', this.onTouchStart);
    document.removeEventListener('touchmove', this.onTouchMove);
  };

  _proto.onMouseMove = function onMouseMove(e) {
    this.onMove(e.clientX, e.clientY);
  };

  _proto.onMouseUp = function onMouseUp(e) {
    this.onUp(e);
  };

  _proto.onMouseOver = function onMouseOver(e) {
    this.play();
    this.trigger('over', e);
  };

  _proto.onMouseOut = function onMouseOut(e) {
    this.pause();
    this.trigger('out', e);
  };

  _proto.onTouchStart = function onTouchStart(e) {
    var touch = [].slice.call(e.touches).reduce(function (p, touch) {
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
    document.addEventListener('touchend', this.onTouchEnd);
    document.removeEventListener('mousedown', this.onMouseDown);
    document.removeEventListener('mousemove', this.onMouseMove);

    if (this.controls) {
      this.canvas.removeEventListener('mouseover', this.onMouseOver);
      this.canvas.removeEventListener('mouseout', this.onMouseOut);
    }
  };

  _proto.onTouchMove = function onTouchMove(e) {
    var touch = [].slice.call(e.touches).reduce(function (p, touch) {
      p = p || new Vector2();
      p.x += touch.clientX;
      p.y += touch.clientY;
      return p;
    }, null);

    if (touch) {
      this.onMove(touch.x / e.touches.length, touch.y / e.touches.length);
    }
  };

  _proto.onTouchEnd = function onTouchEnd(e) {
    this.onUp(e);
    document.removeEventListener('touchend', this.onTouchEnd);
  };

  _proto.onLoop = function onLoop(_) {
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

  _proto.isVisible_ = function isVisible_() {
    var rect = this.rect;
    return rect.top + rect.height > 0 && rect.top < (window.innerHeight || document.documentElement.clientHeight);
  };

  _proto.isAnimated_ = function isAnimated_() {
    return (this.animated || this.textures.animated || this.mode !== ContextMode.Flat) && !this.timer.paused;
  };

  _proto.isDirty_ = function isDirty_() {
    return this.dirty || this.uniforms.dirty || this.textures.dirty;
  } // check size change at start of requestFrame
  ;

  _proto.sizeDidChanged_ = function sizeDidChanged_() {
    var _this4 = this;

    var gl = this.gl;
    var CW = Math.ceil(this.canvas.clientWidth),
        CH = Math.ceil(this.canvas.clientHeight);

    if (this.width !== CW || this.height !== CH) {
      this.width = CW;
      this.height = CH; // Lookup the size the browser is displaying the canvas in CSS pixels
      // and compute a size needed to make our drawingbuffer match it in
      // device pixels.

      var W = Math.ceil(CW * this.devicePixelRatio);
      var H = Math.ceil(CH * this.devicePixelRatio);
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

      Object.keys(this.buffers.values).forEach(function (key) {
        var buffer = _this4.buffers.values[key];
        buffer.resize(gl, W, H);
      });
      this.rect = this.canvas.getBoundingClientRect();
      this.trigger('resize'); // gl.useProgram(this.program);

      return true;
    } else {
      return false;
    }
  };

  _proto.parseTextures_ = function parseTextures_(fragmentString) {
    var _this5 = this;

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
        // create empty texture
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

        _this5.textureList.push({
          key: key,
          url: url
        });
      });
    }

    return this.textureList.length > 0;
  };

  _proto.load = function load(fragmentString, vertexString) {
    var _this6 = this;

    var fragmentVertexString = Context.getFragmentVertex(this.gl, fragmentString || this.fragmentString);
    return Promise.all([Context.getIncludes(fragmentString || this.fragmentString, this.fragmentPath === '' ? this.workpath : this.fragmentPath), Context.getIncludes(fragmentVertexString || vertexString || this.vertexString, this.vertexPath === '' ? this.workpath : this.vertexPath)]).then(function (array) {
      _this6.fragmentString = array[0];
      _this6.vertexString = array[1];
      return _this6.createContext_();
    });
  };

  _proto.getContext_ = function getContext_() {
    var vertexString = this.vertexString;
    var fragmentString = this.fragmentString;
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
      Context.inferPrecision(this.fragmentString);
      vertexShader = Context.createShader(gl, this.vertexString, gl.VERTEX_SHADER);
      fragmentShader = Context.createShader(gl, this.fragmentString, gl.FRAGMENT_SHADER); // If Fragment shader fails load a empty one to sign the error

      if (!fragmentShader) {
        var defaultFragment = Context.getFragment(null, null, this.mode);
        fragmentShader = Context.createShader(gl, defaultFragment, gl.FRAGMENT_SHADER);
        this.valid = false;
      } else {
        this.valid = true;
      }
    } catch (e) {
      // !!!
      // console.error(e);
      this.trigger('error', e);
      return false;
    } // Create and use program


    var program = Context.createProgram(gl, [vertexShader, fragmentShader]); //, [0,1],['a_texcoord','a_position']);

    if (!program) {
      this.trigger('error', Context.lastError);
      return false;
    } // console.log(this.vertexString, this.fragmentString, program);
    // Delete shaders
    // gl.detachShader(program, vertexShader);
    // gl.detachShader(program, fragmentShader);


    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    this.program = program;

    if (this.valid) {
      try {
        this.buffers = Buffers.getBuffers(gl, this.fragmentString, Context.getBufferVertex(gl));
      } catch (e) {
        // console.error('load', e);
        this.valid = false;
        this.trigger('error', e);
        return false;
      }

      this.create_();

      if (this.animated) {
        this.canvas.classList.add('animated');
      } else {
        this.canvas.classList.remove('animated');
      }
    } // Trigger event


    this.trigger('load', this);
    return this.valid;
  };

  _proto.create_ = function create_() {
    this.parseMode_();
    this.parseMesh_();

    _Renderer.prototype.create_.call(this);

    this.createBuffers_();
    this.createTextures_();
  };

  _proto.parseMode_ = function parseMode_() {
    if (this.canvas.hasAttribute('data-mode')) {
      var data = this.canvas.getAttribute('data-mode');

      if (['flat', 'box', 'sphere', 'torus', 'mesh'].indexOf(data) !== -1) {
        this.mode = data;
      }
    }
  };

  _proto.parseMesh_ = function parseMesh_() {
    if (this.canvas.hasAttribute('data-mesh')) {
      var data = this.canvas.getAttribute('data-mesh');

      if (data.indexOf('.obj') !== -1) {
        this.mesh = this.defaultMesh = data;
      }
    }
  };

  _proto.createBuffers_ = function createBuffers_() {
    var _this7 = this;

    Object.keys(this.buffers.values).forEach(function (key) {
      var buffer = _this7.buffers.values[key];

      _this7.uniforms.create(exports.UniformMethod.Uniform1i, exports.UniformType.Sampler2D, buffer.key, [buffer.input.index]);
    });
  };

  _proto.createTextures_ = function createTextures_() {
    var _this8 = this;

    var hasTextures = this.parseTextures_(this.fragmentString);

    if (hasTextures) {
      this.textureList.filter(function (x) {
        return x.url;
      }).forEach(function (x) {
        _this8.setTexture(x.key, x.url, x.options);
      });
      this.textureList = [];
    }
  };

  _proto.update_ = function update_() {
    _Renderer.prototype.update_.call(this);

    this.updateBuffers_();
    this.updateTextures_();
  };

  _proto.updateBuffers_ = function updateBuffers_() {
    var _this9 = this;

    Object.keys(this.buffers.values).forEach(function (key) {
      var buffer = _this9.buffers.values[key];

      _this9.uniforms.update(exports.UniformMethod.Uniform1i, exports.UniformType.Sampler2D, buffer.key, [buffer.input.index]);
    });
  };

  _proto.updateTextures_ = function updateTextures_() {
    var _this10 = this;

    var gl = this.gl;
    Object.keys(this.textures.values).forEach(function (key) {
      var texture = _this10.textures.values[key];
      texture.tryUpdate(gl);

      _this10.uniforms.update(exports.UniformMethod.Uniform1i, exports.UniformType.Sampler2D, texture.key, [texture.index]);
    });
  };

  _proto.destroyContext_ = function destroyContext_() {
    var _this11 = this;

    var gl = this.gl;
    gl.useProgram(null);

    if (this.program) {
      gl.deleteProgram(this.program);
    }

    Object.keys(this.buffers.values).forEach(function (key) {
      var buffer = _this11.buffers.values[key];
      buffer.destroy(gl);
    });
    Object.keys(this.textures.values).forEach(function (key) {
      var texture = _this11.textures.values[key];
      texture.destroy(gl);
    });
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
    var index = Canvas.items.indexOf(this);

    if (index !== -1) {
      Canvas.items.splice(index, 1);
    }
  };

  _proto.loadTexture = function loadTexture(key, urlElementOrData, options) {
    var _this12 = this;

    if (options === void 0) {
      options = {};
    }

    if (this.valid) {
      // Logger.log('GlslCanvas.loadTexture', key, urlElementOrData);
      this.textures.createOrUpdate(this.gl, key, urlElementOrData, this.buffers.count, options, this.options.workpath).then(function (texture) {
        var index = texture.index;

        var uniform = _this12.uniforms.createTexture(key, index);

        uniform.texture = texture;
        var keyResolution = key.indexOf('[') !== -1 ? key.replace('[', 'Resolution[') : key + 'Resolution'; // const uniformResolution = ;

        _this12.uniforms.create(exports.UniformMethod.Uniform2f, exports.UniformType.Float, keyResolution, [texture.width, texture.height]); // Logger.log('loadTexture', key, url, index, texture.width, texture.height);


        return texture;
      }, function (error) {
        var message = Array.isArray(error.path) ? error.path.map(function (x) {
          return x.error ? x.error.message : '';
        }).join(', ') : error.message;
        Logger.error('GlslCanvas.loadTexture.error', key, urlElementOrData, message);

        _this12.trigger('textureError', {
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
    for (var _len = arguments.length, values = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      values[_key - 1] = arguments[_key];
    }

    return this.setUniform_(key, values);
  };

  _proto.setUniformOfInt = function setUniformOfInt(key, values) {
    return this.setUniform_(key, values, null, exports.UniformType.Int);
  };

  _proto.setUniforms = function setUniforms(values) {
    var _this13 = this;

    Object.keys(values).forEach(function (key) {
      _this13.setUniform(key, values[key]);
    });
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
    if (this.isVisible_() && (this.sizeDidChanged_() || this.isDirty_() || this.isAnimated_())) {
      this.render();
      this.canvas.classList.add('playing');
    } else {
      this.canvas.classList.remove('playing');
    }
  };

  return Canvas;
}(Renderer);
Canvas.items = [];function of(canvas, options) {
  return Canvas.items.find(function (x) {
    return x.canvas === canvas;
  }) || new Canvas(canvas, options);
}
function loadAll() {
  var canvases = [].slice.call(document.getElementsByClassName('glsl-canvas')).filter(function (x) {
    return x instanceof HTMLCanvasElement;
  });
  return canvases.map(function (x) {
    return of(x);
  });
}

if (document) {
  document.addEventListener('DOMContentLoaded', function () {
    loadAll();
  });
}exports.BoxGeometry=BoxGeometry;exports.Buffer=Buffer;exports.Buffers=Buffers;exports.Canvas=Canvas;exports.CanvasTimer=CanvasTimer;exports.Common=Common;exports.Context=Context;exports.ContextVertexBuffers=ContextVertexBuffers;exports.DefaultWebGL2BufferFragment=DefaultWebGL2BufferFragment;exports.DefaultWebGL2BufferVertex=DefaultWebGL2BufferVertex;exports.DefaultWebGL2FlatFragment=DefaultWebGL2FlatFragment;exports.DefaultWebGL2MeshFragment=DefaultWebGL2MeshFragment;exports.DefaultWebGL2MeshVertex=DefaultWebGL2MeshVertex;exports.DefaultWebGLBufferFragment=DefaultWebGLBufferFragment;exports.DefaultWebGLBufferVertex=DefaultWebGLBufferVertex;exports.DefaultWebGLFlatFragment=DefaultWebGLFlatFragment;exports.DefaultWebGLMeshFragment=DefaultWebGLMeshFragment;exports.DefaultWebGLMeshVertex=DefaultWebGLMeshVertex;exports.FlatGeometry=FlatGeometry;exports.Geometry=Geometry;exports.IOBuffer=IOBuffer;exports.IterableStringMap=IterableStringMap;exports.Listener=Listener;exports.Logger=Logger;exports.METHODS_FLOAT=METHODS_FLOAT;exports.METHODS_FLOATV=METHODS_FLOATV;exports.METHODS_INT=METHODS_INT;exports.METHODS_INTV=METHODS_INTV;exports.ObjLoader=ObjLoader;exports.OrbitCamera=OrbitCamera;exports.Renderer=Renderer;exports.SphereGeometry=SphereGeometry;exports.Subscriber=Subscriber;exports.Texture=Texture;exports.TextureExtensions=TextureExtensions;exports.TextureImageExtensions=TextureImageExtensions;exports.TextureVideoExtensions=TextureVideoExtensions;exports.Textures=Textures;exports.TorusGeometry=TorusGeometry;exports.Uniform=Uniform;exports.UniformTexture=UniformTexture;exports.Uniforms=Uniforms;exports.Vector2=Vector2;exports.Vector3=Vector3;exports.isTextureData=isTextureData;exports.loadAll=loadAll;exports.of=of;Object.defineProperty(exports,'__esModule',{value:true});})));