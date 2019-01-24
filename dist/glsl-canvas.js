(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
(function (setImmediate){
'use strict';

/**
 * @this {Promise}
 */
function finallyConstructor(callback) {
  var constructor = this.constructor;
  return this.then(
    function(value) {
      return constructor.resolve(callback()).then(function() {
        return value;
      });
    },
    function(reason) {
      return constructor.resolve(callback()).then(function() {
        return constructor.reject(reason);
      });
    }
  );
}

// Store setTimeout reference so promise-polyfill will be unaffected by
// other code modifying setTimeout (like sinon.useFakeTimers())
var setTimeoutFunc = setTimeout;

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
function Promise(fn) {
  if (!(this instanceof Promise))
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
  Promise._immediateFn(function() {
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
      if (newValue instanceof Promise) {
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
    Promise._immediateFn(function() {
      if (!self._handled) {
        Promise._unhandledRejectionFn(self._value);
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

Promise.prototype['catch'] = function(onRejected) {
  return this.then(null, onRejected);
};

Promise.prototype.then = function(onFulfilled, onRejected) {
  // @ts-ignore
  var prom = new this.constructor(noop);

  handle(this, new Handler(onFulfilled, onRejected, prom));
  return prom;
};

Promise.prototype['finally'] = finallyConstructor;

Promise.all = function(arr) {
  return new Promise(function(resolve, reject) {
    if (!arr || typeof arr.length === 'undefined')
      throw new TypeError('Promise.all accepts an array');
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

Promise.resolve = function(value) {
  if (value && typeof value === 'object' && value.constructor === Promise) {
    return value;
  }

  return new Promise(function(resolve) {
    resolve(value);
  });
};

Promise.reject = function(value) {
  return new Promise(function(resolve, reject) {
    reject(value);
  });
};

Promise.race = function(values) {
  return new Promise(function(resolve, reject) {
    for (var i = 0, len = values.length; i < len; i++) {
      values[i].then(resolve, reject);
    }
  });
};

// Use polyfill for setImmediate for performance gains
Promise._immediateFn =
  (typeof setImmediate === 'function' &&
    function(fn) {
      setImmediate(fn);
    }) ||
  function(fn) {
    setTimeoutFunc(fn, 0);
  };

Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
  if (typeof console !== 'undefined' && console) {
    console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
  }
};

module.exports = Promise;

}).call(this,require("timers").setImmediate)
},{"timers":3}],3:[function(require,module,exports){
(function (setImmediate,clearImmediate){
var nextTick = require('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this,require("timers").setImmediate,require("timers").clearImmediate)
},{"process/browser.js":1,"timers":3}],4:[function(require,module,exports){
"use strict";

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var __importDefault = void 0 && (void 0).__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

(function (factory) {
  if ((typeof module === "undefined" ? "undefined" : _typeof(module)) === "object" && _typeof(module.exports) === "object") {
    var v = factory(require, exports);
    if (v !== undefined) module.exports = v;
  } else if (typeof define === "function" && define.amd) {
    define(["require", "exports", "./context", "./iterable"], factory);
  }
})(function (require, exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var context_1 = __importDefault(require("./context"));

  var iterable_1 = __importDefault(require("./iterable"));

  var BufferFloatType;

  (function (BufferFloatType) {
    BufferFloatType[BufferFloatType["FLOAT"] = 0] = "FLOAT";
    BufferFloatType[BufferFloatType["HALF_FLOAT"] = 1] = "HALF_FLOAT";
  })(BufferFloatType = exports.BufferFloatType || (exports.BufferFloatType = {}));

  var Buffer =
  /*#__PURE__*/
  function () {
    function Buffer(gl, BW, BH, index) {
      _classCallCheck(this, Buffer);

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

    _createClass(Buffer, [{
      key: "getFloatType",
      value: function getFloatType(gl) {
        var floatType, extension;

        if (Buffer.floatType === BufferFloatType.FLOAT) {
          extension = gl.getExtension('OES_texture_float');

          if (extension) {
            floatType = gl.FLOAT;
          } else {
            Buffer.floatType = BufferFloatType.HALF_FLOAT;
            return this.getFloatType(gl);
          }
        } else {
          extension = gl.getExtension('OES_texture_half_float');

          if (extension) {
            floatType = extension.HALF_FLOAT_OES;
          } else {
            Buffer.floatType = BufferFloatType.FLOAT;
            return this.getFloatType(gl);
          }
        }

        return floatType;
      }
    }, {
      key: "getTexture",
      value: function getTexture(gl, BW, BH, index) {
        var floatType = this.getFloatType(gl);
        var texture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + index);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, BW, BH, 0, gl.RGBA, floatType, null);
        var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);

        if (status !== gl.FRAMEBUFFER_COMPLETE) {
          if (Buffer.floatType === BufferFloatType.FLOAT) {
            Buffer.floatType = BufferFloatType.HALF_FLOAT;
          } else {
            Buffer.floatType = BufferFloatType.FLOAT;
          }

          return this.getTexture(gl, BW, BH, index);
        }

        return texture;
      }
    }, {
      key: "resize",
      value: function resize(gl, BW, BH) {
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
          var newIndex = index + 1; // temporary index

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
      }
    }]);

    return Buffer;
  }();

  Buffer.floatType = BufferFloatType.HALF_FLOAT;
  exports.Buffer = Buffer;

  var IOBuffer =
  /*#__PURE__*/
  function () {
    function IOBuffer(index, key, vertexString, fragmentString) {
      _classCallCheck(this, IOBuffer);

      this.isValid = false;
      this.index = index;
      this.key = key;
      this.vertexString = vertexString;
      this.fragmentString = fragmentString;
    }

    _createClass(IOBuffer, [{
      key: "create",
      value: function create(gl, BW, BH) {
        var vertexShader = context_1.default.createShader(gl, this.vertexString, gl.VERTEX_SHADER);
        var fragmentShader = context_1.default.createShader(gl, this.fragmentString, gl.FRAGMENT_SHADER, 1);

        if (!fragmentShader) {
          fragmentShader = context_1.default.createShader(gl, 'void main(){\n\tgl_FragColor = vec4(1.0);\n}', gl.FRAGMENT_SHADER);
          this.isValid = false;
        } else {
          this.isValid = true;
        }

        var program = context_1.default.createProgram(gl, [vertexShader, fragmentShader]); // gl.useProgram(program);

        var input = new Buffer(gl, BW, BH, this.index + 0);
        var output = new Buffer(gl, BW, BH, this.index + 2);
        this.program = program;
        this.input = input;
        this.output = output;
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
      }
    }, {
      key: "render",
      value: function render(gl, BW, BH) {
        gl.useProgram(this.program);
        gl.viewport(0, 0, BW, BH);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.output.buffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.output.texture, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6); // swap

        var temp = this.input;
        var input = this.output;
        var output = temp;
        this.input = input;
        this.output = output;
      }
    }, {
      key: "resize",
      value: function resize(gl, BW, BH) {
        gl.useProgram(this.program);
        gl.viewport(0, 0, BW, BH);
        this.input.resize(gl, BW, BH);
        this.output.resize(gl, BW, BH);
      }
    }, {
      key: "destroy",
      value: function destroy(gl) {
        gl.deleteProgram(this.program);
        this.program = null;
        this.input = null;
        this.output = null;
      }
    }]);

    return IOBuffer;
  }();

  exports.IOBuffer = IOBuffer;

  var Buffers =
  /*#__PURE__*/
  function (_iterable_1$default) {
    _inherits(Buffers, _iterable_1$default);

    function Buffers() {
      _classCallCheck(this, Buffers);

      return _possibleConstructorReturn(this, _getPrototypeOf(Buffers).apply(this, arguments));
    }

    _createClass(Buffers, [{
      key: "count",
      get: function get() {
        return Object.keys(this.values).length * 4;
      }
    }], [{
      key: "getBuffers",
      value: function getBuffers(gl, fragmentString, vertexString) {
        var buffers = new Buffers();
        var count = 0;

        if (fragmentString) {
          var regexp = /(?:^\s*)((?:#if|#elif)(?:\s*)(defined\s*\(\s*BUFFER_)(\d+)(?:\s*\))|(?:#ifdef)(?:\s*BUFFER_)(\d+)(?:\s*))/gm;
          var matches;

          while ((matches = regexp.exec(fragmentString)) !== null) {
            var i = matches[3] || matches[4];
            var key = 'u_buffer' + i;
            var buffer = new IOBuffer(count, key, vertexString, '#define BUFFER_' + i + '\n' + fragmentString);
            buffer.create(gl, gl.drawingBufferWidth, gl.drawingBufferHeight);
            buffers.set(key, buffer);
            count += 4;
          }
        }

        return buffers;
      }
    }]);

    return Buffers;
  }(iterable_1.default);

  exports.default = Buffers;
});

},{"./context":6,"./iterable":8}],5:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

(function (factory) {
  if ((typeof module === "undefined" ? "undefined" : _typeof(module)) === "object" && _typeof(module.exports) === "object") {
    var v = factory(require, exports);
    if (v !== undefined) module.exports = v;
  } else if (typeof define === "function" && define.amd) {
    define(["require", "exports", "promise-polyfill"], factory);
  }
})(function (require, exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  require("promise-polyfill");

  var Common =
  /*#__PURE__*/
  function () {
    function Common() {
      _classCallCheck(this, Common);
    }

    _createClass(Common, null, [{
      key: "fetch",
      value: function fetch(url) {
        return new Promise(function (resolve, reject) {
          var xhr = new XMLHttpRequest();

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
        });
      }
    }]);

    return Common;
  }();

  exports.default = Common;
});

},{"promise-polyfill":2}],6:[function(require,module,exports){
"use strict";

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

(function (factory) {
  if ((typeof module === "undefined" ? "undefined" : _typeof(module)) === "object" && _typeof(module.exports) === "object") {
    var v = factory(require, exports);
    if (v !== undefined) module.exports = v;
  } else if (typeof define === "function" && define.amd) {
    define(["require", "exports"], factory);
  }
})(function (require, exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.ContextDefaultVertex = "\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\nattribute vec2 a_position;\nattribute vec2 a_texcoord;\n\nvarying vec2 v_texcoord;\n\nvoid main(){\n\tgl_Position = vec4(a_position, 0.0, 1.0);\n\tv_texcoord = a_texcoord;\n}\n";
  exports.ContextDefaultFragment = "\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\nvarying vec2 v_texcoord;\n\nvoid main(){\n\tgl_FragColor = vec4(0.0);\n}\n";
  var ContextError;

  (function (ContextError) {
    ContextError[ContextError["BrowserSupport"] = 1] = "BrowserSupport";
    ContextError[ContextError["Other"] = 2] = "Other";
  })(ContextError = exports.ContextError || (exports.ContextError = {}));

  var ContextVertexBuffers = function ContextVertexBuffers() {
    _classCallCheck(this, ContextVertexBuffers);
  };

  exports.ContextVertexBuffers = ContextVertexBuffers;

  var Context =
  /*#__PURE__*/
  function () {
    function Context() {
      _classCallCheck(this, Context);
    }

    _createClass(Context, null, [{
      key: "tryGetContext",
      value: function tryGetContext(canvas, attributes, errorCallback) {
        function handleError(errorCode, html) {
          if (typeof errorCallback === 'function') {
            errorCallback(errorCode);
          } else {
            var container = canvas.parentNode;

            if (container) {
              container.innerHTML = "<div class=\"glsl-canvas--error\">".concat(html, "</div>");
            }
          }
        }

        if (!WebGLRenderingContext) {
          handleError(ContextError.BrowserSupport, "This page requires a browser that supports WebGL.<br/>\n\t\t\t<a href=\"http://get.webgl.org\">Click here to upgrade your browser.</a>");
          return null;
        }

        var context = Context.getContext(canvas, attributes);

        if (!context) {
          handleError(ContextError.Other, "It does not appear your computer can support WebGL.<br/>\n\t\t\t<a href=\"http://get.webgl.org/troubleshooting/\">Click here for more information.</a>");
        } else {
          context.getExtension('OES_standard_derivatives');
        }

        return context;
      }
    }, {
      key: "getContext",
      value: function getContext(canvas, options) {
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
      }
    }, {
      key: "createShader",
      value: function createShader(gl, source, type) {
        var offset = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

        if (!compiled) {
          // Something went wrong during compilation; get the error
          Context.lastError = gl.getShaderInfoLog(shader);
          console.error('*** Error compiling shader ' + shader + ':' + Context.lastError); // main.trigger('error', {

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
      }
    }, {
      key: "createProgram",
      value: function createProgram(gl, shaders, attributes, locations) {
        var program = gl.createProgram();

        for (var i = 0; i < shaders.length; ++i) {
          gl.attachShader(program, shaders[i]);
        }

        if (attributes && locations) {
          for (var _i = 0; _i < attributes.length; ++_i) {
            gl.bindAttribLocation(program, locations ? locations[_i] : _i, attributes[_i]);
          }
        }

        gl.linkProgram(program); // Check the link status

        var linked = gl.getProgramParameter(program, gl.LINK_STATUS);

        if (!linked) {
          // something went wrong with the link
          Context.lastError = gl.getProgramInfoLog(program);
          console.log('Error in program linking:' + Context.lastError);
          gl.deleteProgram(program);
          return null;
        }

        return program;
      }
    }, {
      key: "createVertexBuffers",
      value: function createVertexBuffers(gl, program) {
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
      }
    }]);

    return Context;
  }();

  Context.lastError = '';
  exports.default = Context;
});

},{}],7:[function(require,module,exports){
"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var __importDefault = void 0 && (void 0).__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

var __importStar = void 0 && (void 0).__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) {
    if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
  }
  result["default"] = mod;
  return result;
};

(function (factory) {
  if ((typeof module === "undefined" ? "undefined" : _typeof(module)) === "object" && _typeof(module.exports) === "object") {
    var v = factory(require, exports);
    if (v !== undefined) module.exports = v;
  } else if (typeof define === "function" && define.amd) {
    define(["require", "exports", "promise-polyfill", "./buffers", "./common", "./context", "./subscriber", "./textures", "./uniforms"], factory);
  }
})(function (require, exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  }); // import '@babel/polyfill';
  // import 'whatwg-fetch';

  require("promise-polyfill");

  var buffers_1 = __importDefault(require("./buffers"));

  var common_1 = __importDefault(require("./common"));

  var context_1 = __importStar(require("./context"));

  var subscriber_1 = __importDefault(require("./subscriber"));

  var textures_1 = __importStar(require("./textures"));

  var uniforms_1 = __importStar(require("./uniforms"));

  var GlslCanvasOptions = function GlslCanvasOptions() {
    _classCallCheck(this, GlslCanvasOptions);
  };

  exports.GlslCanvasOptions = GlslCanvasOptions;

  var GlslCanvasTimer =
  /*#__PURE__*/
  function () {
    function GlslCanvasTimer() {
      _classCallCheck(this, GlslCanvasTimer);

      this.delay = 0.0;
      this.current = 0.0;
      this.delta = 0.0;
      this.paused = false;
      this.start = this.previous = this.now();
    }

    _createClass(GlslCanvasTimer, [{
      key: "now",
      value: function now() {
        return performance.now();
      }
    }, {
      key: "play",
      value: function play() {
        if (this.previous) {
          var now = this.now();
          this.delay += now - this.previous;
          this.previous = now;
        } // console.log(this.delay);


        this.paused = false;
      }
    }, {
      key: "pause",
      value: function pause() {
        this.paused = true;
      }
    }, {
      key: "next",
      value: function next() {
        var now = this.now();
        this.delta = now - this.previous;
        this.current = now - this.start - this.delay;
        this.previous = now;
        return this;
      }
    }]);

    return GlslCanvasTimer;
  }();

  exports.GlslCanvasTimer = GlslCanvasTimer;

  var GlslCanvas =
  /*#__PURE__*/
  function (_subscriber_1$default) {
    _inherits(GlslCanvas, _subscriber_1$default);

    function GlslCanvas(canvas) {
      var _this;

      var contextOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {// alpha: true,
        // antialias: true,
        // premultipliedAlpha: true
      };
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      _classCallCheck(this, GlslCanvas);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(GlslCanvas).call(this));
      _this.mouse = {
        x: 0,
        y: 0
      };
      _this.uniforms = new uniforms_1.default();
      _this.buffers = new buffers_1.default();
      _this.textures = new textures_1.default();
      _this.textureList = [];
      _this.valid = false;
      _this.animated = false;
      _this.dirty = true;
      _this.visible = false;

      _this.removeListeners = function () {};

      if (!canvas) {
        return _possibleConstructorReturn(_this);
      }

      _this.canvas = canvas;
      _this.width = 0; // canvas.clientWidth;

      _this.height = 0; // canvas.clientHeight;

      _this.rect = canvas.getBoundingClientRect();
      _this.vertexString = contextOptions.vertexString || context_1.ContextDefaultVertex;
      _this.fragmentString = contextOptions.fragmentString || context_1.ContextDefaultFragment;
      var gl = context_1.default.tryGetContext(canvas, contextOptions, options.onError);

      if (!gl) {
        return _possibleConstructorReturn(_this);
      }

      _this.gl = gl;
      _this.devicePixelRatio = window.devicePixelRatio || 1;
      canvas.style.backgroundColor = contextOptions.backgroundColor || 'rgba(0,0,0,0)';

      _this.getShaders().then(function (success) {
        _this.load();

        if (!_this.program) {
          return;
        }

        _this.addListeners();

        _this.loop(); // this.animated = false;

      }, function (error) {
        console.log('error', error);
      });

      GlslCanvas.items.push(_assertThisInitialized(_assertThisInitialized(_this)));
      return _this;
    }

    _createClass(GlslCanvas, [{
      key: "getShaders",
      value: function getShaders() {
        var _this2 = this;

        return new Promise(function (resolve, reject) {
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
              return common_1.default.fetch(url) // .then((response) => response.text())
              .then(function (body) {
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
      }
    }, {
      key: "addListeners",
      value: function addListeners() {
        var _this3 = this;

        /*
        const resize = (e: Event) => {
            this.rect = this.canvas.getBoundingClientRect();
            this.trigger('resize', e);
        };
        */
        var scroll = function scroll(e) {
          _this3.rect = _this3.canvas.getBoundingClientRect();
        };

        var click = function click(e) {
          _this3.toggle();

          _this3.trigger('click', e);
        };

        var move = function move(mx, my) {
          var rect = _this3.rect,
              gap = 20;
          var x = Math.max(-gap, Math.min(rect.width + gap, (mx - rect.left) * _this3.devicePixelRatio));
          var y = Math.max(-gap, Math.min(rect.height + gap, _this3.canvas.height - (my - rect.top) * _this3.devicePixelRatio));

          if (x !== _this3.mouse.x || y !== _this3.mouse.y) {
            _this3.mouse.x = x;
            _this3.mouse.y = y;

            _this3.trigger('move', _this3.mouse);
          }
        };

        var mousemove = function mousemove(e) {
          move(e.clientX || e.pageX, e.clientY || e.pageY);
        };

        var mouseover = function mouseover(e) {
          _this3.play();

          _this3.trigger('over', e);
        };

        var mouseout = function mouseout(e) {
          _this3.pause();

          _this3.trigger('out', e);
        };

        var touchmove = function touchmove(e) {
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
            move(touch.x / e.touches.length, touch.y / e.touches.length);
          }
        };

        var touchend = function touchend(e) {
          _this3.pause();

          _this3.trigger('out', e);

          document.removeEventListener('touchend', touchend);
        };

        var touchstart = function touchstart(e) {
          _this3.play();

          _this3.trigger('over', e);

          document.addEventListener('touchend', touchend);
          document.removeEventListener('mousemove', mousemove);

          if (_this3.canvas.hasAttribute('controls')) {
            _this3.canvas.removeEventListener('mouseover', mouseover);

            _this3.canvas.removeEventListener('mouseout', mouseout);
          }
        };

        var loop = function loop(time) {
          _this3.checkRender();

          window.requestAnimationFrame(loop);
        };

        this.loop = loop; // window.addEventListener('resize', resize);

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

        this.removeListeners = function () {
          // window.removeEventListener('resize', resize);
          window.removeEventListener('scroll', scroll);
          document.removeEventListener('mousemove', mousemove);
          document.removeEventListener('touchmove', touchmove);

          if (_this3.canvas.hasAttribute('controls')) {
            _this3.canvas.removeEventListener('click', click);

            _this3.canvas.removeEventListener('mouseover', mouseover);

            _this3.canvas.removeEventListener('mouseout', mouseout);

            _this3.canvas.removeEventListener('touchstart', touchstart);
          }
        };
      }
    }, {
      key: "load",
      value: function load(fragmentString, vertexString) {
        if (vertexString) {
          this.vertexString = vertexString;
        }

        if (fragmentString) {
          this.fragmentString = fragmentString;
        }

        var gl = this.gl;
        var vertexShader, fragmentShader;

        try {
          vertexShader = context_1.default.createShader(gl, this.vertexString, gl.VERTEX_SHADER);
          fragmentShader = context_1.default.createShader(gl, this.fragmentString, gl.FRAGMENT_SHADER); // If Fragment shader fails load a empty one to sign the error

          if (!fragmentShader) {
            fragmentShader = context_1.default.createShader(gl, context_1.ContextDefaultFragment, gl.FRAGMENT_SHADER);
            this.valid = false;
          } else {
            this.valid = true;
          }
        } catch (e) {
          console.log(e);
          this.trigger('error', e);
          return;
        } // Create and use program


        var program = context_1.default.createProgram(gl, [vertexShader, fragmentShader]); //, [0,1],['a_texcoord','a_position']);

        gl.useProgram(program); // Delete shaders
        // gl.detachShader(program, vertexShader);
        // gl.detachShader(program, fragmentShader);

        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        this.program = program;

        if (this.valid) {
          this.buffers = buffers_1.default.getBuffers(gl, this.fragmentString, this.vertexString);
          this.vertexBuffers = context_1.default.createVertexBuffers(gl, program);
          this.createUniforms();
        } // Trigger event


        this.trigger('load', this);
      }
    }, {
      key: "test",
      value: function test(fragmentString, vertexString) {
        var _this4 = this;

        return new Promise(function (resolve, reject) {
          var vertex = _this4.vertexString;
          var fragment = _this4.fragmentString;
          var paused = _this4.timer.paused; // Thanks to @thespite for the help here
          // https://www.khronos.org/registry/webgl/extensions/EXT_disjoint_timer_query/

          var extension = _this4.gl.getExtension('EXT_disjoint_timer_query');

          var query = extension.createQueryEXT();
          var wasValid = _this4.valid;

          if (fragmentString || vertexString) {
            _this4.load(fragmentString, vertexString);

            wasValid = _this4.valid;

            _this4.render();
          }

          _this4.timer.paused = true;
          extension.beginQueryEXT(extension.TIME_ELAPSED_EXT, query);

          _this4.render();

          extension.endQueryEXT(extension.TIME_ELAPSED_EXT);

          var waitForTest = function waitForTest() {
            _this4.render();

            var available = extension.getQueryObjectEXT(query, extension.QUERY_RESULT_AVAILABLE_EXT);

            var disjoint = _this4.gl.getParameter(extension.GPU_DISJOINT_EXT);

            if (available && !disjoint) {
              var result = {
                wasValid: wasValid,
                fragment: fragmentString || _this4.fragmentString,
                vertex: vertexString || _this4.vertexString,
                timeElapsedMs: extension.getQueryObjectEXT(query, extension.QUERY_RESULT_EXT) / 1000000.0
              };
              _this4.timer.paused = paused;

              if (fragmentString || vertexString) {
                _this4.load(fragment, vertex);
              }

              resolve(result);
            } else {
              window.requestAnimationFrame(waitForTest);
            }
          };

          waitForTest();
        });
      }
    }, {
      key: "destroy",
      value: function destroy() {
        this.removeListeners();
        this.animated = false;
        this.valid = false;
        var gl = this.gl;
        gl.useProgram(null);
        gl.deleteProgram(this.program);

        for (var key in this.buffers.values) {
          var buffer = this.buffers.values[key];
          buffer.destroy(gl);
        }

        for (var _key in this.textures.values) {
          var texture = this.textures.values[_key];
          texture.destroy(gl);
        }

        this.buffers = null;
        this.textures = null;
        this.uniforms = null;
        this.program = null;
        this.gl = null;
        GlslCanvas.items.splice(GlslCanvas.items.indexOf(this), 1);
      }
    }, {
      key: "setUniformArray",
      value: function setUniformArray(key, values) {
        var _uniforms_1$default,
            _this5 = this;

        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

        var uniform = (_uniforms_1$default = uniforms_1.default).parseUniform.apply(_uniforms_1$default, [key].concat(_toConsumableArray(values)));

        if (Array.isArray(uniform)) {
          uniform.forEach(function (x) {
            return _this5.loadTexture(x.key, x.values[0]);
          }, options);
        } else if (uniform) {
          switch (uniform.type) {
            case uniforms_1.UniformType.Sampler2D:
              this.loadTexture(key, values[0]);
              break;

            default:
              this.uniforms.set(key, uniform);
          }
        }
      }
    }, {
      key: "setUniform",
      value: function setUniform(key) {
        for (var _len = arguments.length, values = new Array(_len > 1 ? _len - 1 : 0), _key2 = 1; _key2 < _len; _key2++) {
          values[_key2 - 1] = arguments[_key2];
        }

        return this.setUniformArray(key, values);
      }
    }, {
      key: "setTexture",
      value: function setTexture(key, urlElementOrData) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        return this.setUniformArray(key, [urlElementOrData], options);
      }
    }, {
      key: "setUniforms",
      value: function setUniforms(values) {
        for (var key in values) {
          this.setUniform(key, values[key]);
        }
      }
    }, {
      key: "pause",
      value: function pause() {
        if (this.valid) {
          this.timer.pause();
          this.canvas.classList.add('paused');
          this.trigger('pause');
        }
      }
    }, {
      key: "play",
      value: function play() {
        if (this.valid) {
          this.timer.play();
          this.canvas.classList.remove('paused');
          this.trigger('play');
        }
      }
    }, {
      key: "toggle",
      value: function toggle() {
        if (this.valid) {
          if (this.timer.paused) {
            this.play();
          } else {
            this.pause();
          }
        }
      }
    }, {
      key: "isVisible",
      value: function isVisible() {
        var rect = this.rect;
        return rect.top + rect.height > 0 && rect.top < (window.innerHeight || document.documentElement.clientHeight);
      }
    }, {
      key: "isAnimated",
      value: function isAnimated() {
        return (this.animated || this.textures.animated) && !this.timer.paused;
      }
    }, {
      key: "isDirty",
      value: function isDirty() {
        return this.dirty || this.uniforms.dirty || this.textures.dirty;
      } // check size change at start of requestFrame

    }, {
      key: "sizeDidChanged",
      value: function sizeDidChanged() {
        var gl = this.gl;
        var W = Math.ceil(this.canvas.clientWidth),
            H = Math.ceil(this.canvas.clientHeight);

        if (this.width !== W || this.height !== H) {
          this.width = W;
          this.height = H; // Lookup the size the browser is displaying the canvas in CSS pixels
          // and compute a size needed to make our drawingbuffer match it in
          // device pixels.

          var BW = Math.ceil(W * this.devicePixelRatio);
          var BH = Math.ceil(H * this.devicePixelRatio);
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

          for (var key in this.buffers.values) {
            var buffer = this.buffers.values[key];
            buffer.resize(gl, BW, BH);
          }

          this.rect = this.canvas.getBoundingClientRect();
          this.trigger('resize'); // gl.useProgram(this.program);

          return true;
        } else {
          return false;
        }
      }
    }, {
      key: "checkRender",
      value: function checkRender() {
        if (this.isVisible() && (this.sizeDidChanged() || this.isAnimated() || this.isDirty())) {
          this.render();
          this.canvas.classList.add('playing');
        } else {
          this.canvas.classList.remove('playing');
        }
      }
    }, {
      key: "createUniforms",
      value: function createUniforms() {
        var _this6 = this;

        var gl = this.gl;
        var fragmentString = this.fragmentString;
        var BW = gl.drawingBufferWidth;
        var BH = gl.drawingBufferHeight;
        var timer = this.timer = new GlslCanvasTimer();
        var hasDelta = (fragmentString.match(/u_delta/g) || []).length > 1;
        var hasTime = (fragmentString.match(/u_time/g) || []).length > 1;
        var hasDate = (fragmentString.match(/u_date/g) || []).length > 1;
        var hasMouse = (fragmentString.match(/u_mouse/g) || []).length > 1;
        var hasTextures = this.parseTextures(fragmentString);
        this.animated = hasTime || hasDate || hasMouse;

        if (this.animated) {
          this.canvas.classList.add('animated');
        } else {
          this.canvas.classList.remove('animated');
        }

        this.uniforms.create(uniforms_1.UniformMethod.Uniform2f, uniforms_1.UniformType.FloatVec2, 'u_resolution', BW, BH);

        if (hasDelta) {
          this.uniforms.create(uniforms_1.UniformMethod.Uniform1f, uniforms_1.UniformType.Float, 'u_delta', timer.delta / 1000.0);
        }

        if (hasTime) {
          this.uniforms.create(uniforms_1.UniformMethod.Uniform1f, uniforms_1.UniformType.Float, 'u_time', timer.current / 1000.0);
        }

        if (hasDate) {
          var date = new Date();
          this.uniforms.create(uniforms_1.UniformMethod.Uniform4f, uniforms_1.UniformType.Float, 'u_date', date.getFullYear(), date.getMonth(), date.getDate(), date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds() + date.getMilliseconds() * 0.001);
        }

        if (hasMouse) {
          this.uniforms.create(uniforms_1.UniformMethod.Uniform2f, uniforms_1.UniformType.FloatVec2, 'u_mouse', 0, 0);
        }

        for (var key in this.buffers.values) {
          var buffer = this.buffers.values[key];
          this.uniforms.create(uniforms_1.UniformMethod.Uniform1i, uniforms_1.UniformType.Sampler2D, buffer.key, buffer.input.index);
        }

        if (hasTextures) {
          this.textureList.forEach(function (x) {
            _this6.loadTexture(x.key, x.url);
          });
          this.textureList = [];
        }
      }
    }, {
      key: "parseTextures",
      value: function parseTextures(fragmentString) {
        var _this7 = this;

        var regexp = /uniform\s*sampler2D\s*([\w]*);(\s*\/\/\s*([\w|\:\/\/|\.|\-|\_]*)|\s*)/gm;
        var matches;

        while ((matches = regexp.exec(fragmentString)) !== null) {
          var key = matches[1];

          if (matches[3]) {
            var ext = matches[3].split('.').pop().toLowerCase();
            var url = matches[3];

            if (url && textures_1.TextureExtensions.indexOf(ext) !== -1) {
              this.textureList.push({
                key: key,
                url: url
              });
            }
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
            var key = 'u_tex' + i;

            _this7.textureList.push({
              key: key,
              url: url
            });
          });
        }

        return this.textureList.length > 0;
      }
    }, {
      key: "loadTexture",
      value: function loadTexture(key, urlElementOrData) {
        var _this8 = this;

        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        if (this.valid) {
          return this.textures.createOrUpdate(this.gl, key, urlElementOrData, this.buffers.count, options).then(function (texture) {
            var index = texture.index;

            var uniform = _this8.uniforms.createTexture(key, index);

            uniform.texture = texture;
            var keyResolution = key.indexOf('[') !== -1 ? key.replace('[', 'Resolution[') : key + 'Resolution';

            var uniformResolution = _this8.uniforms.create(uniforms_1.UniformMethod.Uniform2f, uniforms_1.UniformType.FloatVec2, keyResolution, texture.width, texture.height); // console.log('loadTexture', key, url, index, texture.width, texture.height);


            return texture;
          });
        } else {
          this.textureList.push({
            key: key,
            url: urlElementOrData
          });
        }
      }
    }, {
      key: "updateUniforms",
      value: function updateUniforms() {
        var gl = this.gl;
        var BW = gl.drawingBufferWidth;
        var BH = gl.drawingBufferHeight;
        var timer = this.timer.next();
        this.uniforms.update(uniforms_1.UniformMethod.Uniform2f, uniforms_1.UniformType.FloatVec2, 'u_resolution', BW, BH);

        if (this.uniforms.has('u_delta')) {
          this.uniforms.update(uniforms_1.UniformMethod.Uniform1f, uniforms_1.UniformType.Float, 'u_delta', timer.delta / 1000.0);
        }

        if (this.uniforms.has('u_time')) {
          this.uniforms.update(uniforms_1.UniformMethod.Uniform1f, uniforms_1.UniformType.Float, 'u_time', timer.current / 1000.0);
        }

        if (this.uniforms.has('u_date')) {
          var date = new Date();
          this.uniforms.update(uniforms_1.UniformMethod.Uniform4f, uniforms_1.UniformType.Float, 'u_date', date.getFullYear(), date.getMonth(), date.getDate(), date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds() + date.getMilliseconds() * 0.001);
        }

        if (this.uniforms.has('u_mouse')) {
          var mouse = this.mouse;
          this.uniforms.update(uniforms_1.UniformMethod.Uniform2f, uniforms_1.UniformType.FloatVec2, 'u_mouse', mouse.x, mouse.y);
          /*
          const rect = this.rect;
          if (mouse.x >= rect.left && mouse.x <= rect.right &&
              mouse.y >= rect.top && mouse.y <= rect.bottom) {
              const MX = (mouse.x - rect.left) * this.devicePixelRatio;
              const MY = (this.canvas.height - (mouse.y - rect.top) * this.devicePixelRatio);
              this.uniforms.update(UniformMethod.Uniform2f, UniformType.FloatVec2, 'u_mouse', MX, MY);
          }
          */
        }

        for (var key in this.buffers.values) {
          var buffer = this.buffers.values[key];
          this.uniforms.update(uniforms_1.UniformMethod.Uniform1i, uniforms_1.UniformType.Sampler2D, buffer.key, buffer.input.index);
        }

        for (var _key3 in this.textures.values) {
          var texture = this.textures.values[_key3];
          texture.tryUpdate(gl);
          this.uniforms.update(uniforms_1.UniformMethod.Uniform1i, uniforms_1.UniformType.Sampler2D, texture.key, texture.index);
        }
      }
    }, {
      key: "render",
      value: function render() {
        var gl = this.gl;
        var BW = gl.drawingBufferWidth;
        var BH = gl.drawingBufferHeight;
        this.updateUniforms();

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
      }
    }], [{
      key: "version",
      value: function version() {
        return '0.2.0';
      }
    }, {
      key: "of",
      value: function of(canvas) {
        return GlslCanvas.items.find(function (x) {
          return x.canvas === canvas;
        }) || new GlslCanvas(canvas);
      }
    }, {
      key: "loadAll",
      value: function loadAll() {
        var canvases = [].slice.call(document.getElementsByClassName('glsl-canvas')).filter(function (x) {
          return x instanceof HTMLCanvasElement;
        });
        return canvases.map(function (x) {
          return GlslCanvas.of(x);
        });
      }
    }]);

    return GlslCanvas;
  }(subscriber_1.default);

  GlslCanvas.items = [];
  exports.default = GlslCanvas;
  window.GlslCanvas = GlslCanvas;
  document.addEventListener("DOMContentLoaded", GlslCanvas.loadAll);
});

},{"./buffers":4,"./common":5,"./context":6,"./subscriber":9,"./textures":10,"./uniforms":11,"promise-polyfill":2}],8:[function(require,module,exports){
"use strict";

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

(function (factory) {
  if ((typeof module === "undefined" ? "undefined" : _typeof(module)) === "object" && _typeof(module.exports) === "object") {
    var v = factory(require, exports);
    if (v !== undefined) module.exports = v;
  } else if (typeof define === "function" && define.amd) {
    define(["require", "exports"], factory);
  }
})(function (require, exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var NumberMap = function NumberMap() {
    _classCallCheck(this, NumberMap);
  };

  exports.NumberMap = NumberMap;
  ;

  var StringMap = function StringMap() {
    _classCallCheck(this, StringMap);
  };

  exports.StringMap = StringMap;
  ;

  var IterableStringMap =
  /*#__PURE__*/
  function () {
    function IterableStringMap() {
      _classCallCheck(this, IterableStringMap);

      this.values = new StringMap();
    }

    _createClass(IterableStringMap, [{
      key: "has",
      value: function has(key) {
        return this.values.hasOwnProperty(key);
      }
    }, {
      key: "set",
      value: function set(key, item) {
        this.values[key] = item;
      }
    }, {
      key: "get",
      value: function get(key) {
        return this.values[key];
      }
    }, {
      key: "forEach",
      value: function forEach(callbackfn) {
        var i = 0;

        for (var key in this.values) {
          callbackfn(this.values[key], i, this.values);
          i++;
        }
      }
    }, {
      key: "reduce",
      value: function reduce(callbackfn, initialValue) {
        var previous = initialValue,
            i = 0;

        for (var key in this.values) {
          previous = callbackfn(previous, this.values[key], i, this.values);
          i++;
        }

        return previous;
      }
    }]);

    return IterableStringMap;
  }();

  exports.default = IterableStringMap;
});

},{}],9:[function(require,module,exports){
"use strict";

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

(function (factory) {
  if ((typeof module === "undefined" ? "undefined" : _typeof(module)) === "object" && _typeof(module.exports) === "object") {
    var v = factory(require, exports);
    if (v !== undefined) module.exports = v;
  } else if (typeof define === "function" && define.amd) {
    define(["require", "exports"], factory);
  }
})(function (require, exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var Listener = function Listener(event, callback) {
    _classCallCheck(this, Listener);

    this.event = event;
    this.callback = callback;
  };

  exports.Listener = Listener;

  var Subscriber =
  /*#__PURE__*/
  function () {
    function Subscriber() {
      _classCallCheck(this, Subscriber);

      this.listeners = new Set();
    }

    _createClass(Subscriber, [{
      key: "logListeners",
      value: function logListeners() {
        this.listeners.forEach(function (x) {
          return console.log(x);
        });
      }
    }, {
      key: "subscribe",
      value: function subscribe(listener) {
        this.listeners.add(listener);
      }
    }, {
      key: "unsubscribe",
      value: function unsubscribe(listener) {
        this.listeners.delete(listener);
      }
    }, {
      key: "unsubscribeAll",
      value: function unsubscribeAll() {
        this.listeners.clear();
      }
    }, {
      key: "on",
      value: function on(event, callback) {
        this.listeners.add(new Listener(event, callback));
        return this;
      }
    }, {
      key: "off",
      value: function off(event, callback) {
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
      }
    }, {
      key: "trigger",
      value: function trigger(event) {
        for (var _len = arguments.length, data = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          data[_key - 1] = arguments[_key];
        }

        this.listeners.forEach(function (x) {
          if (x.event === event && typeof x.callback === 'function') {
            x.callback.apply(x, data);
          }
        });
        return this;
      }
    }]);

    return Subscriber;
  }();

  exports.default = Subscriber;
});

},{}],10:[function(require,module,exports){
"use strict";

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var __importDefault = void 0 && (void 0).__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

(function (factory) {
  if ((typeof module === "undefined" ? "undefined" : _typeof(module)) === "object" && _typeof(module.exports) === "object") {
    var v = factory(require, exports);
    if (v !== undefined) module.exports = v;
  } else if (typeof define === "function" && define.amd) {
    define(["require", "exports", "./iterable", "./subscriber"], factory);
  }
})(function (require, exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  }); // import 'promise-polyfill';

  var iterable_1 = __importDefault(require("./iterable"));

  var subscriber_1 = __importDefault(require("./subscriber"));

  exports.TextureImageExtensions = ['jpg', 'jpeg', 'png'];
  exports.TextureVideoExtensions = ['ogv', 'webm', 'mp4'];
  exports.TextureExtensions = exports.TextureImageExtensions.concat(exports.TextureVideoExtensions);
  var TextureSourceType;

  (function (TextureSourceType) {
    TextureSourceType[TextureSourceType["Data"] = 0] = "Data";
    TextureSourceType[TextureSourceType["Element"] = 1] = "Element";
    TextureSourceType[TextureSourceType["Url"] = 2] = "Url";
  })(TextureSourceType || (TextureSourceType = {}));

  var TextureFilteringType;

  (function (TextureFilteringType) {
    TextureFilteringType["MipMap"] = "mipmap";
    TextureFilteringType["Linear"] = "linear";
    TextureFilteringType["Nearest"] = "nearest";
  })(TextureFilteringType || (TextureFilteringType = {}));

  var TextureData = function TextureData() {
    _classCallCheck(this, TextureData);
  };

  exports.TextureData = TextureData;

  var TextureOptions = function TextureOptions() {
    _classCallCheck(this, TextureOptions);
  };

  exports.TextureOptions = TextureOptions; // GL texture wrapper object for keeping track of a global set of textures, keyed by a unique user-defined name

  var Texture =
  /*#__PURE__*/
  function (_subscriber_1$default) {
    _inherits(Texture, _subscriber_1$default);

    function Texture(gl, key, index) {
      var _this;

      var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : new TextureOptions();

      _classCallCheck(this, Texture);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(Texture).call(this));
      _this.valid = false;
      _this.dirty = false;
      _this.animated = false;
      _this.powerOf2 = false;
      _this.key = key;
      _this.index = index;
      _this.options = options;

      _this.create(gl);

      return _this;
    }

    _createClass(Texture, [{
      key: "create",
      value: function create(gl) {
        this.texture = gl.createTexture();

        if (this.texture) {
          this.valid = true;
        } // Default to a 1-pixel black texture so we can safely render while we wait for an image to load
        // See: http://stackoverflow.com/questions/19722247/webgl-wait-for-texture-to-load
        // [255, 255, 255, 255]


        this.setData(gl, 1, 1, new Uint8Array([0, 0, 0, 0]), {
          filtering: TextureFilteringType.Linear
        }); // this.bindTexture();
        // this.load(options);
      }
    }, {
      key: "load",
      value: function load(gl) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
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
        }
      }
    }, {
      key: "setUrl",
      value: function setUrl(gl, url) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        if (!this.valid) {
          return;
        }

        this.url = url; // save URL reference (will be overwritten when element is loaded below)

        this.source = url;
        this.sourceType = TextureSourceType.Url;
        this.options = Object.assign(this.options, options);
        var ext = url.split('.').pop().toLowerCase();
        var isVideo = exports.TextureVideoExtensions.indexOf(ext) !== -1;
        var element;
        var promise;

        if (isVideo) {
          element = document.createElement('video'); // options.filtering = TextureFilteringType.Nearest;

          promise = this.setElement(gl, element, options);
          element.setAttribute('playsinline', 'true');
          element.autoplay = true;
          element.muted = true;
          element.src = url;
        } else {
          element = new Image();
          promise = this.setElement(gl, element, options);

          if (!(Texture.isSafari() && url.slice(0, 5) === 'data:')) {
            element.crossOrigin = 'anonymous';
          }

          element.src = url;
        }

        return promise;
      }
    }, {
      key: "setElement",
      value: function setElement(gl, element) {
        var _this2 = this;

        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        this.options = Object.assign(this.options, options);
        return new Promise(function (resolve, reject) {
          var originalElement = element; // a string element is interpeted as a CSS selector

          if (typeof element === 'string') {
            element = document.querySelector(element);
          }

          if (element instanceof HTMLCanvasElement || element instanceof HTMLImageElement || element instanceof HTMLVideoElement) {
            _this2.source = element;
            _this2.sourceType = TextureSourceType.Element;

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
            var message = "the 'element' parameter (`element: ".concat(JSON.stringify(originalElement), "`) must be a CSS selector string, or a <canvas>, <image> or <video> object");
            console.log("Texture '".concat(_this2.key, "': ").concat(message), options);
            reject(message);
          }
        });
      }
    }, {
      key: "setData",
      value: function setData(gl, width, height, data) {
        var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
        this.width = width;
        this.height = height;
        this.options = Object.assign(this.options, options);
        this.source = data;
        this.sourceType = TextureSourceType.Data;
        this.update(gl, options);
        this.setFiltering(gl, options);
        return Promise.resolve(this);
      } // Uploads current image or buffer to the GPU (can be used to update animated textures on the fly)

    }, {
      key: "update",
      value: function update(gl, options) {
        if (!this.valid) {
          return;
        }

        gl.activeTexture(gl.TEXTURE0 + this.index);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, options.UNPACK_FLIP_Y_WEBGL === false ? 0 : 1);
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
          var imageBuffer = this.source;
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, imageBuffer);
        }

        this.trigger('loaded', this);
      }
    }, {
      key: "tryUpdate",
      value: function tryUpdate(gl) {
        var dirty = false;

        if (this.animated) {
          dirty = true;
          this.update(gl, this.options);
        }

        return dirty;
      }
    }, {
      key: "destroy",
      value: function destroy(gl) {
        if (!this.valid) {
          return;
        }

        gl.deleteTexture(this.texture);
        this.texture = null;
        delete this.source;
        this.source = null;
        this.valid = false;
      }
    }, {
      key: "setFiltering",
      value: function setFiltering(gl, options) {
        if (!this.valid) {
          return;
        }

        var powerOf2 = Texture.isPowerOf2(this.width) && Texture.isPowerOf2(this.height);
        var filtering = options.filtering || TextureFilteringType.MipMap;
        var wrapS = options.TEXTURE_WRAP_S || options.repeat && gl.REPEAT || gl.CLAMP_TO_EDGE;
        var wrapT = options.TEXTURE_WRAP_T || options.repeat && gl.REPEAT || gl.CLAMP_TO_EDGE;

        if (!powerOf2) {
          filtering = filtering === TextureFilteringType.MipMap ? TextureFilteringType.Linear : filtering;
          wrapS = wrapT = gl.CLAMP_TO_EDGE;
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
    }], [{
      key: "isPowerOf2",
      value: function isPowerOf2(value) {
        return (value & value - 1) === 0;
      }
    }, {
      key: "isSafari",
      value: function isSafari() {
        return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      }
    }, {
      key: "isTextureUrl",
      value: function isTextureUrl(text) {
        return /\.(jpg|jpeg|png|ogv|webm|mp4)$/i.test(text);
      }
    }, {
      key: "isTexture",
      value: function isTexture(urlElementOrData) {
        var options = Texture.getTextureOptions(urlElementOrData);
        return options !== undefined;
      }
    }, {
      key: "getMaxTextureSize",
      value: function getMaxTextureSize(gl) {
        return gl.getParameter(gl.MAX_TEXTURE_SIZE);
      }
    }, {
      key: "getTextureOptions",
      value: function getTextureOptions(urlElementOrData) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        if (typeof urlElementOrData === 'string') {
          if (Texture.isTextureUrl(urlElementOrData)) {
            options.url = urlElementOrData;
            return options;
          }

          if (document) {
            urlElementOrData = document.querySelector(urlElementOrData); // console.log(urlElementOrData);
          }
        }

        if (urlElementOrData instanceof HTMLCanvasElement || urlElementOrData instanceof HTMLImageElement || urlElementOrData instanceof HTMLVideoElement) {
          options.element = urlElementOrData;
          return options;
        } else if (urlElementOrData instanceof TextureData) {
          options.data = urlElementOrData.data;
          options.width = urlElementOrData.width;
          options.height = urlElementOrData.height;
          return options;
        }
      }
    }]);

    return Texture;
  }(subscriber_1.default);

  exports.Texture = Texture;

  var Textures =
  /*#__PURE__*/
  function (_iterable_1$default) {
    _inherits(Textures, _iterable_1$default);

    function Textures() {
      var _this3;

      _classCallCheck(this, Textures);

      _this3 = _possibleConstructorReturn(this, _getPrototypeOf(Textures).apply(this, arguments));
      _this3.count = 0;
      _this3.dirty = false;
      _this3.animated = false;
      return _this3;
    }

    _createClass(Textures, [{
      key: "clean",
      value: function clean() {
        for (var key in this.values) {
          this.values[key].dirty = false;
        }

        this.dirty = false;
      }
    }, {
      key: "createOrUpdate",
      value: function createOrUpdate(gl, key, urlElementOrData) {
        var _this4 = this;

        var index = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
        var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
        var texture;
        var textureOptions = Texture.getTextureOptions(urlElementOrData, options);
        texture = this.get(key);

        if (!texture) {
          texture = new Texture(gl, key, index + this.count, textureOptions);
          this.count++;
          this.set(key, texture);
        }

        if (textureOptions !== undefined) {
          return texture.load(gl, textureOptions).then(function (texture) {
            if (texture.source instanceof HTMLVideoElement) {
              var video = texture.source; // console.log('video', video);

              video.addEventListener('play', function () {
                // console.log('play', texture.key);
                texture.animated = true;
                _this4.animated = true;
              });
              video.addEventListener('pause', function () {
                // console.log('pause', texture.key);
                texture.animated = false;
                _this4.animated = _this4.reduce(function (flag, texture) {
                  return flag || texture.animated;
                }, false);
              });
              video.addEventListener('seeked', function () {
                // console.log('seeked');
                texture.update(gl, texture.options);
                _this4.dirty = true;
              }); // console.log('video');

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
      }
    }]);

    return Textures;
  }(iterable_1.default);

  exports.default = Textures;
});

},{"./iterable":8,"./subscriber":9}],11:[function(require,module,exports){
"use strict";

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var __importDefault = void 0 && (void 0).__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

(function (factory) {
  if ((typeof module === "undefined" ? "undefined" : _typeof(module)) === "object" && _typeof(module.exports) === "object") {
    var v = factory(require, exports);
    if (v !== undefined) module.exports = v;
  } else if (typeof define === "function" && define.amd) {
    define(["require", "exports", "./iterable", "./textures"], factory);
  }
})(function (require, exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var iterable_1 = __importDefault(require("./iterable"));

  var textures_1 = require("./textures");

  var UniformMethod;

  (function (UniformMethod) {
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
  })(UniformMethod = exports.UniformMethod || (exports.UniformMethod = {}));

  var UniformType;

  (function (UniformType) {
    UniformType[UniformType["Int"] = 0] = "Int";
    UniformType[UniformType["IntArray"] = 1] = "IntArray";
    UniformType[UniformType["IntVec2"] = 2] = "IntVec2";
    UniformType[UniformType["IntVec2Array"] = 3] = "IntVec2Array";
    UniformType[UniformType["IntVec3"] = 4] = "IntVec3";
    UniformType[UniformType["IntVec3Array"] = 5] = "IntVec3Array";
    UniformType[UniformType["IntVec4"] = 6] = "IntVec4";
    UniformType[UniformType["IntVec4Array"] = 7] = "IntVec4Array";
    UniformType[UniformType["Float"] = 8] = "Float";
    UniformType[UniformType["FloatArray"] = 9] = "FloatArray";
    UniformType[UniformType["FloatVec2"] = 10] = "FloatVec2";
    UniformType[UniformType["FloatVec2Array"] = 11] = "FloatVec2Array";
    UniformType[UniformType["FloatVec3"] = 12] = "FloatVec3";
    UniformType[UniformType["FloatVec3Array"] = 13] = "FloatVec3Array";
    UniformType[UniformType["FloatVec4"] = 14] = "FloatVec4";
    UniformType[UniformType["FloatVec4Array"] = 15] = "FloatVec4Array";
    UniformType[UniformType["Bool"] = 16] = "Bool";
    UniformType[UniformType["BoolArray"] = 17] = "BoolArray";
    UniformType[UniformType["BoolVec2"] = 18] = "BoolVec2";
    UniformType[UniformType["BoolVec2Array"] = 19] = "BoolVec2Array";
    UniformType[UniformType["BoolVec3"] = 20] = "BoolVec3";
    UniformType[UniformType["BoolVec3Array"] = 21] = "BoolVec3Array";
    UniformType[UniformType["BoolVec4"] = 22] = "BoolVec4";
    UniformType[UniformType["BoolVec4Array"] = 23] = "BoolVec4Array";
    UniformType[UniformType["Sampler2D"] = 24] = "Sampler2D";
    UniformType[UniformType["Sampler2DArray"] = 25] = "Sampler2DArray";
    UniformType[UniformType["SamplerCube"] = 26] = "SamplerCube";
    UniformType[UniformType["SamplerCubeArray"] = 27] = "SamplerCubeArray";
    UniformType[UniformType["Matrix2fv"] = 28] = "Matrix2fv";
    UniformType[UniformType["Matrix3fv"] = 29] = "Matrix3fv";
    UniformType[UniformType["Matrix4fv"] = 30] = "Matrix4fv";
  })(UniformType = exports.UniformType || (exports.UniformType = {}));

  var Uniform =
  /*#__PURE__*/
  function () {
    function Uniform(options) {
      var _this = this;

      _classCallCheck(this, Uniform);

      this.dirty = true;

      if (options) {
        Object.assign(this, options);
      }

      this.apply = function (gl, program) {
        if (_this.dirty) {
          gl.useProgram(program);
          var location = gl.getUniformLocation(program, _this.key); // console.log(this.key, this.method, this.values);
          // (gl as any)[this.method].apply(gl, [location].concat(this.values));

          gl[_this.method].apply(gl, [location].concat(_this.values));
        }
      };
    }

    _createClass(Uniform, null, [{
      key: "Differs",
      value: function Differs(a, b) {
        return a.length !== b.length || a.reduce(function (f, v, i) {
          return f || v !== b[i];
        }, false);
      }
    }]);

    return Uniform;
  }();

  exports.Uniform = Uniform;

  var UniformTexture =
  /*#__PURE__*/
  function (_Uniform) {
    _inherits(UniformTexture, _Uniform);

    function UniformTexture(options) {
      _classCallCheck(this, UniformTexture);

      return _possibleConstructorReturn(this, _getPrototypeOf(UniformTexture).call(this, options));
    }

    return UniformTexture;
  }(Uniform);

  exports.UniformTexture = UniformTexture;

  var Uniforms =
  /*#__PURE__*/
  function (_iterable_1$default) {
    _inherits(Uniforms, _iterable_1$default);

    function Uniforms() {
      var _this2;

      _classCallCheck(this, Uniforms);

      _this2 = _possibleConstructorReturn(this, _getPrototypeOf(Uniforms).apply(this, arguments));
      _this2.dirty = false;
      return _this2;
    }

    _createClass(Uniforms, [{
      key: "clean",

      /*
      static parseUniforms(values: any, prefix?: string): Map<string, Uniform> {
          const uniforms = new Map<string, Uniform>();
          for (let key in values) {
              const value = values[key];
              if (prefix) {
                  key = prefix + '.' + key;
              }
              const uniform: Uniform = Uniforms.parseUniform(key, value);
              if (uniform) {
                  uniforms.set(key, uniform);
              }
          }
          return uniforms;
      }
      */
      value: function clean() {
        for (var key in this.values) {
          this.values[key].dirty = false;
        }

        this.dirty = false;
      }
      /*
      setParse(key: string, ...values: any[]): Uniform {
          const uniform: Uniform = Uniforms.parseUniform(key, ...values);
          if (uniform) {
              this.set(key, uniform);
          }
          return uniform;
      }
      */

    }, {
      key: "create",
      value: function create(method, type, key) {
        for (var _len = arguments.length, values = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
          values[_key - 3] = arguments[_key];
        }

        var uniform = new Uniform({
          method: method,
          type: type,
          key: key,
          values: values
        });
        this.set(key, uniform);
        this.dirty = true;
        return uniform;
      }
    }, {
      key: "createTexture",
      value: function createTexture(key, index) {
        var uniform;

        if (key.indexOf(']') !== -1) {
          uniform = new UniformTexture({
            method: UniformMethod.Uniform1iv,
            type: UniformType.Sampler2DArray,
            key: key,
            values: [[index]]
          });
        } else {
          uniform = new UniformTexture({
            method: UniformMethod.Uniform1i,
            type: UniformType.Sampler2D,
            key: key,
            values: [index]
          });
        }

        this.set(key, uniform);
        this.dirty = true;
        return uniform;
      }
    }, {
      key: "update",
      value: function update(method, type, key) {
        var uniform = this.get(key);

        for (var _len2 = arguments.length, values = new Array(_len2 > 3 ? _len2 - 3 : 0), _key2 = 3; _key2 < _len2; _key2++) {
          values[_key2 - 3] = arguments[_key2];
        }

        if (uniform && (uniform.method !== method || uniform.type !== type || Uniform.Differs(uniform.values, values))) {
          uniform.method = method;
          uniform.type = type;
          uniform.values = values;
          uniform.dirty = true;
          this.dirty = true;
        }
      }
    }, {
      key: "createOrUpdate",
      value: function createOrUpdate(method, type, key) {
        for (var _len3 = arguments.length, values = new Array(_len3 > 3 ? _len3 - 3 : 0), _key3 = 3; _key3 < _len3; _key3++) {
          values[_key3 - 3] = arguments[_key3];
        }

        if (this.has(key)) {
          this.update.apply(this, [method, type, key].concat(values));
        } else {
          this.create.apply(this, [method, type, key].concat(values));
        }
      }
    }, {
      key: "apply",
      value: function apply(gl, program) {
        for (var key in this.values) {
          this.values[key].apply(gl, program);
        } // this.forEach(uniform => uniform.apply(gl, program));

      }
    }], [{
      key: "isArrayOfInteger",
      value: function isArrayOfInteger(array) {
        return array.reduce(function (flag, value) {
          return flag && Number.isInteger(value);
        }, true);
      }
    }, {
      key: "isArrayOfNumber",
      value: function isArrayOfNumber(array) {
        return array.reduce(function (flag, value) {
          return flag && typeof value === 'number';
        }, true);
      }
    }, {
      key: "isArrayOfBoolean",
      value: function isArrayOfBoolean(array) {
        return array.reduce(function (flag, value) {
          return flag && typeof value === 'boolean';
        }, true);
      }
    }, {
      key: "isArrayOfTexture",
      value: function isArrayOfTexture(array) {
        return array.reduce(function (flag, value) {
          return flag && textures_1.Texture.isTexture(value);
        }, true);
      }
    }, {
      key: "parseUniform",
      value: function parseUniform(key) {
        for (var _len4 = arguments.length, values = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
          values[_key4 - 1] = arguments[_key4];
        }

        var uniform;

        if (Uniforms.isArrayOfInteger(values)) {
          switch (values.length) {
            case 1:
              uniform = new Uniform({
                method: UniformMethod.Uniform1i,
                type: UniformType.Int,
                key: key,
                values: values
              });
              break;

            case 2:
              uniform = new Uniform({
                method: UniformMethod.Uniform2i,
                type: UniformType.IntVec2,
                key: key,
                values: values
              });
              break;

            case 3:
              uniform = new Uniform({
                method: UniformMethod.Uniform3i,
                type: UniformType.IntVec3,
                key: key,
                values: values
              });
              break;

            case 4:
              uniform = new Uniform({
                method: UniformMethod.Uniform4i,
                type: UniformType.IntVec4,
                key: key,
                values: values
              });
              break;
          }
        } else if (Uniforms.isArrayOfNumber(values)) {
          switch (values.length) {
            case 1:
              uniform = new Uniform({
                method: UniformMethod.Uniform1f,
                type: UniformType.Float,
                key: key,
                values: values
              });
              break;

            case 2:
              uniform = new Uniform({
                method: UniformMethod.Uniform2f,
                type: UniformType.FloatVec2,
                key: key,
                values: values
              });
              break;

            case 3:
              uniform = new Uniform({
                method: UniformMethod.Uniform3f,
                type: UniformType.FloatVec3,
                key: key,
                values: values
              });
              break;

            case 4:
              uniform = new Uniform({
                method: UniformMethod.Uniform4f,
                type: UniformType.FloatVec4,
                key: key,
                values: values
              });
              break;
          }
        } else if (Uniforms.isArrayOfBoolean(values)) {
          switch (values.length) {
            case 1:
              uniform = new Uniform({
                method: UniformMethod.Uniform1i,
                type: UniformType.Bool,
                key: key,
                values: values
              });
              break;

            case 2:
              uniform = new Uniform({
                method: UniformMethod.Uniform2i,
                type: UniformType.BoolVec2,
                key: key,
                values: values
              });
              break;

            case 3:
              uniform = new Uniform({
                method: UniformMethod.Uniform3i,
                type: UniformType.BoolVec3,
                key: key,
                values: values
              });
              break;

            case 4:
              uniform = new Uniform({
                method: UniformMethod.Uniform4i,
                type: UniformType.BoolVec4,
                key: key,
                values: values
              });
              break;
          }
        } else if (values.length === 1) {
          var value = values[0];

          if (textures_1.Texture.isTexture(value)) {
            uniform = new Uniform({
              method: UniformMethod.Uniform1i,
              type: UniformType.Sampler2D,
              key: key,
              values: value // !!!

            });
          } else if (Array.isArray(value)) {
            if (Uniforms.isArrayOfInteger(value)) {
              switch (value.length) {
                case 1:
                  uniform = new Uniform({
                    method: UniformMethod.Uniform1iv,
                    type: UniformType.IntArray,
                    key: key,
                    values: values
                  });
                  break;

                case 2:
                  uniform = new Uniform({
                    method: UniformMethod.Uniform2iv,
                    type: UniformType.IntVec2Array,
                    key: key,
                    values: values
                  });
                  break;

                case 3:
                  uniform = new Uniform({
                    method: UniformMethod.Uniform3iv,
                    type: UniformType.IntVec3Array,
                    key: key,
                    values: values
                  });
                  break;

                case 4:
                  uniform = new Uniform({
                    method: UniformMethod.Uniform4iv,
                    type: UniformType.IntVec4Array,
                    key: key,
                    values: values
                  });
                  break;
              }
            } else if (Uniforms.isArrayOfNumber(value)) {
              switch (value.length) {
                case 1:
                  uniform = new Uniform({
                    method: UniformMethod.Uniform1fv,
                    type: UniformType.FloatArray,
                    key: key,
                    values: values
                  });
                  break;

                case 2:
                  uniform = new Uniform({
                    method: UniformMethod.Uniform2fv,
                    type: UniformType.FloatVec2Array,
                    key: key,
                    values: values
                  });
                  break;

                case 3:
                  uniform = new Uniform({
                    method: UniformMethod.Uniform3fv,
                    type: UniformType.FloatVec3Array,
                    key: key,
                    values: values
                  });
                  break;

                case 4:
                  uniform = new Uniform({
                    method: UniformMethod.Uniform4fv,
                    type: UniformType.FloatVec4Array,
                    key: key,
                    values: values
                  });
                  break;
              }
            } else if (Uniforms.isArrayOfBoolean(value)) {
              switch (value.length) {
                case 1:
                  uniform = new Uniform({
                    method: UniformMethod.Uniform1iv,
                    type: UniformType.BoolArray,
                    key: key,
                    values: values
                  });
                  break;

                case 2:
                  uniform = new Uniform({
                    method: UniformMethod.Uniform2i,
                    type: UniformType.BoolVec2Array,
                    key: key,
                    values: values
                  });
                  break;

                case 3:
                  uniform = new Uniform({
                    method: UniformMethod.Uniform3i,
                    type: UniformType.BoolVec3Array,
                    key: key,
                    values: values
                  });
                  break;

                case 4:
                  uniform = new Uniform({
                    method: UniformMethod.Uniform4i,
                    type: UniformType.BoolVec4Array,
                    key: key,
                    values: values
                  });
                  break;
              }
            } else if (Uniforms.isArrayOfTexture(value)) {
              var uniforms = value.map(function (texture, index) {
                return new Uniform({
                  method: UniformMethod.Uniform1iv,
                  type: UniformType.Sampler2DArray,
                  key: key + '[' + index + ']',
                  values: [texture]
                });
              });
              return uniforms;
            }
          }
        }
        /*
            } else if (Array.isArray(value[0]) && typeof value[0][0] === 'number') {
                // Array of arrays - but only arrays of vectors are allowed in this case
                // float vectors (vec2, vec3, vec4)
                if (value[0].length >= 2 && value[0].length <= 4) {
                    // Set each vector in the array
                    for (let u = 0; u < value.length; u++) {
                        switch (value.length) {
                            case 2:
                                uniform = new Uniform({
                                    method: UniformMethod.Uniform2fv,
                                    type: UniformType.FloatVec2,
                                    key: key + '[' + u + ']',
                                    values: value
                                });
                                break;
                            case 3:
                                uniform = new Uniform({
                                    method: UniformMethod.Uniform3fv,
                                    type: UniformType.FloatVec3,
                                    key: key + '[' + u + ']',
                                    values: value
                                });
                                break;
                            case 4:
                                uniform = new Uniform({
                                    method: UniformMethod.Uniform4fv,
                                    type: UniformType.FloatVec4,
                                    key: key + '[' + u + ']',
                                    values: value
                                });
                                break;
                        }
                    }
                }
                // else error?
            } else if (typeof value[0] === 'object') {
                // Array of structures
                for (let u = 0; u < value.length; u++) {
                    // Set each struct in the array
                    // !!! uniform = new Uniform(...Uniforms.parseUniforms(value[u], key + '[' + u + ']'));
                }
            }
        } else if (typeof value === 'object') {
            // Structure
            // Set each field in the struct
            // !!! uniform = new Uniform(...Uniforms.parseUniforms(value, key));
        }
        // TODO: support other non-float types? (int, etc.)
        */


        return uniform;
      }
    }]);

    return Uniforms;
  }(iterable_1.default);

  exports.default = Uniforms;
});

},{"./iterable":8,"./textures":10}]},{},[7]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzcmMvZ2xzbC1jYW52YXMvZ2xzbC1jYW52YXMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gaW1wb3J0ICdAYmFiZWwvcG9seWZpbGwnO1xuLy8gaW1wb3J0ICd3aGF0d2ctZmV0Y2gnO1xuaW1wb3J0ICdwcm9taXNlLXBvbHlmaWxsJztcbmltcG9ydCBCdWZmZXJzLCB7IElPQnVmZmVyIH0gZnJvbSAnLi9idWZmZXJzJztcbmltcG9ydCBDb21tb24gZnJvbSAnLi9jb21tb24nO1xuaW1wb3J0IENvbnRleHQsIHsgQ29udGV4dERlZmF1bHRGcmFnbWVudCwgQ29udGV4dERlZmF1bHRWZXJ0ZXgsIENvbnRleHRWZXJ0ZXhCdWZmZXJzLCBJQ29udGV4dE9wdGlvbnMgfSBmcm9tICcuL2NvbnRleHQnO1xuaW1wb3J0IFN1YnNjcmliZXIgZnJvbSAnLi9zdWJzY3JpYmVyJztcbmltcG9ydCBUZXh0dXJlcywgeyBUZXh0dXJlLCBUZXh0dXJlRGF0YSwgVGV4dHVyZUV4dGVuc2lvbnMsIFRleHR1cmVPcHRpb25zIH0gZnJvbSAnLi90ZXh0dXJlcyc7XG5pbXBvcnQgVW5pZm9ybXMsIHsgSVVuaWZvcm1PcHRpb24sIFVuaWZvcm0sIFVuaWZvcm1NZXRob2QsIFVuaWZvcm1UeXBlIH0gZnJvbSAnLi91bmlmb3Jtcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVBvaW50IHtcbiAgICB4OiBudW1iZXIsXG4gICAgeTogbnVtYmVyLFxufVxuXG5leHBvcnQgY2xhc3MgR2xzbENhbnZhc09wdGlvbnMge1xuICAgIG9uRXJyb3I/OiBGdW5jdGlvbjtcbn1cblxuZXhwb3J0IGNsYXNzIEdsc2xDYW52YXNUaW1lciB7XG5cbiAgICBzdGFydDogbnVtYmVyO1xuICAgIHByZXZpb3VzOiBudW1iZXI7XG4gICAgZGVsYXk6IG51bWJlciA9IDAuMDtcbiAgICBjdXJyZW50OiBudW1iZXIgPSAwLjA7XG4gICAgZGVsdGE6IG51bWJlciA9IDAuMDtcbiAgICBwYXVzZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnN0YXJ0ID0gdGhpcy5wcmV2aW91cyA9IHRoaXMubm93KCk7XG4gICAgfVxuXG4gICAgbm93KCkge1xuICAgICAgICByZXR1cm4gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgfVxuXG4gICAgcGxheSgpIHtcbiAgICAgICAgaWYgKHRoaXMucHJldmlvdXMpIHtcbiAgICAgICAgICAgIGNvbnN0IG5vdyA9IHRoaXMubm93KCk7XG4gICAgICAgICAgICB0aGlzLmRlbGF5ICs9IChub3cgLSB0aGlzLnByZXZpb3VzKTtcbiAgICAgICAgICAgIHRoaXMucHJldmlvdXMgPSBub3c7XG4gICAgICAgIH1cbiAgICAgICAgLy8gY29uc29sZS5sb2codGhpcy5kZWxheSk7XG4gICAgICAgIHRoaXMucGF1c2VkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgcGF1c2UoKSB7XG4gICAgICAgIHRoaXMucGF1c2VkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBuZXh0KCk6IEdsc2xDYW52YXNUaW1lciB7XG4gICAgICAgIGNvbnN0IG5vdyA9IHRoaXMubm93KCk7XG4gICAgICAgIHRoaXMuZGVsdGEgPSBub3cgLSB0aGlzLnByZXZpb3VzO1xuICAgICAgICB0aGlzLmN1cnJlbnQgPSBub3cgLSB0aGlzLnN0YXJ0IC0gdGhpcy5kZWxheTtcbiAgICAgICAgdGhpcy5wcmV2aW91cyA9IG5vdztcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdsc2xDYW52YXMgZXh0ZW5kcyBTdWJzY3JpYmVyIHtcblxuICAgIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQ7XG4gICAgZ2w6IFdlYkdMUmVuZGVyaW5nQ29udGV4dDtcbiAgICBwcm9ncmFtOiBXZWJHTFByb2dyYW07XG4gICAgdGltZXI6IEdsc2xDYW52YXNUaW1lcjtcbiAgICB2ZXJ0ZXhCdWZmZXJzOiBDb250ZXh0VmVydGV4QnVmZmVycztcbiAgICByZWN0OiBDbGllbnRSZWN0IHwgRE9NUmVjdDtcbiAgICBtb3VzZTogSVBvaW50ID0geyB4OiAwLCB5OiAwIH07XG4gICAgdW5pZm9ybXM6IFVuaWZvcm1zID0gbmV3IFVuaWZvcm1zKCk7XG4gICAgYnVmZmVyczogQnVmZmVycyA9IG5ldyBCdWZmZXJzKCk7XG4gICAgdGV4dHVyZXM6IFRleHR1cmVzID0gbmV3IFRleHR1cmVzKCk7XG4gICAgdGV4dHVyZUxpc3Q6IGFueVtdID0gW107XG5cbiAgICB2ZXJ0ZXhTdHJpbmc6IHN0cmluZztcbiAgICBmcmFnbWVudFN0cmluZzogc3RyaW5nO1xuICAgIHdpZHRoOiBudW1iZXI7XG4gICAgaGVpZ2h0OiBudW1iZXI7XG4gICAgZGV2aWNlUGl4ZWxSYXRpbzogbnVtYmVyO1xuXG4gICAgdmFsaWQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICBhbmltYXRlZDogYm9vbGVhbiA9IGZhbHNlO1xuICAgIGRpcnR5OiBib29sZWFuID0gdHJ1ZTtcbiAgICB2aXNpYmxlOiBib29sZWFuID0gZmFsc2U7XG5cbiAgICBsb29wOiBGdW5jdGlvbjtcbiAgICByZW1vdmVMaXN0ZW5lcnM6IEZ1bmN0aW9uID0gKCkgPT4geyB9O1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQsXG4gICAgICAgIGNvbnRleHRPcHRpb25zOiBJQ29udGV4dE9wdGlvbnMgPSB7XG4gICAgICAgICAgICAvLyBhbHBoYTogdHJ1ZSxcbiAgICAgICAgICAgIC8vIGFudGlhbGlhczogdHJ1ZSxcbiAgICAgICAgICAgIC8vIHByZW11bHRpcGxpZWRBbHBoYTogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICBvcHRpb25zOiBHbHNsQ2FudmFzT3B0aW9ucyA9IHt9XG4gICAgKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIGlmICghY2FudmFzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jYW52YXMgPSBjYW52YXM7XG4gICAgICAgIHRoaXMud2lkdGggPSAwOyAvLyBjYW52YXMuY2xpZW50V2lkdGg7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gMDsgLy8gY2FudmFzLmNsaWVudEhlaWdodDtcbiAgICAgICAgdGhpcy5yZWN0ID0gY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICB0aGlzLnZlcnRleFN0cmluZyA9IGNvbnRleHRPcHRpb25zLnZlcnRleFN0cmluZyB8fCBDb250ZXh0RGVmYXVsdFZlcnRleDtcbiAgICAgICAgdGhpcy5mcmFnbWVudFN0cmluZyA9IGNvbnRleHRPcHRpb25zLmZyYWdtZW50U3RyaW5nIHx8IENvbnRleHREZWZhdWx0RnJhZ21lbnQ7XG4gICAgICAgIGNvbnN0IGdsID0gQ29udGV4dC50cnlHZXRDb250ZXh0KGNhbnZhcywgY29udGV4dE9wdGlvbnMsIG9wdGlvbnMub25FcnJvcik7XG4gICAgICAgIGlmICghZ2wpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmdsID0gZ2w7XG4gICAgICAgIHRoaXMuZGV2aWNlUGl4ZWxSYXRpbyA9IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIHx8IDE7XG4gICAgICAgIGNhbnZhcy5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBjb250ZXh0T3B0aW9ucy5iYWNrZ3JvdW5kQ29sb3IgfHwgJ3JnYmEoMCwwLDAsMCknO1xuICAgICAgICB0aGlzLmdldFNoYWRlcnMoKS50aGVuKFxuICAgICAgICAgICAgKHN1Y2Nlc3MpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvYWQoKTtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMucHJvZ3JhbSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuYWRkTGlzdGVuZXJzKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5sb29wKCk7XG4gICAgICAgICAgICAgICAgLy8gdGhpcy5hbmltYXRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdlcnJvcicsIGVycm9yKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICBHbHNsQ2FudmFzLml0ZW1zLnB1c2godGhpcyk7XG4gICAgfVxuXG4gICAgc3RhdGljIGl0ZW1zOiBHbHNsQ2FudmFzW10gPSBbXTtcblxuICAgIHN0YXRpYyB2ZXJzaW9uKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiAnMC4yLjAnO1xuICAgIH1cblxuICAgIHN0YXRpYyBvZihjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50KTogR2xzbENhbnZhcyB7XG4gICAgICAgIHJldHVybiBHbHNsQ2FudmFzLml0ZW1zLmZpbmQoeCA9PiB4LmNhbnZhcyA9PT0gY2FudmFzKSB8fCBuZXcgR2xzbENhbnZhcyhjYW52YXMpO1xuICAgIH1cblxuICAgIHN0YXRpYyBsb2FkQWxsKCk6IEdsc2xDYW52YXNbXSB7XG4gICAgICAgIGNvbnN0IGNhbnZhc2VzOiBIVE1MQ2FudmFzRWxlbWVudFtdID0gPEhUTUxDYW52YXNFbGVtZW50W10+W10uc2xpY2UuY2FsbChkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdnbHNsLWNhbnZhcycpKS5maWx0ZXIoKHg6IEhUTUxFbGVtZW50KSA9PiB4IGluc3RhbmNlb2YgSFRNTENhbnZhc0VsZW1lbnQpO1xuICAgICAgICByZXR1cm4gY2FudmFzZXMubWFwKHggPT4gR2xzbENhbnZhcy5vZih4KSk7XG4gICAgfVxuXG4gICAgZ2V0U2hhZGVycygpOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjYW52YXMgPSB0aGlzLmNhbnZhcztcbiAgICAgICAgICAgIGNvbnN0IHVybHM6IGFueSA9IHt9O1xuICAgICAgICAgICAgaWYgKGNhbnZhcy5oYXNBdHRyaWJ1dGUoJ2RhdGEtdmVydGV4LXVybCcpKSB7XG4gICAgICAgICAgICAgICAgdXJscy52ZXJ0ZXggPSBjYW52YXMuZ2V0QXR0cmlidXRlKCdkYXRhLXZlcnRleC11cmwnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjYW52YXMuaGFzQXR0cmlidXRlKCdkYXRhLWZyYWdtZW50LXVybCcpKSB7XG4gICAgICAgICAgICAgICAgdXJscy5mcmFnbWVudCA9IGNhbnZhcy5nZXRBdHRyaWJ1dGUoJ2RhdGEtZnJhZ21lbnQtdXJsJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY2FudmFzLmhhc0F0dHJpYnV0ZSgnZGF0YS12ZXJ0ZXgnKSkge1xuICAgICAgICAgICAgICAgIHRoaXMudmVydGV4U3RyaW5nID0gY2FudmFzLmdldEF0dHJpYnV0ZSgnZGF0YS12ZXJ0ZXgnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjYW52YXMuaGFzQXR0cmlidXRlKCdkYXRhLWZyYWdtZW50JykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZyYWdtZW50U3RyaW5nID0gY2FudmFzLmdldEF0dHJpYnV0ZSgnZGF0YS1mcmFnbWVudCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKHVybHMpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIFByb21pc2UuYWxsKE9iamVjdC5rZXlzKHVybHMpLm1hcCgoa2V5LCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVybDogc3RyaW5nID0gdXJsc1trZXldO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gQ29tbW9uLmZldGNoKHVybClcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIC50aGVuKChyZXNwb25zZSkgPT4gcmVzcG9uc2UudGV4dCgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKGJvZHkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoa2V5ID09PSAndmVydGV4Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy52ZXJ0ZXhTdHJpbmcgPSBib2R5O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmZyYWdtZW50U3RyaW5nID0gYm9keTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApKS50aGVuKHNoYWRlcnMgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKFt0aGlzLnZlcnRleFN0cmluZywgdGhpcy5mcmFnbWVudFN0cmluZ10pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKFt0aGlzLnZlcnRleFN0cmluZywgdGhpcy5mcmFnbWVudFN0cmluZ10pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhZGRMaXN0ZW5lcnMoKTogdm9pZCB7XG4gICAgICAgIC8qXG4gICAgICAgIGNvbnN0IHJlc2l6ZSA9IChlOiBFdmVudCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5yZWN0ID0gdGhpcy5jYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICB0aGlzLnRyaWdnZXIoJ3Jlc2l6ZScsIGUpO1xuICAgICAgICB9O1xuICAgICAgICAqL1xuXG4gICAgICAgIGNvbnN0IHNjcm9sbCA9IChlOiBFdmVudCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5yZWN0ID0gdGhpcy5jYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgY2xpY2sgPSAoZTogTW91c2VFdmVudCkgPT4ge1xuICAgICAgICAgICAgdGhpcy50b2dnbGUoKTtcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlcignY2xpY2snLCBlKTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBtb3ZlID0gKG14OiBudW1iZXIsIG15OiBudW1iZXIpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJlY3QgPSB0aGlzLnJlY3QsIGdhcCA9IDIwO1xuICAgICAgICAgICAgY29uc3QgeCA9IE1hdGgubWF4KC1nYXAsIE1hdGgubWluKHJlY3Qud2lkdGggKyBnYXAsIChteCAtIHJlY3QubGVmdCkgKiB0aGlzLmRldmljZVBpeGVsUmF0aW8pKTtcbiAgICAgICAgICAgIGNvbnN0IHkgPSBNYXRoLm1heCgtZ2FwLCBNYXRoLm1pbihyZWN0LmhlaWdodCArIGdhcCwgKHRoaXMuY2FudmFzLmhlaWdodCAtIChteSAtIHJlY3QudG9wKSAqIHRoaXMuZGV2aWNlUGl4ZWxSYXRpbykpKTtcbiAgICAgICAgICAgIGlmICh4ICE9PSB0aGlzLm1vdXNlLnggfHxcbiAgICAgICAgICAgICAgICB5ICE9PSB0aGlzLm1vdXNlLnkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1vdXNlLnggPSB4O1xuICAgICAgICAgICAgICAgIHRoaXMubW91c2UueSA9IHk7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyKCdtb3ZlJywgdGhpcy5tb3VzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgbW91c2Vtb3ZlID0gKGU6IE1vdXNlRXZlbnQpID0+IHtcbiAgICAgICAgICAgIG1vdmUoZS5jbGllbnRYIHx8IGUucGFnZVgsIGUuY2xpZW50WSB8fCBlLnBhZ2VZKTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBtb3VzZW92ZXIgPSAoZTogTW91c2VFdmVudCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbGF5KCk7XG4gICAgICAgICAgICB0aGlzLnRyaWdnZXIoJ292ZXInLCBlKTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBtb3VzZW91dCA9IChlOiBNb3VzZUV2ZW50KSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBhdXNlKCk7XG4gICAgICAgICAgICB0aGlzLnRyaWdnZXIoJ291dCcsIGUpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IHRvdWNobW92ZSA9IChlOiBUb3VjaEV2ZW50KSA9PiB7XG4gICAgICAgICAgICBjb25zdCB0b3VjaCA9IFtdLnNsaWNlLmNhbGwoZS50b3VjaGVzKS5yZWR1Y2UoKHA6IElQb2ludCwgdG91Y2g6IFRvdWNoKSA9PiB7XG4gICAgICAgICAgICAgICAgcCA9IHAgfHwgeyB4OiAwLCB5OiAwIH07XG4gICAgICAgICAgICAgICAgcC54ICs9IHRvdWNoLmNsaWVudFg7XG4gICAgICAgICAgICAgICAgcC55ICs9IHRvdWNoLmNsaWVudFk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHA7XG4gICAgICAgICAgICB9LCBudWxsKTtcbiAgICAgICAgICAgIGlmICh0b3VjaCkge1xuICAgICAgICAgICAgICAgIG1vdmUodG91Y2gueCAvIGUudG91Y2hlcy5sZW5ndGgsIHRvdWNoLnkgLyBlLnRvdWNoZXMubGVuZ3RoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCB0b3VjaGVuZCA9IChlOiBUb3VjaEV2ZW50KSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBhdXNlKCk7XG4gICAgICAgICAgICB0aGlzLnRyaWdnZXIoJ291dCcsIGUpO1xuICAgICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0b3VjaGVuZCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgdG91Y2hzdGFydCA9IChlOiBUb3VjaEV2ZW50KSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsYXkoKTtcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlcignb3ZlcicsIGUpO1xuICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0b3VjaGVuZCk7XG4gICAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBtb3VzZW1vdmUpO1xuICAgICAgICAgICAgaWYgKHRoaXMuY2FudmFzLmhhc0F0dHJpYnV0ZSgnY29udHJvbHMnKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlb3ZlcicsIG1vdXNlb3Zlcik7XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXMucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2VvdXQnLCBtb3VzZW91dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgbG9vcDogRnJhbWVSZXF1ZXN0Q2FsbGJhY2sgPSAodGltZTogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmNoZWNrUmVuZGVyKCk7XG4gICAgICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGxvb3ApO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMubG9vcCA9IGxvb3A7XG5cbiAgICAgICAgLy8gd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHJlc2l6ZSk7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBzY3JvbGwpO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBtb3VzZW1vdmUsIGZhbHNlKTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdG91Y2htb3ZlKTtcbiAgICAgICAgaWYgKHRoaXMuY2FudmFzLmhhc0F0dHJpYnV0ZSgnY29udHJvbHMnKSkge1xuICAgICAgICAgICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjbGljayk7XG4gICAgICAgICAgICB0aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW92ZXInLCBtb3VzZW92ZXIpO1xuICAgICAgICAgICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VvdXQnLCBtb3VzZW91dCk7XG4gICAgICAgICAgICB0aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdG91Y2hzdGFydCk7XG4gICAgICAgICAgICBpZiAoIXRoaXMuY2FudmFzLmhhc0F0dHJpYnV0ZSgnZGF0YS1hdXRvcGxheScpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXVzZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcnMgPSAoKSA9PiB7XG4gICAgICAgICAgICAvLyB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgcmVzaXplKTtcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBzY3JvbGwpO1xuICAgICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgbW91c2Vtb3ZlKTtcbiAgICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHRvdWNobW92ZSk7XG4gICAgICAgICAgICBpZiAodGhpcy5jYW52YXMuaGFzQXR0cmlidXRlKCdjb250cm9scycpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXMucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjbGljayk7XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXMucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2VvdmVyJywgbW91c2VvdmVyKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhcy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW91dCcsIG1vdXNlb3V0KTtcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhcy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdG91Y2hzdGFydCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBsb2FkKFxuICAgICAgICBmcmFnbWVudFN0cmluZz86IHN0cmluZyxcbiAgICAgICAgdmVydGV4U3RyaW5nPzogc3RyaW5nXG4gICAgKTogdm9pZCB7XG4gICAgICAgIGlmICh2ZXJ0ZXhTdHJpbmcpIHtcbiAgICAgICAgICAgIHRoaXMudmVydGV4U3RyaW5nID0gdmVydGV4U3RyaW5nO1xuICAgICAgICB9XG4gICAgICAgIGlmIChmcmFnbWVudFN0cmluZykge1xuICAgICAgICAgICAgdGhpcy5mcmFnbWVudFN0cmluZyA9IGZyYWdtZW50U3RyaW5nO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGdsID0gdGhpcy5nbDtcbiAgICAgICAgbGV0IHZlcnRleFNoYWRlciwgZnJhZ21lbnRTaGFkZXI7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB2ZXJ0ZXhTaGFkZXIgPSBDb250ZXh0LmNyZWF0ZVNoYWRlcihnbCwgdGhpcy52ZXJ0ZXhTdHJpbmcsIGdsLlZFUlRFWF9TSEFERVIpO1xuICAgICAgICAgICAgZnJhZ21lbnRTaGFkZXIgPSBDb250ZXh0LmNyZWF0ZVNoYWRlcihnbCwgdGhpcy5mcmFnbWVudFN0cmluZywgZ2wuRlJBR01FTlRfU0hBREVSKTtcbiAgICAgICAgICAgIC8vIElmIEZyYWdtZW50IHNoYWRlciBmYWlscyBsb2FkIGEgZW1wdHkgb25lIHRvIHNpZ24gdGhlIGVycm9yXG4gICAgICAgICAgICBpZiAoIWZyYWdtZW50U2hhZGVyKSB7XG4gICAgICAgICAgICAgICAgZnJhZ21lbnRTaGFkZXIgPSBDb250ZXh0LmNyZWF0ZVNoYWRlcihnbCwgQ29udGV4dERlZmF1bHRGcmFnbWVudCwgZ2wuRlJBR01FTlRfU0hBREVSKTtcbiAgICAgICAgICAgICAgICB0aGlzLnZhbGlkID0gZmFsc2U7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMudmFsaWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlcignZXJyb3InLCBlKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBDcmVhdGUgYW5kIHVzZSBwcm9ncmFtXG4gICAgICAgIGNvbnN0IHByb2dyYW0gPSBDb250ZXh0LmNyZWF0ZVByb2dyYW0oZ2wsIFt2ZXJ0ZXhTaGFkZXIsIGZyYWdtZW50U2hhZGVyXSk7IC8vLCBbMCwxXSxbJ2FfdGV4Y29vcmQnLCdhX3Bvc2l0aW9uJ10pO1xuICAgICAgICBnbC51c2VQcm9ncmFtKHByb2dyYW0pO1xuICAgICAgICAvLyBEZWxldGUgc2hhZGVyc1xuICAgICAgICAvLyBnbC5kZXRhY2hTaGFkZXIocHJvZ3JhbSwgdmVydGV4U2hhZGVyKTtcbiAgICAgICAgLy8gZ2wuZGV0YWNoU2hhZGVyKHByb2dyYW0sIGZyYWdtZW50U2hhZGVyKTtcbiAgICAgICAgZ2wuZGVsZXRlU2hhZGVyKHZlcnRleFNoYWRlcik7XG4gICAgICAgIGdsLmRlbGV0ZVNoYWRlcihmcmFnbWVudFNoYWRlcik7XG4gICAgICAgIHRoaXMucHJvZ3JhbSA9IHByb2dyYW07XG4gICAgICAgIGlmICh0aGlzLnZhbGlkKSB7XG4gICAgICAgICAgICB0aGlzLmJ1ZmZlcnMgPSBCdWZmZXJzLmdldEJ1ZmZlcnMoZ2wsIHRoaXMuZnJhZ21lbnRTdHJpbmcsIHRoaXMudmVydGV4U3RyaW5nKTtcbiAgICAgICAgICAgIHRoaXMudmVydGV4QnVmZmVycyA9IENvbnRleHQuY3JlYXRlVmVydGV4QnVmZmVycyhnbCwgcHJvZ3JhbSk7XG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVVuaWZvcm1zKCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVHJpZ2dlciBldmVudFxuICAgICAgICB0aGlzLnRyaWdnZXIoJ2xvYWQnLCB0aGlzKTtcbiAgICB9XG5cbiAgICB0ZXN0KFxuICAgICAgICBmcmFnbWVudFN0cmluZz86IHN0cmluZyxcbiAgICAgICAgdmVydGV4U3RyaW5nPzogc3RyaW5nXG4gICAgKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHZlcnRleCA9IHRoaXMudmVydGV4U3RyaW5nO1xuICAgICAgICAgICAgY29uc3QgZnJhZ21lbnQgPSB0aGlzLmZyYWdtZW50U3RyaW5nO1xuICAgICAgICAgICAgY29uc3QgcGF1c2VkID0gdGhpcy50aW1lci5wYXVzZWQ7XG4gICAgICAgICAgICAvLyBUaGFua3MgdG8gQHRoZXNwaXRlIGZvciB0aGUgaGVscCBoZXJlXG4gICAgICAgICAgICAvLyBodHRwczovL3d3dy5raHJvbm9zLm9yZy9yZWdpc3RyeS93ZWJnbC9leHRlbnNpb25zL0VYVF9kaXNqb2ludF90aW1lcl9xdWVyeS9cbiAgICAgICAgICAgIGNvbnN0IGV4dGVuc2lvbiA9IHRoaXMuZ2wuZ2V0RXh0ZW5zaW9uKCdFWFRfZGlzam9pbnRfdGltZXJfcXVlcnknKTtcbiAgICAgICAgICAgIGNvbnN0IHF1ZXJ5ID0gZXh0ZW5zaW9uLmNyZWF0ZVF1ZXJ5RVhUKCk7XG4gICAgICAgICAgICBsZXQgd2FzVmFsaWQgPSB0aGlzLnZhbGlkO1xuICAgICAgICAgICAgaWYgKGZyYWdtZW50U3RyaW5nIHx8IHZlcnRleFN0cmluZykge1xuICAgICAgICAgICAgICAgIHRoaXMubG9hZChmcmFnbWVudFN0cmluZywgdmVydGV4U3RyaW5nKTtcbiAgICAgICAgICAgICAgICB3YXNWYWxpZCA9IHRoaXMudmFsaWQ7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMudGltZXIucGF1c2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIGV4dGVuc2lvbi5iZWdpblF1ZXJ5RVhUKGV4dGVuc2lvbi5USU1FX0VMQVBTRURfRVhULCBxdWVyeSk7XG4gICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgICAgICAgICAgZXh0ZW5zaW9uLmVuZFF1ZXJ5RVhUKGV4dGVuc2lvbi5USU1FX0VMQVBTRURfRVhUKTtcbiAgICAgICAgICAgIGNvbnN0IHdhaXRGb3JUZXN0ID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgYXZhaWxhYmxlID0gZXh0ZW5zaW9uLmdldFF1ZXJ5T2JqZWN0RVhUKHF1ZXJ5LCBleHRlbnNpb24uUVVFUllfUkVTVUxUX0FWQUlMQUJMRV9FWFQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGRpc2pvaW50ID0gdGhpcy5nbC5nZXRQYXJhbWV0ZXIoZXh0ZW5zaW9uLkdQVV9ESVNKT0lOVF9FWFQpO1xuICAgICAgICAgICAgICAgIGlmIChhdmFpbGFibGUgJiYgIWRpc2pvaW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdhc1ZhbGlkOiB3YXNWYWxpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyYWdtZW50OiBmcmFnbWVudFN0cmluZyB8fCB0aGlzLmZyYWdtZW50U3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmVydGV4OiB2ZXJ0ZXhTdHJpbmcgfHwgdGhpcy52ZXJ0ZXhTdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lRWxhcHNlZE1zOiBleHRlbnNpb24uZ2V0UXVlcnlPYmplY3RFWFQocXVlcnksIGV4dGVuc2lvbi5RVUVSWV9SRVNVTFRfRVhUKSAvIDEwMDAwMDAuMFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRpbWVyLnBhdXNlZCA9IHBhdXNlZDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZyYWdtZW50U3RyaW5nIHx8IHZlcnRleFN0cmluZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkKGZyYWdtZW50LCB2ZXJ0ZXgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHdhaXRGb3JUZXN0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB3YWl0Rm9yVGVzdCgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBkZXN0cm95KCk6IHZvaWQge1xuICAgICAgICB0aGlzLnJlbW92ZUxpc3RlbmVycygpO1xuICAgICAgICB0aGlzLmFuaW1hdGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMudmFsaWQgPSBmYWxzZTtcbiAgICAgICAgY29uc3QgZ2wgPSB0aGlzLmdsO1xuICAgICAgICBnbC51c2VQcm9ncmFtKG51bGwpO1xuICAgICAgICBnbC5kZWxldGVQcm9ncmFtKHRoaXMucHJvZ3JhbSk7XG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIHRoaXMuYnVmZmVycy52YWx1ZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGJ1ZmZlcjogSU9CdWZmZXIgPSB0aGlzLmJ1ZmZlcnMudmFsdWVzW2tleV07XG4gICAgICAgICAgICBidWZmZXIuZGVzdHJveShnbCk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gdGhpcy50ZXh0dXJlcy52YWx1ZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IHRleHR1cmU6IFRleHR1cmUgPSB0aGlzLnRleHR1cmVzLnZhbHVlc1trZXldO1xuICAgICAgICAgICAgdGV4dHVyZS5kZXN0cm95KGdsKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmJ1ZmZlcnMgPSBudWxsO1xuICAgICAgICB0aGlzLnRleHR1cmVzID0gbnVsbDtcbiAgICAgICAgdGhpcy51bmlmb3JtcyA9IG51bGw7XG4gICAgICAgIHRoaXMucHJvZ3JhbSA9IG51bGw7XG4gICAgICAgIHRoaXMuZ2wgPSBudWxsO1xuICAgICAgICBHbHNsQ2FudmFzLml0ZW1zLnNwbGljZShHbHNsQ2FudmFzLml0ZW1zLmluZGV4T2YodGhpcyksIDEpO1xuICAgIH1cblxuICAgIHNldFVuaWZvcm1BcnJheShrZXk6IHN0cmluZywgdmFsdWVzOiBhbnlbXSwgb3B0aW9uczogYW55ID0gbnVsbCk6IHZvaWQge1xuICAgICAgICBjb25zdCB1bmlmb3JtOiBVbmlmb3JtIHwgVW5pZm9ybVtdID0gVW5pZm9ybXMucGFyc2VVbmlmb3JtKGtleSwgLi4udmFsdWVzKTtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodW5pZm9ybSkpIHtcbiAgICAgICAgICAgIHVuaWZvcm0uZm9yRWFjaCgoeCkgPT4gdGhpcy5sb2FkVGV4dHVyZSh4LmtleSwgeC52YWx1ZXNbMF0pLCBvcHRpb25zKTtcbiAgICAgICAgfSBlbHNlIGlmICh1bmlmb3JtKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKHVuaWZvcm0udHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgVW5pZm9ybVR5cGUuU2FtcGxlcjJEOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYWRUZXh0dXJlKGtleSwgdmFsdWVzWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51bmlmb3Jtcy5zZXQoa2V5LCB1bmlmb3JtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldFVuaWZvcm0oa2V5OiBzdHJpbmcsIC4uLnZhbHVlczogYW55W10pOiB2b2lkIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0VW5pZm9ybUFycmF5KGtleSwgdmFsdWVzKTtcbiAgICB9XG5cbiAgICBzZXRUZXh0dXJlKFxuICAgICAgICBrZXk6IHN0cmluZyxcbiAgICAgICAgdXJsRWxlbWVudE9yRGF0YTogc3RyaW5nIHwgSFRNTENhbnZhc0VsZW1lbnQgfCBIVE1MSW1hZ2VFbGVtZW50IHwgSFRNTFZpZGVvRWxlbWVudCB8IEVsZW1lbnQgfCBUZXh0dXJlRGF0YSxcbiAgICAgICAgb3B0aW9uczogVGV4dHVyZU9wdGlvbnMgPSB7fVxuICAgICk6IHZvaWQge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRVbmlmb3JtQXJyYXkoa2V5LCBbdXJsRWxlbWVudE9yRGF0YV0sIG9wdGlvbnMpO1xuICAgIH1cblxuICAgIHNldFVuaWZvcm1zKHZhbHVlczogSVVuaWZvcm1PcHRpb24pOiB2b2lkIHtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gdmFsdWVzKSB7XG4gICAgICAgICAgICB0aGlzLnNldFVuaWZvcm0oa2V5LCB2YWx1ZXNba2V5XSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwYXVzZSgpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMudmFsaWQpIHtcbiAgICAgICAgICAgIHRoaXMudGltZXIucGF1c2UoKTtcbiAgICAgICAgICAgIHRoaXMuY2FudmFzLmNsYXNzTGlzdC5hZGQoJ3BhdXNlZCcpO1xuICAgICAgICAgICAgdGhpcy50cmlnZ2VyKCdwYXVzZScpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcGxheSgpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMudmFsaWQpIHtcbiAgICAgICAgICAgIHRoaXMudGltZXIucGxheSgpO1xuICAgICAgICAgICAgdGhpcy5jYW52YXMuY2xhc3NMaXN0LnJlbW92ZSgncGF1c2VkJyk7XG4gICAgICAgICAgICB0aGlzLnRyaWdnZXIoJ3BsYXknKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRvZ2dsZSgpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMudmFsaWQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnRpbWVyLnBhdXNlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMucGxheSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhdXNlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpc1Zpc2libGUoKTogYm9vbGVhbiB7XG4gICAgICAgIGNvbnN0IHJlY3QgPSB0aGlzLnJlY3Q7XG4gICAgICAgIHJldHVybiAocmVjdC50b3AgKyByZWN0LmhlaWdodCkgPiAwICYmIHJlY3QudG9wIDwgKHdpbmRvdy5pbm5lckhlaWdodCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0KTtcbiAgICB9XG5cbiAgICBpc0FuaW1hdGVkKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gKHRoaXMuYW5pbWF0ZWQgfHwgdGhpcy50ZXh0dXJlcy5hbmltYXRlZCkgJiYgIXRoaXMudGltZXIucGF1c2VkO1xuICAgIH1cblxuICAgIGlzRGlydHkoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLmRpcnR5IHx8IHRoaXMudW5pZm9ybXMuZGlydHkgfHwgdGhpcy50ZXh0dXJlcy5kaXJ0eTtcbiAgICB9XG5cbiAgICAvLyBjaGVjayBzaXplIGNoYW5nZSBhdCBzdGFydCBvZiByZXF1ZXN0RnJhbWVcbiAgICBzaXplRGlkQ2hhbmdlZCgpOiBib29sZWFuIHtcbiAgICAgICAgY29uc3QgZ2wgPSB0aGlzLmdsO1xuICAgICAgICBjb25zdCBXID0gTWF0aC5jZWlsKHRoaXMuY2FudmFzLmNsaWVudFdpZHRoKSxcbiAgICAgICAgICAgIEggPSBNYXRoLmNlaWwodGhpcy5jYW52YXMuY2xpZW50SGVpZ2h0KTtcbiAgICAgICAgaWYgKHRoaXMud2lkdGggIT09IFcgfHxcbiAgICAgICAgICAgIHRoaXMuaGVpZ2h0ICE9PSBIKSB7XG4gICAgICAgICAgICB0aGlzLndpZHRoID0gVztcbiAgICAgICAgICAgIHRoaXMuaGVpZ2h0ID0gSDtcbiAgICAgICAgICAgIC8vIExvb2t1cCB0aGUgc2l6ZSB0aGUgYnJvd3NlciBpcyBkaXNwbGF5aW5nIHRoZSBjYW52YXMgaW4gQ1NTIHBpeGVsc1xuICAgICAgICAgICAgLy8gYW5kIGNvbXB1dGUgYSBzaXplIG5lZWRlZCB0byBtYWtlIG91ciBkcmF3aW5nYnVmZmVyIG1hdGNoIGl0IGluXG4gICAgICAgICAgICAvLyBkZXZpY2UgcGl4ZWxzLlxuICAgICAgICAgICAgY29uc3QgQlcgPSBNYXRoLmNlaWwoVyAqIHRoaXMuZGV2aWNlUGl4ZWxSYXRpbyk7XG4gICAgICAgICAgICBjb25zdCBCSCA9IE1hdGguY2VpbChIICogdGhpcy5kZXZpY2VQaXhlbFJhdGlvKTtcbiAgICAgICAgICAgIHRoaXMuY2FudmFzLndpZHRoID0gQlc7XG4gICAgICAgICAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSBCSDtcbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICBpZiAoZ2wuY2FudmFzLndpZHRoICE9PSBCVyB8fFxuICAgICAgICAgICAgICAgIGdsLmNhbnZhcy5oZWlnaHQgIT09IEJIKSB7XG4gICAgICAgICAgICAgICAgZ2wuY2FudmFzLndpZHRoID0gQlc7XG4gICAgICAgICAgICAgICAgZ2wuY2FudmFzLmhlaWdodCA9IEJIO1xuICAgICAgICAgICAgICAgIC8vIFNldCB0aGUgdmlld3BvcnQgdG8gbWF0Y2hcbiAgICAgICAgICAgICAgICAvLyBnbC52aWV3cG9ydCgwLCAwLCBCVywgQkgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIHRoaXMuYnVmZmVycy52YWx1ZXMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBidWZmZXI6IElPQnVmZmVyID0gdGhpcy5idWZmZXJzLnZhbHVlc1trZXldO1xuICAgICAgICAgICAgICAgIGJ1ZmZlci5yZXNpemUoZ2wsIEJXLCBCSCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnJlY3QgPSB0aGlzLmNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlcigncmVzaXplJyk7XG4gICAgICAgICAgICAvLyBnbC51c2VQcm9ncmFtKHRoaXMucHJvZ3JhbSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNoZWNrUmVuZGVyKCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5pc1Zpc2libGUoKSAmJiAodGhpcy5zaXplRGlkQ2hhbmdlZCgpIHx8IHRoaXMuaXNBbmltYXRlZCgpIHx8IHRoaXMuaXNEaXJ0eSgpKSkge1xuICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgICAgICAgIHRoaXMuY2FudmFzLmNsYXNzTGlzdC5hZGQoJ3BsYXlpbmcnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuY2FudmFzLmNsYXNzTGlzdC5yZW1vdmUoJ3BsYXlpbmcnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNyZWF0ZVVuaWZvcm1zKCk6IHZvaWQge1xuICAgICAgICBjb25zdCBnbCA9IHRoaXMuZ2w7XG4gICAgICAgIGNvbnN0IGZyYWdtZW50U3RyaW5nID0gdGhpcy5mcmFnbWVudFN0cmluZztcbiAgICAgICAgY29uc3QgQlcgPSBnbC5kcmF3aW5nQnVmZmVyV2lkdGg7XG4gICAgICAgIGNvbnN0IEJIID0gZ2wuZHJhd2luZ0J1ZmZlckhlaWdodDtcbiAgICAgICAgY29uc3QgdGltZXIgPSB0aGlzLnRpbWVyID0gbmV3IEdsc2xDYW52YXNUaW1lcigpO1xuICAgICAgICBjb25zdCBoYXNEZWx0YSA9IChmcmFnbWVudFN0cmluZy5tYXRjaCgvdV9kZWx0YS9nKSB8fCBbXSkubGVuZ3RoID4gMTtcbiAgICAgICAgY29uc3QgaGFzVGltZSA9IChmcmFnbWVudFN0cmluZy5tYXRjaCgvdV90aW1lL2cpIHx8IFtdKS5sZW5ndGggPiAxO1xuICAgICAgICBjb25zdCBoYXNEYXRlID0gKGZyYWdtZW50U3RyaW5nLm1hdGNoKC91X2RhdGUvZykgfHwgW10pLmxlbmd0aCA+IDE7XG4gICAgICAgIGNvbnN0IGhhc01vdXNlID0gKGZyYWdtZW50U3RyaW5nLm1hdGNoKC91X21vdXNlL2cpIHx8IFtdKS5sZW5ndGggPiAxO1xuICAgICAgICBjb25zdCBoYXNUZXh0dXJlcyA9IHRoaXMucGFyc2VUZXh0dXJlcyhmcmFnbWVudFN0cmluZyk7XG4gICAgICAgIHRoaXMuYW5pbWF0ZWQgPSBoYXNUaW1lIHx8IGhhc0RhdGUgfHwgaGFzTW91c2U7XG4gICAgICAgIGlmICh0aGlzLmFuaW1hdGVkKSB7XG4gICAgICAgICAgICB0aGlzLmNhbnZhcy5jbGFzc0xpc3QuYWRkKCdhbmltYXRlZCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jYW52YXMuY2xhc3NMaXN0LnJlbW92ZSgnYW5pbWF0ZWQnKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnVuaWZvcm1zLmNyZWF0ZShVbmlmb3JtTWV0aG9kLlVuaWZvcm0yZiwgVW5pZm9ybVR5cGUuRmxvYXRWZWMyLCAndV9yZXNvbHV0aW9uJywgQlcsIEJIKTtcbiAgICAgICAgaWYgKGhhc0RlbHRhKSB7XG4gICAgICAgICAgICB0aGlzLnVuaWZvcm1zLmNyZWF0ZShVbmlmb3JtTWV0aG9kLlVuaWZvcm0xZiwgVW5pZm9ybVR5cGUuRmxvYXQsICd1X2RlbHRhJywgdGltZXIuZGVsdGEgLyAxMDAwLjApO1xuICAgICAgICB9XG4gICAgICAgIGlmIChoYXNUaW1lKSB7XG4gICAgICAgICAgICB0aGlzLnVuaWZvcm1zLmNyZWF0ZShVbmlmb3JtTWV0aG9kLlVuaWZvcm0xZiwgVW5pZm9ybVR5cGUuRmxvYXQsICd1X3RpbWUnLCB0aW1lci5jdXJyZW50IC8gMTAwMC4wKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaGFzRGF0ZSkge1xuICAgICAgICAgICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKCk7XG4gICAgICAgICAgICB0aGlzLnVuaWZvcm1zLmNyZWF0ZShVbmlmb3JtTWV0aG9kLlVuaWZvcm00ZiwgVW5pZm9ybVR5cGUuRmxvYXQsICd1X2RhdGUnLCBkYXRlLmdldEZ1bGxZZWFyKCksIGRhdGUuZ2V0TW9udGgoKSwgZGF0ZS5nZXREYXRlKCksIGRhdGUuZ2V0SG91cnMoKSAqIDM2MDAgKyBkYXRlLmdldE1pbnV0ZXMoKSAqIDYwICsgZGF0ZS5nZXRTZWNvbmRzKCkgKyBkYXRlLmdldE1pbGxpc2Vjb25kcygpICogMC4wMDEpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChoYXNNb3VzZSkge1xuICAgICAgICAgICAgdGhpcy51bmlmb3Jtcy5jcmVhdGUoVW5pZm9ybU1ldGhvZC5Vbmlmb3JtMmYsIFVuaWZvcm1UeXBlLkZsb2F0VmVjMiwgJ3VfbW91c2UnLCAwLCAwKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiB0aGlzLmJ1ZmZlcnMudmFsdWVzKSB7XG4gICAgICAgICAgICBjb25zdCBidWZmZXI6IElPQnVmZmVyID0gdGhpcy5idWZmZXJzLnZhbHVlc1trZXldO1xuICAgICAgICAgICAgdGhpcy51bmlmb3Jtcy5jcmVhdGUoVW5pZm9ybU1ldGhvZC5Vbmlmb3JtMWksIFVuaWZvcm1UeXBlLlNhbXBsZXIyRCwgYnVmZmVyLmtleSwgYnVmZmVyLmlucHV0LmluZGV4KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaGFzVGV4dHVyZXMpIHtcbiAgICAgICAgICAgIHRoaXMudGV4dHVyZUxpc3QuZm9yRWFjaCh4ID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvYWRUZXh0dXJlKHgua2V5LCB4LnVybCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMudGV4dHVyZUxpc3QgPSBbXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHBhcnNlVGV4dHVyZXMoZnJhZ21lbnRTdHJpbmc6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCByZWdleHAgPSAvdW5pZm9ybVxccypzYW1wbGVyMkRcXHMqKFtcXHddKik7KFxccypcXC9cXC9cXHMqKFtcXHd8XFw6XFwvXFwvfFxcLnxcXC18XFxfXSopfFxccyopL2dtO1xuICAgICAgICBsZXQgbWF0Y2hlcztcbiAgICAgICAgd2hpbGUgKChtYXRjaGVzID0gcmVnZXhwLmV4ZWMoZnJhZ21lbnRTdHJpbmcpKSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc3Qga2V5ID0gbWF0Y2hlc1sxXTtcbiAgICAgICAgICAgIGlmIChtYXRjaGVzWzNdKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXh0ID0gbWF0Y2hlc1szXS5zcGxpdCgnLicpLnBvcCgpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgdXJsID0gbWF0Y2hlc1szXTtcbiAgICAgICAgICAgICAgICBpZiAodXJsICYmIFRleHR1cmVFeHRlbnNpb25zLmluZGV4T2YoZXh0KSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50ZXh0dXJlTGlzdC5wdXNoKHsga2V5LCB1cmwgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmICghdGhpcy5idWZmZXJzLmhhcyhrZXkpKSB7XG4gICAgICAgICAgICAgICAgLy8gY3JlYXRlIGVtcHR5IHRleHR1cmVcbiAgICAgICAgICAgICAgICB0aGlzLnRleHR1cmVMaXN0LnB1c2goeyBrZXksIHVybDogbnVsbCB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5jYW52YXMuaGFzQXR0cmlidXRlKCdkYXRhLXRleHR1cmVzJykpIHtcbiAgICAgICAgICAgIGNvbnN0IHVybHMgPSB0aGlzLmNhbnZhcy5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGV4dHVyZXMnKS5zcGxpdCgnLCcpO1xuICAgICAgICAgICAgdXJscy5mb3JFYWNoKCh1cmw6IHN0cmluZywgaTogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qga2V5ID0gJ3VfdGV4JyArIGk7XG4gICAgICAgICAgICAgICAgdGhpcy50ZXh0dXJlTGlzdC5wdXNoKHsga2V5LCB1cmwgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy50ZXh0dXJlTGlzdC5sZW5ndGggPiAwO1xuICAgIH1cblxuICAgIGxvYWRUZXh0dXJlKFxuICAgICAgICBrZXk6IHN0cmluZyxcbiAgICAgICAgdXJsRWxlbWVudE9yRGF0YTogc3RyaW5nIHwgSFRNTENhbnZhc0VsZW1lbnQgfCBIVE1MSW1hZ2VFbGVtZW50IHwgSFRNTFZpZGVvRWxlbWVudCB8IEVsZW1lbnQgfCBUZXh0dXJlRGF0YSxcbiAgICAgICAgb3B0aW9uczogVGV4dHVyZU9wdGlvbnMgPSB7fVxuICAgICk6IFByb21pc2U8VGV4dHVyZT4ge1xuICAgICAgICBpZiAodGhpcy52YWxpZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMudGV4dHVyZXMuY3JlYXRlT3JVcGRhdGUodGhpcy5nbCwga2V5LCB1cmxFbGVtZW50T3JEYXRhLCB0aGlzLmJ1ZmZlcnMuY291bnQsIG9wdGlvbnMpLnRoZW4odGV4dHVyZSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5kZXggPSB0ZXh0dXJlLmluZGV4O1xuICAgICAgICAgICAgICAgIGNvbnN0IHVuaWZvcm0gPSB0aGlzLnVuaWZvcm1zLmNyZWF0ZVRleHR1cmUoa2V5LCBpbmRleCk7XG4gICAgICAgICAgICAgICAgdW5pZm9ybS50ZXh0dXJlID0gdGV4dHVyZTtcbiAgICAgICAgICAgICAgICBjb25zdCBrZXlSZXNvbHV0aW9uID0ga2V5LmluZGV4T2YoJ1snKSAhPT0gLTEgPyBrZXkucmVwbGFjZSgnWycsICdSZXNvbHV0aW9uWycpIDoga2V5ICsgJ1Jlc29sdXRpb24nO1xuICAgICAgICAgICAgICAgIGNvbnN0IHVuaWZvcm1SZXNvbHV0aW9uID0gdGhpcy51bmlmb3Jtcy5jcmVhdGUoVW5pZm9ybU1ldGhvZC5Vbmlmb3JtMmYsIFVuaWZvcm1UeXBlLkZsb2F0VmVjMiwga2V5UmVzb2x1dGlvbiwgdGV4dHVyZS53aWR0aCwgdGV4dHVyZS5oZWlnaHQpO1xuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdsb2FkVGV4dHVyZScsIGtleSwgdXJsLCBpbmRleCwgdGV4dHVyZS53aWR0aCwgdGV4dHVyZS5oZWlnaHQpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0ZXh0dXJlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnRleHR1cmVMaXN0LnB1c2goeyBrZXksIHVybDogdXJsRWxlbWVudE9yRGF0YSB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHVwZGF0ZVVuaWZvcm1zKCk6IHZvaWQge1xuICAgICAgICBjb25zdCBnbCA9IHRoaXMuZ2w7XG4gICAgICAgIGNvbnN0IEJXID0gZ2wuZHJhd2luZ0J1ZmZlcldpZHRoO1xuICAgICAgICBjb25zdCBCSCA9IGdsLmRyYXdpbmdCdWZmZXJIZWlnaHQ7XG4gICAgICAgIGNvbnN0IHRpbWVyID0gdGhpcy50aW1lci5uZXh0KCk7XG4gICAgICAgIHRoaXMudW5pZm9ybXMudXBkYXRlKFVuaWZvcm1NZXRob2QuVW5pZm9ybTJmLCBVbmlmb3JtVHlwZS5GbG9hdFZlYzIsICd1X3Jlc29sdXRpb24nLCBCVywgQkgpO1xuICAgICAgICBpZiAodGhpcy51bmlmb3Jtcy5oYXMoJ3VfZGVsdGEnKSkge1xuICAgICAgICAgICAgdGhpcy51bmlmb3Jtcy51cGRhdGUoVW5pZm9ybU1ldGhvZC5Vbmlmb3JtMWYsIFVuaWZvcm1UeXBlLkZsb2F0LCAndV9kZWx0YScsIHRpbWVyLmRlbHRhIC8gMTAwMC4wKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy51bmlmb3Jtcy5oYXMoJ3VfdGltZScpKSB7XG4gICAgICAgICAgICB0aGlzLnVuaWZvcm1zLnVwZGF0ZShVbmlmb3JtTWV0aG9kLlVuaWZvcm0xZiwgVW5pZm9ybVR5cGUuRmxvYXQsICd1X3RpbWUnLCB0aW1lci5jdXJyZW50IC8gMTAwMC4wKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy51bmlmb3Jtcy5oYXMoJ3VfZGF0ZScpKSB7XG4gICAgICAgICAgICBjb25zdCBkYXRlID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgIHRoaXMudW5pZm9ybXMudXBkYXRlKFVuaWZvcm1NZXRob2QuVW5pZm9ybTRmLCBVbmlmb3JtVHlwZS5GbG9hdCwgJ3VfZGF0ZScsIGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpLCBkYXRlLmdldERhdGUoKSwgZGF0ZS5nZXRIb3VycygpICogMzYwMCArIGRhdGUuZ2V0TWludXRlcygpICogNjAgKyBkYXRlLmdldFNlY29uZHMoKSArIGRhdGUuZ2V0TWlsbGlzZWNvbmRzKCkgKiAwLjAwMSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMudW5pZm9ybXMuaGFzKCd1X21vdXNlJykpIHtcbiAgICAgICAgICAgIGNvbnN0IG1vdXNlID0gdGhpcy5tb3VzZTtcbiAgICAgICAgICAgIHRoaXMudW5pZm9ybXMudXBkYXRlKFVuaWZvcm1NZXRob2QuVW5pZm9ybTJmLCBVbmlmb3JtVHlwZS5GbG9hdFZlYzIsICd1X21vdXNlJywgbW91c2UueCwgbW91c2UueSk7XG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgY29uc3QgcmVjdCA9IHRoaXMucmVjdDtcbiAgICAgICAgICAgIGlmIChtb3VzZS54ID49IHJlY3QubGVmdCAmJiBtb3VzZS54IDw9IHJlY3QucmlnaHQgJiZcbiAgICAgICAgICAgICAgICBtb3VzZS55ID49IHJlY3QudG9wICYmIG1vdXNlLnkgPD0gcmVjdC5ib3R0b20pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBNWCA9IChtb3VzZS54IC0gcmVjdC5sZWZ0KSAqIHRoaXMuZGV2aWNlUGl4ZWxSYXRpbztcbiAgICAgICAgICAgICAgICBjb25zdCBNWSA9ICh0aGlzLmNhbnZhcy5oZWlnaHQgLSAobW91c2UueSAtIHJlY3QudG9wKSAqIHRoaXMuZGV2aWNlUGl4ZWxSYXRpbyk7XG4gICAgICAgICAgICAgICAgdGhpcy51bmlmb3Jtcy51cGRhdGUoVW5pZm9ybU1ldGhvZC5Vbmlmb3JtMmYsIFVuaWZvcm1UeXBlLkZsb2F0VmVjMiwgJ3VfbW91c2UnLCBNWCwgTVkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgKi9cbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiB0aGlzLmJ1ZmZlcnMudmFsdWVzKSB7XG4gICAgICAgICAgICBjb25zdCBidWZmZXI6IElPQnVmZmVyID0gdGhpcy5idWZmZXJzLnZhbHVlc1trZXldO1xuICAgICAgICAgICAgdGhpcy51bmlmb3Jtcy51cGRhdGUoVW5pZm9ybU1ldGhvZC5Vbmlmb3JtMWksIFVuaWZvcm1UeXBlLlNhbXBsZXIyRCwgYnVmZmVyLmtleSwgYnVmZmVyLmlucHV0LmluZGV4KTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiB0aGlzLnRleHR1cmVzLnZhbHVlcykge1xuICAgICAgICAgICAgY29uc3QgdGV4dHVyZTogVGV4dHVyZSA9IHRoaXMudGV4dHVyZXMudmFsdWVzW2tleV07XG4gICAgICAgICAgICB0ZXh0dXJlLnRyeVVwZGF0ZShnbCk7XG4gICAgICAgICAgICB0aGlzLnVuaWZvcm1zLnVwZGF0ZShVbmlmb3JtTWV0aG9kLlVuaWZvcm0xaSwgVW5pZm9ybVR5cGUuU2FtcGxlcjJELCB0ZXh0dXJlLmtleSwgdGV4dHVyZS5pbmRleCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW5kZXIoKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGdsID0gdGhpcy5nbDtcbiAgICAgICAgY29uc3QgQlcgPSBnbC5kcmF3aW5nQnVmZmVyV2lkdGg7XG4gICAgICAgIGNvbnN0IEJIID0gZ2wuZHJhd2luZ0J1ZmZlckhlaWdodDtcbiAgICAgICAgdGhpcy51cGRhdGVVbmlmb3JtcygpO1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiB0aGlzLmJ1ZmZlcnMudmFsdWVzKSB7XG4gICAgICAgICAgICBjb25zdCBidWZmZXI6IElPQnVmZmVyID0gdGhpcy5idWZmZXJzLnZhbHVlc1trZXldO1xuICAgICAgICAgICAgdGhpcy51bmlmb3Jtcy5hcHBseShnbCwgYnVmZmVyLnByb2dyYW0pO1xuICAgICAgICAgICAgYnVmZmVyLnJlbmRlcihnbCwgQlcsIEJIKTtcbiAgICAgICAgfVxuICAgICAgICBnbC51c2VQcm9ncmFtKHRoaXMucHJvZ3JhbSk7XG4gICAgICAgIHRoaXMudW5pZm9ybXMuYXBwbHkoZ2wsIHRoaXMucHJvZ3JhbSk7XG4gICAgICAgIGdsLnZpZXdwb3J0KDAsIDAsIEJXLCBCSCk7XG4gICAgICAgIGdsLmJpbmRGcmFtZWJ1ZmZlcihnbC5GUkFNRUJVRkZFUiwgbnVsbCk7XG4gICAgICAgIGdsLmRyYXdBcnJheXMoZ2wuVFJJQU5HTEVTLCAwLCA2KTtcbiAgICAgICAgdGhpcy51bmlmb3Jtcy5jbGVhbigpO1xuICAgICAgICB0aGlzLnRleHR1cmVzLmNsZWFuKCk7XG4gICAgICAgIHRoaXMuZGlydHkgPSBmYWxzZTtcbiAgICAgICAgdGhpcy50cmlnZ2VyKCdyZW5kZXInLCB0aGlzKTtcbiAgICB9XG5cbn1cblxuKDxhbnk+d2luZG93KS5HbHNsQ2FudmFzID0gR2xzbENhbnZhcztcblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgR2xzbENhbnZhcy5sb2FkQWxsKTtcbiJdLCJmaWxlIjoiZGlzdC9nbHNsLWNhbnZhcy5qcyJ9
