(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.WHATWGFetch = {})));
}(this, (function (exports) { 'use strict';

  var support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob:
      'FileReader' in self &&
      'Blob' in self &&
      (function() {
        try {
          new Blob();
          return true
        } catch (e) {
          return false
        }
      })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  };

  function isDataView(obj) {
    return obj && DataView.prototype.isPrototypeOf(obj)
  }

  if (support.arrayBuffer) {
    var viewClasses = [
      '[object Int8Array]',
      '[object Uint8Array]',
      '[object Uint8ClampedArray]',
      '[object Int16Array]',
      '[object Uint16Array]',
      '[object Int32Array]',
      '[object Uint32Array]',
      '[object Float32Array]',
      '[object Float64Array]'
    ];

    var isArrayBufferView =
      ArrayBuffer.isView ||
      function(obj) {
        return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
      };
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name);
    }
    if (/[^a-z0-9\-#$%&'*+.^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value);
    }
    return value
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function() {
        var value = items.shift();
        return {done: value === undefined, value: value}
      }
    };

    if (support.iterable) {
      iterator[Symbol.iterator] = function() {
        return iterator
      };
    }

    return iterator
  }

  function Headers(headers) {
    this.map = {};

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value);
      }, this);
    } else if (Array.isArray(headers)) {
      headers.forEach(function(header) {
        this.append(header[0], header[1]);
      }, this);
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name]);
      }, this);
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name);
    value = normalizeValue(value);
    var oldValue = this.map[name];
    this.map[name] = oldValue ? oldValue + ', ' + value : value;
  };

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)];
  };

  Headers.prototype.get = function(name) {
    name = normalizeName(name);
    return this.has(name) ? this.map[name] : null
  };

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  };

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = normalizeValue(value);
  };

  Headers.prototype.forEach = function(callback, thisArg) {
    for (var name in this.map) {
      if (this.map.hasOwnProperty(name)) {
        callback.call(thisArg, this.map[name], name, this);
      }
    }
  };

  Headers.prototype.keys = function() {
    var items = [];
    this.forEach(function(value, name) {
      items.push(name);
    });
    return iteratorFor(items)
  };

  Headers.prototype.values = function() {
    var items = [];
    this.forEach(function(value) {
      items.push(value);
    });
    return iteratorFor(items)
  };

  Headers.prototype.entries = function() {
    var items = [];
    this.forEach(function(value, name) {
      items.push([name, value]);
    });
    return iteratorFor(items)
  };

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true;
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result);
      };
      reader.onerror = function() {
        reject(reader.error);
      };
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsArrayBuffer(blob);
    return promise
  }

  function readBlobAsText(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsText(blob);
    return promise
  }

  function readArrayBufferAsText(buf) {
    var view = new Uint8Array(buf);
    var chars = new Array(view.length);

    for (var i = 0; i < view.length; i++) {
      chars[i] = String.fromCharCode(view[i]);
    }
    return chars.join('')
  }

  function bufferClone(buf) {
    if (buf.slice) {
      return buf.slice(0)
    } else {
      var view = new Uint8Array(buf.byteLength);
      view.set(new Uint8Array(buf));
      return view.buffer
    }
  }

  function Body() {
    this.bodyUsed = false;

    this._initBody = function(body) {
      this._bodyInit = body;
      if (!body) {
        this._bodyText = '';
      } else if (typeof body === 'string') {
        this._bodyText = body;
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body;
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body;
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString();
      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
        this._bodyArrayBuffer = bufferClone(body.buffer);
        // IE 10-11 can't handle a DataView body.
        this._bodyInit = new Blob([this._bodyArrayBuffer]);
      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
        this._bodyArrayBuffer = bufferClone(body);
      } else {
        this._bodyText = body = Object.prototype.toString.call(body);
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8');
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type);
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
        }
      }
    };

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this);
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyArrayBuffer) {
          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      };

      this.arrayBuffer = function() {
        if (this._bodyArrayBuffer) {
          return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
        } else {
          return this.blob().then(readBlobAsArrayBuffer)
        }
      };
    }

    this.text = function() {
      var rejected = consumed(this);
      if (rejected) {
        return rejected
      }

      if (this._bodyBlob) {
        return readBlobAsText(this._bodyBlob)
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as text')
      } else {
        return Promise.resolve(this._bodyText)
      }
    };

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      };
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    };

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

  function normalizeMethod(method) {
    var upcased = method.toUpperCase();
    return methods.indexOf(upcased) > -1 ? upcased : method
  }

  function Request(input, options) {
    options = options || {};
    var body = options.body;

    if (input instanceof Request) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url;
      this.credentials = input.credentials;
      if (!options.headers) {
        this.headers = new Headers(input.headers);
      }
      this.method = input.method;
      this.mode = input.mode;
      this.signal = input.signal;
      if (!body && input._bodyInit != null) {
        body = input._bodyInit;
        input.bodyUsed = true;
      }
    } else {
      this.url = String(input);
    }

    this.credentials = options.credentials || this.credentials || 'same-origin';
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers);
    }
    this.method = normalizeMethod(options.method || this.method || 'GET');
    this.mode = options.mode || this.mode || null;
    this.signal = options.signal || this.signal;
    this.referrer = null;

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body);
  }

  Request.prototype.clone = function() {
    return new Request(this, {body: this._bodyInit})
  };

  function decode(body) {
    var form = new FormData();
    body
      .trim()
      .split('&')
      .forEach(function(bytes) {
        if (bytes) {
          var split = bytes.split('=');
          var name = split.shift().replace(/\+/g, ' ');
          var value = split.join('=').replace(/\+/g, ' ');
          form.append(decodeURIComponent(name), decodeURIComponent(value));
        }
      });
    return form
  }

  function parseHeaders(rawHeaders) {
    var headers = new Headers();
    // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
    // https://tools.ietf.org/html/rfc7230#section-3.2
    var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
    preProcessedHeaders.split(/\r?\n/).forEach(function(line) {
      var parts = line.split(':');
      var key = parts.shift().trim();
      if (key) {
        var value = parts.join(':').trim();
        headers.append(key, value);
      }
    });
    return headers
  }

  Body.call(Request.prototype);

  function Response(bodyInit, options) {
    if (!options) {
      options = {};
    }

    this.type = 'default';
    this.status = options.status === undefined ? 200 : options.status;
    this.ok = this.status >= 200 && this.status < 300;
    this.statusText = 'statusText' in options ? options.statusText : 'OK';
    this.headers = new Headers(options.headers);
    this.url = options.url || '';
    this._initBody(bodyInit);
  }

  Body.call(Response.prototype);

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  };

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''});
    response.type = 'error';
    return response
  };

  var redirectStatuses = [301, 302, 303, 307, 308];

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  };

  exports.DOMException = self.DOMException;
  try {
    new exports.DOMException();
  } catch (err) {
    exports.DOMException = function(message, name) {
      this.message = message;
      this.name = name;
      var error = Error(message);
      this.stack = error.stack;
    };
    exports.DOMException.prototype = Object.create(Error.prototype);
    exports.DOMException.prototype.constructor = exports.DOMException;
  }

  function fetch(input, init) {
    return new Promise(function(resolve, reject) {
      var request = new Request(input, init);

      if (request.signal && request.signal.aborted) {
        return reject(new exports.DOMException('Aborted', 'AbortError'))
      }

      var xhr = new XMLHttpRequest();

      function abortXhr() {
        xhr.abort();
      }

      xhr.onload = function() {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
        };
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
        var body = 'response' in xhr ? xhr.response : xhr.responseText;
        resolve(new Response(body, options));
      };

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'));
      };

      xhr.ontimeout = function() {
        reject(new TypeError('Network request failed'));
      };

      xhr.onabort = function() {
        reject(new exports.DOMException('Aborted', 'AbortError'));
      };

      xhr.open(request.method, request.url, true);

      if (request.credentials === 'include') {
        xhr.withCredentials = true;
      } else if (request.credentials === 'omit') {
        xhr.withCredentials = false;
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob';
      }

      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value);
      });

      if (request.signal) {
        request.signal.addEventListener('abort', abortXhr);

        xhr.onreadystatechange = function() {
          // DONE (success or failure)
          if (xhr.readyState === 4) {
            request.signal.removeEventListener('abort', abortXhr);
          }
        };
      }

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
    })
  }

  fetch.polyfill = true;

  if (!self.fetch) {
    self.fetch = fetch;
    self.Headers = Headers;
    self.Request = Request;
    self.Response = Response;
  }

  exports.Headers = Headers;
  exports.Request = Request;
  exports.Response = Response;
  exports.fetch = fetch;

  Object.defineProperty(exports, '__esModule', { value: true });

})));

},{}],2:[function(require,module,exports){
"use strict";

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

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
    define(["require", "exports", "./context"], factory);
  }
})(function (require, exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var context_1 = __importDefault(require("./context"));

  var Buffer =
  /*#__PURE__*/
  function () {
    function Buffer(gl, BW, BH, index) {
      _classCallCheck(this, Buffer);

      gl.getExtension('OES_texture_float');
      gl.activeTexture(gl.TEXTURE0 + index);
      var texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, BW, BH, 0, gl.RGBA, gl.FLOAT, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      var buffer = gl.createFramebuffer();
      this.texture = texture;
      this.buffer = buffer;
      this.BW = BW;
      this.BH = BH;
      this.index = index;
    }

    _createClass(Buffer, [{
      key: "resize",
      value: function resize(gl, BW, BH) {
        var buffer = this.buffer;
        var texture = this.texture;
        var index = this.index;
        gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
        var minW = Math.min(BW, this.BW);
        var minH = Math.min(BH, this.BH);
        var pixels = new Float32Array(minW * minH * 4);
        gl.readPixels(0, 0, minW, minH, gl.RGBA, gl.FLOAT, pixels);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        var newIndex = index + 1; // !!!

        var newTexture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + newIndex);
        gl.bindTexture(gl.TEXTURE_2D, newTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, BW, BH, 0, gl.RGBA, gl.FLOAT, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, minW, minH, gl.RGBA, gl.FLOAT, pixels);
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
    }]);

    return Buffer;
  }();

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
  function (_Map) {
    _inherits(Buffers, _Map);

    function Buffers() {
      _classCallCheck(this, Buffers);

      return _possibleConstructorReturn(this, _getPrototypeOf(Buffers).apply(this, arguments));
    }

    _createClass(Buffers, [{
      key: "count",
      get: function get() {
        return this.size * 4;
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
  }(_wrapNativeSuper(Map));

  exports.default = Buffers;
});

},{"./context":3}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

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
    define(["require", "exports", "whatwg-fetch", "./buffers", "./context", "./listener.subscriber", "./textures", "./uniforms"], factory);
  }
})(function (require, exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  }); // import '@babel/polyfill';

  require("whatwg-fetch");

  var buffers_1 = __importDefault(require("./buffers"));

  var context_1 = __importDefault(require("./context"));

  var listener_subscriber_1 = __importDefault(require("./listener.subscriber"));

  var textures_1 = __importStar(require("./textures"));

  var uniforms_1 = __importDefault(require("./uniforms"));

  var GlslCanvasDefaultVertex = "\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\nattribute vec2 a_position;\nattribute vec2 a_texcoord;\n\nvarying vec2 v_texcoord;\n\nvoid main(){\n\tgl_Position = vec4(a_position, 0.0, 1.0);\n\tv_texcoord = a_texcoord;\n}\n";
  var GlslCanvasDefaultFragment = "\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\nvarying vec2 v_texcoord;\n\nvoid main(){\n\tgl_FragColor = vec4(0.0);\n}\n";

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
      this.start = this.previous = performance.now() / 1000.0;
    }

    _createClass(GlslCanvasTimer, [{
      key: "play",
      value: function play() {
        if (this.previous) {
          var now = performance.now() / 1000.0;
          this.delay += now - this.previous;
          this.previous = now;
        }

        console.log(this.delay);
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
        var now = performance.now() / 1000.0;
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
  function (_listener_subscriber_) {
    _inherits(GlslCanvas, _listener_subscriber_);

    function GlslCanvas(canvas) {
      var _this;

      var contextOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      _classCallCheck(this, GlslCanvas);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(GlslCanvas).call(this));
      _this.dirty = true;
      _this.animated = false;
      _this.nDelta = 0;
      _this.nTime = 0;
      _this.nDate = 0;
      _this.nMouse = 0;
      _this.textures = new textures_1.default();
      _this.buffers = new buffers_1.default();
      _this.uniforms = new uniforms_1.default();
      _this.mouse = {
        x: 0,
        y: 0
      };
      _this.valid = false;
      _this.visible = false;
      _this.textureIndex = 0;

      if (!canvas) {
        return _possibleConstructorReturn(_this);
      }

      _this.canvas = canvas;
      _this.width = canvas.clientWidth;
      _this.height = canvas.clientHeight;
      _this.rect = canvas.getBoundingClientRect();
      _this.vertexString = contextOptions.vertexString || GlslCanvasDefaultVertex;
      _this.fragmentString = contextOptions.fragmentString || GlslCanvasDefaultFragment;
      var gl = context_1.default.tryGetContext(canvas, contextOptions, options.onError);

      if (!gl) {
        return _possibleConstructorReturn(_this);
      }

      _this.gl = gl;
      _this.pixelRatio = window.devicePixelRatio || 1;
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

      return _this;
    }

    _createClass(GlslCanvas, [{
      key: "getShaders",
      value: function getShaders() {
        var _this2 = this;

        return new Promise(function (resolve, reject) {
          var canvas = _this2.canvas;
          var urls = [];

          if (canvas.hasAttribute('data-vertex-url')) {
            urls.push(canvas.getAttribute('data-vertex-url'));
          }

          if (canvas.hasAttribute('data-fragment-url')) {
            urls.push(canvas.getAttribute('data-fragment-url'));
          }

          if (urls.length) {
            Promise.all(urls.map(function (url, i) {
              return fetch(url).then(function (response) {
                return response.text();
              }).then(function (body) {
                if (i === 0) {
                  return _this2.vertexString = body;
                } else {
                  return _this2.fragmentString = body;
                }
              });
            })).then(function (shaders) {
              resolve(shaders);
            });
          } else {
            if (canvas.hasAttribute('data-vertex')) {
              _this2.vertexString = canvas.getAttribute('data-vertex');
            }

            if (canvas.hasAttribute('data-fragment')) {
              _this2.fragmentString = canvas.getAttribute('data-fragment');
            }

            resolve([_this2.vertexString, _this2.fragmentString]);
          }
        });
      }
    }, {
      key: "addListeners",
      value: function addListeners() {
        var _this3 = this;

        // resize buffers on canvas resize
        // consider applying a throttle of 50 ms on canvas resize
        // to avoid requestAnimationFrame and Gl violations
        var resize = function resize(e) {
          _this3.rect = _this3.canvas.getBoundingClientRect();
        };

        var scroll = function scroll(e) {
          _this3.rect = _this3.canvas.getBoundingClientRect();
        };

        var mousemove = function mousemove(e) {
          _this3.mouse.x = e.clientX || e.pageX;
          _this3.mouse.y = e.clientY || e.pageY;
        };

        var click = function click(e) {
          if (_this3.timer.paused) {
            _this3.play();
          } else {
            _this3.pause();
          }
        };

        var loop = function loop(time) {
          _this3.checkRender();

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

          if (!this.canvas.hasAttribute('autoplay')) {
            this.pause();
          }
        }
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
        var vertexShader = context_1.default.createShader(gl, this.vertexString, gl.VERTEX_SHADER);
        var fragmentShader = context_1.default.createShader(gl, this.fragmentString, gl.FRAGMENT_SHADER); // If Fragment shader fails load a empty one to sign the error

        if (!fragmentShader) {
          fragmentShader = context_1.default.createShader(gl, "void main(){\n\t\t\t\tgl_FragColor = vec4(1.0);\n\t\t\t}", gl.FRAGMENT_SHADER);
          this.valid = false;
        } else {
          this.valid = true;
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
          this.textureIndex = this.buffers.count;
          this.vertexBuffers = context_1.default.createVertexBuffers(gl, program);
          this.createUniforms(); // this.getBuffers(this.fragmentString);
        } // Trigger event


        this.trigger('load', {}); // this.render();
      }
    }, {
      key: "test",
      value: function test(fragmentString, vertexString) {
        var _this4 = this;

        return new Promise(function (resolve, reject) {
          // Thanks to @thespite for the help here
          // https://www.khronos.org/registry/webgl/extensions/EXT_disjoint_timer_query/
          var vertex = _this4.vertexString;
          var fragment = _this4.fragmentString;
          var paused = _this4.timer.paused;

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
        this.animated = false;
        this.valid = false;
        var gl = this.gl;
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
        this.buffers.forEach(function (buffer) {
          return buffer.destroy(gl);
        });
        this.buffers = null;
        this.textures = null;
        this.uniforms = null;
        this.program = null;
        this.gl = null;
      }
    }, {
      key: "setUniform",
      value: function setUniform(key) {
        var _uniforms_1$default;

        for (var _len = arguments.length, values = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          values[_key - 1] = arguments[_key];
        }

        var uniform = (_uniforms_1$default = uniforms_1.default).parseUniform.apply(_uniforms_1$default, [key].concat(values));

        if (uniform) {
          if (uniform.type === 'sampler2D') {
            this.loadTexture(key, values[0]);
          } else {
            this.uniforms.set(key, uniform);
          }
        }
      }
    }, {
      key: "setUniforms",
      value: function setUniforms(values) {
        var _this5 = this;

        values.forEach(function (value, key) {
          _this5.setUniform.apply(_this5, [key].concat(_toConsumableArray(value)));
        });
      }
    }, {
      key: "pause",
      value: function pause() {
        this.timer.pause();
        this.canvas.classList.add('paused');
      }
    }, {
      key: "play",
      value: function play() {
        this.timer.play();
        this.canvas.classList.remove('paused');
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
      } // !!!

    }, {
      key: "sizeDidChanged",
      value: function sizeDidChanged() {
        var gl = this.gl;
        var rect = this.rect;
        var W = rect.width,
            H = rect.height;

        if (this.width !== W || this.height !== H) {
          this.width = W;
          this.height = H; // Lookup the size the browser is displaying the canvas in CSS pixels
          // and compute a size needed to make our drawingbuffer match it in
          // device pixels.

          var BW = Math.floor(W * this.pixelRatio);
          var BH = Math.floor(H * this.pixelRatio); // Check if the canvas is not the same size.

          if (gl.canvas.width !== BW || gl.canvas.height !== BH) {
            // Make the canvas the same size
            gl.canvas.width = BW;
            gl.canvas.height = BH; // Set the viewport to match
            // gl.viewport(0, 0, BW, BH);
          }

          this.buffers.forEach(function (buffer) {
            buffer.resize(gl, BW, BH);
          }); // gl.useProgram(this.program);

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
        var hasTextures = fragmentString.search(/sampler2D/g);
        this.animated = hasTime || hasDate || hasMouse;

        if (this.animated) {
          this.canvas.classList.add('animated');
        } else {
          this.canvas.classList.remove('animated');
        }

        this.uniforms.create('2f', 'vec2', 'u_resolution', BW, BH);

        if (hasDelta) {
          this.uniforms.create('1f', 'float', 'u_delta', timer.delta);
        }

        if (hasTime) {
          this.uniforms.create('1f', 'float', 'u_time', timer.current);
        }

        if (hasDate) {
          var date = new Date();
          this.uniforms.create('4f', 'float', 'u_date', date.getFullYear(), date.getMonth(), date.getDate(), date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds() + date.getMilliseconds() * 0.001);
        }

        if (hasMouse) {
          this.uniforms.create('2f', 'vec2', 'u_mouse', 0, 0);
        }

        this.buffers.forEach(function (buffer) {
          _this6.uniforms.create('1i', 'sampler2D', buffer.key, buffer.input.index);
        });

        if (hasTextures) {
          var lines = fragmentString.split('\n');

          for (var i = 0; i < lines.length; i++) {
            var match = lines[i].match(/uniform\s*sampler2D\s*([\w]*);\s*\/\/\s*([\w|\:\/\/|\.|\-|\_]*)/i);

            if (match) {
              var ext = match[2].split('.').pop().toLowerCase();
              var key = match[1];
              var url = match[2];

              if (key && url && textures_1.TextureExtensions.indexOf(ext) !== -1) {
                this.loadTexture(key, url);
              }
            }

            var main = lines[i].match(/\s*void\s*main\s*/g);

            if (main) {
              break;
            }
          }
        }

        if (this.canvas.hasAttribute('data-textures')) {
          var urls = this.canvas.getAttribute('data-textures').split(',');
          urls.forEach(function (url, i) {
            var key = 'u_tex' + i;

            _this6.loadTexture(key, url);
          });
        }
      }
    }, {
      key: "loadTexture",
      value: function loadTexture(key, url) {
        var _this7 = this;

        return this.textures.createOrUpdate(this.gl, key, url, this.buffers.count).then(function (texture) {
          var index = texture.index;

          var uniform = _this7.uniforms.createTexture(key, index);

          uniform.texture = texture;

          var uniformResolution = _this7.uniforms.create('2f', 'vec2', key + 'Resolution', texture.width, texture.height); // console.log('loadTexture', key, url, index, texture.width, texture.height);


          return texture;
        });
      }
    }, {
      key: "updateUniforms",
      value: function updateUniforms() {
        var _this8 = this;

        var gl = this.gl;
        var BW = gl.drawingBufferWidth;
        var BH = gl.drawingBufferHeight;
        var timer = this.timer.next();
        this.uniforms.update('2f', 'vec2', 'u_resolution', BW, BH);

        if (this.uniforms.has('u_delta')) {
          this.uniforms.update('1f', 'float', 'u_delta', timer.delta);
        }

        if (this.uniforms.has('u_time')) {
          this.uniforms.update('1f', 'float', 'u_time', timer.current);
        }

        if (this.uniforms.has('u_date')) {
          var date = new Date();
          this.uniforms.update('4f', 'float', 'u_date', date.getFullYear(), date.getMonth(), date.getDate(), date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds() + date.getMilliseconds() * 0.001);
        }

        if (this.uniforms.has('u_mouse')) {
          var rect = this.rect;
          var mouse = this.mouse;

          if (mouse.x >= rect.left && mouse.x <= rect.right && mouse.y >= rect.top && mouse.y <= rect.bottom) {
            var MX = (mouse.x - rect.left) * this.pixelRatio;
            var MY = this.canvas.height - (mouse.y - rect.top) * this.pixelRatio;
            this.uniforms.update('2f', 'vec2', 'u_mouse', MX, MY);
          }
        }

        this.buffers.forEach(function (buffer) {
          _this8.uniforms.update('1i', 'sampler2D', buffer.key, buffer.input.index);
        });
        this.textures.forEach(function (texture) {
          texture.tryUpdate(gl);

          _this8.uniforms.update('1i', 'sampler2D', texture.key, texture.index);
        });
      }
    }, {
      key: "render",
      value: function render() {
        var _this9 = this;

        var gl = this.gl;
        var BW = gl.drawingBufferWidth;
        var BH = gl.drawingBufferHeight;
        this.updateUniforms();
        this.buffers.forEach(function (buffer) {
          _this9.uniforms.apply(gl, buffer.program);

          buffer.render(gl, BW, BH);
        });
        gl.useProgram(this.program);
        this.uniforms.apply(gl, this.program);
        gl.viewport(0, 0, BW, BH);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        this.uniforms.forEach(function (uniform) {
          return uniform.dirty = false;
        });
        this.uniforms.dirty = false;
        this.textures.forEach(function (texture) {
          return texture.dirty = false;
        });
        this.textures.dirty = false;
        this.dirty = false;
        this.trigger('render', {});
      }
    }], [{
      key: "version",
      value: function version() {
        return '0.1.8';
      }
    }, {
      key: "isDifferent",
      value: function isDifferent(a, b) {
        if (a && b) {
          return a.toString() !== b.toString();
        }

        return false;
      }
    }]);

    return GlslCanvas;
  }(listener_subscriber_1.default);

  exports.default = GlslCanvas;
  window.GlslCanvas = GlslCanvas;

  var loadAllGlslCanvas = function loadAllGlslCanvas() {
    var canvases = Array.from(document.getElementsByClassName('glslCanvas')).filter(function (x) {
      return x instanceof HTMLCanvasElement;
    });
    window.glslCanvases = canvases.map(function (x) {
      return new GlslCanvas(x);
    }).filter(function (x) {
      return x.valid;
    });
  };

  window.addEventListener('load', function () {
    loadAllGlslCanvas();
  });
});

},{"./buffers":2,"./context":3,"./listener.subscriber":5,"./textures":6,"./uniforms":7,"whatwg-fetch":1}],5:[function(require,module,exports){
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

  var ListenerSubscriber =
  /*#__PURE__*/
  function () {
    function ListenerSubscriber() {
      _classCallCheck(this, ListenerSubscriber);

      this.listeners = new Set();
    }

    _createClass(ListenerSubscriber, [{
      key: "listSubscriptions",
      value: function listSubscriptions() {
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

    return ListenerSubscriber;
  }();

  exports.default = ListenerSubscriber;
});

},{}],6:[function(require,module,exports){
"use strict";

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

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
    define(["require", "exports", "./listener.subscriber"], factory);
  }
})(function (require, exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  }); // Texture management

  var listener_subscriber_1 = __importDefault(require("./listener.subscriber"));

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
  function (_listener_subscriber_) {
    _inherits(Texture, _listener_subscriber_);

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
        });
        this.setFiltering(gl, this.options); // this.bindTexture();
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
        var _this2 = this;

        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        if (!this.valid) {
          return;
        }

        this.url = url; // save URL reference (will be overwritten when element is loaded below)

        this.source = url;
        this.sourceType = TextureSourceType.Url;
        this.options = Object.assign(this.options, options);
        return new Promise(function (resolve, reject) {
          var ext = url.split('.').pop().toLowerCase();
          var isVideo = exports.TextureVideoExtensions.indexOf(ext) !== -1;
          var element;

          if (isVideo) {
            element = document.createElement('video');
            element.autoplay = true;
            options.filtering = TextureFilteringType.Nearest; // element.preload = 'auto';
            // element.style.display = 'none';
            // document.body.appendChild(element);
          } else {
            element = new Image();
          }

          element.onload = function () {
            try {
              _this2.setElement(gl, element, options);
            } catch (error) {
              console.log("Texture '".concat(_this2.key, "' failed to load url '").concat(url, "'"), error, options);
            }

            resolve(_this2);
          };

          element.onerror = function (error) {
            // Warn and resolve on error
            console.log("Texture '".concat(_this2.key, "' failed to load url '").concat(url, "'"), error, options);
            resolve(_this2);
          }; // Safari has a bug loading data-URL elements with CORS enabled, so it must be disabled in that case
          // https://bugs.webkit.org/show_bug.cgi?id=123978


          if (!(Texture.isSafari() && url.slice(0, 5) === 'data:')) {
            element.crossOrigin = 'anonymous';
          }

          element.src = url;

          if (isVideo) {
            _this2.setElement(gl, element, options);
          }
        });
      }
    }, {
      key: "setElement",
      value: function setElement(gl, element) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        this.options = Object.assign(this.options, options);
        var originalElement = element; // a string element is interpeted as a CSS selector

        if (typeof element === 'string') {
          element = document.querySelector(element);
        }

        if (element instanceof HTMLCanvasElement || element instanceof HTMLImageElement || element instanceof HTMLVideoElement) {
          this.source = element;
          this.sourceType = TextureSourceType.Element;

          if (element instanceof HTMLVideoElement) {
            /*
            const video = element as HTMLVideoElement;
            console.log('video', video);
            video.addEventListener('play', () => {
                console.log('play', this.key);
                this.animated = true;
            });
            video.addEventListener('pause', () => {
                console.log('pause', this.key);
                this.animated = false;
            });
            */

            /*
            video.addEventListener('canplaythrough', () => {
                // !!!
                this.intervalID = setInterval(() => {
                    this.update(gl, options);
                }, 15);
            }, true);
            */

            /*
            video.addEventListener('ended', () => {
                video.currentTime = 0;
                video.play();
            }, true);
            */
          } else {
            this.update(gl, options);
          }

          this.setFiltering(gl, options);
        } else {
          var message = "the 'element' parameter (`element: ".concat(JSON.stringify(originalElement), "`) must be a CSS selector string, or a <canvas>, <image> or <video> object");
          console.log("Texture '".concat(this.key, "': ").concat(message), options);
        }

        return Promise.resolve(this);
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
      /*
      bindTexture(gl: WebGLRenderingContext) {
          if (this.valid && Texture.activeTexture !== this.texture) {
              Texture.activeUnit++;
              gl.activeTexture(gl.TEXTURE0 + Texture.activeUnit);
              gl.bindTexture(gl.TEXTURE_2D, this.texture);
              console.log('bindTexture', this.key);
              Texture.activeTexture = this.texture;
          }
      }
      */
      // Determines appropriate filtering mode

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
            urlElementOrData = document.querySelector(urlElementOrData);
            console.log(urlElementOrData);
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
  }(listener_subscriber_1.default);

  Texture.activeUnit = -1;
  exports.Texture = Texture;

  var Textures =
  /*#__PURE__*/
  function (_Map) {
    _inherits(Textures, _Map);

    function Textures() {
      var _this3;

      _classCallCheck(this, Textures);

      _this3 = _possibleConstructorReturn(this, _getPrototypeOf(Textures).apply(this, arguments));
      _this3.count = 1;
      _this3.dirty = false;
      _this3.animated = false;
      return _this3;
    }

    _createClass(Textures, [{
      key: "createOrUpdate",
      value: function createOrUpdate(gl, key, urlElementOrData) {
        var _this4 = this;

        var index = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
        var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
        var texture;
        var textureOptions = Texture.getTextureOptions(urlElementOrData, options);

        if (textureOptions !== undefined) {
          texture = this.get(key);

          if (!texture) {
            texture = new Texture(gl, key, index + this.count, textureOptions);
            this.count++;
            this.set(key, texture);
          } // return Promise.resolve(texture);


          return texture.load(gl, textureOptions).then(function (texture) {
            if (texture.source instanceof HTMLVideoElement) {
              var video = texture.source;
              console.log('video', video);
              video.addEventListener('play', function () {
                console.log('play', texture.key);
                texture.animated = true;
                _this4.animated = true;
              });
              video.addEventListener('pause', function () {
                console.log('pause', texture.key);
                texture.animated = false;
                _this4.animated = Array.from(_this4.values()).reduce(function (flag, texture) {
                  return flag || texture.animated;
                }, false);
              });
              video.addEventListener('seeked', function () {
                console.log('seeked');
                texture.update(gl, texture.options);
                _this4.dirty = true;
              });
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
          return Promise.reject(null);
        }
      }
    }]);

    return Textures;
  }(_wrapNativeSuper(Map));

  exports.default = Textures;
});

},{"./listener.subscriber":5}],7:[function(require,module,exports){
"use strict";

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

(function (factory) {
  if ((typeof module === "undefined" ? "undefined" : _typeof(module)) === "object" && _typeof(module.exports) === "object") {
    var v = factory(require, exports);
    if (v !== undefined) module.exports = v;
  } else if (typeof define === "function" && define.amd) {
    define(["require", "exports", "./textures"], factory);
  }
})(function (require, exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var textures_1 = require("./textures");

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
          var method = 'uniform' + _this.method;
          var location = gl.getUniformLocation(program, _this.key);
          gl[method].apply(gl, [location].concat(_this.values));
        }
      };
    }

    _createClass(Uniform, null, [{
      key: "isDifferent",
      value: function isDifferent(a, b) {
        if (a && b) {
          return a.toString() !== b.toString();
        }

        return false;
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
  function (_Map) {
    _inherits(Uniforms, _Map);

    function Uniforms() {
      var _this2;

      _classCallCheck(this, Uniforms);

      _this2 = _possibleConstructorReturn(this, _getPrototypeOf(Uniforms).apply(this, arguments));
      _this2.dirty = false;
      return _this2;
    }

    _createClass(Uniforms, [{
      key: "setParse",
      value: function setParse(key) {
        for (var _len = arguments.length, values = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          values[_key - 1] = arguments[_key];
        }

        var uniform = Uniforms.parseUniform.apply(Uniforms, [key].concat(values));

        if (uniform) {
          this.set(key, uniform);
        }

        return uniform;
      }
    }, {
      key: "create",
      value: function create(method, type, key) {
        for (var _len2 = arguments.length, values = new Array(_len2 > 3 ? _len2 - 3 : 0), _key2 = 3; _key2 < _len2; _key2++) {
          values[_key2 - 3] = arguments[_key2];
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
        var uniform = new UniformTexture({
          method: '1i',
          type: 'sampler2D',
          key: key,
          values: [index]
        });
        this.set(key, uniform);
        this.dirty = true;
        return uniform; // const uniform = this.setParse(key, url) as UniformTexture; // !!!
        // console.log(uniform.type, key, url);

        /*
        if (uniform.type === 'sampler2D') {
            // console.log(u, uniform);
            // For textures, we need to track texture units, so we have a special setter
            // this.uniformTexture(uniform.key, uniform.value[0]);
            if (uniform.method === '1iv') {
                // todo
                uniform.values.map((
                    urlElementOrData: string | HTMLCanvasElement | HTMLImageElement | HTMLVideoElement | Element | TextureData,
                    i: number
                ) => this.uniformTexture(uniform.key + i, urlElementOrData));
            } else {
                this.uniformTexture(uniform.key, uniform.values[0]);
            }
        }
        */

        return uniform;
      }
    }, {
      key: "update",
      value: function update(method, type, key) {
        var uniform = this.get(key);

        for (var _len3 = arguments.length, values = new Array(_len3 > 3 ? _len3 - 3 : 0), _key3 = 3; _key3 < _len3; _key3++) {
          values[_key3 - 3] = arguments[_key3];
        }

        if (uniform && (uniform.method !== method || uniform.type !== type || uniform.values !== values)) {
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
        for (var _len4 = arguments.length, values = new Array(_len4 > 3 ? _len4 - 3 : 0), _key4 = 3; _key4 < _len4; _key4++) {
          values[_key4 - 3] = arguments[_key4];
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
        this.forEach(function (uniform) {
          return uniform.apply(gl, program);
        });
      }
    }], [{
      key: "isArrayOfNumbers",
      value: function isArrayOfNumbers(array) {
        return array.reduce(function (flag, value) {
          return flag && typeof value === 'number';
        }, true);
      }
    }, {
      key: "parseUniform",
      value: function parseUniform(key) {
        for (var _len5 = arguments.length, values = new Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
          values[_key5 - 1] = arguments[_key5];
        }

        var value = values.length === 1 ? values[0] : values;
        var uniform; // console.log(key, value);
        // Single float

        if (typeof value === 'number') {
          uniform = new Uniform({
            type: 'float',
            method: '1f',
            key: key,
            values: [value]
          });
        } else if (typeof value === 'boolean') {
          // Boolean
          uniform = new Uniform({
            type: 'bool',
            method: '1i',
            key: key,
            values: [value]
          });
        } else if (textures_1.Texture.isTexture(value)) {
          // Texture
          uniform = new Uniform({
            type: 'sampler2D',
            method: '1i',
            key: key,
            values: value // !!!

          });
        } else if (Array.isArray(value)) {
          // Array: vector, array of floats, array of textures, or array of structs
          // Numeric values
          if (Uniforms.isArrayOfNumbers(value)) {
            // float vectors (vec2, vec3, vec4)
            if (value.length === 1) {
              uniform = new Uniform({
                type: 'float',
                method: '1f',
                key: key,
                values: value
              });
            } else if (value.length >= 2 && value.length <= 4) {
              // float vectors (vec2, vec3, vec4)
              uniform = new Uniform({
                type: 'vec' + value.length,
                method: value.length + 'fv',
                key: key,
                values: value
              });
            } else if (value.length > 4) {
              // float array
              uniform = new Uniform({
                type: 'float[]',
                method: '1fv',
                key: key,
                values: value
              });
            } // TODO: assume matrix for (typeof == Float32Array && length == 16)?

          } else if (textures_1.Texture.getTextureOptions(value[0])) {
            // Array of textures
            uniform = new Uniform({
              type: 'sampler2D',
              method: '1iv',
              key: key,
              values: value
            });
          } else if (Array.isArray(value[0]) && typeof value[0][0] === 'number') {
            // Array of arrays - but only arrays of vectors are allowed in this case
            // float vectors (vec2, vec3, vec4)
            if (value[0].length >= 2 && value[0].length <= 4) {
              // Set each vector in the array
              for (var u = 0; u < value.length; u++) {
                uniform = new Uniform({
                  type: 'vec' + value[0].length,
                  method: value[u].length + 'fv',
                  key: key + '[' + u + ']',
                  values: value[u]
                });
              }
            } // else error?

          } else if (_typeof(value[0]) === 'object') {
            // Array of structures
            for (var _u = 0; _u < value.length; _u++) {// Set each struct in the array
              // !!! uniform = new Uniform(...Uniforms.parseUniforms(value[u], key + '[' + u + ']'));
            }
          }
        } else if (_typeof(value) === 'object') {} // Structure
        // Set each field in the struct
        // !!! uniform = new Uniform(...Uniforms.parseUniforms(value, key));
        // TODO: support other non-float types? (int, etc.)


        return uniform;
      }
    }, {
      key: "parseUniforms",
      value: function parseUniforms(values, prefix) {
        var uniforms = new Map();

        for (var key in values) {
          var value = values[key];

          if (prefix) {
            key = prefix + '.' + key;
          }

          var uniform = Uniforms.parseUniform(key, value);

          if (uniform) {
            uniforms.set(key, uniform);
          }
        }

        return uniforms;
      }
    }]);

    return Uniforms;
  }(_wrapNativeSuper(Map));

  exports.default = Uniforms;
});

},{"./textures":6}]},{},[4]);

//# sourceMappingURL=glsl-canvas.js.map
