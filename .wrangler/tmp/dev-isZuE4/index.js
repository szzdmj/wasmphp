var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// scripts/php_8_4_cf.js
var Module = /* @__PURE__ */ (() => {
  var _scriptName = void 0;
  return function(moduleArg = {}) {
    var moduleRtn;
    var Module2 = moduleArg;
    var readyPromiseResolve, readyPromiseReject;
    var readyPromise = new Promise((resolve, reject) => {
      readyPromiseResolve = resolve;
      readyPromiseReject = reject;
    });
    var ENVIRONMENT_IS_WEB = false;
    var ENVIRONMENT_IS_WORKER = true;
    var ENVIRONMENT_IS_NODE = false;
    var moduleOverrides = Object.assign({}, Module2);
    var arguments_ = [];
    var thisProgram = "./this.program";
    var quit_ = /* @__PURE__ */ __name((status, toThrow) => {
      throw toThrow;
    }, "quit_");
    var scriptDirectory = "";
    function locateFile(path) {
      if (Module2["locateFile"]) {
        return Module2["locateFile"](path, scriptDirectory);
      }
      return scriptDirectory + path;
    }
    __name(locateFile, "locateFile");
    var readAsync, readBinary;
    if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
      if (ENVIRONMENT_IS_WORKER) {
        scriptDirectory = self.location.href;
      } else if (typeof document != "undefined" && document.currentScript) {
        scriptDirectory = document.currentScript.src;
      }
      if (_scriptName) {
        scriptDirectory = _scriptName;
      }
      if (scriptDirectory.startsWith("blob:")) {
        scriptDirectory = "";
      } else {
        scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1);
      }
      {
        if (ENVIRONMENT_IS_WORKER) {
          readBinary = /* @__PURE__ */ __name((url) => {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, false);
            xhr.responseType = "arraybuffer";
            xhr.send(null);
            return new Uint8Array(xhr.response);
          }, "readBinary");
        }
        readAsync = /* @__PURE__ */ __name((url) => fetch(url, { credentials: "same-origin" }).then((response) => {
          if (response.ok) {
            return response.arrayBuffer();
          }
          return Promise.reject(new Error(response.status + " : " + response.url));
        }), "readAsync");
      }
    } else {
    }
    var out = Module2["print"] || console.log.bind(console);
    var err = Module2["printErr"] || console.error.bind(console);
    Object.assign(Module2, moduleOverrides);
    moduleOverrides = null;
    if (Module2["arguments"]) arguments_ = Module2["arguments"];
    if (Module2["thisProgram"]) thisProgram = Module2["thisProgram"];
    var wasmBinary = Module2["wasmBinary"];
    var wasmMemory;
    var ABORT = false;
    var EXITSTATUS;
    function assert(condition, text) {
      if (!condition) {
        abort(text);
      }
    }
    __name(assert, "assert");
    var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
    function updateMemoryViews() {
      var b = wasmMemory.buffer;
      Module2["HEAP8"] = HEAP8 = new Int8Array(b);
      Module2["HEAP16"] = HEAP16 = new Int16Array(b);
      Module2["HEAPU8"] = HEAPU8 = new Uint8Array(b);
      Module2["HEAPU16"] = HEAPU16 = new Uint16Array(b);
      Module2["HEAP32"] = HEAP32 = new Int32Array(b);
      Module2["HEAPU32"] = HEAPU32 = new Uint32Array(b);
      Module2["HEAPF32"] = HEAPF32 = new Float32Array(b);
      Module2["HEAPF64"] = HEAPF64 = new Float64Array(b);
    }
    __name(updateMemoryViews, "updateMemoryViews");
    var __ATPRERUN__ = [];
    var __ATINIT__ = [];
    var __ATMAIN__ = [];
    var __ATPOSTRUN__ = [];
    var runtimeInitialized = false;
    function preRun() {
      if (Module2["preRun"]) {
        if (typeof Module2["preRun"] == "function") Module2["preRun"] = [Module2["preRun"]];
        while (Module2["preRun"].length) {
          addOnPreRun(Module2["preRun"].shift());
        }
      }
      callRuntimeCallbacks(__ATPRERUN__);
    }
    __name(preRun, "preRun");
    function initRuntime() {
      runtimeInitialized = true;
      if (!Module2["noFSInit"] && !FS.initialized) FS.init();
      FS.ignorePermissions = false;
      TTY.init();
      SOCKFS.root = FS.mount(SOCKFS, {}, null);
      PIPEFS.root = FS.mount(PIPEFS, {}, null);
      callRuntimeCallbacks(__ATINIT__);
    }
    __name(initRuntime, "initRuntime");
    function preMain() {
      callRuntimeCallbacks(__ATMAIN__);
    }
    __name(preMain, "preMain");
    function postRun() {
      if (Module2["postRun"]) {
        if (typeof Module2["postRun"] == "function") Module2["postRun"] = [Module2["postRun"]];
        while (Module2["postRun"].length) {
          addOnPostRun(Module2["postRun"].shift());
        }
      }
      callRuntimeCallbacks(__ATPOSTRUN__);
    }
    __name(postRun, "postRun");
    function addOnPreRun(cb) {
      __ATPRERUN__.unshift(cb);
    }
    __name(addOnPreRun, "addOnPreRun");
    function addOnInit(cb) {
      __ATINIT__.unshift(cb);
    }
    __name(addOnInit, "addOnInit");
    function addOnPostRun(cb) {
      __ATPOSTRUN__.unshift(cb);
    }
    __name(addOnPostRun, "addOnPostRun");
    var runDependencies = 0;
    var runDependencyWatcher = null;
    var dependenciesFulfilled = null;
    function getUniqueRunDependency(id) {
      return id;
    }
    __name(getUniqueRunDependency, "getUniqueRunDependency");
    function addRunDependency(id) {
      runDependencies++;
      Module2["monitorRunDependencies"]?.(runDependencies);
    }
    __name(addRunDependency, "addRunDependency");
    function removeRunDependency(id) {
      runDependencies--;
      Module2["monitorRunDependencies"]?.(runDependencies);
      if (runDependencies == 0) {
        if (runDependencyWatcher !== null) {
          clearInterval(runDependencyWatcher);
          runDependencyWatcher = null;
        }
        if (dependenciesFulfilled) {
          var callback = dependenciesFulfilled;
          dependenciesFulfilled = null;
          callback();
        }
      }
    }
    __name(removeRunDependency, "removeRunDependency");
    function abort(what) {
      Module2["onAbort"]?.(what);
      what = "Aborted(" + what + ")";
      err(what);
      ABORT = true;
      what += ". Build with -sASSERTIONS for more info.";
      var e = new WebAssembly.RuntimeError(what);
      readyPromiseReject(e);
      throw e;
    }
    __name(abort, "abort");
    var dataURIPrefix = "data:application/octet-stream;base64,";
    var isDataURI = /* @__PURE__ */ __name((filename) => filename.startsWith(dataURIPrefix), "isDataURI");
    function findWasmBinary() {
      if (Module2["locateFile"]) {
        var f = "php.wasm";
        if (!isDataURI(f)) {
          return locateFile(f);
        }
        return f;
      }
      return new URL("php.wasm", import.meta.url).href;
    }
    __name(findWasmBinary, "findWasmBinary");
    var wasmBinaryFile;
    function getBinarySync(file) {
      if (file == wasmBinaryFile && wasmBinary) {
        return new Uint8Array(wasmBinary);
      }
      if (readBinary) {
        return readBinary(file);
      }
      throw "both async and sync fetching of the wasm failed";
    }
    __name(getBinarySync, "getBinarySync");
    function getBinaryPromise(binaryFile) {
      if (!wasmBinary) {
        return readAsync(binaryFile).then((response) => new Uint8Array(response), () => getBinarySync(binaryFile));
      }
      return Promise.resolve().then(() => getBinarySync(binaryFile));
    }
    __name(getBinaryPromise, "getBinaryPromise");
    function instantiateArrayBuffer(binaryFile, imports, receiver) {
      return getBinaryPromise(binaryFile).then((binary) => WebAssembly.instantiate(binary, imports)).then(receiver, (reason) => {
        err(`failed to asynchronously prepare wasm: ${reason}`);
        abort(reason);
      });
    }
    __name(instantiateArrayBuffer, "instantiateArrayBuffer");
    function instantiateAsync(binary, binaryFile, imports, callback) {
      if (!binary && typeof WebAssembly.instantiateStreaming == "function" && !isDataURI(binaryFile) && typeof fetch == "function") {
        return fetch(binaryFile, { credentials: "same-origin" }).then((response) => {
          var result = WebAssembly.instantiateStreaming(response, imports);
          return result.then(callback, function(reason) {
            err(`wasm streaming compile failed: ${reason}`);
            err("falling back to ArrayBuffer instantiation");
            return instantiateArrayBuffer(binaryFile, imports, callback);
          });
        });
      }
      return instantiateArrayBuffer(binaryFile, imports, callback);
    }
    __name(instantiateAsync, "instantiateAsync");
    function getWasmImports() {
      return { a: wasmImports };
    }
    __name(getWasmImports, "getWasmImports");
    function createWasm() {
      var info = getWasmImports();
      function receiveInstance(instance, module) {
        wasmExports = instance.exports;
        wasmMemory = wasmExports["Ya"];
        updateMemoryViews();
        wasmTable = wasmExports["gb"];
        addOnInit(wasmExports["Za"]);
        removeRunDependency("wasm-instantiate");
        return wasmExports;
      }
      __name(receiveInstance, "receiveInstance");
      addRunDependency("wasm-instantiate");
      function receiveInstantiationResult(result) {
        receiveInstance(result["instance"]);
      }
      __name(receiveInstantiationResult, "receiveInstantiationResult");
      if (Module2["instantiateWasm"]) {
        try {
          return Module2["instantiateWasm"](info, receiveInstance);
        } catch (e) {
          err(`Module.instantiateWasm callback failed with error: ${e}`);
          readyPromiseReject(e);
        }
      }
      if (!wasmBinaryFile) wasmBinaryFile = findWasmBinary();
      instantiateAsync(wasmBinary, wasmBinaryFile, info, receiveInstantiationResult).catch(readyPromiseReject);
      return {};
    }
    __name(createWasm, "createWasm");
    var tempDouble;
    var tempI64;
    function ExitStatus(status) {
      this.name = "ExitStatus";
      this.message = `Program terminated with exit(${status})`;
      this.status = status;
    }
    __name(ExitStatus, "ExitStatus");
    var callRuntimeCallbacks = /* @__PURE__ */ __name((callbacks) => {
      while (callbacks.length > 0) {
        callbacks.shift()(Module2);
      }
    }, "callRuntimeCallbacks");
    var noExitRuntime = Module2["noExitRuntime"] || true;
    var stackRestore = /* @__PURE__ */ __name((val) => __emscripten_stack_restore(val), "stackRestore");
    var stackSave = /* @__PURE__ */ __name(() => _emscripten_stack_get_current(), "stackSave");
    var UTF8Decoder = typeof TextDecoder != "undefined" ? new TextDecoder() : void 0;
    var UTF8ArrayToString = /* @__PURE__ */ __name((heapOrArray, idx, maxBytesToRead) => {
      var endIdx = idx + maxBytesToRead;
      var endPtr = idx;
      while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
      if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
        return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
      }
      var str = "";
      while (idx < endPtr) {
        var u0 = heapOrArray[idx++];
        if (!(u0 & 128)) {
          str += String.fromCharCode(u0);
          continue;
        }
        var u1 = heapOrArray[idx++] & 63;
        if ((u0 & 224) == 192) {
          str += String.fromCharCode((u0 & 31) << 6 | u1);
          continue;
        }
        var u2 = heapOrArray[idx++] & 63;
        if ((u0 & 240) == 224) {
          u0 = (u0 & 15) << 12 | u1 << 6 | u2;
        } else {
          u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | heapOrArray[idx++] & 63;
        }
        if (u0 < 65536) {
          str += String.fromCharCode(u0);
        } else {
          var ch = u0 - 65536;
          str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
        }
      }
      return str;
    }, "UTF8ArrayToString");
    var UTF8ToString = /* @__PURE__ */ __name((ptr, maxBytesToRead) => ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : "", "UTF8ToString");
    var ___assert_fail = /* @__PURE__ */ __name((condition, filename, line, func) => {
      abort(`Assertion failed: ${UTF8ToString(condition)}, at: ` + [filename ? UTF8ToString(filename) : "unknown filename", line, func ? UTF8ToString(func) : "unknown function"]);
    }, "___assert_fail");
    var wasmTableMirror = [];
    var wasmTable;
    var getWasmTableEntry = /* @__PURE__ */ __name((funcPtr) => {
      var func = wasmTableMirror[funcPtr];
      if (!func) {
        if (funcPtr >= wasmTableMirror.length) wasmTableMirror.length = funcPtr + 1;
        wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
      }
      return func;
    }, "getWasmTableEntry");
    var ___call_sighandler = /* @__PURE__ */ __name((fp, sig) => getWasmTableEntry(fp)(sig), "___call_sighandler");
    var PATH = { isAbs: /* @__PURE__ */ __name((path) => path.charAt(0) === "/", "isAbs"), splitPath: /* @__PURE__ */ __name((filename) => {
      var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
      return splitPathRe.exec(filename).slice(1);
    }, "splitPath"), normalizeArray: /* @__PURE__ */ __name((parts, allowAboveRoot) => {
      var up = 0;
      for (var i = parts.length - 1; i >= 0; i--) {
        var last = parts[i];
        if (last === ".") {
          parts.splice(i, 1);
        } else if (last === "..") {
          parts.splice(i, 1);
          up++;
        } else if (up) {
          parts.splice(i, 1);
          up--;
        }
      }
      if (allowAboveRoot) {
        for (; up; up--) {
          parts.unshift("..");
        }
      }
      return parts;
    }, "normalizeArray"), normalize: /* @__PURE__ */ __name((path) => {
      var isAbsolute = PATH.isAbs(path), trailingSlash = path.substr(-1) === "/";
      path = PATH.normalizeArray(path.split("/").filter((p) => !!p), !isAbsolute).join("/");
      if (!path && !isAbsolute) {
        path = ".";
      }
      if (path && trailingSlash) {
        path += "/";
      }
      return (isAbsolute ? "/" : "") + path;
    }, "normalize"), dirname: /* @__PURE__ */ __name((path) => {
      var result = PATH.splitPath(path), root = result[0], dir = result[1];
      if (!root && !dir) {
        return ".";
      }
      if (dir) {
        dir = dir.substr(0, dir.length - 1);
      }
      return root + dir;
    }, "dirname"), basename: /* @__PURE__ */ __name((path) => {
      if (path === "/") return "/";
      path = PATH.normalize(path);
      path = path.replace(/\/$/, "");
      var lastSlash = path.lastIndexOf("/");
      if (lastSlash === -1) return path;
      return path.substr(lastSlash + 1);
    }, "basename"), join: /* @__PURE__ */ __name((...paths) => PATH.normalize(paths.join("/")), "join"), join2: /* @__PURE__ */ __name((l, r) => PATH.normalize(l + "/" + r), "join2") };
    var initRandomFill = /* @__PURE__ */ __name(() => {
      if (typeof crypto == "object" && typeof crypto["getRandomValues"] == "function") {
        return (view) => crypto.getRandomValues(view);
      } else abort("initRandomDevice");
    }, "initRandomFill");
    var randomFill = /* @__PURE__ */ __name((view) => (randomFill = initRandomFill())(view), "randomFill");
    var PATH_FS = { resolve: /* @__PURE__ */ __name((...args) => {
      var resolvedPath = "", resolvedAbsolute = false;
      for (var i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
        var path = i >= 0 ? args[i] : FS.cwd();
        if (typeof path != "string") {
          throw new TypeError("Arguments to path.resolve must be strings");
        } else if (!path) {
          return "";
        }
        resolvedPath = path + "/" + resolvedPath;
        resolvedAbsolute = PATH.isAbs(path);
      }
      resolvedPath = PATH.normalizeArray(resolvedPath.split("/").filter((p) => !!p), !resolvedAbsolute).join("/");
      return (resolvedAbsolute ? "/" : "") + resolvedPath || ".";
    }, "resolve"), relative: /* @__PURE__ */ __name((from, to) => {
      from = PATH_FS.resolve(from).substr(1);
      to = PATH_FS.resolve(to).substr(1);
      function trim(arr) {
        var start = 0;
        for (; start < arr.length; start++) {
          if (arr[start] !== "") break;
        }
        var end = arr.length - 1;
        for (; end >= 0; end--) {
          if (arr[end] !== "") break;
        }
        if (start > end) return [];
        return arr.slice(start, end - start + 1);
      }
      __name(trim, "trim");
      var fromParts = trim(from.split("/"));
      var toParts = trim(to.split("/"));
      var length = Math.min(fromParts.length, toParts.length);
      var samePartsLength = length;
      for (var i = 0; i < length; i++) {
        if (fromParts[i] !== toParts[i]) {
          samePartsLength = i;
          break;
        }
      }
      var outputParts = [];
      for (var i = samePartsLength; i < fromParts.length; i++) {
        outputParts.push("..");
      }
      outputParts = outputParts.concat(toParts.slice(samePartsLength));
      return outputParts.join("/");
    }, "relative") };
    var FS_stdin_getChar_buffer = [];
    var lengthBytesUTF8 = /* @__PURE__ */ __name((str) => {
      var len = 0;
      for (var i = 0; i < str.length; ++i) {
        var c = str.charCodeAt(i);
        if (c <= 127) {
          len++;
        } else if (c <= 2047) {
          len += 2;
        } else if (c >= 55296 && c <= 57343) {
          len += 4;
          ++i;
        } else {
          len += 3;
        }
      }
      return len;
    }, "lengthBytesUTF8");
    var stringToUTF8Array = /* @__PURE__ */ __name((str, heap, outIdx, maxBytesToWrite) => {
      if (!(maxBytesToWrite > 0)) return 0;
      var startIdx = outIdx;
      var endIdx = outIdx + maxBytesToWrite - 1;
      for (var i = 0; i < str.length; ++i) {
        var u = str.charCodeAt(i);
        if (u >= 55296 && u <= 57343) {
          var u1 = str.charCodeAt(++i);
          u = 65536 + ((u & 1023) << 10) | u1 & 1023;
        }
        if (u <= 127) {
          if (outIdx >= endIdx) break;
          heap[outIdx++] = u;
        } else if (u <= 2047) {
          if (outIdx + 1 >= endIdx) break;
          heap[outIdx++] = 192 | u >> 6;
          heap[outIdx++] = 128 | u & 63;
        } else if (u <= 65535) {
          if (outIdx + 2 >= endIdx) break;
          heap[outIdx++] = 224 | u >> 12;
          heap[outIdx++] = 128 | u >> 6 & 63;
          heap[outIdx++] = 128 | u & 63;
        } else {
          if (outIdx + 3 >= endIdx) break;
          heap[outIdx++] = 240 | u >> 18;
          heap[outIdx++] = 128 | u >> 12 & 63;
          heap[outIdx++] = 128 | u >> 6 & 63;
          heap[outIdx++] = 128 | u & 63;
        }
      }
      heap[outIdx] = 0;
      return outIdx - startIdx;
    }, "stringToUTF8Array");
    function intArrayFromString(stringy, dontAddNull, length) {
      var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
      var u8array = new Array(len);
      var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
      if (dontAddNull) u8array.length = numBytesWritten;
      return u8array;
    }
    __name(intArrayFromString, "intArrayFromString");
    var FS_stdin_getChar = /* @__PURE__ */ __name(() => {
      if (!FS_stdin_getChar_buffer.length) {
        var result = null;
        {
        }
        if (!result) {
          return null;
        }
        FS_stdin_getChar_buffer = intArrayFromString(result, true);
      }
      return FS_stdin_getChar_buffer.shift();
    }, "FS_stdin_getChar");
    var TTY = { ttys: [], init() {
    }, shutdown() {
    }, register(dev, ops) {
      TTY.ttys[dev] = { input: [], output: [], ops };
      FS.registerDevice(dev, TTY.stream_ops);
    }, stream_ops: { open(stream) {
      var tty = TTY.ttys[stream.node.rdev];
      if (!tty) {
        throw new FS.ErrnoError(43);
      }
      stream.tty = tty;
      stream.seekable = false;
    }, close(stream) {
      stream.tty.ops.fsync(stream.tty);
    }, fsync(stream) {
      stream.tty.ops.fsync(stream.tty);
    }, read(stream, buffer, offset, length, pos) {
      if (!stream.tty || !stream.tty.ops.get_char) {
        throw new FS.ErrnoError(60);
      }
      var bytesRead = 0;
      for (var i = 0; i < length; i++) {
        var result;
        try {
          result = stream.tty.ops.get_char(stream.tty);
        } catch (e) {
          throw new FS.ErrnoError(29);
        }
        if (result === void 0 && bytesRead === 0) {
          throw new FS.ErrnoError(6);
        }
        if (result === null || result === void 0) break;
        bytesRead++;
        buffer[offset + i] = result;
      }
      if (bytesRead) {
        stream.node.timestamp = Date.now();
      }
      return bytesRead;
    }, write(stream, buffer, offset, length, pos) {
      if (!stream.tty || !stream.tty.ops.put_char) {
        throw new FS.ErrnoError(60);
      }
      try {
        for (var i = 0; i < length; i++) {
          stream.tty.ops.put_char(stream.tty, buffer[offset + i]);
        }
      } catch (e) {
        throw new FS.ErrnoError(29);
      }
      if (length) {
        stream.node.timestamp = Date.now();
      }
      return i;
    } }, default_tty_ops: { get_char(tty) {
      return FS_stdin_getChar();
    }, put_char(tty, val) {
      if (val === null || val === 10) {
        out(UTF8ArrayToString(tty.output, 0));
        tty.output = [];
      } else {
        if (val != 0) tty.output.push(val);
      }
    }, fsync(tty) {
      if (tty.output && tty.output.length > 0) {
        out(UTF8ArrayToString(tty.output, 0));
        tty.output = [];
      }
    }, ioctl_tcgets(tty) {
      return { c_iflag: 25856, c_oflag: 5, c_cflag: 191, c_lflag: 35387, c_cc: [3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] };
    }, ioctl_tcsets(tty, optional_actions, data) {
      return 0;
    }, ioctl_tiocgwinsz(tty) {
      return [24, 80];
    } }, default_tty1_ops: { put_char(tty, val) {
      if (val === null || val === 10) {
        err(UTF8ArrayToString(tty.output, 0));
        tty.output = [];
      } else {
        if (val != 0) tty.output.push(val);
      }
    }, fsync(tty) {
      if (tty.output && tty.output.length > 0) {
        err(UTF8ArrayToString(tty.output, 0));
        tty.output = [];
      }
    } } };
    var zeroMemory = /* @__PURE__ */ __name((address, size) => {
      HEAPU8.fill(0, address, address + size);
      return address;
    }, "zeroMemory");
    var alignMemory = /* @__PURE__ */ __name((size, alignment) => Math.ceil(size / alignment) * alignment, "alignMemory");
    var mmapAlloc = /* @__PURE__ */ __name((size) => {
      size = alignMemory(size, 65536);
      var ptr = _emscripten_builtin_memalign(65536, size);
      if (!ptr) return 0;
      return zeroMemory(ptr, size);
    }, "mmapAlloc");
    var MEMFS = { ops_table: null, mount(mount) {
      return MEMFS.createNode(null, "/", 16384 | 511, 0);
    }, createNode(parent, name, mode, dev) {
      if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
        throw new FS.ErrnoError(63);
      }
      MEMFS.ops_table ||= { dir: { node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr, lookup: MEMFS.node_ops.lookup, mknod: MEMFS.node_ops.mknod, rename: MEMFS.node_ops.rename, unlink: MEMFS.node_ops.unlink, rmdir: MEMFS.node_ops.rmdir, readdir: MEMFS.node_ops.readdir, symlink: MEMFS.node_ops.symlink }, stream: { llseek: MEMFS.stream_ops.llseek } }, file: { node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr }, stream: { llseek: MEMFS.stream_ops.llseek, read: MEMFS.stream_ops.read, write: MEMFS.stream_ops.write, allocate: MEMFS.stream_ops.allocate, mmap: MEMFS.stream_ops.mmap, msync: MEMFS.stream_ops.msync } }, link: { node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr, readlink: MEMFS.node_ops.readlink }, stream: {} }, chrdev: { node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr }, stream: FS.chrdev_stream_ops } };
      var node = FS.createNode(parent, name, mode, dev);
      if (FS.isDir(node.mode)) {
        node.node_ops = MEMFS.ops_table.dir.node;
        node.stream_ops = MEMFS.ops_table.dir.stream;
        node.contents = {};
      } else if (FS.isFile(node.mode)) {
        node.node_ops = MEMFS.ops_table.file.node;
        node.stream_ops = MEMFS.ops_table.file.stream;
        node.usedBytes = 0;
        node.contents = null;
      } else if (FS.isLink(node.mode)) {
        node.node_ops = MEMFS.ops_table.link.node;
        node.stream_ops = MEMFS.ops_table.link.stream;
      } else if (FS.isChrdev(node.mode)) {
        node.node_ops = MEMFS.ops_table.chrdev.node;
        node.stream_ops = MEMFS.ops_table.chrdev.stream;
      }
      node.timestamp = Date.now();
      if (parent) {
        parent.contents[name] = node;
        parent.timestamp = node.timestamp;
      }
      return node;
    }, getFileDataAsTypedArray(node) {
      if (!node.contents) return new Uint8Array(0);
      if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes);
      return new Uint8Array(node.contents);
    }, expandFileStorage(node, newCapacity) {
      var prevCapacity = node.contents ? node.contents.length : 0;
      if (prevCapacity >= newCapacity) return;
      var CAPACITY_DOUBLING_MAX = 1024 * 1024;
      newCapacity = Math.max(newCapacity, prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125) >>> 0);
      if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256);
      var oldContents = node.contents;
      node.contents = new Uint8Array(newCapacity);
      if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0);
    }, resizeFileStorage(node, newSize) {
      if (node.usedBytes == newSize) return;
      if (newSize == 0) {
        node.contents = null;
        node.usedBytes = 0;
      } else {
        var oldContents = node.contents;
        node.contents = new Uint8Array(newSize);
        if (oldContents) {
          node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes)));
        }
        node.usedBytes = newSize;
      }
    }, node_ops: { getattr(node) {
      var attr = {};
      attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
      attr.ino = node.id;
      attr.mode = node.mode;
      attr.nlink = 1;
      attr.uid = 0;
      attr.gid = 0;
      attr.rdev = node.rdev;
      if (FS.isDir(node.mode)) {
        attr.size = 4096;
      } else if (FS.isFile(node.mode)) {
        attr.size = node.usedBytes;
      } else if (FS.isLink(node.mode)) {
        attr.size = node.link.length;
      } else {
        attr.size = 0;
      }
      attr.atime = new Date(node.timestamp);
      attr.mtime = new Date(node.timestamp);
      attr.ctime = new Date(node.timestamp);
      attr.blksize = 4096;
      attr.blocks = Math.ceil(attr.size / attr.blksize);
      return attr;
    }, setattr(node, attr) {
      if (attr.mode !== void 0) {
        node.mode = attr.mode;
      }
      if (attr.timestamp !== void 0) {
        node.timestamp = attr.timestamp;
      }
      if (attr.size !== void 0) {
        MEMFS.resizeFileStorage(node, attr.size);
      }
    }, lookup(parent, name) {
      throw FS.genericErrors[44];
    }, mknod(parent, name, mode, dev) {
      return MEMFS.createNode(parent, name, mode, dev);
    }, rename(old_node, new_dir, new_name) {
      if (FS.isDir(old_node.mode)) {
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
        }
        if (new_node) {
          for (var i in new_node.contents) {
            throw new FS.ErrnoError(55);
          }
        }
      }
      delete old_node.parent.contents[old_node.name];
      old_node.parent.timestamp = Date.now();
      old_node.name = new_name;
      new_dir.contents[new_name] = old_node;
      new_dir.timestamp = old_node.parent.timestamp;
    }, unlink(parent, name) {
      delete parent.contents[name];
      parent.timestamp = Date.now();
    }, rmdir(parent, name) {
      var node = FS.lookupNode(parent, name);
      for (var i in node.contents) {
        throw new FS.ErrnoError(55);
      }
      delete parent.contents[name];
      parent.timestamp = Date.now();
    }, readdir(node) {
      var entries = [".", ".."];
      for (var key of Object.keys(node.contents)) {
        entries.push(key);
      }
      return entries;
    }, symlink(parent, newname, oldpath) {
      var node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
      node.link = oldpath;
      return node;
    }, readlink(node) {
      if (!FS.isLink(node.mode)) {
        throw new FS.ErrnoError(28);
      }
      return node.link;
    } }, stream_ops: { read(stream, buffer, offset, length, position) {
      var contents = stream.node.contents;
      if (position >= stream.node.usedBytes) return 0;
      var size = Math.min(stream.node.usedBytes - position, length);
      if (size > 8 && contents.subarray) {
        buffer.set(contents.subarray(position, position + size), offset);
      } else {
        for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i];
      }
      return size;
    }, write(stream, buffer, offset, length, position, canOwn) {
      if (buffer.buffer === HEAP8.buffer) {
        canOwn = false;
      }
      if (!length) return 0;
      var node = stream.node;
      node.timestamp = Date.now();
      if (buffer.subarray && (!node.contents || node.contents.subarray)) {
        if (canOwn) {
          node.contents = buffer.subarray(offset, offset + length);
          node.usedBytes = length;
          return length;
        } else if (node.usedBytes === 0 && position === 0) {
          node.contents = buffer.slice(offset, offset + length);
          node.usedBytes = length;
          return length;
        } else if (position + length <= node.usedBytes) {
          node.contents.set(buffer.subarray(offset, offset + length), position);
          return length;
        }
      }
      MEMFS.expandFileStorage(node, position + length);
      if (node.contents.subarray && buffer.subarray) {
        node.contents.set(buffer.subarray(offset, offset + length), position);
      } else {
        for (var i = 0; i < length; i++) {
          node.contents[position + i] = buffer[offset + i];
        }
      }
      node.usedBytes = Math.max(node.usedBytes, position + length);
      return length;
    }, llseek(stream, offset, whence) {
      var position = offset;
      if (whence === 1) {
        position += stream.position;
      } else if (whence === 2) {
        if (FS.isFile(stream.node.mode)) {
          position += stream.node.usedBytes;
        }
      }
      if (position < 0) {
        throw new FS.ErrnoError(28);
      }
      return position;
    }, allocate(stream, offset, length) {
      MEMFS.expandFileStorage(stream.node, offset + length);
      stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
    }, mmap(stream, length, position, prot, flags) {
      if (!FS.isFile(stream.node.mode)) {
        throw new FS.ErrnoError(43);
      }
      var ptr;
      var allocated;
      var contents = stream.node.contents;
      if (!(flags & 2) && contents && contents.buffer === HEAP8.buffer) {
        allocated = false;
        ptr = contents.byteOffset;
      } else {
        allocated = true;
        ptr = mmapAlloc(length);
        if (!ptr) {
          throw new FS.ErrnoError(48);
        }
        if (contents) {
          if (position > 0 || position + length < contents.length) {
            if (contents.subarray) {
              contents = contents.subarray(position, position + length);
            } else {
              contents = Array.prototype.slice.call(contents, position, position + length);
            }
          }
          HEAP8.set(contents, ptr);
        }
      }
      return { ptr, allocated };
    }, msync(stream, buffer, offset, length, mmapFlags) {
      MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
      return 0;
    } } };
    var asyncLoad = /* @__PURE__ */ __name((url, onload, onerror, noRunDep) => {
      var dep = !noRunDep ? getUniqueRunDependency(`al ${url}`) : "";
      readAsync(url).then((arrayBuffer) => {
        onload(new Uint8Array(arrayBuffer));
        if (dep) removeRunDependency(dep);
      }, (err2) => {
        if (onerror) {
          onerror();
        } else {
          throw `Loading data file "${url}" failed.`;
        }
      });
      if (dep) addRunDependency(dep);
    }, "asyncLoad");
    var FS_createDataFile = /* @__PURE__ */ __name((parent, name, fileData, canRead, canWrite, canOwn) => {
      FS.createDataFile(parent, name, fileData, canRead, canWrite, canOwn);
    }, "FS_createDataFile");
    var preloadPlugins = Module2["preloadPlugins"] || [];
    var FS_handledByPreloadPlugin = /* @__PURE__ */ __name((byteArray, fullname, finish, onerror) => {
      if (typeof Browser != "undefined") Browser.init();
      var handled = false;
      preloadPlugins.forEach((plugin) => {
        if (handled) return;
        if (plugin["canHandle"](fullname)) {
          plugin["handle"](byteArray, fullname, finish, onerror);
          handled = true;
        }
      });
      return handled;
    }, "FS_handledByPreloadPlugin");
    var FS_createPreloadedFile = /* @__PURE__ */ __name((parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) => {
      var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
      var dep = getUniqueRunDependency(`cp ${fullname}`);
      function processData(byteArray) {
        function finish(byteArray2) {
          preFinish?.();
          if (!dontCreateFile) {
            FS_createDataFile(parent, name, byteArray2, canRead, canWrite, canOwn);
          }
          onload?.();
          removeRunDependency(dep);
        }
        __name(finish, "finish");
        if (FS_handledByPreloadPlugin(byteArray, fullname, finish, () => {
          onerror?.();
          removeRunDependency(dep);
        })) {
          return;
        }
        finish(byteArray);
      }
      __name(processData, "processData");
      addRunDependency(dep);
      if (typeof url == "string") {
        asyncLoad(url, processData, onerror);
      } else {
        processData(url);
      }
    }, "FS_createPreloadedFile");
    var FS_modeStringToFlags = /* @__PURE__ */ __name((str) => {
      var flagModes = { r: 0, "r+": 2, w: 512 | 64 | 1, "w+": 512 | 64 | 2, a: 1024 | 64 | 1, "a+": 1024 | 64 | 2 };
      var flags = flagModes[str];
      if (typeof flags == "undefined") {
        throw new Error(`Unknown file open mode: ${str}`);
      }
      return flags;
    }, "FS_modeStringToFlags");
    var FS_getMode = /* @__PURE__ */ __name((canRead, canWrite) => {
      var mode = 0;
      if (canRead) mode |= 292 | 73;
      if (canWrite) mode |= 146;
      return mode;
    }, "FS_getMode");
    var FS = { root: null, mounts: [], devices: {}, streams: [], nextInode: 1, nameTable: null, currentPath: "/", initialized: false, ignorePermissions: true, ErrnoError: class {
      static {
        __name(this, "ErrnoError");
      }
      constructor(errno) {
        this.name = "ErrnoError";
        this.errno = errno;
      }
    }, genericErrors: {}, filesystems: null, syncFSRequests: 0, FSStream: class {
      static {
        __name(this, "FSStream");
      }
      constructor() {
        this.shared = {};
      }
      get object() {
        return this.node;
      }
      set object(val) {
        this.node = val;
      }
      get isRead() {
        return (this.flags & 2097155) !== 1;
      }
      get isWrite() {
        return (this.flags & 2097155) !== 0;
      }
      get isAppend() {
        return this.flags & 1024;
      }
      get flags() {
        return this.shared.flags;
      }
      set flags(val) {
        this.shared.flags = val;
      }
      get position() {
        return this.shared.position;
      }
      set position(val) {
        this.shared.position = val;
      }
    }, FSNode: class {
      static {
        __name(this, "FSNode");
      }
      constructor(parent, name, mode, rdev) {
        if (!parent) {
          parent = this;
        }
        this.parent = parent;
        this.mount = parent.mount;
        this.mounted = null;
        this.id = FS.nextInode++;
        this.name = name;
        this.mode = mode;
        this.node_ops = {};
        this.stream_ops = {};
        this.rdev = rdev;
        this.readMode = 292 | 73;
        this.writeMode = 146;
      }
      get read() {
        return (this.mode & this.readMode) === this.readMode;
      }
      set read(val) {
        val ? this.mode |= this.readMode : this.mode &= ~this.readMode;
      }
      get write() {
        return (this.mode & this.writeMode) === this.writeMode;
      }
      set write(val) {
        val ? this.mode |= this.writeMode : this.mode &= ~this.writeMode;
      }
      get isFolder() {
        return FS.isDir(this.mode);
      }
      get isDevice() {
        return FS.isChrdev(this.mode);
      }
    }, lookupPath(path, opts = {}) {
      path = PATH_FS.resolve(path);
      if (!path) return { path: "", node: null };
      var defaults = { follow_mount: true, recurse_count: 0 };
      opts = Object.assign(defaults, opts);
      if (opts.recurse_count > 8) {
        throw new FS.ErrnoError(32);
      }
      var parts = path.split("/").filter((p) => !!p);
      var current = FS.root;
      var current_path = "/";
      for (var i = 0; i < parts.length; i++) {
        var islast = i === parts.length - 1;
        if (islast && opts.parent) {
          break;
        }
        current = FS.lookupNode(current, parts[i]);
        current_path = PATH.join2(current_path, parts[i]);
        if (FS.isMountpoint(current)) {
          if (!islast || islast && opts.follow_mount) {
            current = current.mounted.root;
          }
        }
        if (!islast || opts.follow) {
          var count = 0;
          while (FS.isLink(current.mode)) {
            var link = FS.readlink(current_path);
            current_path = PATH_FS.resolve(PATH.dirname(current_path), link);
            var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count + 1 });
            current = lookup.node;
            if (count++ > 40) {
              throw new FS.ErrnoError(32);
            }
          }
        }
      }
      return { path: current_path, node: current };
    }, getPath(node) {
      var path;
      while (true) {
        if (FS.isRoot(node)) {
          var mount = node.mount.mountpoint;
          if (!path) return mount;
          return mount[mount.length - 1] !== "/" ? `${mount}/${path}` : mount + path;
        }
        path = path ? `${node.name}/${path}` : node.name;
        node = node.parent;
      }
    }, hashName(parentid, name) {
      var hash = 0;
      for (var i = 0; i < name.length; i++) {
        hash = (hash << 5) - hash + name.charCodeAt(i) | 0;
      }
      return (parentid + hash >>> 0) % FS.nameTable.length;
    }, hashAddNode(node) {
      var hash = FS.hashName(node.parent.id, node.name);
      node.name_next = FS.nameTable[hash];
      FS.nameTable[hash] = node;
    }, hashRemoveNode(node) {
      var hash = FS.hashName(node.parent.id, node.name);
      if (FS.nameTable[hash] === node) {
        FS.nameTable[hash] = node.name_next;
      } else {
        var current = FS.nameTable[hash];
        while (current) {
          if (current.name_next === node) {
            current.name_next = node.name_next;
            break;
          }
          current = current.name_next;
        }
      }
    }, lookupNode(parent, name) {
      var errCode = FS.mayLookup(parent);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      var hash = FS.hashName(parent.id, name);
      for (var node = FS.nameTable[hash]; node; node = node.name_next) {
        var nodeName = node.name;
        if (node.parent.id === parent.id && nodeName === name) {
          return node;
        }
      }
      return FS.lookup(parent, name);
    }, createNode(parent, name, mode, rdev) {
      var node = new FS.FSNode(parent, name, mode, rdev);
      FS.hashAddNode(node);
      return node;
    }, destroyNode(node) {
      FS.hashRemoveNode(node);
    }, isRoot(node) {
      return node === node.parent;
    }, isMountpoint(node) {
      return !!node.mounted;
    }, isFile(mode) {
      return (mode & 61440) === 32768;
    }, isDir(mode) {
      return (mode & 61440) === 16384;
    }, isLink(mode) {
      return (mode & 61440) === 40960;
    }, isChrdev(mode) {
      return (mode & 61440) === 8192;
    }, isBlkdev(mode) {
      return (mode & 61440) === 24576;
    }, isFIFO(mode) {
      return (mode & 61440) === 4096;
    }, isSocket(mode) {
      return (mode & 49152) === 49152;
    }, flagsToPermissionString(flag) {
      var perms = ["r", "w", "rw"][flag & 3];
      if (flag & 512) {
        perms += "w";
      }
      return perms;
    }, nodePermissions(node, perms) {
      if (FS.ignorePermissions) {
        return 0;
      }
      if (perms.includes("r") && !(node.mode & 292)) {
        return 2;
      } else if (perms.includes("w") && !(node.mode & 146)) {
        return 2;
      } else if (perms.includes("x") && !(node.mode & 73)) {
        return 2;
      }
      return 0;
    }, mayLookup(dir) {
      if (!FS.isDir(dir.mode)) return 54;
      var errCode = FS.nodePermissions(dir, "x");
      if (errCode) return errCode;
      if (!dir.node_ops.lookup) return 2;
      return 0;
    }, mayCreate(dir, name) {
      try {
        var node = FS.lookupNode(dir, name);
        return 20;
      } catch (e) {
      }
      return FS.nodePermissions(dir, "wx");
    }, mayDelete(dir, name, isdir) {
      var node;
      try {
        node = FS.lookupNode(dir, name);
      } catch (e) {
        return e.errno;
      }
      var errCode = FS.nodePermissions(dir, "wx");
      if (errCode) {
        return errCode;
      }
      if (isdir) {
        if (!FS.isDir(node.mode)) {
          return 54;
        }
        if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
          return 10;
        }
      } else {
        if (FS.isDir(node.mode)) {
          return 31;
        }
      }
      return 0;
    }, mayOpen(node, flags) {
      if (!node) {
        return 44;
      }
      if (FS.isLink(node.mode)) {
        return 32;
      } else if (FS.isDir(node.mode)) {
        if (FS.flagsToPermissionString(flags) !== "r" || flags & 512) {
          return 31;
        }
      }
      return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
    }, MAX_OPEN_FDS: 4096, nextfd() {
      for (var fd = 0; fd <= FS.MAX_OPEN_FDS; fd++) {
        if (!FS.streams[fd]) {
          return fd;
        }
      }
      throw new FS.ErrnoError(33);
    }, getStreamChecked(fd) {
      var stream = FS.getStream(fd);
      if (!stream) {
        throw new FS.ErrnoError(8);
      }
      return stream;
    }, getStream: /* @__PURE__ */ __name((fd) => FS.streams[fd], "getStream"), createStream(stream, fd = -1) {
      stream = Object.assign(new FS.FSStream(), stream);
      if (fd == -1) {
        fd = FS.nextfd();
      }
      stream.fd = fd;
      FS.streams[fd] = stream;
      return stream;
    }, closeStream(fd) {
      FS.streams[fd] = null;
    }, dupStream(origStream, fd = -1) {
      var stream = FS.createStream(origStream, fd);
      stream.stream_ops?.dup?.(stream);
      return stream;
    }, chrdev_stream_ops: { open(stream) {
      var device = FS.getDevice(stream.node.rdev);
      stream.stream_ops = device.stream_ops;
      stream.stream_ops.open?.(stream);
    }, llseek() {
      throw new FS.ErrnoError(70);
    } }, major: /* @__PURE__ */ __name((dev) => dev >> 8, "major"), minor: /* @__PURE__ */ __name((dev) => dev & 255, "minor"), makedev: /* @__PURE__ */ __name((ma, mi) => ma << 8 | mi, "makedev"), registerDevice(dev, ops) {
      FS.devices[dev] = { stream_ops: ops };
    }, getDevice: /* @__PURE__ */ __name((dev) => FS.devices[dev], "getDevice"), getMounts(mount) {
      var mounts = [];
      var check = [mount];
      while (check.length) {
        var m = check.pop();
        mounts.push(m);
        check.push(...m.mounts);
      }
      return mounts;
    }, syncfs(populate, callback) {
      if (typeof populate == "function") {
        callback = populate;
        populate = false;
      }
      FS.syncFSRequests++;
      if (FS.syncFSRequests > 1) {
        err(`warning: ${FS.syncFSRequests} FS.syncfs operations in flight at once, probably just doing extra work`);
      }
      var mounts = FS.getMounts(FS.root.mount);
      var completed = 0;
      function doCallback(errCode) {
        FS.syncFSRequests--;
        return callback(errCode);
      }
      __name(doCallback, "doCallback");
      function done(errCode) {
        if (errCode) {
          if (!done.errored) {
            done.errored = true;
            return doCallback(errCode);
          }
          return;
        }
        if (++completed >= mounts.length) {
          doCallback(null);
        }
      }
      __name(done, "done");
      mounts.forEach((mount) => {
        if (!mount.type.syncfs) {
          return done(null);
        }
        mount.type.syncfs(mount, populate, done);
      });
    }, mount(type, opts, mountpoint) {
      var root = mountpoint === "/";
      var pseudo = !mountpoint;
      var node;
      if (root && FS.root) {
        throw new FS.ErrnoError(10);
      } else if (!root && !pseudo) {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
        mountpoint = lookup.path;
        node = lookup.node;
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(10);
        }
        if (!FS.isDir(node.mode)) {
          throw new FS.ErrnoError(54);
        }
      }
      var mount = { type, opts, mountpoint, mounts: [] };
      var mountRoot = type.mount(mount);
      mountRoot.mount = mount;
      mount.root = mountRoot;
      if (root) {
        FS.root = mountRoot;
      } else if (node) {
        node.mounted = mount;
        if (node.mount) {
          node.mount.mounts.push(mount);
        }
      }
      return mountRoot;
    }, unmount(mountpoint) {
      var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
      if (!FS.isMountpoint(lookup.node)) {
        throw new FS.ErrnoError(28);
      }
      var node = lookup.node;
      var mount = node.mounted;
      var mounts = FS.getMounts(mount);
      Object.keys(FS.nameTable).forEach((hash) => {
        var current = FS.nameTable[hash];
        while (current) {
          var next = current.name_next;
          if (mounts.includes(current.mount)) {
            FS.destroyNode(current);
          }
          current = next;
        }
      });
      node.mounted = null;
      var idx = node.mount.mounts.indexOf(mount);
      node.mount.mounts.splice(idx, 1);
    }, lookup(parent, name) {
      return parent.node_ops.lookup(parent, name);
    }, mknod(path, mode, dev) {
      var lookup = FS.lookupPath(path, { parent: true });
      var parent = lookup.node;
      var name = PATH.basename(path);
      if (!name || name === "." || name === "..") {
        throw new FS.ErrnoError(28);
      }
      var errCode = FS.mayCreate(parent, name);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      if (!parent.node_ops.mknod) {
        throw new FS.ErrnoError(63);
      }
      return parent.node_ops.mknod(parent, name, mode, dev);
    }, create(path, mode) {
      mode = mode !== void 0 ? mode : 438;
      mode &= 4095;
      mode |= 32768;
      return FS.mknod(path, mode, 0);
    }, mkdir(path, mode) {
      mode = mode !== void 0 ? mode : 511;
      mode &= 511 | 512;
      mode |= 16384;
      return FS.mknod(path, mode, 0);
    }, mkdirTree(path, mode) {
      var dirs = path.split("/");
      var d = "";
      for (var i = 0; i < dirs.length; ++i) {
        if (!dirs[i]) continue;
        d += "/" + dirs[i];
        try {
          FS.mkdir(d, mode);
        } catch (e) {
          if (e.errno != 20) throw e;
        }
      }
    }, mkdev(path, mode, dev) {
      if (typeof dev == "undefined") {
        dev = mode;
        mode = 438;
      }
      mode |= 8192;
      return FS.mknod(path, mode, dev);
    }, symlink(oldpath, newpath) {
      if (!PATH_FS.resolve(oldpath)) {
        throw new FS.ErrnoError(44);
      }
      var lookup = FS.lookupPath(newpath, { parent: true });
      var parent = lookup.node;
      if (!parent) {
        throw new FS.ErrnoError(44);
      }
      var newname = PATH.basename(newpath);
      var errCode = FS.mayCreate(parent, newname);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      if (!parent.node_ops.symlink) {
        throw new FS.ErrnoError(63);
      }
      return parent.node_ops.symlink(parent, newname, oldpath);
    }, rename(old_path, new_path) {
      var old_dirname = PATH.dirname(old_path);
      var new_dirname = PATH.dirname(new_path);
      var old_name = PATH.basename(old_path);
      var new_name = PATH.basename(new_path);
      var lookup, old_dir, new_dir;
      lookup = FS.lookupPath(old_path, { parent: true });
      old_dir = lookup.node;
      lookup = FS.lookupPath(new_path, { parent: true });
      new_dir = lookup.node;
      if (!old_dir || !new_dir) throw new FS.ErrnoError(44);
      if (old_dir.mount !== new_dir.mount) {
        throw new FS.ErrnoError(75);
      }
      var old_node = FS.lookupNode(old_dir, old_name);
      var relative = PATH_FS.relative(old_path, new_dirname);
      if (relative.charAt(0) !== ".") {
        throw new FS.ErrnoError(28);
      }
      relative = PATH_FS.relative(new_path, old_dirname);
      if (relative.charAt(0) !== ".") {
        throw new FS.ErrnoError(55);
      }
      var new_node;
      try {
        new_node = FS.lookupNode(new_dir, new_name);
      } catch (e) {
      }
      if (old_node === new_node) {
        return;
      }
      var isdir = FS.isDir(old_node.mode);
      var errCode = FS.mayDelete(old_dir, old_name, isdir);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      errCode = new_node ? FS.mayDelete(new_dir, new_name, isdir) : FS.mayCreate(new_dir, new_name);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      if (!old_dir.node_ops.rename) {
        throw new FS.ErrnoError(63);
      }
      if (FS.isMountpoint(old_node) || new_node && FS.isMountpoint(new_node)) {
        throw new FS.ErrnoError(10);
      }
      if (new_dir !== old_dir) {
        errCode = FS.nodePermissions(old_dir, "w");
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
      }
      FS.hashRemoveNode(old_node);
      try {
        old_dir.node_ops.rename(old_node, new_dir, new_name);
        old_node.parent = new_dir;
      } catch (e) {
        throw e;
      } finally {
        FS.hashAddNode(old_node);
      }
    }, rmdir(path) {
      var lookup = FS.lookupPath(path, { parent: true });
      var parent = lookup.node;
      var name = PATH.basename(path);
      var node = FS.lookupNode(parent, name);
      var errCode = FS.mayDelete(parent, name, true);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      if (!parent.node_ops.rmdir) {
        throw new FS.ErrnoError(63);
      }
      if (FS.isMountpoint(node)) {
        throw new FS.ErrnoError(10);
      }
      parent.node_ops.rmdir(parent, name);
      FS.destroyNode(node);
    }, readdir(path) {
      var lookup = FS.lookupPath(path, { follow: true });
      var node = lookup.node;
      if (!node.node_ops.readdir) {
        throw new FS.ErrnoError(54);
      }
      return node.node_ops.readdir(node);
    }, unlink(path) {
      var lookup = FS.lookupPath(path, { parent: true });
      var parent = lookup.node;
      if (!parent) {
        throw new FS.ErrnoError(44);
      }
      var name = PATH.basename(path);
      var node = FS.lookupNode(parent, name);
      var errCode = FS.mayDelete(parent, name, false);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      if (!parent.node_ops.unlink) {
        throw new FS.ErrnoError(63);
      }
      if (FS.isMountpoint(node)) {
        throw new FS.ErrnoError(10);
      }
      parent.node_ops.unlink(parent, name);
      FS.destroyNode(node);
    }, readlink(path) {
      var lookup = FS.lookupPath(path);
      var link = lookup.node;
      if (!link) {
        throw new FS.ErrnoError(44);
      }
      if (!link.node_ops.readlink) {
        throw new FS.ErrnoError(28);
      }
      return PATH_FS.resolve(FS.getPath(link.parent), link.node_ops.readlink(link));
    }, stat(path, dontFollow) {
      var lookup = FS.lookupPath(path, { follow: !dontFollow });
      var node = lookup.node;
      if (!node) {
        throw new FS.ErrnoError(44);
      }
      if (!node.node_ops.getattr) {
        throw new FS.ErrnoError(63);
      }
      return node.node_ops.getattr(node);
    }, lstat(path) {
      return FS.stat(path, true);
    }, chmod(path, mode, dontFollow) {
      var node;
      if (typeof path == "string") {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        node = lookup.node;
      } else {
        node = path;
      }
      if (!node.node_ops.setattr) {
        throw new FS.ErrnoError(63);
      }
      node.node_ops.setattr(node, { mode: mode & 4095 | node.mode & ~4095, timestamp: Date.now() });
    }, lchmod(path, mode) {
      FS.chmod(path, mode, true);
    }, fchmod(fd, mode) {
      var stream = FS.getStreamChecked(fd);
      FS.chmod(stream.node, mode);
    }, chown(path, uid, gid, dontFollow) {
      var node;
      if (typeof path == "string") {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        node = lookup.node;
      } else {
        node = path;
      }
      if (!node.node_ops.setattr) {
        throw new FS.ErrnoError(63);
      }
      node.node_ops.setattr(node, { timestamp: Date.now() });
    }, lchown(path, uid, gid) {
      FS.chown(path, uid, gid, true);
    }, fchown(fd, uid, gid) {
      var stream = FS.getStreamChecked(fd);
      FS.chown(stream.node, uid, gid);
    }, truncate(path, len) {
      if (len < 0) {
        throw new FS.ErrnoError(28);
      }
      var node;
      if (typeof path == "string") {
        var lookup = FS.lookupPath(path, { follow: true });
        node = lookup.node;
      } else {
        node = path;
      }
      if (!node.node_ops.setattr) {
        throw new FS.ErrnoError(63);
      }
      if (FS.isDir(node.mode)) {
        throw new FS.ErrnoError(31);
      }
      if (!FS.isFile(node.mode)) {
        throw new FS.ErrnoError(28);
      }
      var errCode = FS.nodePermissions(node, "w");
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      node.node_ops.setattr(node, { size: len, timestamp: Date.now() });
    }, ftruncate(fd, len) {
      var stream = FS.getStreamChecked(fd);
      if ((stream.flags & 2097155) === 0) {
        throw new FS.ErrnoError(28);
      }
      FS.truncate(stream.node, len);
    }, utime(path, atime, mtime) {
      var lookup = FS.lookupPath(path, { follow: true });
      var node = lookup.node;
      node.node_ops.setattr(node, { timestamp: Math.max(atime, mtime) });
    }, open(path, flags, mode) {
      if (path === "") {
        throw new FS.ErrnoError(44);
      }
      flags = typeof flags == "string" ? FS_modeStringToFlags(flags) : flags;
      if (flags & 64) {
        mode = typeof mode == "undefined" ? 438 : mode;
        mode = mode & 4095 | 32768;
      } else {
        mode = 0;
      }
      var node;
      if (typeof path == "object") {
        node = path;
      } else {
        path = PATH.normalize(path);
        try {
          var lookup = FS.lookupPath(path, { follow: !(flags & 131072) });
          node = lookup.node;
        } catch (e) {
        }
      }
      var created = false;
      if (flags & 64) {
        if (node) {
          if (flags & 128) {
            throw new FS.ErrnoError(20);
          }
        } else {
          node = FS.mknod(path, mode, 0);
          created = true;
        }
      }
      if (!node) {
        throw new FS.ErrnoError(44);
      }
      if (FS.isChrdev(node.mode)) {
        flags &= ~512;
      }
      if (flags & 65536 && !FS.isDir(node.mode)) {
        throw new FS.ErrnoError(54);
      }
      if (!created) {
        var errCode = FS.mayOpen(node, flags);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
      }
      if (flags & 512 && !created) {
        FS.truncate(node, 0);
      }
      flags &= ~(128 | 512 | 131072);
      var stream = FS.createStream({ node, path: FS.getPath(node), flags, seekable: true, position: 0, stream_ops: node.stream_ops, ungotten: [], error: false });
      if (stream.stream_ops.open) {
        stream.stream_ops.open(stream);
      }
      if (Module2["logReadFiles"] && !(flags & 1)) {
        if (!FS.readFiles) FS.readFiles = {};
        if (!(path in FS.readFiles)) {
          FS.readFiles[path] = 1;
        }
      }
      return stream;
    }, close(stream) {
      if (FS.isClosed(stream)) {
        throw new FS.ErrnoError(8);
      }
      if (stream.getdents) stream.getdents = null;
      try {
        if (stream.stream_ops.close) {
          stream.stream_ops.close(stream);
        }
      } catch (e) {
        throw e;
      } finally {
        FS.closeStream(stream.fd);
      }
      stream.fd = null;
    }, isClosed(stream) {
      return stream.fd === null;
    }, llseek(stream, offset, whence) {
      if (FS.isClosed(stream)) {
        throw new FS.ErrnoError(8);
      }
      if (!stream.seekable || !stream.stream_ops.llseek) {
        throw new FS.ErrnoError(70);
      }
      if (whence != 0 && whence != 1 && whence != 2) {
        throw new FS.ErrnoError(28);
      }
      stream.position = stream.stream_ops.llseek(stream, offset, whence);
      stream.ungotten = [];
      return stream.position;
    }, read(stream, buffer, offset, length, position) {
      if (length < 0 || position < 0) {
        throw new FS.ErrnoError(28);
      }
      if (FS.isClosed(stream)) {
        throw new FS.ErrnoError(8);
      }
      if ((stream.flags & 2097155) === 1) {
        throw new FS.ErrnoError(8);
      }
      if (FS.isDir(stream.node.mode)) {
        throw new FS.ErrnoError(31);
      }
      if (!stream.stream_ops.read) {
        throw new FS.ErrnoError(28);
      }
      var seeking = typeof position != "undefined";
      if (!seeking) {
        position = stream.position;
      } else if (!stream.seekable) {
        throw new FS.ErrnoError(70);
      }
      var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
      if (!seeking) stream.position += bytesRead;
      return bytesRead;
    }, write(stream, buffer, offset, length, position, canOwn) {
      if (length < 0 || position < 0) {
        throw new FS.ErrnoError(28);
      }
      if (FS.isClosed(stream)) {
        throw new FS.ErrnoError(8);
      }
      if ((stream.flags & 2097155) === 0) {
        throw new FS.ErrnoError(8);
      }
      if (FS.isDir(stream.node.mode)) {
        throw new FS.ErrnoError(31);
      }
      if (!stream.stream_ops.write) {
        throw new FS.ErrnoError(28);
      }
      if (stream.seekable && stream.flags & 1024) {
        FS.llseek(stream, 0, 2);
      }
      var seeking = typeof position != "undefined";
      if (!seeking) {
        position = stream.position;
      } else if (!stream.seekable) {
        throw new FS.ErrnoError(70);
      }
      var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
      if (!seeking) stream.position += bytesWritten;
      return bytesWritten;
    }, allocate(stream, offset, length) {
      if (FS.isClosed(stream)) {
        throw new FS.ErrnoError(8);
      }
      if (offset < 0 || length <= 0) {
        throw new FS.ErrnoError(28);
      }
      if ((stream.flags & 2097155) === 0) {
        throw new FS.ErrnoError(8);
      }
      if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
        throw new FS.ErrnoError(43);
      }
      if (!stream.stream_ops.allocate) {
        throw new FS.ErrnoError(138);
      }
      stream.stream_ops.allocate(stream, offset, length);
    }, mmap(stream, length, position, prot, flags) {
      if ((prot & 2) !== 0 && (flags & 2) === 0 && (stream.flags & 2097155) !== 2) {
        throw new FS.ErrnoError(2);
      }
      if ((stream.flags & 2097155) === 1) {
        throw new FS.ErrnoError(2);
      }
      if (!stream.stream_ops.mmap) {
        throw new FS.ErrnoError(43);
      }
      if (!length) {
        throw new FS.ErrnoError(28);
      }
      return stream.stream_ops.mmap(stream, length, position, prot, flags);
    }, msync(stream, buffer, offset, length, mmapFlags) {
      if (!stream.stream_ops.msync) {
        return 0;
      }
      return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
    }, ioctl(stream, cmd, arg) {
      if (!stream.stream_ops.ioctl) {
        throw new FS.ErrnoError(59);
      }
      return stream.stream_ops.ioctl(stream, cmd, arg);
    }, readFile(path, opts = {}) {
      opts.flags = opts.flags || 0;
      opts.encoding = opts.encoding || "binary";
      if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
        throw new Error(`Invalid encoding type "${opts.encoding}"`);
      }
      var ret;
      var stream = FS.open(path, opts.flags);
      var stat = FS.stat(path);
      var length = stat.size;
      var buf = new Uint8Array(length);
      FS.read(stream, buf, 0, length, 0);
      if (opts.encoding === "utf8") {
        ret = UTF8ArrayToString(buf, 0);
      } else if (opts.encoding === "binary") {
        ret = buf;
      }
      FS.close(stream);
      return ret;
    }, writeFile(path, data, opts = {}) {
      opts.flags = opts.flags || 577;
      var stream = FS.open(path, opts.flags, opts.mode);
      if (typeof data == "string") {
        var buf = new Uint8Array(lengthBytesUTF8(data) + 1);
        var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
        FS.write(stream, buf, 0, actualNumBytes, void 0, opts.canOwn);
      } else if (ArrayBuffer.isView(data)) {
        FS.write(stream, data, 0, data.byteLength, void 0, opts.canOwn);
      } else {
        throw new Error("Unsupported data type");
      }
      FS.close(stream);
    }, cwd: /* @__PURE__ */ __name(() => FS.currentPath, "cwd"), chdir(path) {
      var lookup = FS.lookupPath(path, { follow: true });
      if (lookup.node === null) {
        throw new FS.ErrnoError(44);
      }
      if (!FS.isDir(lookup.node.mode)) {
        throw new FS.ErrnoError(54);
      }
      var errCode = FS.nodePermissions(lookup.node, "x");
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      FS.currentPath = lookup.path;
    }, createDefaultDirectories() {
      FS.mkdir("/tmp");
      FS.mkdir("/home");
      FS.mkdir("/home/web_user");
    }, createDefaultDevices() {
      FS.mkdir("/dev");
      FS.registerDevice(FS.makedev(1, 3), { read: /* @__PURE__ */ __name(() => 0, "read"), write: /* @__PURE__ */ __name((stream, buffer, offset, length, pos) => length, "write") });
      FS.mkdev("/dev/null", FS.makedev(1, 3));
      TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
      TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
      FS.mkdev("/dev/tty", FS.makedev(5, 0));
      FS.mkdev("/dev/tty1", FS.makedev(6, 0));
      var randomBuffer = new Uint8Array(1024), randomLeft = 0;
      var randomByte = /* @__PURE__ */ __name(() => {
        if (randomLeft === 0) {
          randomLeft = randomFill(randomBuffer).byteLength;
        }
        return randomBuffer[--randomLeft];
      }, "randomByte");
      FS.createDevice("/dev", "random", randomByte);
      FS.createDevice("/dev", "urandom", randomByte);
      FS.mkdir("/dev/shm");
      FS.mkdir("/dev/shm/tmp");
    }, createSpecialDirectories() {
      FS.mkdir("/proc");
      var proc_self = FS.mkdir("/proc/self");
      FS.mkdir("/proc/self/fd");
      FS.mount({ mount() {
        var node = FS.createNode(proc_self, "fd", 16384 | 511, 73);
        node.node_ops = { lookup(parent, name) {
          var fd = +name;
          var stream = FS.getStreamChecked(fd);
          var ret = { parent: null, mount: { mountpoint: "fake" }, node_ops: { readlink: /* @__PURE__ */ __name(() => stream.path, "readlink") } };
          ret.parent = ret;
          return ret;
        } };
        return node;
      } }, {}, "/proc/self/fd");
    }, createStandardStreams(input, output, error) {
      if (input) {
        FS.createDevice("/dev", "stdin", input);
      } else {
        FS.symlink("/dev/tty", "/dev/stdin");
      }
      if (output) {
        FS.createDevice("/dev", "stdout", null, output);
      } else {
        FS.symlink("/dev/tty", "/dev/stdout");
      }
      if (error) {
        FS.createDevice("/dev", "stderr", null, error);
      } else {
        FS.symlink("/dev/tty1", "/dev/stderr");
      }
      var stdin = FS.open("/dev/stdin", 0);
      var stdout = FS.open("/dev/stdout", 1);
      var stderr = FS.open("/dev/stderr", 1);
    }, staticInit() {
      [44].forEach((code) => {
        FS.genericErrors[code] = new FS.ErrnoError(code);
        FS.genericErrors[code].stack = "<generic error, no stack>";
      });
      FS.nameTable = new Array(4096);
      FS.mount(MEMFS, {}, "/");
      FS.createDefaultDirectories();
      FS.createDefaultDevices();
      FS.createSpecialDirectories();
      FS.filesystems = { MEMFS };
    }, init(input, output, error) {
      FS.initialized = true;
      input ??= Module2["stdin"];
      output ??= Module2["stdout"];
      error ??= Module2["stderr"];
      FS.createStandardStreams(input, output, error);
    }, quit() {
      FS.initialized = false;
      for (var i = 0; i < FS.streams.length; i++) {
        var stream = FS.streams[i];
        if (!stream) {
          continue;
        }
        FS.close(stream);
      }
    }, findObject(path, dontResolveLastLink) {
      var ret = FS.analyzePath(path, dontResolveLastLink);
      if (!ret.exists) {
        return null;
      }
      return ret.object;
    }, analyzePath(path, dontResolveLastLink) {
      try {
        var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
        path = lookup.path;
      } catch (e) {
      }
      var ret = { isRoot: false, exists: false, error: 0, name: null, path: null, object: null, parentExists: false, parentPath: null, parentObject: null };
      try {
        var lookup = FS.lookupPath(path, { parent: true });
        ret.parentExists = true;
        ret.parentPath = lookup.path;
        ret.parentObject = lookup.node;
        ret.name = PATH.basename(path);
        lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
        ret.exists = true;
        ret.path = lookup.path;
        ret.object = lookup.node;
        ret.name = lookup.node.name;
        ret.isRoot = lookup.path === "/";
      } catch (e) {
        ret.error = e.errno;
      }
      return ret;
    }, createPath(parent, path, canRead, canWrite) {
      parent = typeof parent == "string" ? parent : FS.getPath(parent);
      var parts = path.split("/").reverse();
      while (parts.length) {
        var part = parts.pop();
        if (!part) continue;
        var current = PATH.join2(parent, part);
        try {
          FS.mkdir(current);
        } catch (e) {
        }
        parent = current;
      }
      return current;
    }, createFile(parent, name, properties, canRead, canWrite) {
      var path = PATH.join2(typeof parent == "string" ? parent : FS.getPath(parent), name);
      var mode = FS_getMode(canRead, canWrite);
      return FS.create(path, mode);
    }, createDataFile(parent, name, data, canRead, canWrite, canOwn) {
      var path = name;
      if (parent) {
        parent = typeof parent == "string" ? parent : FS.getPath(parent);
        path = name ? PATH.join2(parent, name) : parent;
      }
      var mode = FS_getMode(canRead, canWrite);
      var node = FS.create(path, mode);
      if (data) {
        if (typeof data == "string") {
          var arr = new Array(data.length);
          for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
          data = arr;
        }
        FS.chmod(node, mode | 146);
        var stream = FS.open(node, 577);
        FS.write(stream, data, 0, data.length, 0, canOwn);
        FS.close(stream);
        FS.chmod(node, mode);
      }
    }, createDevice(parent, name, input, output) {
      var path = PATH.join2(typeof parent == "string" ? parent : FS.getPath(parent), name);
      var mode = FS_getMode(!!input, !!output);
      if (!FS.createDevice.major) FS.createDevice.major = 64;
      var dev = FS.makedev(FS.createDevice.major++, 0);
      FS.registerDevice(dev, { open(stream) {
        stream.seekable = false;
      }, close(stream) {
        if (output?.buffer?.length) {
          output(10);
        }
      }, read(stream, buffer, offset, length, pos) {
        var bytesRead = 0;
        for (var i = 0; i < length; i++) {
          var result;
          try {
            result = input();
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
          if (result === void 0 && bytesRead === 0) {
            throw new FS.ErrnoError(6);
          }
          if (result === null || result === void 0) break;
          bytesRead++;
          buffer[offset + i] = result;
        }
        if (bytesRead) {
          stream.node.timestamp = Date.now();
        }
        return bytesRead;
      }, write(stream, buffer, offset, length, pos) {
        for (var i = 0; i < length; i++) {
          try {
            output(buffer[offset + i]);
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
        }
        if (length) {
          stream.node.timestamp = Date.now();
        }
        return i;
      } });
      return FS.mkdev(path, mode, dev);
    }, forceLoadFile(obj) {
      if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
      if (typeof XMLHttpRequest != "undefined") {
        throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
      } else {
        try {
          obj.contents = readBinary(obj.url);
          obj.usedBytes = obj.contents.length;
        } catch (e) {
          throw new FS.ErrnoError(29);
        }
      }
    }, createLazyFile(parent, name, url, canRead, canWrite) {
      class LazyUint8Array {
        static {
          __name(this, "LazyUint8Array");
        }
        constructor() {
          this.lengthKnown = false;
          this.chunks = [];
        }
        get(idx) {
          if (idx > this.length - 1 || idx < 0) {
            return void 0;
          }
          var chunkOffset = idx % this.chunkSize;
          var chunkNum = idx / this.chunkSize | 0;
          return this.getter(chunkNum)[chunkOffset];
        }
        setDataGetter(getter) {
          this.getter = getter;
        }
        cacheLength() {
          var xhr = new XMLHttpRequest();
          xhr.open("HEAD", url, false);
          xhr.send(null);
          if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
          var datalength = Number(xhr.getResponseHeader("Content-length"));
          var header;
          var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
          var usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip";
          var chunkSize = 1024 * 1024;
          if (!hasByteServing) chunkSize = datalength;
          var doXHR = /* @__PURE__ */ __name((from, to) => {
            if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
            if (to > datalength - 1) throw new Error("only " + datalength + " bytes available! programmer error!");
            var xhr2 = new XMLHttpRequest();
            xhr2.open("GET", url, false);
            if (datalength !== chunkSize) xhr2.setRequestHeader("Range", "bytes=" + from + "-" + to);
            xhr2.responseType = "arraybuffer";
            if (xhr2.overrideMimeType) {
              xhr2.overrideMimeType("text/plain; charset=x-user-defined");
            }
            xhr2.send(null);
            if (!(xhr2.status >= 200 && xhr2.status < 300 || xhr2.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr2.status);
            if (xhr2.response !== void 0) {
              return new Uint8Array(xhr2.response || []);
            }
            return intArrayFromString(xhr2.responseText || "", true);
          }, "doXHR");
          var lazyArray2 = this;
          lazyArray2.setDataGetter((chunkNum) => {
            var start = chunkNum * chunkSize;
            var end = (chunkNum + 1) * chunkSize - 1;
            end = Math.min(end, datalength - 1);
            if (typeof lazyArray2.chunks[chunkNum] == "undefined") {
              lazyArray2.chunks[chunkNum] = doXHR(start, end);
            }
            if (typeof lazyArray2.chunks[chunkNum] == "undefined") throw new Error("doXHR failed!");
            return lazyArray2.chunks[chunkNum];
          });
          if (usesGzip || !datalength) {
            chunkSize = datalength = 1;
            datalength = this.getter(0).length;
            chunkSize = datalength;
            out("LazyFiles on gzip forces download of the whole file when length is accessed");
          }
          this._length = datalength;
          this._chunkSize = chunkSize;
          this.lengthKnown = true;
        }
        get length() {
          if (!this.lengthKnown) {
            this.cacheLength();
          }
          return this._length;
        }
        get chunkSize() {
          if (!this.lengthKnown) {
            this.cacheLength();
          }
          return this._chunkSize;
        }
      }
      if (typeof XMLHttpRequest != "undefined") {
        if (!ENVIRONMENT_IS_WORKER) throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
        var lazyArray = new LazyUint8Array();
        var properties = { isDevice: false, contents: lazyArray };
      } else {
        var properties = { isDevice: false, url };
      }
      var node = FS.createFile(parent, name, properties, canRead, canWrite);
      if (properties.contents) {
        node.contents = properties.contents;
      } else if (properties.url) {
        node.contents = null;
        node.url = properties.url;
      }
      Object.defineProperties(node, { usedBytes: { get: /* @__PURE__ */ __name(function() {
        return this.contents.length;
      }, "get") } });
      var stream_ops = {};
      var keys = Object.keys(node.stream_ops);
      keys.forEach((key) => {
        var fn = node.stream_ops[key];
        stream_ops[key] = (...args) => {
          FS.forceLoadFile(node);
          return fn(...args);
        };
      });
      function writeChunks(stream, buffer, offset, length, position) {
        var contents = stream.node.contents;
        if (position >= contents.length) return 0;
        var size = Math.min(contents.length - position, length);
        if (contents.slice) {
          for (var i = 0; i < size; i++) {
            buffer[offset + i] = contents[position + i];
          }
        } else {
          for (var i = 0; i < size; i++) {
            buffer[offset + i] = contents.get(position + i);
          }
        }
        return size;
      }
      __name(writeChunks, "writeChunks");
      stream_ops.read = (stream, buffer, offset, length, position) => {
        FS.forceLoadFile(node);
        return writeChunks(stream, buffer, offset, length, position);
      };
      stream_ops.mmap = (stream, length, position, prot, flags) => {
        FS.forceLoadFile(node);
        var ptr = mmapAlloc(length);
        if (!ptr) {
          throw new FS.ErrnoError(48);
        }
        writeChunks(stream, HEAP8, ptr, length, position);
        return { ptr, allocated: true };
      };
      node.stream_ops = stream_ops;
      return node;
    } };
    var SYSCALLS = { DEFAULT_POLLMASK: 5, calculateAt(dirfd, path, allowEmpty) {
      if (PATH.isAbs(path)) {
        return path;
      }
      var dir;
      if (dirfd === -100) {
        dir = FS.cwd();
      } else {
        var dirstream = SYSCALLS.getStreamFromFD(dirfd);
        dir = dirstream.path;
      }
      if (path.length == 0) {
        if (!allowEmpty) {
          throw new FS.ErrnoError(44);
        }
        return dir;
      }
      return PATH.join2(dir, path);
    }, doStat(func, path, buf) {
      var stat = func(path);
      HEAP32[buf >> 2] = stat.dev;
      HEAP32[buf + 4 >> 2] = stat.mode;
      HEAPU32[buf + 8 >> 2] = stat.nlink;
      HEAP32[buf + 12 >> 2] = stat.uid;
      HEAP32[buf + 16 >> 2] = stat.gid;
      HEAP32[buf + 20 >> 2] = stat.rdev;
      tempI64 = [stat.size >>> 0, (tempDouble = stat.size, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[buf + 24 >> 2] = tempI64[0], HEAP32[buf + 28 >> 2] = tempI64[1];
      HEAP32[buf + 32 >> 2] = 4096;
      HEAP32[buf + 36 >> 2] = stat.blocks;
      var atime = stat.atime.getTime();
      var mtime = stat.mtime.getTime();
      var ctime = stat.ctime.getTime();
      tempI64 = [Math.floor(atime / 1e3) >>> 0, (tempDouble = Math.floor(atime / 1e3), +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[buf + 40 >> 2] = tempI64[0], HEAP32[buf + 44 >> 2] = tempI64[1];
      HEAPU32[buf + 48 >> 2] = atime % 1e3 * 1e3 * 1e3;
      tempI64 = [Math.floor(mtime / 1e3) >>> 0, (tempDouble = Math.floor(mtime / 1e3), +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[buf + 56 >> 2] = tempI64[0], HEAP32[buf + 60 >> 2] = tempI64[1];
      HEAPU32[buf + 64 >> 2] = mtime % 1e3 * 1e3 * 1e3;
      tempI64 = [Math.floor(ctime / 1e3) >>> 0, (tempDouble = Math.floor(ctime / 1e3), +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[buf + 72 >> 2] = tempI64[0], HEAP32[buf + 76 >> 2] = tempI64[1];
      HEAPU32[buf + 80 >> 2] = ctime % 1e3 * 1e3 * 1e3;
      tempI64 = [stat.ino >>> 0, (tempDouble = stat.ino, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[buf + 88 >> 2] = tempI64[0], HEAP32[buf + 92 >> 2] = tempI64[1];
      return 0;
    }, doMsync(addr, stream, len, flags, offset) {
      if (!FS.isFile(stream.node.mode)) {
        throw new FS.ErrnoError(43);
      }
      if (flags & 2) {
        return 0;
      }
      var buffer = HEAPU8.slice(addr, addr + len);
      FS.msync(stream, buffer, offset, len, flags);
    }, getStreamFromFD(fd) {
      var stream = FS.getStreamChecked(fd);
      return stream;
    }, varargs: void 0, getStr(ptr) {
      var ret = UTF8ToString(ptr);
      return ret;
    } };
    function ___syscall__newselect(nfds, readfds, writefds, exceptfds, timeout) {
      try {
        var total = 0;
        var srcReadLow = readfds ? HEAP32[readfds >> 2] : 0, srcReadHigh = readfds ? HEAP32[readfds + 4 >> 2] : 0;
        var srcWriteLow = writefds ? HEAP32[writefds >> 2] : 0, srcWriteHigh = writefds ? HEAP32[writefds + 4 >> 2] : 0;
        var srcExceptLow = exceptfds ? HEAP32[exceptfds >> 2] : 0, srcExceptHigh = exceptfds ? HEAP32[exceptfds + 4 >> 2] : 0;
        var dstReadLow = 0, dstReadHigh = 0;
        var dstWriteLow = 0, dstWriteHigh = 0;
        var dstExceptLow = 0, dstExceptHigh = 0;
        var allLow = (readfds ? HEAP32[readfds >> 2] : 0) | (writefds ? HEAP32[writefds >> 2] : 0) | (exceptfds ? HEAP32[exceptfds >> 2] : 0);
        var allHigh = (readfds ? HEAP32[readfds + 4 >> 2] : 0) | (writefds ? HEAP32[writefds + 4 >> 2] : 0) | (exceptfds ? HEAP32[exceptfds + 4 >> 2] : 0);
        var check = /* @__PURE__ */ __name(function(fd2, low, high, val) {
          return fd2 < 32 ? low & val : high & val;
        }, "check");
        for (var fd = 0; fd < nfds; fd++) {
          var mask = 1 << fd % 32;
          if (!check(fd, allLow, allHigh, mask)) {
            continue;
          }
          var stream = SYSCALLS.getStreamFromFD(fd);
          var flags = SYSCALLS.DEFAULT_POLLMASK;
          if (stream.stream_ops.poll) {
            var timeoutInMillis = -1;
            if (timeout) {
              var tv_sec = readfds ? HEAP32[timeout >> 2] : 0, tv_usec = readfds ? HEAP32[timeout + 4 >> 2] : 0;
              timeoutInMillis = (tv_sec + tv_usec / 1e6) * 1e3;
            }
            flags = stream.stream_ops.poll(stream, timeoutInMillis);
          }
          if (flags & 1 && check(fd, srcReadLow, srcReadHigh, mask)) {
            fd < 32 ? dstReadLow = dstReadLow | mask : dstReadHigh = dstReadHigh | mask;
            total++;
          }
          if (flags & 4 && check(fd, srcWriteLow, srcWriteHigh, mask)) {
            fd < 32 ? dstWriteLow = dstWriteLow | mask : dstWriteHigh = dstWriteHigh | mask;
            total++;
          }
          if (flags & 2 && check(fd, srcExceptLow, srcExceptHigh, mask)) {
            fd < 32 ? dstExceptLow = dstExceptLow | mask : dstExceptHigh = dstExceptHigh | mask;
            total++;
          }
        }
        if (readfds) {
          HEAP32[readfds >> 2] = dstReadLow;
          HEAP32[readfds + 4 >> 2] = dstReadHigh;
        }
        if (writefds) {
          HEAP32[writefds >> 2] = dstWriteLow;
          HEAP32[writefds + 4 >> 2] = dstWriteHigh;
        }
        if (exceptfds) {
          HEAP32[exceptfds >> 2] = dstExceptLow;
          HEAP32[exceptfds + 4 >> 2] = dstExceptHigh;
        }
        return total;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    __name(___syscall__newselect, "___syscall__newselect");
    var SOCKFS = { mount(mount) {
      Module2["websocket"] = Module2["websocket"] && "object" === typeof Module2["websocket"] ? Module2["websocket"] : {};
      Module2["websocket"]._callbacks = {};
      Module2["websocket"]["on"] = function(event, callback) {
        if ("function" === typeof callback) {
          this._callbacks[event] = callback;
        }
        return this;
      };
      Module2["websocket"].emit = function(event, param) {
        if ("function" === typeof this._callbacks[event]) {
          this._callbacks[event].call(this, param);
        }
      };
      return FS.createNode(null, "/", 16384 | 511, 0);
    }, createSocket(family, type, protocol) {
      type &= ~526336;
      var streaming = type == 1;
      if (streaming && protocol && protocol != 6) {
        throw new FS.ErrnoError(66);
      }
      var sock = { family, type, protocol, server: null, error: null, peers: {}, pending: [], recv_queue: [], sock_ops: SOCKFS.websocket_sock_ops };
      var name = SOCKFS.nextname();
      var node = FS.createNode(SOCKFS.root, name, 49152, 0);
      node.sock = sock;
      var stream = FS.createStream({ path: name, node, flags: 2, seekable: false, stream_ops: SOCKFS.stream_ops });
      sock.stream = stream;
      return sock;
    }, getSocket(fd) {
      var stream = FS.getStream(fd);
      if (!stream || !FS.isSocket(stream.node.mode)) {
        return null;
      }
      return stream.node.sock;
    }, stream_ops: { poll(stream) {
      var sock = stream.node.sock;
      return sock.sock_ops.poll(sock);
    }, ioctl(stream, request, varargs) {
      var sock = stream.node.sock;
      return sock.sock_ops.ioctl(sock, request, varargs);
    }, read(stream, buffer, offset, length, position) {
      var sock = stream.node.sock;
      var msg = sock.sock_ops.recvmsg(sock, length);
      if (!msg) {
        return 0;
      }
      buffer.set(msg.buffer, offset);
      return msg.buffer.length;
    }, write(stream, buffer, offset, length, position) {
      var sock = stream.node.sock;
      return sock.sock_ops.sendmsg(sock, buffer, offset, length);
    }, close(stream) {
      var sock = stream.node.sock;
      sock.sock_ops.close(sock);
    } }, nextname() {
      if (!SOCKFS.nextname.current) {
        SOCKFS.nextname.current = 0;
      }
      return "socket[" + SOCKFS.nextname.current++ + "]";
    }, websocket_sock_ops: { createPeer(sock, addr, port) {
      var ws;
      if (typeof addr == "object") {
        ws = addr;
        addr = null;
        port = null;
      }
      if (ws) {
        if (ws._socket) {
          addr = ws._socket.remoteAddress;
          port = ws._socket.remotePort;
        } else {
          var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
          if (!result) {
            throw new Error("WebSocket URL must be in the format ws(s)://address:port");
          }
          addr = result[1];
          port = parseInt(result[2], 10);
        }
      } else {
        try {
          var runtimeConfig = Module2["websocket"] && "object" === typeof Module2["websocket"];
          var url = "ws:#".replace("#", "//");
          if (runtimeConfig) {
            if ("string" === typeof Module2["websocket"]["url"]) {
              url = Module2["websocket"]["url"];
            }
          }
          if (url === "ws://" || url === "wss://") {
            var parts = addr.split("/");
            url = url + parts[0] + ":" + port + "/" + parts.slice(1).join("/");
          }
          var subProtocols = "binary";
          if (runtimeConfig) {
            if ("string" === typeof Module2["websocket"]["subprotocol"]) {
              subProtocols = Module2["websocket"]["subprotocol"];
            }
          }
          var opts = void 0;
          if (subProtocols !== "null") {
            subProtocols = subProtocols.replace(/^ +| +$/g, "").split(/ *, */);
            opts = subProtocols;
          }
          if (runtimeConfig && null === Module2["websocket"]["subprotocol"]) {
            subProtocols = "null";
            opts = void 0;
          }
          var WebSocketConstructor;
          {
            WebSocketConstructor = WebSocket;
          }
          ws = new WebSocketConstructor(url, opts);
          ws.binaryType = "arraybuffer";
        } catch (e) {
          throw new FS.ErrnoError(23);
        }
      }
      var peer = { addr, port, socket: ws, dgram_send_queue: [] };
      SOCKFS.websocket_sock_ops.addPeer(sock, peer);
      SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);
      if (sock.type === 2 && typeof sock.sport != "undefined") {
        peer.dgram_send_queue.push(new Uint8Array([255, 255, 255, 255, "p".charCodeAt(0), "o".charCodeAt(0), "r".charCodeAt(0), "t".charCodeAt(0), (sock.sport & 65280) >> 8, sock.sport & 255]));
      }
      return peer;
    }, getPeer(sock, addr, port) {
      return sock.peers[addr + ":" + port];
    }, addPeer(sock, peer) {
      sock.peers[peer.addr + ":" + peer.port] = peer;
    }, removePeer(sock, peer) {
      delete sock.peers[peer.addr + ":" + peer.port];
    }, handlePeerEvents(sock, peer) {
      var first = true;
      var handleOpen = /* @__PURE__ */ __name(function() {
        Module2["websocket"].emit("open", sock.stream.fd);
        try {
          var queued = peer.dgram_send_queue.shift();
          while (queued) {
            peer.socket.send(queued);
            queued = peer.dgram_send_queue.shift();
          }
        } catch (e) {
          peer.socket.close();
        }
      }, "handleOpen");
      function handleMessage(data) {
        if (typeof data == "string") {
          var encoder = new TextEncoder();
          data = encoder.encode(data);
        } else {
          assert(data.byteLength !== void 0);
          if (data.byteLength == 0) {
            return;
          }
          data = new Uint8Array(data);
        }
        var wasfirst = first;
        first = false;
        if (wasfirst && data.length === 10 && data[0] === 255 && data[1] === 255 && data[2] === 255 && data[3] === 255 && data[4] === "p".charCodeAt(0) && data[5] === "o".charCodeAt(0) && data[6] === "r".charCodeAt(0) && data[7] === "t".charCodeAt(0)) {
          var newport = data[8] << 8 | data[9];
          SOCKFS.websocket_sock_ops.removePeer(sock, peer);
          peer.port = newport;
          SOCKFS.websocket_sock_ops.addPeer(sock, peer);
          return;
        }
        sock.recv_queue.push({ addr: peer.addr, port: peer.port, data });
        Module2["websocket"].emit("message", sock.stream.fd);
      }
      __name(handleMessage, "handleMessage");
      if (ENVIRONMENT_IS_NODE) {
        peer.socket.on("open", handleOpen);
        peer.socket.on("message", function(data, isBinary) {
          if (!isBinary) {
            return;
          }
          handleMessage(new Uint8Array(data).buffer);
        });
        peer.socket.on("close", function() {
          Module2["websocket"].emit("close", sock.stream.fd);
        });
        peer.socket.on("error", function(error) {
          sock.error = 14;
          Module2["websocket"].emit("error", [sock.stream.fd, sock.error, "ECONNREFUSED: Connection refused"]);
        });
      } else {
        peer.socket.onopen = handleOpen;
        peer.socket.onclose = function() {
          Module2["websocket"].emit("close", sock.stream.fd);
        };
        peer.socket.onmessage = /* @__PURE__ */ __name(function peer_socket_onmessage(event) {
          handleMessage(event.data);
        }, "peer_socket_onmessage");
        peer.socket.onerror = function(error) {
          sock.error = 14;
          Module2["websocket"].emit("error", [sock.stream.fd, sock.error, "ECONNREFUSED: Connection refused"]);
        };
      }
    }, poll(sock) {
      if (sock.type === 1 && sock.server) {
        return sock.pending.length ? 64 | 1 : 0;
      }
      var mask = 0;
      var dest = sock.type === 1 ? SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) : null;
      if (sock.recv_queue.length || !dest || dest && dest.socket.readyState === dest.socket.CLOSING || dest && dest.socket.readyState === dest.socket.CLOSED) {
        mask |= 64 | 1;
      }
      if (!dest || dest && dest.socket.readyState === dest.socket.OPEN) {
        mask |= 4;
      }
      if (dest && dest.socket.readyState === dest.socket.CLOSING || dest && dest.socket.readyState === dest.socket.CLOSED) {
        mask |= 16;
      }
      return mask;
    }, ioctl(sock, request, arg) {
      switch (request) {
        case 21531:
          var bytes = 0;
          if (sock.recv_queue.length) {
            bytes = sock.recv_queue[0].data.length;
          }
          HEAP32[arg >> 2] = bytes;
          return 0;
        default:
          return 28;
      }
    }, close(sock) {
      if (sock.server) {
        try {
          sock.server.close();
        } catch (e) {
        }
        sock.server = null;
      }
      var peers = Object.keys(sock.peers);
      for (var i = 0; i < peers.length; i++) {
        var peer = sock.peers[peers[i]];
        try {
          peer.socket.close();
        } catch (e) {
        }
        SOCKFS.websocket_sock_ops.removePeer(sock, peer);
      }
      return 0;
    }, bind(sock, addr, port) {
      if (typeof sock.saddr != "undefined" || typeof sock.sport != "undefined") {
        throw new FS.ErrnoError(28);
      }
      sock.saddr = addr;
      sock.sport = port;
      if (sock.type === 2) {
        if (sock.server) {
          sock.server.close();
          sock.server = null;
        }
        try {
          sock.sock_ops.listen(sock, 0);
        } catch (e) {
          if (!(e.name === "ErrnoError")) throw e;
          if (e.errno !== 138) throw e;
        }
      }
    }, connect(sock, addr, port) {
      if (sock.server) {
        throw new FS.ErrnoError(138);
      }
      if (typeof sock.daddr != "undefined" && typeof sock.dport != "undefined") {
        var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
        if (dest) {
          if (dest.socket.readyState === dest.socket.CONNECTING) {
            throw new FS.ErrnoError(7);
          } else {
            throw new FS.ErrnoError(30);
          }
        }
      }
      var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
      sock.daddr = peer.addr;
      sock.dport = peer.port;
      throw new FS.ErrnoError(26);
    }, listen(sock, backlog) {
      if (!ENVIRONMENT_IS_NODE) {
        throw new FS.ErrnoError(138);
      }
    }, accept(listensock) {
      if (!listensock.server || !listensock.pending.length) {
        throw new FS.ErrnoError(28);
      }
      var newsock = listensock.pending.shift();
      newsock.stream.flags = listensock.stream.flags;
      return newsock;
    }, getname(sock, peer) {
      var addr, port;
      if (peer) {
        if (sock.daddr === void 0 || sock.dport === void 0) {
          throw new FS.ErrnoError(53);
        }
        addr = sock.daddr;
        port = sock.dport;
      } else {
        addr = sock.saddr || 0;
        port = sock.sport || 0;
      }
      return { addr, port };
    }, sendmsg(sock, buffer, offset, length, addr, port) {
      if (sock.type === 2) {
        if (addr === void 0 || port === void 0) {
          addr = sock.daddr;
          port = sock.dport;
        }
        if (addr === void 0 || port === void 0) {
          throw new FS.ErrnoError(17);
        }
      } else {
        addr = sock.daddr;
        port = sock.dport;
      }
      var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);
      if (sock.type === 1) {
        if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
          throw new FS.ErrnoError(53);
        } else if (dest.socket.readyState === dest.socket.CONNECTING) {
          throw new FS.ErrnoError(6);
        }
      }
      if (ArrayBuffer.isView(buffer)) {
        offset += buffer.byteOffset;
        buffer = buffer.buffer;
      }
      var data;
      data = buffer.slice(offset, offset + length);
      if (sock.type === 2) {
        if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
          if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
            dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
          }
          dest.dgram_send_queue.push(data);
          return length;
        }
      }
      try {
        dest.socket.send(data);
        return length;
      } catch (e) {
        throw new FS.ErrnoError(28);
      }
    }, recvmsg(sock, length) {
      if (sock.type === 1 && sock.server) {
        throw new FS.ErrnoError(53);
      }
      var queued = sock.recv_queue.shift();
      if (!queued) {
        if (sock.type === 1) {
          var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
          if (!dest) {
            throw new FS.ErrnoError(53);
          }
          if (dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
            return null;
          }
          throw new FS.ErrnoError(6);
        }
        throw new FS.ErrnoError(6);
      }
      var queuedLength = queued.data.byteLength || queued.data.length;
      var queuedOffset = queued.data.byteOffset || 0;
      var queuedBuffer = queued.data.buffer || queued.data;
      var bytesRead = Math.min(length, queuedLength);
      var res = { buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead), addr: queued.addr, port: queued.port };
      if (sock.type === 1 && bytesRead < queuedLength) {
        var bytesRemaining = queuedLength - bytesRead;
        queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining);
        sock.recv_queue.unshift(queued);
      }
      return res;
    } } };
    var getSocketFromFD = /* @__PURE__ */ __name((fd) => {
      var socket = SOCKFS.getSocket(fd);
      if (!socket) throw new FS.ErrnoError(8);
      return socket;
    }, "getSocketFromFD");
    var inetPton4 = /* @__PURE__ */ __name((str) => {
      var b = str.split(".");
      for (var i = 0; i < 4; i++) {
        var tmp = Number(b[i]);
        if (isNaN(tmp)) return null;
        b[i] = tmp;
      }
      return (b[0] | b[1] << 8 | b[2] << 16 | b[3] << 24) >>> 0;
    }, "inetPton4");
    var jstoi_q = /* @__PURE__ */ __name((str) => parseInt(str), "jstoi_q");
    var inetPton6 = /* @__PURE__ */ __name((str) => {
      var words;
      var w, offset, z;
      var valid6regx = /^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/i;
      var parts = [];
      if (!valid6regx.test(str)) {
        return null;
      }
      if (str === "::") {
        return [0, 0, 0, 0, 0, 0, 0, 0];
      }
      if (str.startsWith("::")) {
        str = str.replace("::", "Z:");
      } else {
        str = str.replace("::", ":Z:");
      }
      if (str.indexOf(".") > 0) {
        str = str.replace(new RegExp("[.]", "g"), ":");
        words = str.split(":");
        words[words.length - 4] = jstoi_q(words[words.length - 4]) + jstoi_q(words[words.length - 3]) * 256;
        words[words.length - 3] = jstoi_q(words[words.length - 2]) + jstoi_q(words[words.length - 1]) * 256;
        words = words.slice(0, words.length - 2);
      } else {
        words = str.split(":");
      }
      offset = 0;
      z = 0;
      for (w = 0; w < words.length; w++) {
        if (typeof words[w] == "string") {
          if (words[w] === "Z") {
            for (z = 0; z < 8 - words.length + 1; z++) {
              parts[w + z] = 0;
            }
            offset = z - 1;
          } else {
            parts[w + offset] = _htons(parseInt(words[w], 16));
          }
        } else {
          parts[w + offset] = words[w];
        }
      }
      return [parts[1] << 16 | parts[0], parts[3] << 16 | parts[2], parts[5] << 16 | parts[4], parts[7] << 16 | parts[6]];
    }, "inetPton6");
    var writeSockaddr = /* @__PURE__ */ __name((sa, family, addr, port, addrlen) => {
      switch (family) {
        case 2:
          addr = inetPton4(addr);
          zeroMemory(sa, 16);
          if (addrlen) {
            HEAP32[addrlen >> 2] = 16;
          }
          HEAP16[sa >> 1] = family;
          HEAP32[sa + 4 >> 2] = addr;
          HEAP16[sa + 2 >> 1] = _htons(port);
          break;
        case 10:
          addr = inetPton6(addr);
          zeroMemory(sa, 28);
          if (addrlen) {
            HEAP32[addrlen >> 2] = 28;
          }
          HEAP32[sa >> 2] = family;
          HEAP32[sa + 8 >> 2] = addr[0];
          HEAP32[sa + 12 >> 2] = addr[1];
          HEAP32[sa + 16 >> 2] = addr[2];
          HEAP32[sa + 20 >> 2] = addr[3];
          HEAP16[sa + 2 >> 1] = _htons(port);
          break;
        default:
          return 5;
      }
      return 0;
    }, "writeSockaddr");
    var DNS = { address_map: { id: 1, addrs: {}, names: {} }, lookup_name(name) {
      var res = inetPton4(name);
      if (res !== null) {
        return name;
      }
      res = inetPton6(name);
      if (res !== null) {
        return name;
      }
      var addr;
      if (DNS.address_map.addrs[name]) {
        addr = DNS.address_map.addrs[name];
      } else {
        var id = DNS.address_map.id++;
        assert(id < 65535, "exceeded max address mappings of 65535");
        addr = "172.29." + (id & 255) + "." + (id & 65280);
        DNS.address_map.names[addr] = name;
        DNS.address_map.addrs[name] = addr;
      }
      return addr;
    }, lookup_addr(addr) {
      if (DNS.address_map.names[addr]) {
        return DNS.address_map.names[addr];
      }
      return null;
    } };
    function ___syscall_accept4(fd, addr, addrlen, flags, d1, d2) {
      try {
        var sock = getSocketFromFD(fd);
        var newsock = sock.sock_ops.accept(sock);
        if (addr) {
          var errno = writeSockaddr(addr, newsock.family, DNS.lookup_name(newsock.daddr), newsock.dport, addrlen);
        }
        return newsock.stream.fd;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    __name(___syscall_accept4, "___syscall_accept4");
    var inetNtop4 = /* @__PURE__ */ __name((addr) => (addr & 255) + "." + (addr >> 8 & 255) + "." + (addr >> 16 & 255) + "." + (addr >> 24 & 255), "inetNtop4");
    var inetNtop6 = /* @__PURE__ */ __name((ints) => {
      var str = "";
      var word = 0;
      var longest = 0;
      var lastzero = 0;
      var zstart = 0;
      var len = 0;
      var i = 0;
      var parts = [ints[0] & 65535, ints[0] >> 16, ints[1] & 65535, ints[1] >> 16, ints[2] & 65535, ints[2] >> 16, ints[3] & 65535, ints[3] >> 16];
      var hasipv4 = true;
      var v4part = "";
      for (i = 0; i < 5; i++) {
        if (parts[i] !== 0) {
          hasipv4 = false;
          break;
        }
      }
      if (hasipv4) {
        v4part = inetNtop4(parts[6] | parts[7] << 16);
        if (parts[5] === -1) {
          str = "::ffff:";
          str += v4part;
          return str;
        }
        if (parts[5] === 0) {
          str = "::";
          if (v4part === "0.0.0.0") v4part = "";
          if (v4part === "0.0.0.1") v4part = "1";
          str += v4part;
          return str;
        }
      }
      for (word = 0; word < 8; word++) {
        if (parts[word] === 0) {
          if (word - lastzero > 1) {
            len = 0;
          }
          lastzero = word;
          len++;
        }
        if (len > longest) {
          longest = len;
          zstart = word - longest + 1;
        }
      }
      for (word = 0; word < 8; word++) {
        if (longest > 1) {
          if (parts[word] === 0 && word >= zstart && word < zstart + longest) {
            if (word === zstart) {
              str += ":";
              if (zstart === 0) str += ":";
            }
            continue;
          }
        }
        str += Number(_ntohs(parts[word] & 65535)).toString(16);
        str += word < 7 ? ":" : "";
      }
      return str;
    }, "inetNtop6");
    var readSockaddr = /* @__PURE__ */ __name((sa, salen) => {
      var family = HEAP16[sa >> 1];
      var port = _ntohs(HEAPU16[sa + 2 >> 1]);
      var addr;
      switch (family) {
        case 2:
          if (salen !== 16) {
            return { errno: 28 };
          }
          addr = HEAP32[sa + 4 >> 2];
          addr = inetNtop4(addr);
          break;
        case 10:
          if (salen !== 28) {
            return { errno: 28 };
          }
          addr = [HEAP32[sa + 8 >> 2], HEAP32[sa + 12 >> 2], HEAP32[sa + 16 >> 2], HEAP32[sa + 20 >> 2]];
          addr = inetNtop6(addr);
          break;
        default:
          return { errno: 5 };
      }
      return { family, addr, port };
    }, "readSockaddr");
    var getSocketAddress = /* @__PURE__ */ __name((addrp, addrlen, allowNull) => {
      if (allowNull && addrp === 0) return null;
      var info = readSockaddr(addrp, addrlen);
      if (info.errno) throw new FS.ErrnoError(info.errno);
      info.addr = DNS.lookup_addr(info.addr) || info.addr;
      return info;
    }, "getSocketAddress");
    function ___syscall_bind(fd, addr, addrlen, d1, d2, d3) {
      try {
        var sock = getSocketFromFD(fd);
        var info = getSocketAddress(addr, addrlen);
        sock.sock_ops.bind(sock, info.addr, info.port);
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    __name(___syscall_bind, "___syscall_bind");
    function ___syscall_chdir(path) {
      try {
        path = SYSCALLS.getStr(path);
        FS.chdir(path);
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    __name(___syscall_chdir, "___syscall_chdir");
    function ___syscall_chmod(path, mode) {
      try {
        path = SYSCALLS.getStr(path);
        FS.chmod(path, mode);
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    __name(___syscall_chmod, "___syscall_chmod");
    function ___syscall_connect(fd, addr, addrlen, d1, d2, d3) {
      try {
        var sock = getSocketFromFD(fd);
        var info = getSocketAddress(addr, addrlen);
        sock.sock_ops.connect(sock, info.addr, info.port);
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    __name(___syscall_connect, "___syscall_connect");
    function ___syscall_dup(fd) {
      try {
        var old = SYSCALLS.getStreamFromFD(fd);
        return FS.dupStream(old).fd;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    __name(___syscall_dup, "___syscall_dup");
    function ___syscall_faccessat(dirfd, path, amode, flags) {
      try {
        path = SYSCALLS.getStr(path);
        path = SYSCALLS.calculateAt(dirfd, path);
        if (amode & ~7) {
          return -28;
        }
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node) {
          return -44;
        }
        var perms = "";
        if (amode & 4) perms += "r";
        if (amode & 2) perms += "w";
        if (amode & 1) perms += "x";
        if (perms && FS.nodePermissions(node, perms)) {
          return -2;
        }
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    __name(___syscall_faccessat, "___syscall_faccessat");
    function ___syscall_fchownat(dirfd, path, owner, group, flags) {
      try {
        path = SYSCALLS.getStr(path);
        var nofollow = flags & 256;
        flags = flags & ~256;
        path = SYSCALLS.calculateAt(dirfd, path);
        (nofollow ? FS.lchown : FS.chown)(path, owner, group);
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    __name(___syscall_fchownat, "___syscall_fchownat");
    function syscallGetVarargI() {
      var ret = HEAP32[+SYSCALLS.varargs >> 2];
      SYSCALLS.varargs += 4;
      return ret;
    }
    __name(syscallGetVarargI, "syscallGetVarargI");
    var syscallGetVarargP = syscallGetVarargI;
    function ___syscall_fcntl64(fd, cmd, varargs) {
      SYSCALLS.varargs = varargs;
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        switch (cmd) {
          case 0: {
            var arg = syscallGetVarargI();
            if (arg < 0) {
              return -28;
            }
            while (FS.streams[arg]) {
              arg++;
            }
            var newStream;
            newStream = FS.dupStream(stream, arg);
            return newStream.fd;
          }
          case 1:
          case 2:
            return 0;
          case 3:
            return stream.flags;
          case 4: {
            var arg = syscallGetVarargI();
            stream.flags |= arg;
            return 0;
          }
          case 12: {
            var arg = syscallGetVarargP();
            var offset = 0;
            HEAP16[arg + offset >> 1] = 2;
            return 0;
          }
          case 13:
          case 14:
            return 0;
        }
        return -28;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    __name(___syscall_fcntl64, "___syscall_fcntl64");
    function ___syscall_fdatasync(fd) {
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    __name(___syscall_fdatasync, "___syscall_fdatasync");
    function ___syscall_fstat64(fd, buf) {
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        return SYSCALLS.doStat(FS.stat, stream.path, buf);
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    __name(___syscall_fstat64, "___syscall_fstat64");
    var convertI32PairToI53Checked = /* @__PURE__ */ __name((lo, hi) => hi + 2097152 >>> 0 < 4194305 - !!lo ? (lo >>> 0) + hi * 4294967296 : NaN, "convertI32PairToI53Checked");
    function ___syscall_ftruncate64(fd, length_low, length_high) {
      var length = convertI32PairToI53Checked(length_low, length_high);
      try {
        if (isNaN(length)) return 61;
        FS.ftruncate(fd, length);
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    __name(___syscall_ftruncate64, "___syscall_ftruncate64");
    var stringToUTF8 = /* @__PURE__ */ __name((str, outPtr, maxBytesToWrite) => stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite), "stringToUTF8");
    function ___syscall_getcwd(buf, size) {
      try {
        if (size === 0) return -28;
        var cwd = FS.cwd();
        var cwdLengthInBytes = lengthBytesUTF8(cwd) + 1;
        if (size < cwdLengthInBytes) return -68;
        stringToUTF8(cwd, buf, size);
        return cwdLengthInBytes;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    __name(___syscall_getcwd, "___syscall_getcwd");
    function ___syscall_getdents64(fd, dirp, count) {
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        stream.getdents ||= FS.readdir(stream.path);
        var struct_size = 280;
        var pos = 0;
        var off = FS.llseek(stream, 0, 1);
        var idx = Math.floor(off / struct_size);
        while (idx < stream.getdents.length && pos + struct_size <= count) {
          var id;
          var type;
          var name = stream.getdents[idx];
          if (name === ".") {
            id = stream.node.id;
            type = 4;
          } else if (name === "..") {
            var lookup = FS.lookupPath(stream.path, { parent: true });
            id = lookup.node.id;
            type = 4;
          } else {
            var child = FS.lookupNode(stream.node, name);
            id = child.id;
            type = FS.isChrdev(child.mode) ? 2 : FS.isDir(child.mode) ? 4 : FS.isLink(child.mode) ? 10 : 8;
          }
          tempI64 = [id >>> 0, (tempDouble = id, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[dirp + pos >> 2] = tempI64[0], HEAP32[dirp + pos + 4 >> 2] = tempI64[1];
          tempI64 = [(idx + 1) * struct_size >>> 0, (tempDouble = (idx + 1) * struct_size, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[dirp + pos + 8 >> 2] = tempI64[0], HEAP32[dirp + pos + 12 >> 2] = tempI64[1];
          HEAP16[dirp + pos + 16 >> 1] = 280;
          HEAP8[dirp + pos + 18] = type;
          stringToUTF8(name, dirp + pos + 19, 256);
          pos += struct_size;
          idx += 1;
        }
        FS.llseek(stream, idx * struct_size, 0);
        return pos;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    __name(___syscall_getdents64, "___syscall_getdents64");
    function ___syscall_getpeername(fd, addr, addrlen, d1, d2, d3) {
      try {
        var sock = getSocketFromFD(fd);
        if (!sock.daddr) {
          return -53;
        }
        var errno = writeSockaddr(addr, sock.family, DNS.lookup_name(sock.daddr), sock.dport, addrlen);
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    __name(___syscall_getpeername, "___syscall_getpeername");
    function ___syscall_getsockname(fd, addr, addrlen, d1, d2, d3) {
      try {
        var sock = getSocketFromFD(fd);
        var errno = writeSockaddr(addr, sock.family, DNS.lookup_name(sock.saddr || "0.0.0.0"), sock.sport, addrlen);
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    __name(___syscall_getsockname, "___syscall_getsockname");
    function ___syscall_getsockopt(fd, level, optname, optval, optlen, d1) {
      try {
        var sock = getSocketFromFD(fd);
        if (level === 1) {
          if (optname === 4) {
            HEAP32[optval >> 2] = sock.error;
            HEAP32[optlen >> 2] = 4;
            sock.error = null;
            return 0;
          }
        }
        return -50;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    __name(___syscall_getsockopt, "___syscall_getsockopt");
    function ___syscall_ioctl(fd, op, varargs) {
      SYSCALLS.varargs = varargs;
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        switch (op) {
          case 21509: {
            if (!stream.tty) return -59;
            return 0;
          }
          case 21505: {
            if (!stream.tty) return -59;
            if (stream.tty.ops.ioctl_tcgets) {
              var termios = stream.tty.ops.ioctl_tcgets(stream);
              var argp = syscallGetVarargP();
              HEAP32[argp >> 2] = termios.c_iflag || 0;
              HEAP32[argp + 4 >> 2] = termios.c_oflag || 0;
              HEAP32[argp + 8 >> 2] = termios.c_cflag || 0;
              HEAP32[argp + 12 >> 2] = termios.c_lflag || 0;
              for (var i = 0; i < 32; i++) {
                HEAP8[argp + i + 17] = termios.c_cc[i] || 0;
              }
              return 0;
            }
            return 0;
          }
          case 21510:
          case 21511:
          case 21512: {
            if (!stream.tty) return -59;
            return 0;
          }
          case 21506:
          case 21507:
          case 21508: {
            if (!stream.tty) return -59;
            if (stream.tty.ops.ioctl_tcsets) {
              var argp = syscallGetVarargP();
              var c_iflag = HEAP32[argp >> 2];
              var c_oflag = HEAP32[argp + 4 >> 2];
              var c_cflag = HEAP32[argp + 8 >> 2];
              var c_lflag = HEAP32[argp + 12 >> 2];
              var c_cc = [];
              for (var i = 0; i < 32; i++) {
                c_cc.push(HEAP8[argp + i + 17]);
              }
              return stream.tty.ops.ioctl_tcsets(stream.tty, op, { c_iflag, c_oflag, c_cflag, c_lflag, c_cc });
            }
            return 0;
          }
          case 21519: {
            if (!stream.tty) return -59;
            var argp = syscallGetVarargP();
            HEAP32[argp >> 2] = 0;
            return 0;
          }
          case 21520: {
            if (!stream.tty) return -59;
            return -28;
          }
          case 21531: {
            var argp = syscallGetVarargP();
            return FS.ioctl(stream, op, argp);
          }
          case 21523: {
            if (!stream.tty) return -59;
            if (stream.tty.ops.ioctl_tiocgwinsz) {
              var winsize = stream.tty.ops.ioctl_tiocgwinsz(stream.tty);
              var argp = syscallGetVarargP();
              HEAP16[argp >> 1] = winsize[0];
              HEAP16[argp + 2 >> 1] = winsize[1];
            }
            return 0;
          }
          case 21524: {
            if (!stream.tty) return -59;
            return 0;
          }
          case 21515: {
            if (!stream.tty) return -59;
            return 0;
          }
          default:
            return -28;
        }
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    __name(___syscall_ioctl, "___syscall_ioctl");
    function ___syscall_listen(fd, backlog) {
      try {
        var sock = getSocketFromFD(fd);
        sock.sock_ops.listen(sock, backlog);
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    __name(___syscall_listen, "___syscall_listen");
    function ___syscall_lstat64(path, buf) {
      try {
        path = SYSCALLS.getStr(path);
        return SYSCALLS.doStat(FS.lstat, path, buf);
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    __name(___syscall_lstat64, "___syscall_lstat64");
    function ___syscall_mkdirat(dirfd, path, mode) {
      try {
        path = SYSCALLS.getStr(path);
        path = SYSCALLS.calculateAt(dirfd, path);
        path = PATH.normalize(path);
        if (path[path.length - 1] === "/") path = path.substr(0, path.length - 1);
        FS.mkdir(path, mode, 0);
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    __name(___syscall_mkdirat, "___syscall_mkdirat");
    function ___syscall_newfstatat(dirfd, path, buf, flags) {
      try {
        path = SYSCALLS.getStr(path);
        var nofollow = flags & 256;
        var allowEmpty = flags & 4096;
        flags = flags & ~6400;
        path = SYSCALLS.calculateAt(dirfd, path, allowEmpty);
        return SYSCALLS.doStat(nofollow ? FS.lstat : FS.stat, path, buf);
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    __name(___syscall_newfstatat, "___syscall_newfstatat");
    function ___syscall_openat(dirfd, path, flags, varargs) {
      SYSCALLS.varargs = varargs;
      try {
        path = SYSCALLS.getStr(path);
        path = SYSCALLS.calculateAt(dirfd, path);
        var mode = varargs ? syscallGetVarargI() : 0;
        return FS.open(path, flags, mode).fd;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    __name(___syscall_openat, "___syscall_openat");
    var PIPEFS = { BUCKET_BUFFER_SIZE: 8192, mount(mount) {
      return FS.createNode(null, "/", 16384 | 511, 0);
    }, createPipe() {
      var pipe = { buckets: [], refcnt: 2 };
      pipe.buckets.push({ buffer: new Uint8Array(PIPEFS.BUCKET_BUFFER_SIZE), offset: 0, roffset: 0 });
      var rName = PIPEFS.nextname();
      var wName = PIPEFS.nextname();
      var rNode = FS.createNode(PIPEFS.root, rName, 4096, 0);
      var wNode = FS.createNode(PIPEFS.root, wName, 4096, 0);
      rNode.pipe = pipe;
      wNode.pipe = pipe;
      var readableStream = FS.createStream({ path: rName, node: rNode, flags: 0, seekable: false, stream_ops: PIPEFS.stream_ops });
      rNode.stream = readableStream;
      var writableStream = FS.createStream({ path: wName, node: wNode, flags: 1, seekable: false, stream_ops: PIPEFS.stream_ops });
      wNode.stream = writableStream;
      return { readable_fd: readableStream.fd, writable_fd: writableStream.fd };
    }, stream_ops: { poll(stream) {
      var pipe = stream.node.pipe;
      if ((stream.flags & 2097155) === 1) {
        return 256 | 4;
      }
      if (pipe.buckets.length > 0) {
        for (var i = 0; i < pipe.buckets.length; i++) {
          var bucket = pipe.buckets[i];
          if (bucket.offset - bucket.roffset > 0) {
            return 64 | 1;
          }
        }
      }
      return 0;
    }, ioctl(stream, request, varargs) {
      return 28;
    }, fsync(stream) {
      return 28;
    }, read(stream, buffer, offset, length, position) {
      var pipe = stream.node.pipe;
      var currentLength = 0;
      for (var i = 0; i < pipe.buckets.length; i++) {
        var bucket = pipe.buckets[i];
        currentLength += bucket.offset - bucket.roffset;
      }
      var data = buffer.subarray(offset, offset + length);
      if (length <= 0) {
        return 0;
      }
      if (currentLength == 0) {
        throw new FS.ErrnoError(6);
      }
      var toRead = Math.min(currentLength, length);
      var totalRead = toRead;
      var toRemove = 0;
      for (var i = 0; i < pipe.buckets.length; i++) {
        var currBucket = pipe.buckets[i];
        var bucketSize = currBucket.offset - currBucket.roffset;
        if (toRead <= bucketSize) {
          var tmpSlice = currBucket.buffer.subarray(currBucket.roffset, currBucket.offset);
          if (toRead < bucketSize) {
            tmpSlice = tmpSlice.subarray(0, toRead);
            currBucket.roffset += toRead;
          } else {
            toRemove++;
          }
          data.set(tmpSlice);
          break;
        } else {
          var tmpSlice = currBucket.buffer.subarray(currBucket.roffset, currBucket.offset);
          data.set(tmpSlice);
          data = data.subarray(tmpSlice.byteLength);
          toRead -= tmpSlice.byteLength;
          toRemove++;
        }
      }
      if (toRemove && toRemove == pipe.buckets.length) {
        toRemove--;
        pipe.buckets[toRemove].offset = 0;
        pipe.buckets[toRemove].roffset = 0;
      }
      pipe.buckets.splice(0, toRemove);
      return totalRead;
    }, write(stream, buffer, offset, length, position) {
      var pipe = stream.node.pipe;
      var data = buffer.subarray(offset, offset + length);
      var dataLen = data.byteLength;
      if (dataLen <= 0) {
        return 0;
      }
      var currBucket = null;
      if (pipe.buckets.length == 0) {
        currBucket = { buffer: new Uint8Array(PIPEFS.BUCKET_BUFFER_SIZE), offset: 0, roffset: 0 };
        pipe.buckets.push(currBucket);
      } else {
        currBucket = pipe.buckets[pipe.buckets.length - 1];
      }
      assert(currBucket.offset <= PIPEFS.BUCKET_BUFFER_SIZE);
      var freeBytesInCurrBuffer = PIPEFS.BUCKET_BUFFER_SIZE - currBucket.offset;
      if (freeBytesInCurrBuffer >= dataLen) {
        currBucket.buffer.set(data, currBucket.offset);
        currBucket.offset += dataLen;
        return dataLen;
      } else if (freeBytesInCurrBuffer > 0) {
        currBucket.buffer.set(data.subarray(0, freeBytesInCurrBuffer), currBucket.offset);
        currBucket.offset += freeBytesInCurrBuffer;
        data = data.subarray(freeBytesInCurrBuffer, data.byteLength);
      }
      var numBuckets = data.byteLength / PIPEFS.BUCKET_BUFFER_SIZE | 0;
      var remElements = data.byteLength % PIPEFS.BUCKET_BUFFER_SIZE;
      for (var i = 0; i < numBuckets; i++) {
        var newBucket = { buffer: new Uint8Array(PIPEFS.BUCKET_BUFFER_SIZE), offset: PIPEFS.BUCKET_BUFFER_SIZE, roffset: 0 };
        pipe.buckets.push(newBucket);
        newBucket.buffer.set(data.subarray(0, PIPEFS.BUCKET_BUFFER_SIZE));
        data = data.subarray(PIPEFS.BUCKET_BUFFER_SIZE, data.byteLength);
      }
      if (remElements > 0) {
        var newBucket = { buffer: new Uint8Array(PIPEFS.BUCKET_BUFFER_SIZE), offset: data.byteLength, roffset: 0 };
        pipe.buckets.push(newBucket);
        newBucket.buffer.set(data);
      }
      return dataLen;
    }, close(stream) {
      var pipe = stream.node.pipe;
      pipe.refcnt--;
      if (pipe.refcnt === 0) {
        pipe.buckets = null;
      }
    } }, nextname() {
      if (!PIPEFS.nextname.current) {
        PIPEFS.nextname.current = 0;
      }
      return "pipe[" + PIPEFS.nextname.current++ + "]";
    } };
    function ___syscall_pipe(fdPtr) {
      try {
        if (fdPtr == 0) {
          throw new FS.ErrnoError(21);
        }
        var res = PIPEFS.createPipe();
        HEAP32[fdPtr >> 2] = res.readable_fd;
        HEAP32[fdPtr + 4 >> 2] = res.writable_fd;
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    __name(___syscall_pipe, "___syscall_pipe");
    function ___syscall_poll(fds, nfds, timeout) {
      try {
        var nonzero = 0;
        for (var i = 0; i < nfds; i++) {
          var pollfd = fds + 8 * i;
          var fd = HEAP32[pollfd >> 2];
          var events = HEAP16[pollfd + 4 >> 1];
          var mask = 32;
          var stream = FS.getStream(fd);
          if (stream) {
            mask = SYSCALLS.DEFAULT_POLLMASK;
            if (stream.stream_ops.poll) {
              mask = stream.stream_ops.poll(stream, -1);
            }
          }
          mask &= events | 8 | 16;
          if (mask) nonzero++;
          HEAP16[pollfd + 6 >> 1] = mask;
        }
        return nonzero;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    __name(___syscall_poll, "___syscall_poll");
    function ___syscall_readlinkat(dirfd, path, buf, bufsize) {
      try {
        path = SYSCALLS.getStr(path);
        path = SYSCALLS.calculateAt(dirfd, path);
        if (bufsize <= 0) return -28;
        var ret = FS.readlink(path);
        var len = Math.min(bufsize, lengthBytesUTF8(ret));
        var endChar = HEAP8[buf + len];
        stringToUTF8(ret, buf, bufsize + 1);
        HEAP8[buf + len] = endChar;
        return len;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    __name(___syscall_readlinkat, "___syscall_readlinkat");
    function ___syscall_recvfrom(fd, buf, len, flags, addr, addrlen) {
      try {
        var sock = getSocketFromFD(fd);
        var msg = sock.sock_ops.recvmsg(sock, len);
        if (!msg) return 0;
        if (addr) {
          var errno = writeSockaddr(addr, sock.family, DNS.lookup_name(msg.addr), msg.port, addrlen);
        }
        HEAPU8.set(msg.buffer, buf);
        return msg.buffer.byteLength;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    __name(___syscall_recvfrom, "___syscall_recvfrom");
    function ___syscall_renameat(olddirfd, oldpath, newdirfd, newpath) {
      try {
        oldpath = SYSCALLS.getStr(oldpath);
        newpath = SYSCALLS.getStr(newpath);
        oldpath = SYSCALLS.calculateAt(olddirfd, oldpath);
        newpath = SYSCALLS.calculateAt(newdirfd, newpath);
        FS.rename(oldpath, newpath);
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    __name(___syscall_renameat, "___syscall_renameat");
    function ___syscall_rmdir(path) {
      try {
        path = SYSCALLS.getStr(path);
        FS.rmdir(path);
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    __name(___syscall_rmdir, "___syscall_rmdir");
    function ___syscall_sendto(fd, message, length, flags, addr, addr_len) {
      try {
        var sock = getSocketFromFD(fd);
        var dest = getSocketAddress(addr, addr_len, true);
        if (!dest) {
          return FS.write(sock.stream, HEAP8, message, length);
        }
        return sock.sock_ops.sendmsg(sock, HEAP8, message, length, dest.addr, dest.port);
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    __name(___syscall_sendto, "___syscall_sendto");
    function ___syscall_socket(domain, type, protocol) {
      try {
        var sock = SOCKFS.createSocket(domain, type, protocol);
        return sock.stream.fd;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    __name(___syscall_socket, "___syscall_socket");
    function ___syscall_stat64(path, buf) {
      try {
        path = SYSCALLS.getStr(path);
        return SYSCALLS.doStat(FS.stat, path, buf);
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    __name(___syscall_stat64, "___syscall_stat64");
    function ___syscall_statfs64(path, size, buf) {
      try {
        path = SYSCALLS.getStr(path);
        HEAP32[buf + 4 >> 2] = 4096;
        HEAP32[buf + 40 >> 2] = 4096;
        HEAP32[buf + 8 >> 2] = 1e6;
        HEAP32[buf + 12 >> 2] = 5e5;
        HEAP32[buf + 16 >> 2] = 5e5;
        HEAP32[buf + 20 >> 2] = FS.nextInode;
        HEAP32[buf + 24 >> 2] = 1e6;
        HEAP32[buf + 28 >> 2] = 42;
        HEAP32[buf + 44 >> 2] = 2;
        HEAP32[buf + 36 >> 2] = 255;
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    __name(___syscall_statfs64, "___syscall_statfs64");
    function ___syscall_symlink(target, linkpath) {
      try {
        target = SYSCALLS.getStr(target);
        linkpath = SYSCALLS.getStr(linkpath);
        FS.symlink(target, linkpath);
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    __name(___syscall_symlink, "___syscall_symlink");
    function ___syscall_unlinkat(dirfd, path, flags) {
      try {
        path = SYSCALLS.getStr(path);
        path = SYSCALLS.calculateAt(dirfd, path);
        if (flags === 0) {
          FS.unlink(path);
        } else if (flags === 512) {
          FS.rmdir(path);
        } else {
          abort("Invalid flags passed to unlinkat");
        }
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    __name(___syscall_unlinkat, "___syscall_unlinkat");
    var readI53FromI64 = /* @__PURE__ */ __name((ptr) => HEAPU32[ptr >> 2] + HEAP32[ptr + 4 >> 2] * 4294967296, "readI53FromI64");
    function ___syscall_utimensat(dirfd, path, times, flags) {
      try {
        path = SYSCALLS.getStr(path);
        path = SYSCALLS.calculateAt(dirfd, path, true);
        var now = Date.now(), atime, mtime;
        if (!times) {
          atime = now;
          mtime = now;
        } else {
          var seconds = readI53FromI64(times);
          var nanoseconds = HEAP32[times + 8 >> 2];
          if (nanoseconds == 1073741823) {
            atime = now;
          } else if (nanoseconds == 1073741822) {
            atime = -1;
          } else {
            atime = seconds * 1e3 + nanoseconds / (1e3 * 1e3);
          }
          times += 16;
          seconds = readI53FromI64(times);
          nanoseconds = HEAP32[times + 8 >> 2];
          if (nanoseconds == 1073741823) {
            mtime = now;
          } else if (nanoseconds == 1073741822) {
            mtime = -1;
          } else {
            mtime = seconds * 1e3 + nanoseconds / (1e3 * 1e3);
          }
        }
        if (mtime != -1 || atime != -1) {
          FS.utime(path, atime, mtime);
        }
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    __name(___syscall_utimensat, "___syscall_utimensat");
    var __abort_js = /* @__PURE__ */ __name(() => {
      abort("");
    }, "__abort_js");
    var nowIsMonotonic = 1;
    var __emscripten_get_now_is_monotonic = /* @__PURE__ */ __name(() => nowIsMonotonic, "__emscripten_get_now_is_monotonic");
    var __emscripten_lookup_name = /* @__PURE__ */ __name((name) => {
      var nameString = UTF8ToString(name);
      return inetPton4(DNS.lookup_name(nameString));
    }, "__emscripten_lookup_name");
    var __emscripten_memcpy_js = /* @__PURE__ */ __name((dest, src, num) => HEAPU8.copyWithin(dest, src, src + num), "__emscripten_memcpy_js");
    var __emscripten_runtime_keepalive_clear = /* @__PURE__ */ __name(() => {
      noExitRuntime = false;
      runtimeKeepaliveCounter = 0;
    }, "__emscripten_runtime_keepalive_clear");
    var __emscripten_throw_longjmp = /* @__PURE__ */ __name(() => {
      throw Infinity;
    }, "__emscripten_throw_longjmp");
    function __gmtime_js(time_low, time_high, tmPtr) {
      var time = convertI32PairToI53Checked(time_low, time_high);
      var date = new Date(time * 1e3);
      HEAP32[tmPtr >> 2] = date.getUTCSeconds();
      HEAP32[tmPtr + 4 >> 2] = date.getUTCMinutes();
      HEAP32[tmPtr + 8 >> 2] = date.getUTCHours();
      HEAP32[tmPtr + 12 >> 2] = date.getUTCDate();
      HEAP32[tmPtr + 16 >> 2] = date.getUTCMonth();
      HEAP32[tmPtr + 20 >> 2] = date.getUTCFullYear() - 1900;
      HEAP32[tmPtr + 24 >> 2] = date.getUTCDay();
      var start = Date.UTC(date.getUTCFullYear(), 0, 1, 0, 0, 0, 0);
      var yday = (date.getTime() - start) / (1e3 * 60 * 60 * 24) | 0;
      HEAP32[tmPtr + 28 >> 2] = yday;
    }
    __name(__gmtime_js, "__gmtime_js");
    var isLeapYear = /* @__PURE__ */ __name((year) => year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0), "isLeapYear");
    var MONTH_DAYS_LEAP_CUMULATIVE = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];
    var MONTH_DAYS_REGULAR_CUMULATIVE = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    var ydayFromDate = /* @__PURE__ */ __name((date) => {
      var leap = isLeapYear(date.getFullYear());
      var monthDaysCumulative = leap ? MONTH_DAYS_LEAP_CUMULATIVE : MONTH_DAYS_REGULAR_CUMULATIVE;
      var yday = monthDaysCumulative[date.getMonth()] + date.getDate() - 1;
      return yday;
    }, "ydayFromDate");
    function __localtime_js(time_low, time_high, tmPtr) {
      var time = convertI32PairToI53Checked(time_low, time_high);
      var date = new Date(time * 1e3);
      HEAP32[tmPtr >> 2] = date.getSeconds();
      HEAP32[tmPtr + 4 >> 2] = date.getMinutes();
      HEAP32[tmPtr + 8 >> 2] = date.getHours();
      HEAP32[tmPtr + 12 >> 2] = date.getDate();
      HEAP32[tmPtr + 16 >> 2] = date.getMonth();
      HEAP32[tmPtr + 20 >> 2] = date.getFullYear() - 1900;
      HEAP32[tmPtr + 24 >> 2] = date.getDay();
      var yday = ydayFromDate(date) | 0;
      HEAP32[tmPtr + 28 >> 2] = yday;
      HEAP32[tmPtr + 36 >> 2] = -(date.getTimezoneOffset() * 60);
      var start = new Date(date.getFullYear(), 0, 1);
      var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
      var winterOffset = start.getTimezoneOffset();
      var dst = (summerOffset != winterOffset && date.getTimezoneOffset() == Math.min(winterOffset, summerOffset)) | 0;
      HEAP32[tmPtr + 32 >> 2] = dst;
    }
    __name(__localtime_js, "__localtime_js");
    var __mktime_js = /* @__PURE__ */ __name(function(tmPtr) {
      var ret = (() => {
        var date = new Date(HEAP32[tmPtr + 20 >> 2] + 1900, HEAP32[tmPtr + 16 >> 2], HEAP32[tmPtr + 12 >> 2], HEAP32[tmPtr + 8 >> 2], HEAP32[tmPtr + 4 >> 2], HEAP32[tmPtr >> 2], 0);
        var dst = HEAP32[tmPtr + 32 >> 2];
        var guessedOffset = date.getTimezoneOffset();
        var start = new Date(date.getFullYear(), 0, 1);
        var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
        var winterOffset = start.getTimezoneOffset();
        var dstOffset = Math.min(winterOffset, summerOffset);
        if (dst < 0) {
          HEAP32[tmPtr + 32 >> 2] = Number(summerOffset != winterOffset && dstOffset == guessedOffset);
        } else if (dst > 0 != (dstOffset == guessedOffset)) {
          var nonDstOffset = Math.max(winterOffset, summerOffset);
          var trueOffset = dst > 0 ? dstOffset : nonDstOffset;
          date.setTime(date.getTime() + (trueOffset - guessedOffset) * 6e4);
        }
        HEAP32[tmPtr + 24 >> 2] = date.getDay();
        var yday = ydayFromDate(date) | 0;
        HEAP32[tmPtr + 28 >> 2] = yday;
        HEAP32[tmPtr >> 2] = date.getSeconds();
        HEAP32[tmPtr + 4 >> 2] = date.getMinutes();
        HEAP32[tmPtr + 8 >> 2] = date.getHours();
        HEAP32[tmPtr + 12 >> 2] = date.getDate();
        HEAP32[tmPtr + 16 >> 2] = date.getMonth();
        HEAP32[tmPtr + 20 >> 2] = date.getYear();
        var timeMs = date.getTime();
        if (isNaN(timeMs)) {
          return -1;
        }
        return timeMs / 1e3;
      })();
      return setTempRet0((tempDouble = ret, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)), ret >>> 0;
    }, "__mktime_js");
    function __mmap_js(len, prot, flags, fd, offset_low, offset_high, allocated, addr) {
      var offset = convertI32PairToI53Checked(offset_low, offset_high);
      try {
        if (isNaN(offset)) return 61;
        var stream = SYSCALLS.getStreamFromFD(fd);
        var res = FS.mmap(stream, len, offset, prot, flags);
        var ptr = res.ptr;
        HEAP32[allocated >> 2] = res.allocated;
        HEAPU32[addr >> 2] = ptr;
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    __name(__mmap_js, "__mmap_js");
    function __munmap_js(addr, len, prot, flags, fd, offset_low, offset_high) {
      var offset = convertI32PairToI53Checked(offset_low, offset_high);
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        if (prot & 2) {
          SYSCALLS.doMsync(addr, stream, len, flags, offset);
        }
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    __name(__munmap_js, "__munmap_js");
    function __pcre2_jit_free_8() {
      abort("missing function: _pcre2_jit_free_8");
    }
    __name(__pcre2_jit_free_8, "__pcre2_jit_free_8");
    __pcre2_jit_free_8.stub = true;
    function __pcre2_jit_get_size_8() {
      abort("missing function: _pcre2_jit_get_size_8");
    }
    __name(__pcre2_jit_get_size_8, "__pcre2_jit_get_size_8");
    __pcre2_jit_get_size_8.stub = true;
    function __pcre2_jit_get_target_8() {
      abort("missing function: _pcre2_jit_get_target_8");
    }
    __name(__pcre2_jit_get_target_8, "__pcre2_jit_get_target_8");
    __pcre2_jit_get_target_8.stub = true;
    var timers = {};
    var handleException = /* @__PURE__ */ __name((e) => {
      if (e instanceof ExitStatus || e == "unwind") {
        return EXITSTATUS;
      }
      quit_(1, e);
    }, "handleException");
    var runtimeKeepaliveCounter = 0;
    var keepRuntimeAlive = /* @__PURE__ */ __name(() => noExitRuntime || runtimeKeepaliveCounter > 0, "keepRuntimeAlive");
    var _proc_exit = /* @__PURE__ */ __name((code) => {
      EXITSTATUS = code;
      if (!keepRuntimeAlive()) {
        Module2["onExit"]?.(code);
        ABORT = true;
      }
      quit_(code, new ExitStatus(code));
    }, "_proc_exit");
    var exitJS = /* @__PURE__ */ __name((status, implicit) => {
      EXITSTATUS = status;
      _proc_exit(status);
    }, "exitJS");
    var _exit = exitJS;
    var maybeExit = /* @__PURE__ */ __name(() => {
      if (!keepRuntimeAlive()) {
        try {
          _exit(EXITSTATUS);
        } catch (e) {
          handleException(e);
        }
      }
    }, "maybeExit");
    var callUserCallback = /* @__PURE__ */ __name((func) => {
      if (ABORT) {
        return;
      }
      try {
        func();
        maybeExit();
      } catch (e) {
        handleException(e);
      }
    }, "callUserCallback");
    var _emscripten_get_now;
    _emscripten_get_now = /* @__PURE__ */ __name(() => performance.now(), "_emscripten_get_now");
    var __setitimer_js = /* @__PURE__ */ __name((which, timeout_ms) => {
      if (timers[which]) {
        clearTimeout(timers[which].id);
        delete timers[which];
      }
      if (!timeout_ms) return 0;
      var id = setTimeout(() => {
        delete timers[which];
        callUserCallback(() => __emscripten_timeout(which, _emscripten_get_now()));
      }, timeout_ms);
      timers[which] = { id, timeout_ms };
      return 0;
    }, "__setitimer_js");
    var __tzset_js = /* @__PURE__ */ __name((timezone, daylight, std_name, dst_name) => {
      var currentYear = (/* @__PURE__ */ new Date()).getFullYear();
      var winter = new Date(currentYear, 0, 1);
      var summer = new Date(currentYear, 6, 1);
      var winterOffset = winter.getTimezoneOffset();
      var summerOffset = summer.getTimezoneOffset();
      var stdTimezoneOffset = Math.max(winterOffset, summerOffset);
      HEAPU32[timezone >> 2] = stdTimezoneOffset * 60;
      HEAP32[daylight >> 2] = Number(winterOffset != summerOffset);
      var extractZone = /* @__PURE__ */ __name((timezoneOffset) => {
        var sign = timezoneOffset >= 0 ? "-" : "+";
        var absOffset = Math.abs(timezoneOffset);
        var hours = String(Math.floor(absOffset / 60)).padStart(2, "0");
        var minutes = String(absOffset % 60).padStart(2, "0");
        return `UTC${sign}${hours}${minutes}`;
      }, "extractZone");
      var winterName = extractZone(winterOffset);
      var summerName = extractZone(summerOffset);
      if (summerOffset < winterOffset) {
        stringToUTF8(winterName, std_name, 17);
        stringToUTF8(summerName, dst_name, 17);
      } else {
        stringToUTF8(winterName, dst_name, 17);
        stringToUTF8(summerName, std_name, 17);
      }
    }, "__tzset_js");
    var _emscripten_date_now = /* @__PURE__ */ __name(() => Date.now(), "_emscripten_date_now");
    var getHeapMax = /* @__PURE__ */ __name(() => 2147483648, "getHeapMax");
    var _emscripten_get_heap_max = /* @__PURE__ */ __name(() => getHeapMax(), "_emscripten_get_heap_max");
    var growMemory = /* @__PURE__ */ __name((size) => {
      var b = wasmMemory.buffer;
      var pages = (size - b.byteLength + 65535) / 65536;
      try {
        wasmMemory.grow(pages);
        updateMemoryViews();
        return 1;
      } catch (e) {
      }
    }, "growMemory");
    var _emscripten_resize_heap = /* @__PURE__ */ __name((requestedSize) => {
      var oldSize = HEAPU8.length;
      requestedSize >>>= 0;
      var maxHeapSize = getHeapMax();
      if (requestedSize > maxHeapSize) {
        return false;
      }
      for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
        var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown);
        overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
        var newSize = Math.min(maxHeapSize, alignMemory(Math.max(requestedSize, overGrownHeapSize), 65536));
        var replacement = growMemory(newSize);
        if (replacement) {
          return true;
        }
      }
      return false;
    }, "_emscripten_resize_heap");
    var ENV = {};
    var getExecutableName = /* @__PURE__ */ __name(() => thisProgram || "./this.program", "getExecutableName");
    var getEnvStrings = /* @__PURE__ */ __name(() => {
      if (!getEnvStrings.strings) {
        var lang = (typeof navigator == "object" && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8";
        var env = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: lang, _: getExecutableName() };
        for (var x in ENV) {
          if (ENV[x] === void 0) delete env[x];
          else env[x] = ENV[x];
        }
        var strings = [];
        for (var x in env) {
          strings.push(`${x}=${env[x]}`);
        }
        getEnvStrings.strings = strings;
      }
      return getEnvStrings.strings;
    }, "getEnvStrings");
    var stringToAscii = /* @__PURE__ */ __name((str, buffer) => {
      for (var i = 0; i < str.length; ++i) {
        HEAP8[buffer++] = str.charCodeAt(i);
      }
      HEAP8[buffer] = 0;
    }, "stringToAscii");
    var _environ_get = /* @__PURE__ */ __name((__environ, environ_buf) => {
      var bufSize = 0;
      getEnvStrings().forEach((string, i) => {
        var ptr = environ_buf + bufSize;
        HEAPU32[__environ + i * 4 >> 2] = ptr;
        stringToAscii(string, ptr);
        bufSize += string.length + 1;
      });
      return 0;
    }, "_environ_get");
    var _environ_sizes_get = /* @__PURE__ */ __name((penviron_count, penviron_buf_size) => {
      var strings = getEnvStrings();
      HEAPU32[penviron_count >> 2] = strings.length;
      var bufSize = 0;
      strings.forEach((string) => bufSize += string.length + 1);
      HEAPU32[penviron_buf_size >> 2] = bufSize;
      return 0;
    }, "_environ_sizes_get");
    function _fd_close(fd) {
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        FS.close(stream);
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return e.errno;
      }
    }
    __name(_fd_close, "_fd_close");
    function _fd_fdstat_get(fd, pbuf) {
      try {
        var rightsBase = 0;
        var rightsInheriting = 0;
        var flags = 0;
        {
          var stream = SYSCALLS.getStreamFromFD(fd);
          var type = stream.tty ? 2 : FS.isDir(stream.mode) ? 3 : FS.isLink(stream.mode) ? 7 : 4;
        }
        HEAP8[pbuf] = type;
        HEAP16[pbuf + 2 >> 1] = flags;
        tempI64 = [rightsBase >>> 0, (tempDouble = rightsBase, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[pbuf + 8 >> 2] = tempI64[0], HEAP32[pbuf + 12 >> 2] = tempI64[1];
        tempI64 = [rightsInheriting >>> 0, (tempDouble = rightsInheriting, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[pbuf + 16 >> 2] = tempI64[0], HEAP32[pbuf + 20 >> 2] = tempI64[1];
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return e.errno;
      }
    }
    __name(_fd_fdstat_get, "_fd_fdstat_get");
    var doReadv = /* @__PURE__ */ __name((stream, iov, iovcnt, offset) => {
      var ret = 0;
      for (var i = 0; i < iovcnt; i++) {
        var ptr = HEAPU32[iov >> 2];
        var len = HEAPU32[iov + 4 >> 2];
        iov += 8;
        var curr = FS.read(stream, HEAP8, ptr, len, offset);
        if (curr < 0) return -1;
        ret += curr;
        if (curr < len) break;
        if (typeof offset != "undefined") {
          offset += curr;
        }
      }
      return ret;
    }, "doReadv");
    function _fd_read(fd, iov, iovcnt, pnum) {
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        var num = doReadv(stream, iov, iovcnt);
        HEAPU32[pnum >> 2] = num;
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return e.errno;
      }
    }
    __name(_fd_read, "_fd_read");
    function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
      var offset = convertI32PairToI53Checked(offset_low, offset_high);
      try {
        if (isNaN(offset)) return 61;
        var stream = SYSCALLS.getStreamFromFD(fd);
        FS.llseek(stream, offset, whence);
        tempI64 = [stream.position >>> 0, (tempDouble = stream.position, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[newOffset >> 2] = tempI64[0], HEAP32[newOffset + 4 >> 2] = tempI64[1];
        if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null;
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return e.errno;
      }
    }
    __name(_fd_seek, "_fd_seek");
    function _fd_sync(fd) {
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        if (stream.stream_ops?.fsync) {
          return stream.stream_ops.fsync(stream);
        }
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return e.errno;
      }
    }
    __name(_fd_sync, "_fd_sync");
    var doWritev = /* @__PURE__ */ __name((stream, iov, iovcnt, offset) => {
      var ret = 0;
      for (var i = 0; i < iovcnt; i++) {
        var ptr = HEAPU32[iov >> 2];
        var len = HEAPU32[iov + 4 >> 2];
        iov += 8;
        var curr = FS.write(stream, HEAP8, ptr, len, offset);
        if (curr < 0) return -1;
        ret += curr;
        if (curr < len) {
          break;
        }
        if (typeof offset != "undefined") {
          offset += curr;
        }
      }
      return ret;
    }, "doWritev");
    function _fd_write(fd, iov, iovcnt, pnum) {
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        var num = doWritev(stream, iov, iovcnt);
        HEAPU32[pnum >> 2] = num;
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return e.errno;
      }
    }
    __name(_fd_write, "_fd_write");
    function _ftok() {
      abort("missing function: ftok");
    }
    __name(_ftok, "_ftok");
    _ftok.stub = true;
    function _getcontext() {
      abort("missing function: getcontext");
    }
    __name(_getcontext, "_getcontext");
    _getcontext.stub = true;
    function _getdtablesize() {
      abort("missing function: getdtablesize");
    }
    __name(_getdtablesize, "_getdtablesize");
    _getdtablesize.stub = true;
    var _getnameinfo = /* @__PURE__ */ __name((sa, salen, node, nodelen, serv, servlen, flags) => {
      var info = readSockaddr(sa, salen);
      if (info.errno) {
        return -6;
      }
      var port = info.port;
      var addr = info.addr;
      var overflowed = false;
      if (node && nodelen) {
        var lookup;
        if (flags & 1 || !(lookup = DNS.lookup_addr(addr))) {
          if (flags & 8) {
            return -2;
          }
        } else {
          addr = lookup;
        }
        var numBytesWrittenExclNull = stringToUTF8(addr, node, nodelen);
        if (numBytesWrittenExclNull + 1 >= nodelen) {
          overflowed = true;
        }
      }
      if (serv && servlen) {
        port = "" + port;
        var numBytesWrittenExclNull = stringToUTF8(port, serv, servlen);
        if (numBytesWrittenExclNull + 1 >= servlen) {
          overflowed = true;
        }
      }
      if (overflowed) {
        return -12;
      }
      return 0;
    }, "_getnameinfo");
    var Protocols = { list: [], map: {} };
    var _setprotoent = /* @__PURE__ */ __name((stayopen) => {
      function allocprotoent(name, proto, aliases) {
        var nameBuf = _malloc(name.length + 1);
        stringToAscii(name, nameBuf);
        var j = 0;
        var length = aliases.length;
        var aliasListBuf = _malloc((length + 1) * 4);
        for (var i = 0; i < length; i++, j += 4) {
          var alias = aliases[i];
          var aliasBuf = _malloc(alias.length + 1);
          stringToAscii(alias, aliasBuf);
          HEAPU32[aliasListBuf + j >> 2] = aliasBuf;
        }
        HEAPU32[aliasListBuf + j >> 2] = 0;
        var pe = _malloc(12);
        HEAPU32[pe >> 2] = nameBuf;
        HEAPU32[pe + 4 >> 2] = aliasListBuf;
        HEAP32[pe + 8 >> 2] = proto;
        return pe;
      }
      __name(allocprotoent, "allocprotoent");
      var list = Protocols.list;
      var map = Protocols.map;
      if (list.length === 0) {
        var entry = allocprotoent("tcp", 6, ["TCP"]);
        list.push(entry);
        map["tcp"] = map["6"] = entry;
        entry = allocprotoent("udp", 17, ["UDP"]);
        list.push(entry);
        map["udp"] = map["17"] = entry;
      }
      _setprotoent.index = 0;
    }, "_setprotoent");
    var _getprotobyname = /* @__PURE__ */ __name((name) => {
      name = UTF8ToString(name);
      _setprotoent(true);
      var result = Protocols.map[name];
      return result;
    }, "_getprotobyname");
    var _getprotobynumber = /* @__PURE__ */ __name((number) => {
      _setprotoent(true);
      var result = Protocols.map[number];
      return result;
    }, "_getprotobynumber");
    function _makecontext() {
      abort("missing function: makecontext");
    }
    __name(_makecontext, "_makecontext");
    _makecontext.stub = true;
    function _php_pcre2_jit_match() {
      abort("missing function: php_pcre2_jit_match");
    }
    __name(_php_pcre2_jit_match, "_php_pcre2_jit_match");
    _php_pcre2_jit_match.stub = true;
    function _posix_spawnp() {
      abort("missing function: posix_spawnp");
    }
    __name(_posix_spawnp, "_posix_spawnp");
    _posix_spawnp.stub = true;
    var arraySum = /* @__PURE__ */ __name((array, index) => {
      var sum = 0;
      for (var i = 0; i <= index; sum += array[i++]) {
      }
      return sum;
    }, "arraySum");
    var MONTH_DAYS_LEAP = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var MONTH_DAYS_REGULAR = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var addDays = /* @__PURE__ */ __name((date, days) => {
      var newDate = new Date(date.getTime());
      while (days > 0) {
        var leap = isLeapYear(newDate.getFullYear());
        var currentMonth = newDate.getMonth();
        var daysInCurrentMonth = (leap ? MONTH_DAYS_LEAP : MONTH_DAYS_REGULAR)[currentMonth];
        if (days > daysInCurrentMonth - newDate.getDate()) {
          days -= daysInCurrentMonth - newDate.getDate() + 1;
          newDate.setDate(1);
          if (currentMonth < 11) {
            newDate.setMonth(currentMonth + 1);
          } else {
            newDate.setMonth(0);
            newDate.setFullYear(newDate.getFullYear() + 1);
          }
        } else {
          newDate.setDate(newDate.getDate() + days);
          return newDate;
        }
      }
      return newDate;
    }, "addDays");
    var _strptime = /* @__PURE__ */ __name((buf, format, tm) => {
      var pattern = UTF8ToString(format);
      var SPECIAL_CHARS = "\\!@#$^&*()+=-[]/{}|:<>?,.";
      for (var i = 0, ii = SPECIAL_CHARS.length; i < ii; ++i) {
        pattern = pattern.replace(new RegExp("\\" + SPECIAL_CHARS[i], "g"), "\\" + SPECIAL_CHARS[i]);
      }
      var EQUIVALENT_MATCHERS = { A: "%a", B: "%b", c: "%a %b %d %H:%M:%S %Y", D: "%m\\/%d\\/%y", e: "%d", F: "%Y-%m-%d", h: "%b", R: "%H\\:%M", r: "%I\\:%M\\:%S\\s%p", T: "%H\\:%M\\:%S", x: "%m\\/%d\\/(?:%y|%Y)", X: "%H\\:%M\\:%S" };
      var DATE_PATTERNS = { a: "(?:Sun(?:day)?)|(?:Mon(?:day)?)|(?:Tue(?:sday)?)|(?:Wed(?:nesday)?)|(?:Thu(?:rsday)?)|(?:Fri(?:day)?)|(?:Sat(?:urday)?)", b: "(?:Jan(?:uary)?)|(?:Feb(?:ruary)?)|(?:Mar(?:ch)?)|(?:Apr(?:il)?)|May|(?:Jun(?:e)?)|(?:Jul(?:y)?)|(?:Aug(?:ust)?)|(?:Sep(?:tember)?)|(?:Oct(?:ober)?)|(?:Nov(?:ember)?)|(?:Dec(?:ember)?)", C: "\\d\\d", d: "0[1-9]|[1-9](?!\\d)|1\\d|2\\d|30|31", H: "\\d(?!\\d)|[0,1]\\d|20|21|22|23", I: "\\d(?!\\d)|0\\d|10|11|12", j: "00[1-9]|0?[1-9](?!\\d)|0?[1-9]\\d(?!\\d)|[1,2]\\d\\d|3[0-6]\\d", m: "0[1-9]|[1-9](?!\\d)|10|11|12", M: "0\\d|\\d(?!\\d)|[1-5]\\d", n: " ", p: "AM|am|PM|pm|A\\.M\\.|a\\.m\\.|P\\.M\\.|p\\.m\\.", S: "0\\d|\\d(?!\\d)|[1-5]\\d|60", U: "0\\d|\\d(?!\\d)|[1-4]\\d|50|51|52|53", W: "0\\d|\\d(?!\\d)|[1-4]\\d|50|51|52|53", w: "[0-6]", y: "\\d\\d", Y: "\\d\\d\\d\\d", t: " ", z: "Z|(?:[\\+\\-]\\d\\d:?(?:\\d\\d)?)" };
      var MONTH_NUMBERS = { JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5, JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11 };
      var DAY_NUMBERS_SUN_FIRST = { SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6 };
      var DAY_NUMBERS_MON_FIRST = { MON: 0, TUE: 1, WED: 2, THU: 3, FRI: 4, SAT: 5, SUN: 6 };
      var capture = [];
      var pattern_out = pattern.replace(/%(.)/g, (m, c) => EQUIVALENT_MATCHERS[c] || m).replace(/%(.)/g, (_, c) => {
        let pat = DATE_PATTERNS[c];
        if (pat) {
          capture.push(c);
          return `(${pat})`;
        } else {
          return c;
        }
      }).replace(/\s+/g, "\\s*");
      var matches = new RegExp("^" + pattern_out, "i").exec(UTF8ToString(buf));
      function initDate() {
        function fixup(value2, min, max) {
          return typeof value2 != "number" || isNaN(value2) ? min : value2 >= min ? value2 <= max ? value2 : max : min;
        }
        __name(fixup, "fixup");
        return { year: fixup(HEAP32[tm + 20 >> 2] + 1900, 1970, 9999), month: fixup(HEAP32[tm + 16 >> 2], 0, 11), day: fixup(HEAP32[tm + 12 >> 2], 1, 31), hour: fixup(HEAP32[tm + 8 >> 2], 0, 23), min: fixup(HEAP32[tm + 4 >> 2], 0, 59), sec: fixup(HEAP32[tm >> 2], 0, 59), gmtoff: 0 };
      }
      __name(initDate, "initDate");
      if (matches) {
        var date = initDate();
        var value;
        var getMatch = /* @__PURE__ */ __name((symbol) => {
          var pos = capture.indexOf(symbol);
          if (pos >= 0) {
            return matches[pos + 1];
          }
          return;
        }, "getMatch");
        if (value = getMatch("S")) {
          date.sec = jstoi_q(value);
        }
        if (value = getMatch("M")) {
          date.min = jstoi_q(value);
        }
        if (value = getMatch("H")) {
          date.hour = jstoi_q(value);
        } else if (value = getMatch("I")) {
          var hour = jstoi_q(value);
          if (value = getMatch("p")) {
            hour += value.toUpperCase()[0] === "P" ? 12 : 0;
          }
          date.hour = hour;
        }
        if (value = getMatch("Y")) {
          date.year = jstoi_q(value);
        } else if (value = getMatch("y")) {
          var year = jstoi_q(value);
          if (value = getMatch("C")) {
            year += jstoi_q(value) * 100;
          } else {
            year += year < 69 ? 2e3 : 1900;
          }
          date.year = year;
        }
        if (value = getMatch("m")) {
          date.month = jstoi_q(value) - 1;
        } else if (value = getMatch("b")) {
          date.month = MONTH_NUMBERS[value.substring(0, 3).toUpperCase()] || 0;
        }
        if (value = getMatch("d")) {
          date.day = jstoi_q(value);
        } else if (value = getMatch("j")) {
          var day = jstoi_q(value);
          var leapYear = isLeapYear(date.year);
          for (var month = 0; month < 12; ++month) {
            var daysUntilMonth = arraySum(leapYear ? MONTH_DAYS_LEAP : MONTH_DAYS_REGULAR, month - 1);
            if (day <= daysUntilMonth + (leapYear ? MONTH_DAYS_LEAP : MONTH_DAYS_REGULAR)[month]) {
              date.day = day - daysUntilMonth;
            }
          }
        } else if (value = getMatch("a")) {
          var weekDay = value.substring(0, 3).toUpperCase();
          if (value = getMatch("U")) {
            var weekDayNumber = DAY_NUMBERS_SUN_FIRST[weekDay];
            var weekNumber = jstoi_q(value);
            var janFirst = new Date(date.year, 0, 1);
            var endDate;
            if (janFirst.getDay() === 0) {
              endDate = addDays(janFirst, weekDayNumber + 7 * (weekNumber - 1));
            } else {
              endDate = addDays(janFirst, 7 - janFirst.getDay() + weekDayNumber + 7 * (weekNumber - 1));
            }
            date.day = endDate.getDate();
            date.month = endDate.getMonth();
          } else if (value = getMatch("W")) {
            var weekDayNumber = DAY_NUMBERS_MON_FIRST[weekDay];
            var weekNumber = jstoi_q(value);
            var janFirst = new Date(date.year, 0, 1);
            var endDate;
            if (janFirst.getDay() === 1) {
              endDate = addDays(janFirst, weekDayNumber + 7 * (weekNumber - 1));
            } else {
              endDate = addDays(janFirst, 7 - janFirst.getDay() + 1 + weekDayNumber + 7 * (weekNumber - 1));
            }
            date.day = endDate.getDate();
            date.month = endDate.getMonth();
          }
        }
        if (value = getMatch("z")) {
          if (value.toLowerCase() === "z") {
            date.gmtoff = 0;
          } else {
            var match = value.match(/^((?:\-|\+)\d\d):?(\d\d)?/);
            date.gmtoff = match[1] * 3600;
            if (match[2]) {
              date.gmtoff += date.gmtoff > 0 ? match[2] * 60 : -match[2] * 60;
            }
          }
        }
        var fullDate = new Date(date.year, date.month, date.day, date.hour, date.min, date.sec, 0);
        HEAP32[tm >> 2] = fullDate.getSeconds();
        HEAP32[tm + 4 >> 2] = fullDate.getMinutes();
        HEAP32[tm + 8 >> 2] = fullDate.getHours();
        HEAP32[tm + 12 >> 2] = fullDate.getDate();
        HEAP32[tm + 16 >> 2] = fullDate.getMonth();
        HEAP32[tm + 20 >> 2] = fullDate.getFullYear() - 1900;
        HEAP32[tm + 24 >> 2] = fullDate.getDay();
        HEAP32[tm + 28 >> 2] = arraySum(isLeapYear(fullDate.getFullYear()) ? MONTH_DAYS_LEAP : MONTH_DAYS_REGULAR, fullDate.getMonth() - 1) + fullDate.getDate() - 1;
        HEAP32[tm + 32 >> 2] = 0;
        HEAP32[tm + 36 >> 2] = date.gmtoff;
        return buf + intArrayFromString(matches[0]).length - 1;
      }
      return 0;
    }, "_strptime");
    function _swapcontext() {
      abort("missing function: swapcontext");
    }
    __name(_swapcontext, "_swapcontext");
    _swapcontext.stub = true;
    function _zif_dns_check_record() {
      abort("missing function: zif_dns_check_record");
    }
    __name(_zif_dns_check_record, "_zif_dns_check_record");
    _zif_dns_check_record.stub = true;
    function _zif_dns_get_mx() {
      abort("missing function: zif_dns_get_mx");
    }
    __name(_zif_dns_get_mx, "_zif_dns_get_mx");
    _zif_dns_get_mx.stub = true;
    function _zif_dns_get_record() {
      abort("missing function: zif_dns_get_record");
    }
    __name(_zif_dns_get_record, "_zif_dns_get_record");
    _zif_dns_get_record.stub = true;
    function _zif_gethostbyaddr() {
      abort("missing function: zif_gethostbyaddr");
    }
    __name(_zif_gethostbyaddr, "_zif_gethostbyaddr");
    _zif_gethostbyaddr.stub = true;
    function _zif_gethostbyname() {
      abort("missing function: zif_gethostbyname");
    }
    __name(_zif_gethostbyname, "_zif_gethostbyname");
    _zif_gethostbyname.stub = true;
    function _zif_gethostbynamel() {
      abort("missing function: zif_gethostbynamel");
    }
    __name(_zif_gethostbynamel, "_zif_gethostbynamel");
    _zif_gethostbynamel.stub = true;
    function _zif_gethostname() {
      abort("missing function: zif_gethostname");
    }
    __name(_zif_gethostname, "_zif_gethostname");
    _zif_gethostname.stub = true;
    var stackAlloc = /* @__PURE__ */ __name((sz) => __emscripten_stack_alloc(sz), "stackAlloc");
    var stringToUTF8OnStack = /* @__PURE__ */ __name((str) => {
      var size = lengthBytesUTF8(str) + 1;
      var ret = stackAlloc(size);
      stringToUTF8(str, ret, size);
      return ret;
    }, "stringToUTF8OnStack");
    FS.createPreloadedFile = FS_createPreloadedFile;
    FS.staticInit();
    var wasmImports = { l: ___assert_fail, ea: ___call_sighandler, $: ___syscall__newselect, S: ___syscall_accept4, R: ___syscall_bind, wa: ___syscall_chdir, va: ___syscall_chmod, Q: ___syscall_connect, ua: ___syscall_dup, xa: ___syscall_faccessat, A: ___syscall_fchownat, j: ___syscall_fcntl64, ra: ___syscall_fdatasync, qa: ___syscall_fstat64, H: ___syscall_ftruncate64, la: ___syscall_getcwd, da: ___syscall_getdents64, N: ___syscall_getpeername, M: ___syscall_getsockname, L: ___syscall_getsockopt, u: ___syscall_ioctl, K: ___syscall_listen, na: ___syscall_lstat64, ja: ___syscall_mkdirat, oa: ___syscall_newfstatat, r: ___syscall_openat, ia: ___syscall_pipe, ga: ___syscall_poll, ca: ___syscall_readlinkat, J: ___syscall_recvfrom, ba: ___syscall_renameat, aa: ___syscall_rmdir, I: ___syscall_sendto, y: ___syscall_socket, pa: ___syscall_stat64, _: ___syscall_statfs64, Y: ___syscall_symlink, W: ___syscall_unlinkat, V: ___syscall_utimensat, ya: __abort_js, sa: __emscripten_get_now_is_monotonic, P: __emscripten_lookup_name, ta: __emscripten_memcpy_js, fa: __emscripten_runtime_keepalive_clear, T: __emscripten_throw_longjmp, Va: __gmtime_js, Wa: __localtime_js, F: __mktime_js, Ta: __mmap_js, Ua: __munmap_js, E: __pcre2_jit_free_8, Da: __pcre2_jit_get_size_8, C: __pcre2_jit_get_target_8, z: __setitimer_js, Aa: __tzset_js, s: _emscripten_date_now, X: _emscripten_get_heap_max, o: _emscripten_get_now, U: _emscripten_resize_heap, Ba: _environ_get, Ca: _environ_sizes_get, q: _exit, n: _fd_close, ka: _fd_fdstat_get, B: _fd_read, G: _fd_seek, ma: _fd_sync, t: _fd_write, Ma: _ftok, Ha: _getcontext, La: _getdtablesize, D: _getnameinfo, ha: _getprotobyname, Z: _getprotobynumber, k: invoke_i, f: invoke_ii, b: invoke_iii, h: invoke_iiii, i: invoke_iiiii, p: invoke_iiiiii, w: invoke_iiiiiii, v: invoke_iiiiiiii, Ia: invoke_iiiiiiiiii, c: invoke_v, a: invoke_vi, g: invoke_vii, x: invoke_viidii, e: invoke_viii, m: invoke_viiii, d: invoke_viiiii, Ea: invoke_viiiiiii, Ga: _makecontext, Ja: _php_pcre2_jit_match, Ka: _posix_spawnp, za: _proc_exit, Na: _strptime, Fa: _swapcontext, Qa: _zif_dns_check_record, Oa: _zif_dns_get_mx, Pa: _zif_dns_get_record, Xa: _zif_gethostbyaddr, Sa: _zif_gethostbyname, Ra: _zif_gethostbynamel, O: _zif_gethostname };
    var wasmExports = createWasm();
    var ___wasm_call_ctors = /* @__PURE__ */ __name(() => (___wasm_call_ctors = wasmExports["Za"])(), "___wasm_call_ctors");
    var _php_time = Module2["_php_time"] = () => (_php_time = Module2["_php_time"] = wasmExports["_a"])();
    var _php_date_get_date_ce = Module2["_php_date_get_date_ce"] = () => (_php_date_get_date_ce = Module2["_php_date_get_date_ce"] = wasmExports["$a"])();
    var _php_date_get_immutable_ce = Module2["_php_date_get_immutable_ce"] = () => (_php_date_get_immutable_ce = Module2["_php_date_get_immutable_ce"] = wasmExports["ab"])();
    var _php_date_get_interface_ce = Module2["_php_date_get_interface_ce"] = () => (_php_date_get_interface_ce = Module2["_php_date_get_interface_ce"] = wasmExports["bb"])();
    var _php_date_get_timezone_ce = Module2["_php_date_get_timezone_ce"] = () => (_php_date_get_timezone_ce = Module2["_php_date_get_timezone_ce"] = wasmExports["cb"])();
    var _php_date_get_interval_ce = Module2["_php_date_get_interval_ce"] = () => (_php_date_get_interval_ce = Module2["_php_date_get_interval_ce"] = wasmExports["db"])();
    var _php_date_get_period_ce = Module2["_php_date_get_period_ce"] = () => (_php_date_get_period_ce = Module2["_php_date_get_period_ce"] = wasmExports["eb"])();
    var _zend_register_ini_entries_ex = Module2["_zend_register_ini_entries_ex"] = (a0, a1, a2) => (_zend_register_ini_entries_ex = Module2["_zend_register_ini_entries_ex"] = wasmExports["fb"])(a0, a1, a2);
    var _zend_register_internal_interface = Module2["_zend_register_internal_interface"] = (a0) => (_zend_register_internal_interface = Module2["_zend_register_internal_interface"] = wasmExports["hb"])(a0);
    var ___zend_malloc = Module2["___zend_malloc"] = (a0) => (___zend_malloc = Module2["___zend_malloc"] = wasmExports["ib"])(a0);
    var _zend_declare_typed_class_constant = Module2["_zend_declare_typed_class_constant"] = (a0, a1, a2, a3, a4, a5) => (_zend_declare_typed_class_constant = Module2["_zend_declare_typed_class_constant"] = wasmExports["jb"])(a0, a1, a2, a3, a4, a5);
    var __efree = Module2["__efree"] = (a0) => (__efree = Module2["__efree"] = wasmExports["kb"])(a0);
    var _zend_register_internal_class_with_flags = Module2["_zend_register_internal_class_with_flags"] = (a0, a1, a2) => (_zend_register_internal_class_with_flags = Module2["_zend_register_internal_class_with_flags"] = wasmExports["lb"])(a0, a1, a2);
    var _zend_class_implements = Module2["_zend_class_implements"] = (a0, a1, a2) => (_zend_class_implements = Module2["_zend_class_implements"] = wasmExports["mb"])(a0, a1, a2);
    var _zend_declare_typed_property = Module2["_zend_declare_typed_property"] = (a0, a1, a2, a3, a4, a5) => (_zend_declare_typed_property = Module2["_zend_declare_typed_property"] = wasmExports["nb"])(a0, a1, a2, a3, a4, a5);
    var _zend_register_string_constant = Module2["_zend_register_string_constant"] = (a0, a1, a2, a3, a4) => (_zend_register_string_constant = Module2["_zend_register_string_constant"] = wasmExports["ob"])(a0, a1, a2, a3, a4);
    var _zend_register_long_constant = Module2["_zend_register_long_constant"] = (a0, a1, a2, a3, a4) => (_zend_register_long_constant = Module2["_zend_register_long_constant"] = wasmExports["pb"])(a0, a1, a2, a3, a4);
    var _zend_hash_str_find = Module2["_zend_hash_str_find"] = (a0, a1, a2) => (_zend_hash_str_find = Module2["_zend_hash_str_find"] = wasmExports["qb"])(a0, a1, a2);
    var _zend_add_attribute = Module2["_zend_add_attribute"] = (a0, a1, a2, a3, a4, a5) => (_zend_add_attribute = Module2["_zend_add_attribute"] = wasmExports["rb"])(a0, a1, a2, a3, a4, a5);
    var _zend_unregister_ini_entries_ex = Module2["_zend_unregister_ini_entries_ex"] = (a0, a1) => (_zend_unregister_ini_entries_ex = Module2["_zend_unregister_ini_entries_ex"] = wasmExports["sb"])(a0, a1);
    var _php_info_print_table_start = Module2["_php_info_print_table_start"] = () => (_php_info_print_table_start = Module2["_php_info_print_table_start"] = wasmExports["tb"])();
    var _php_info_print_table_row = Module2["_php_info_print_table_row"] = (a0, a1) => (_php_info_print_table_row = Module2["_php_info_print_table_row"] = wasmExports["ub"])(a0, a1);
    var _cfg_get_entry = Module2["_cfg_get_entry"] = (a0, a1) => (_cfg_get_entry = Module2["_cfg_get_entry"] = wasmExports["vb"])(a0, a1);
    var _php_info_print_table_end = Module2["_php_info_print_table_end"] = () => (_php_info_print_table_end = Module2["_php_info_print_table_end"] = wasmExports["wb"])();
    var _display_ini_entries = Module2["_display_ini_entries"] = (a0) => (_display_ini_entries = Module2["_display_ini_entries"] = wasmExports["xb"])(a0);
    var _zend_hash_destroy = Module2["_zend_hash_destroy"] = (a0) => (_zend_hash_destroy = Module2["_zend_hash_destroy"] = wasmExports["yb"])(a0);
    var __efree_48 = Module2["__efree_48"] = (a0) => (__efree_48 = Module2["__efree_48"] = wasmExports["zb"])(a0);
    var _get_timezone_info = Module2["_get_timezone_info"] = () => (_get_timezone_info = Module2["_get_timezone_info"] = wasmExports["Ab"])();
    var _zend_throw_error = Module2["_zend_throw_error"] = (a0, a1, a2) => (_zend_throw_error = Module2["_zend_throw_error"] = wasmExports["Bb"])(a0, a1, a2);
    var __emalloc_48 = Module2["__emalloc_48"] = () => (__emalloc_48 = Module2["__emalloc_48"] = wasmExports["Cb"])();
    var __zend_hash_init = Module2["__zend_hash_init"] = (a0, a1, a2, a3) => (__zend_hash_init = Module2["__zend_hash_init"] = wasmExports["Db"])(a0, a1, a2, a3);
    var _zend_hash_str_add = Module2["_zend_hash_str_add"] = (a0, a1, a2, a3) => (_zend_hash_str_add = Module2["_zend_hash_str_add"] = wasmExports["Eb"])(a0, a1, a2, a3);
    var _php_format_date_obj = Module2["_php_format_date_obj"] = (a0, a1, a2) => (_php_format_date_obj = Module2["_php_format_date_obj"] = wasmExports["Fb"])(a0, a1, a2);
    var __estrdup = Module2["__estrdup"] = (a0) => (__estrdup = Module2["__estrdup"] = wasmExports["Gb"])(a0);
    var __emalloc_16 = Module2["__emalloc_16"] = () => (__emalloc_16 = Module2["__emalloc_16"] = wasmExports["Hb"])();
    var _ap_php_snprintf = Module2["_ap_php_snprintf"] = (a0, a1, a2, a3) => (_ap_php_snprintf = Module2["_ap_php_snprintf"] = wasmExports["Ib"])(a0, a1, a2, a3);
    var _ap_php_slprintf = Module2["_ap_php_slprintf"] = (a0, a1, a2, a3) => (_ap_php_slprintf = Module2["_ap_php_slprintf"] = wasmExports["Jb"])(a0, a1, a2, a3);
    var _smart_str_erealloc = Module2["_smart_str_erealloc"] = (a0, a1) => (_smart_str_erealloc = Module2["_smart_str_erealloc"] = wasmExports["Kb"])(a0, a1);
    var _php_format_date = Module2["_php_format_date"] = (a0, a1, a2, a3, a4) => (_php_format_date = Module2["_php_format_date"] = wasmExports["Lb"])(a0, a1, a2, a3, a4);
    var _php_idate = Module2["_php_idate"] = (a0, a1, a2, a3) => (_php_idate = Module2["_php_idate"] = wasmExports["Mb"])(a0, a1, a2, a3);
    var _zend_wrong_parameters_count_error = Module2["_zend_wrong_parameters_count_error"] = (a0, a1) => (_zend_wrong_parameters_count_error = Module2["_zend_wrong_parameters_count_error"] = wasmExports["Nb"])(a0, a1);
    var _zend_parse_arg_str_slow = Module2["_zend_parse_arg_str_slow"] = (a0, a1, a2) => (_zend_parse_arg_str_slow = Module2["_zend_parse_arg_str_slow"] = wasmExports["Ob"])(a0, a1, a2);
    var _zend_parse_arg_long_slow = Module2["_zend_parse_arg_long_slow"] = (a0, a1, a2) => (_zend_parse_arg_long_slow = Module2["_zend_parse_arg_long_slow"] = wasmExports["Pb"])(a0, a1, a2);
    var _zend_wrong_parameter_error = Module2["_zend_wrong_parameter_error"] = (a0, a1, a2, a3, a4) => (_zend_wrong_parameter_error = Module2["_zend_wrong_parameter_error"] = wasmExports["Qb"])(a0, a1, a2, a3, a4);
    var _php_error_docref = Module2["_php_error_docref"] = (a0, a1, a2, a3) => (_php_error_docref = Module2["_php_error_docref"] = wasmExports["Rb"])(a0, a1, a2, a3);
    var _php_date_set_tzdb = Module2["_php_date_set_tzdb"] = (a0) => (_php_date_set_tzdb = Module2["_php_date_set_tzdb"] = wasmExports["Sb"])(a0);
    var _php_version_compare = Module2["_php_version_compare"] = (a0, a1) => (_php_version_compare = Module2["_php_version_compare"] = wasmExports["Tb"])(a0, a1);
    var _php_parse_date = Module2["_php_parse_date"] = (a0, a1) => (_php_parse_date = Module2["_php_parse_date"] = wasmExports["Ub"])(a0, a1);
    var _php_mktime = Module2["_php_mktime"] = (a0, a1, a2) => (_php_mktime = Module2["_php_mktime"] = wasmExports["Vb"])(a0, a1, a2);
    var _php_strftime = Module2["_php_strftime"] = (a0, a1, a2) => (_php_strftime = Module2["_php_strftime"] = wasmExports["Wb"])(a0, a1, a2);
    var __emalloc_320 = Module2["__emalloc_320"] = () => (__emalloc_320 = Module2["__emalloc_320"] = wasmExports["Xb"])();
    var __erealloc = Module2["__erealloc"] = (a0, a1) => (__erealloc = Module2["__erealloc"] = wasmExports["Yb"])(a0, a1);
    var __emalloc = Module2["__emalloc"] = (a0) => (__emalloc = Module2["__emalloc"] = wasmExports["Zb"])(a0);
    var _zend_wrong_parameters_none_error = Module2["_zend_wrong_parameters_none_error"] = () => (_zend_wrong_parameters_none_error = Module2["_zend_wrong_parameters_none_error"] = wasmExports["_b"])();
    var _zend_parse_arg_bool_slow = Module2["_zend_parse_arg_bool_slow"] = (a0, a1, a2) => (_zend_parse_arg_bool_slow = Module2["_zend_parse_arg_bool_slow"] = wasmExports["$b"])(a0, a1, a2);
    var __zend_new_array_0 = Module2["__zend_new_array_0"] = () => (__zend_new_array_0 = Module2["__zend_new_array_0"] = wasmExports["ac"])();
    var _add_assoc_long_ex = Module2["_add_assoc_long_ex"] = (a0, a1, a2, a3) => (_add_assoc_long_ex = Module2["_add_assoc_long_ex"] = wasmExports["bc"])(a0, a1, a2, a3);
    var _add_next_index_long = Module2["_add_next_index_long"] = (a0, a1) => (_add_next_index_long = Module2["_add_next_index_long"] = wasmExports["cc"])(a0, a1);
    var _add_assoc_string_ex = Module2["_add_assoc_string_ex"] = (a0, a1, a2, a3) => (_add_assoc_string_ex = Module2["_add_assoc_string_ex"] = wasmExports["dc"])(a0, a1, a2, a3);
    var _add_index_long = Module2["_add_index_long"] = (a0, a1, a2) => (_add_index_long = Module2["_add_index_long"] = wasmExports["ec"])(a0, a1, a2);
    var _php_date_instantiate = Module2["_php_date_instantiate"] = (a0, a1) => (_php_date_instantiate = Module2["_php_date_instantiate"] = wasmExports["fc"])(a0, a1);
    var _object_init_ex = Module2["_object_init_ex"] = (a0, a1) => (_object_init_ex = Module2["_object_init_ex"] = wasmExports["gc"])(a0, a1);
    var _php_date_initialize = Module2["_php_date_initialize"] = (a0, a1, a2, a3, a4, a5) => (_php_date_initialize = Module2["_php_date_initialize"] = wasmExports["hc"])(a0, a1, a2, a3, a4, a5);
    var _zend_throw_exception_ex = Module2["_zend_throw_exception_ex"] = (a0, a1, a2, a3) => (_zend_throw_exception_ex = Module2["_zend_throw_exception_ex"] = wasmExports["ic"])(a0, a1, a2, a3);
    var _php_date_initialize_from_ts_long = Module2["_php_date_initialize_from_ts_long"] = (a0, a1, a2) => (_php_date_initialize_from_ts_long = Module2["_php_date_initialize_from_ts_long"] = wasmExports["jc"])(a0, a1, a2);
    var _php_date_initialize_from_ts_double = Module2["_php_date_initialize_from_ts_double"] = (a0, a1) => (_php_date_initialize_from_ts_double = Module2["_php_date_initialize_from_ts_double"] = wasmExports["kc"])(a0, a1);
    var _zend_argument_error = Module2["_zend_argument_error"] = (a0, a1, a2, a3) => (_zend_argument_error = Module2["_zend_argument_error"] = wasmExports["lc"])(a0, a1, a2, a3);
    var _instanceof_function_slow = Module2["_instanceof_function_slow"] = (a0, a1) => (_instanceof_function_slow = Module2["_instanceof_function_slow"] = wasmExports["mc"])(a0, a1);
    var _zval_ptr_dtor = Module2["_zval_ptr_dtor"] = (a0) => (_zval_ptr_dtor = Module2["_zval_ptr_dtor"] = wasmExports["nc"])(a0);
    var _zend_parse_arg_number_slow = Module2["_zend_parse_arg_number_slow"] = (a0, a1, a2) => (_zend_parse_arg_number_slow = Module2["_zend_parse_arg_number_slow"] = wasmExports["oc"])(a0, a1, a2);
    var _zend_string_concat3 = Module2["_zend_string_concat3"] = (a0, a1, a2, a3, a4, a5) => (_zend_string_concat3 = Module2["_zend_string_concat3"] = wasmExports["pc"])(a0, a1, a2, a3, a4, a5);
    var _zend_std_get_properties = Module2["_zend_std_get_properties"] = (a0) => (_zend_std_get_properties = Module2["_zend_std_get_properties"] = wasmExports["qc"])(a0);
    var _zend_hash_add = Module2["_zend_hash_add"] = (a0, a1, a2) => (_zend_hash_add = Module2["_zend_hash_add"] = wasmExports["rc"])(a0, a1, a2);
    var _zend_hash_str_update = Module2["_zend_hash_str_update"] = (a0, a1, a2, a3) => (_zend_hash_str_update = Module2["_zend_hash_str_update"] = wasmExports["sc"])(a0, a1, a2, a3);
    var __emalloc_32 = Module2["__emalloc_32"] = () => (__emalloc_32 = Module2["__emalloc_32"] = wasmExports["tc"])();
    var _add_index_string = Module2["_add_index_string"] = (a0, a1, a2) => (_add_index_string = Module2["_add_index_string"] = wasmExports["uc"])(a0, a1, a2);
    var _add_assoc_zval_ex = Module2["_add_assoc_zval_ex"] = (a0, a1, a2, a3) => (_add_assoc_zval_ex = Module2["_add_assoc_zval_ex"] = wasmExports["vc"])(a0, a1, a2, a3);
    var _add_assoc_bool_ex = Module2["_add_assoc_bool_ex"] = (a0, a1, a2, a3) => (_add_assoc_bool_ex = Module2["_add_assoc_bool_ex"] = wasmExports["wc"])(a0, a1, a2, a3);
    var _add_assoc_double_ex = Module2["_add_assoc_double_ex"] = (a0, a1, a2, a3) => (_add_assoc_double_ex = Module2["_add_assoc_double_ex"] = wasmExports["xc"])(a0, a1, a2, a3);
    var _zend_parse_method_parameters = Module2["_zend_parse_method_parameters"] = (a0, a1, a2, a3) => (_zend_parse_method_parameters = Module2["_zend_parse_method_parameters"] = wasmExports["yc"])(a0, a1, a2, a3);
    var _zend_replace_error_handling = Module2["_zend_replace_error_handling"] = (a0, a1, a2) => (_zend_replace_error_handling = Module2["_zend_replace_error_handling"] = wasmExports["zc"])(a0, a1, a2);
    var _zend_restore_error_handling = Module2["_zend_restore_error_handling"] = (a0) => (_zend_restore_error_handling = Module2["_zend_restore_error_handling"] = wasmExports["Ac"])(a0);
    var __ecalloc = Module2["__ecalloc"] = (a0, a1) => (__ecalloc = Module2["__ecalloc"] = wasmExports["Bc"])(a0, a1);
    var _zend_spprintf = Module2["_zend_spprintf"] = (a0, a1, a2, a3) => (_zend_spprintf = Module2["_zend_spprintf"] = wasmExports["Cc"])(a0, a1, a2, a3);
    var _add_assoc_str_ex = Module2["_add_assoc_str_ex"] = (a0, a1, a2, a3) => (_add_assoc_str_ex = Module2["_add_assoc_str_ex"] = wasmExports["Dc"])(a0, a1, a2, a3);
    var _zend_hash_next_index_insert = Module2["_zend_hash_next_index_insert"] = (a0, a1) => (_zend_hash_next_index_insert = Module2["_zend_hash_next_index_insert"] = wasmExports["Ec"])(a0, a1);
    var _zval_get_long_func = Module2["_zval_get_long_func"] = (a0, a1) => (_zval_get_long_func = Module2["_zval_get_long_func"] = wasmExports["Fc"])(a0, a1);
    var _zval_get_double_func = Module2["_zval_get_double_func"] = (a0) => (_zval_get_double_func = Module2["_zval_get_double_func"] = wasmExports["Gc"])(a0);
    var _zend_dval_to_lval_slow = Module2["_zend_dval_to_lval_slow"] = (a0) => (_zend_dval_to_lval_slow = Module2["_zend_dval_to_lval_slow"] = wasmExports["Hc"])(a0);
    var _zval_get_string_func = Module2["_zval_get_string_func"] = (a0) => (_zval_get_string_func = Module2["_zval_get_string_func"] = wasmExports["Ic"])(a0);
    var _get_active_function_or_method_name = Module2["_get_active_function_or_method_name"] = () => (_get_active_function_or_method_name = Module2["_get_active_function_or_method_name"] = wasmExports["Jc"])();
    var _zend_parse_parameters_ex = Module2["_zend_parse_parameters_ex"] = (a0, a1, a2, a3) => (_zend_parse_parameters_ex = Module2["_zend_parse_parameters_ex"] = wasmExports["Kc"])(a0, a1, a2, a3);
    var _zend_type_error = Module2["_zend_type_error"] = (a0, a1) => (_zend_type_error = Module2["_zend_type_error"] = wasmExports["Lc"])(a0, a1);
    var _zend_error = Module2["_zend_error"] = (a0, a1, a2) => (_zend_error = Module2["_zend_error"] = wasmExports["Mc"])(a0, a1, a2);
    var _zend_create_internal_iterator_zval = Module2["_zend_create_internal_iterator_zval"] = (a0, a1) => (_zend_create_internal_iterator_zval = Module2["_zend_create_internal_iterator_zval"] = wasmExports["Nc"])(a0, a1);
    var _zend_argument_value_error = Module2["_zend_argument_value_error"] = (a0, a1, a2) => (_zend_argument_value_error = Module2["_zend_argument_value_error"] = wasmExports["Oc"])(a0, a1, a2);
    var _add_next_index_string = Module2["_add_next_index_string"] = (a0, a1) => (_add_next_index_string = Module2["_add_next_index_string"] = wasmExports["Pc"])(a0, a1);
    var _add_assoc_null_ex = Module2["_add_assoc_null_ex"] = (a0, a1, a2) => (_add_assoc_null_ex = Module2["_add_assoc_null_ex"] = wasmExports["Qc"])(a0, a1, a2);
    var __estrndup = Module2["__estrndup"] = (a0, a1) => (__estrndup = Module2["__estrndup"] = wasmExports["Rc"])(a0, a1);
    var _zend_parse_arg_double_slow = Module2["_zend_parse_arg_double_slow"] = (a0, a1, a2) => (_zend_parse_arg_double_slow = Module2["_zend_parse_arg_double_slow"] = wasmExports["Sc"])(a0, a1, a2);
    var _zend_ini_double = Module2["_zend_ini_double"] = (a0, a1, a2) => (_zend_ini_double = Module2["_zend_ini_double"] = wasmExports["Tc"])(a0, a1, a2);
    var _zend_strpprintf = Module2["_zend_strpprintf"] = (a0, a1, a2) => (_zend_strpprintf = Module2["_zend_strpprintf"] = wasmExports["Uc"])(a0, a1, a2);
    var _OnUpdateString = Module2["_OnUpdateString"] = (a0, a1, a2, a3, a4, a5) => (_OnUpdateString = Module2["_OnUpdateString"] = wasmExports["Vc"])(a0, a1, a2, a3, a4, a5);
    var _zend_error_noreturn = Module2["_zend_error_noreturn"] = (a0, a1, a2) => (_zend_error_noreturn = Module2["_zend_error_noreturn"] = wasmExports["Wc"])(a0, a1, a2);
    var _zend_object_std_init = Module2["_zend_object_std_init"] = (a0, a1) => (_zend_object_std_init = Module2["_zend_object_std_init"] = wasmExports["Xc"])(a0, a1);
    var _object_properties_init = Module2["_object_properties_init"] = (a0, a1) => (_object_properties_init = Module2["_object_properties_init"] = wasmExports["Yc"])(a0, a1);
    var _zend_object_std_dtor = Module2["_zend_object_std_dtor"] = (a0) => (_zend_object_std_dtor = Module2["_zend_object_std_dtor"] = wasmExports["Zc"])(a0);
    var _zend_objects_clone_members = Module2["_zend_objects_clone_members"] = (a0, a1) => (_zend_objects_clone_members = Module2["_zend_objects_clone_members"] = wasmExports["_c"])(a0, a1);
    var _zend_std_compare_objects = Module2["_zend_std_compare_objects"] = (a0, a1) => (_zend_std_compare_objects = Module2["_zend_std_compare_objects"] = wasmExports["$c"])(a0, a1);
    var _zend_std_get_properties_for = Module2["_zend_std_get_properties_for"] = (a0, a1) => (_zend_std_get_properties_for = Module2["_zend_std_get_properties_for"] = wasmExports["ad"])(a0, a1);
    var _zend_array_dup = Module2["_zend_array_dup"] = (a0) => (_zend_array_dup = Module2["_zend_array_dup"] = wasmExports["bd"])(a0);
    var _zend_std_has_property = Module2["_zend_std_has_property"] = (a0, a1, a2, a3) => (_zend_std_has_property = Module2["_zend_std_has_property"] = wasmExports["cd"])(a0, a1, a2, a3);
    var _zend_is_true = Module2["_zend_is_true"] = (a0) => (_zend_is_true = Module2["_zend_is_true"] = wasmExports["dd"])(a0);
    var _zend_std_read_property = Module2["_zend_std_read_property"] = (a0, a1, a2, a3, a4) => (_zend_std_read_property = Module2["_zend_std_read_property"] = wasmExports["ed"])(a0, a1, a2, a3, a4);
    var _zend_std_write_property = Module2["_zend_std_write_property"] = (a0, a1, a2, a3) => (_zend_std_write_property = Module2["_zend_std_write_property"] = wasmExports["fd"])(a0, a1, a2, a3);
    var _zend_std_get_property_ptr_ptr = Module2["_zend_std_get_property_ptr_ptr"] = (a0, a1, a2, a3) => (_zend_std_get_property_ptr_ptr = Module2["_zend_std_get_property_ptr_ptr"] = wasmExports["gd"])(a0, a1, a2, a3);
    var __emalloc_96 = Module2["__emalloc_96"] = () => (__emalloc_96 = Module2["__emalloc_96"] = wasmExports["hd"])();
    var _zend_iterator_init = Module2["_zend_iterator_init"] = (a0) => (_zend_iterator_init = Module2["_zend_iterator_init"] = wasmExports["id"])(a0);
    var _zend_readonly_property_modification_error_ex = Module2["_zend_readonly_property_modification_error_ex"] = (a0, a1) => (_zend_readonly_property_modification_error_ex = Module2["_zend_readonly_property_modification_error_ex"] = wasmExports["jd"])(a0, a1);
    var _zend_lazy_object_get_properties = Module2["_zend_lazy_object_get_properties"] = (a0) => (_zend_lazy_object_get_properties = Module2["_zend_lazy_object_get_properties"] = wasmExports["kd"])(a0);
    var _rebuild_object_properties_internal = Module2["_rebuild_object_properties_internal"] = (a0) => (_rebuild_object_properties_internal = Module2["_rebuild_object_properties_internal"] = wasmExports["ld"])(a0);
    var __emalloc_24 = Module2["__emalloc_24"] = () => (__emalloc_24 = Module2["__emalloc_24"] = wasmExports["md"])();
    var _zend_unmangle_property_name_ex = Module2["_zend_unmangle_property_name_ex"] = (a0, a1, a2, a3) => (_zend_unmangle_property_name_ex = Module2["_zend_unmangle_property_name_ex"] = wasmExports["nd"])(a0, a1, a2, a3);
    var _zend_lookup_class = Module2["_zend_lookup_class"] = (a0) => (_zend_lookup_class = Module2["_zend_lookup_class"] = wasmExports["od"])(a0);
    var _zend_update_property = Module2["_zend_update_property"] = (a0, a1, a2, a3, a4) => (_zend_update_property = Module2["_zend_update_property"] = wasmExports["pd"])(a0, a1, a2, a3, a4);
    var __emalloc_40 = Module2["__emalloc_40"] = () => (__emalloc_40 = Module2["__emalloc_40"] = wasmExports["qd"])();
    var __emalloc_8 = Module2["__emalloc_8"] = () => (__emalloc_8 = Module2["__emalloc_8"] = wasmExports["rd"])();
    var _php_pcre2_code_copy = Module2["_php_pcre2_code_copy"] = (a0) => (_php_pcre2_code_copy = Module2["_php_pcre2_code_copy"] = wasmExports["sd"])(a0);
    var _php_pcre2_code_copy_with_tables = Module2["_php_pcre2_code_copy_with_tables"] = (a0) => (_php_pcre2_code_copy_with_tables = Module2["_php_pcre2_code_copy_with_tables"] = wasmExports["td"])(a0);
    var _php_pcre2_code_free = Module2["_php_pcre2_code_free"] = (a0) => (_php_pcre2_code_free = Module2["_php_pcre2_code_free"] = wasmExports["ud"])(a0);
    var _php_pcre2_compile = Module2["_php_pcre2_compile"] = (a0, a1, a2, a3, a4, a5) => (_php_pcre2_compile = Module2["_php_pcre2_compile"] = wasmExports["vd"])(a0, a1, a2, a3, a4, a5);
    var _php_pcre2_config = Module2["_php_pcre2_config"] = (a0, a1) => (_php_pcre2_config = Module2["_php_pcre2_config"] = wasmExports["wd"])(a0, a1);
    var _malloc = /* @__PURE__ */ __name((a0) => (_malloc = wasmExports["xd"])(a0), "_malloc");
    var _php_pcre2_general_context_create = Module2["_php_pcre2_general_context_create"] = (a0, a1, a2) => (_php_pcre2_general_context_create = Module2["_php_pcre2_general_context_create"] = wasmExports["yd"])(a0, a1, a2);
    var _php_pcre2_compile_context_create = Module2["_php_pcre2_compile_context_create"] = (a0) => (_php_pcre2_compile_context_create = Module2["_php_pcre2_compile_context_create"] = wasmExports["zd"])(a0);
    var _php_pcre2_match_context_create = Module2["_php_pcre2_match_context_create"] = (a0) => (_php_pcre2_match_context_create = Module2["_php_pcre2_match_context_create"] = wasmExports["Ad"])(a0);
    var _php_pcre2_convert_context_create = Module2["_php_pcre2_convert_context_create"] = (a0) => (_php_pcre2_convert_context_create = Module2["_php_pcre2_convert_context_create"] = wasmExports["Bd"])(a0);
    var _php_pcre2_general_context_copy = Module2["_php_pcre2_general_context_copy"] = (a0) => (_php_pcre2_general_context_copy = Module2["_php_pcre2_general_context_copy"] = wasmExports["Cd"])(a0);
    var _php_pcre2_compile_context_copy = Module2["_php_pcre2_compile_context_copy"] = (a0) => (_php_pcre2_compile_context_copy = Module2["_php_pcre2_compile_context_copy"] = wasmExports["Dd"])(a0);
    var _php_pcre2_match_context_copy = Module2["_php_pcre2_match_context_copy"] = (a0) => (_php_pcre2_match_context_copy = Module2["_php_pcre2_match_context_copy"] = wasmExports["Ed"])(a0);
    var _php_pcre2_convert_context_copy = Module2["_php_pcre2_convert_context_copy"] = (a0) => (_php_pcre2_convert_context_copy = Module2["_php_pcre2_convert_context_copy"] = wasmExports["Fd"])(a0);
    var _php_pcre2_general_context_free = Module2["_php_pcre2_general_context_free"] = (a0) => (_php_pcre2_general_context_free = Module2["_php_pcre2_general_context_free"] = wasmExports["Gd"])(a0);
    var _php_pcre2_compile_context_free = Module2["_php_pcre2_compile_context_free"] = (a0) => (_php_pcre2_compile_context_free = Module2["_php_pcre2_compile_context_free"] = wasmExports["Hd"])(a0);
    var _php_pcre2_match_context_free = Module2["_php_pcre2_match_context_free"] = (a0) => (_php_pcre2_match_context_free = Module2["_php_pcre2_match_context_free"] = wasmExports["Id"])(a0);
    var _php_pcre2_convert_context_free = Module2["_php_pcre2_convert_context_free"] = (a0) => (_php_pcre2_convert_context_free = Module2["_php_pcre2_convert_context_free"] = wasmExports["Jd"])(a0);
    var _php_pcre2_set_character_tables = Module2["_php_pcre2_set_character_tables"] = (a0, a1) => (_php_pcre2_set_character_tables = Module2["_php_pcre2_set_character_tables"] = wasmExports["Kd"])(a0, a1);
    var _php_pcre2_set_bsr = Module2["_php_pcre2_set_bsr"] = (a0, a1) => (_php_pcre2_set_bsr = Module2["_php_pcre2_set_bsr"] = wasmExports["Ld"])(a0, a1);
    var _php_pcre2_set_max_pattern_length = Module2["_php_pcre2_set_max_pattern_length"] = (a0, a1) => (_php_pcre2_set_max_pattern_length = Module2["_php_pcre2_set_max_pattern_length"] = wasmExports["Md"])(a0, a1);
    var _pcre2_set_max_pattern_compiled_length_8 = Module2["_pcre2_set_max_pattern_compiled_length_8"] = (a0, a1) => (_pcre2_set_max_pattern_compiled_length_8 = Module2["_pcre2_set_max_pattern_compiled_length_8"] = wasmExports["Nd"])(a0, a1);
    var _php_pcre2_set_newline = Module2["_php_pcre2_set_newline"] = (a0, a1) => (_php_pcre2_set_newline = Module2["_php_pcre2_set_newline"] = wasmExports["Od"])(a0, a1);
    var _pcre2_set_max_varlookbehind_8 = Module2["_pcre2_set_max_varlookbehind_8"] = (a0, a1) => (_pcre2_set_max_varlookbehind_8 = Module2["_pcre2_set_max_varlookbehind_8"] = wasmExports["Pd"])(a0, a1);
    var _php_pcre2_set_parens_nest_limit = Module2["_php_pcre2_set_parens_nest_limit"] = (a0, a1) => (_php_pcre2_set_parens_nest_limit = Module2["_php_pcre2_set_parens_nest_limit"] = wasmExports["Qd"])(a0, a1);
    var _php_pcre2_set_compile_extra_options = Module2["_php_pcre2_set_compile_extra_options"] = (a0, a1) => (_php_pcre2_set_compile_extra_options = Module2["_php_pcre2_set_compile_extra_options"] = wasmExports["Rd"])(a0, a1);
    var _php_pcre2_set_compile_recursion_guard = Module2["_php_pcre2_set_compile_recursion_guard"] = (a0, a1, a2) => (_php_pcre2_set_compile_recursion_guard = Module2["_php_pcre2_set_compile_recursion_guard"] = wasmExports["Sd"])(a0, a1, a2);
    var _php_pcre2_set_callout = Module2["_php_pcre2_set_callout"] = (a0, a1, a2) => (_php_pcre2_set_callout = Module2["_php_pcre2_set_callout"] = wasmExports["Td"])(a0, a1, a2);
    var _pcre2_set_substitute_callout_8 = Module2["_pcre2_set_substitute_callout_8"] = (a0, a1, a2) => (_pcre2_set_substitute_callout_8 = Module2["_pcre2_set_substitute_callout_8"] = wasmExports["Ud"])(a0, a1, a2);
    var _php_pcre2_set_heap_limit = Module2["_php_pcre2_set_heap_limit"] = (a0, a1) => (_php_pcre2_set_heap_limit = Module2["_php_pcre2_set_heap_limit"] = wasmExports["Vd"])(a0, a1);
    var _php_pcre2_set_match_limit = Module2["_php_pcre2_set_match_limit"] = (a0, a1) => (_php_pcre2_set_match_limit = Module2["_php_pcre2_set_match_limit"] = wasmExports["Wd"])(a0, a1);
    var _php_pcre2_set_depth_limit = Module2["_php_pcre2_set_depth_limit"] = (a0, a1) => (_php_pcre2_set_depth_limit = Module2["_php_pcre2_set_depth_limit"] = wasmExports["Xd"])(a0, a1);
    var _php_pcre2_set_offset_limit = Module2["_php_pcre2_set_offset_limit"] = (a0, a1) => (_php_pcre2_set_offset_limit = Module2["_php_pcre2_set_offset_limit"] = wasmExports["Yd"])(a0, a1);
    var _php_pcre2_set_recursion_limit = Module2["_php_pcre2_set_recursion_limit"] = (a0, a1) => (_php_pcre2_set_recursion_limit = Module2["_php_pcre2_set_recursion_limit"] = wasmExports["Zd"])(a0, a1);
    var _php_pcre2_set_recursion_memory_management = Module2["_php_pcre2_set_recursion_memory_management"] = (a0, a1, a2, a3) => (_php_pcre2_set_recursion_memory_management = Module2["_php_pcre2_set_recursion_memory_management"] = wasmExports["_d"])(a0, a1, a2, a3);
    var _php_pcre2_set_glob_separator = Module2["_php_pcre2_set_glob_separator"] = (a0, a1) => (_php_pcre2_set_glob_separator = Module2["_php_pcre2_set_glob_separator"] = wasmExports["$d"])(a0, a1);
    var _php_pcre2_set_glob_escape = Module2["_php_pcre2_set_glob_escape"] = (a0, a1) => (_php_pcre2_set_glob_escape = Module2["_php_pcre2_set_glob_escape"] = wasmExports["ae"])(a0, a1);
    var _pcre2_pattern_convert_8 = Module2["_pcre2_pattern_convert_8"] = (a0, a1, a2, a3, a4, a5) => (_pcre2_pattern_convert_8 = Module2["_pcre2_pattern_convert_8"] = wasmExports["be"])(a0, a1, a2, a3, a4, a5);
    var _pcre2_converted_pattern_free_8 = Module2["_pcre2_converted_pattern_free_8"] = (a0) => (_pcre2_converted_pattern_free_8 = Module2["_pcre2_converted_pattern_free_8"] = wasmExports["ce"])(a0);
    var _php_pcre2_dfa_match = Module2["_php_pcre2_dfa_match"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8) => (_php_pcre2_dfa_match = Module2["_php_pcre2_dfa_match"] = wasmExports["de"])(a0, a1, a2, a3, a4, a5, a6, a7, a8);
    var _php_pcre2_get_error_message = Module2["_php_pcre2_get_error_message"] = (a0, a1, a2) => (_php_pcre2_get_error_message = Module2["_php_pcre2_get_error_message"] = wasmExports["ee"])(a0, a1, a2);
    var _php_pcre2_maketables = Module2["_php_pcre2_maketables"] = (a0) => (_php_pcre2_maketables = Module2["_php_pcre2_maketables"] = wasmExports["fe"])(a0);
    var _pcre2_maketables_free_8 = Module2["_pcre2_maketables_free_8"] = (a0, a1) => (_pcre2_maketables_free_8 = Module2["_pcre2_maketables_free_8"] = wasmExports["ge"])(a0, a1);
    var _php_pcre2_match_data_create = Module2["_php_pcre2_match_data_create"] = (a0, a1) => (_php_pcre2_match_data_create = Module2["_php_pcre2_match_data_create"] = wasmExports["he"])(a0, a1);
    var _php_pcre2_match_data_create_from_pattern = Module2["_php_pcre2_match_data_create_from_pattern"] = (a0, a1) => (_php_pcre2_match_data_create_from_pattern = Module2["_php_pcre2_match_data_create_from_pattern"] = wasmExports["ie"])(a0, a1);
    var _php_pcre2_match_data_free = Module2["_php_pcre2_match_data_free"] = (a0) => (_php_pcre2_match_data_free = Module2["_php_pcre2_match_data_free"] = wasmExports["je"])(a0);
    var _php_pcre2_get_mark = Module2["_php_pcre2_get_mark"] = (a0) => (_php_pcre2_get_mark = Module2["_php_pcre2_get_mark"] = wasmExports["ke"])(a0);
    var _php_pcre2_get_ovector_pointer = Module2["_php_pcre2_get_ovector_pointer"] = (a0) => (_php_pcre2_get_ovector_pointer = Module2["_php_pcre2_get_ovector_pointer"] = wasmExports["le"])(a0);
    var _php_pcre2_get_ovector_count = Module2["_php_pcre2_get_ovector_count"] = (a0) => (_php_pcre2_get_ovector_count = Module2["_php_pcre2_get_ovector_count"] = wasmExports["me"])(a0);
    var _php_pcre2_get_startchar = Module2["_php_pcre2_get_startchar"] = (a0) => (_php_pcre2_get_startchar = Module2["_php_pcre2_get_startchar"] = wasmExports["ne"])(a0);
    var _pcre2_get_match_data_size_8 = Module2["_pcre2_get_match_data_size_8"] = (a0) => (_pcre2_get_match_data_size_8 = Module2["_pcre2_get_match_data_size_8"] = wasmExports["oe"])(a0);
    var _pcre2_get_match_data_heapframes_size_8 = Module2["_pcre2_get_match_data_heapframes_size_8"] = (a0) => (_pcre2_get_match_data_heapframes_size_8 = Module2["_pcre2_get_match_data_heapframes_size_8"] = wasmExports["pe"])(a0);
    var _php_pcre2_match = Module2["_php_pcre2_match"] = (a0, a1, a2, a3, a4, a5, a6) => (_php_pcre2_match = Module2["_php_pcre2_match"] = wasmExports["qe"])(a0, a1, a2, a3, a4, a5, a6);
    var _php_pcre2_pattern_info = Module2["_php_pcre2_pattern_info"] = (a0, a1, a2) => (_php_pcre2_pattern_info = Module2["_php_pcre2_pattern_info"] = wasmExports["re"])(a0, a1, a2);
    var _php_pcre2_callout_enumerate = Module2["_php_pcre2_callout_enumerate"] = (a0, a1, a2) => (_php_pcre2_callout_enumerate = Module2["_php_pcre2_callout_enumerate"] = wasmExports["se"])(a0, a1, a2);
    var _php_pcre2_serialize_encode = Module2["_php_pcre2_serialize_encode"] = (a0, a1, a2, a3, a4) => (_php_pcre2_serialize_encode = Module2["_php_pcre2_serialize_encode"] = wasmExports["te"])(a0, a1, a2, a3, a4);
    var _php_pcre2_serialize_decode = Module2["_php_pcre2_serialize_decode"] = (a0, a1, a2, a3) => (_php_pcre2_serialize_decode = Module2["_php_pcre2_serialize_decode"] = wasmExports["ue"])(a0, a1, a2, a3);
    var _php_pcre2_serialize_get_number_of_codes = Module2["_php_pcre2_serialize_get_number_of_codes"] = (a0) => (_php_pcre2_serialize_get_number_of_codes = Module2["_php_pcre2_serialize_get_number_of_codes"] = wasmExports["ve"])(a0);
    var _php_pcre2_serialize_free = Module2["_php_pcre2_serialize_free"] = (a0) => (_php_pcre2_serialize_free = Module2["_php_pcre2_serialize_free"] = wasmExports["we"])(a0);
    var _php_pcre2_substitute = Module2["_php_pcre2_substitute"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) => (_php_pcre2_substitute = Module2["_php_pcre2_substitute"] = wasmExports["xe"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
    var _php_pcre2_substring_nametable_scan = Module2["_php_pcre2_substring_nametable_scan"] = (a0, a1, a2, a3) => (_php_pcre2_substring_nametable_scan = Module2["_php_pcre2_substring_nametable_scan"] = wasmExports["ye"])(a0, a1, a2, a3);
    var _php_pcre2_substring_length_bynumber = Module2["_php_pcre2_substring_length_bynumber"] = (a0, a1, a2) => (_php_pcre2_substring_length_bynumber = Module2["_php_pcre2_substring_length_bynumber"] = wasmExports["ze"])(a0, a1, a2);
    var _php_pcre2_substring_copy_byname = Module2["_php_pcre2_substring_copy_byname"] = (a0, a1, a2, a3) => (_php_pcre2_substring_copy_byname = Module2["_php_pcre2_substring_copy_byname"] = wasmExports["Ae"])(a0, a1, a2, a3);
    var _php_pcre2_substring_copy_bynumber = Module2["_php_pcre2_substring_copy_bynumber"] = (a0, a1, a2, a3) => (_php_pcre2_substring_copy_bynumber = Module2["_php_pcre2_substring_copy_bynumber"] = wasmExports["Be"])(a0, a1, a2, a3);
    var _php_pcre2_substring_get_byname = Module2["_php_pcre2_substring_get_byname"] = (a0, a1, a2, a3) => (_php_pcre2_substring_get_byname = Module2["_php_pcre2_substring_get_byname"] = wasmExports["Ce"])(a0, a1, a2, a3);
    var _php_pcre2_substring_get_bynumber = Module2["_php_pcre2_substring_get_bynumber"] = (a0, a1, a2, a3) => (_php_pcre2_substring_get_bynumber = Module2["_php_pcre2_substring_get_bynumber"] = wasmExports["De"])(a0, a1, a2, a3);
    var _php_pcre2_substring_free = Module2["_php_pcre2_substring_free"] = (a0) => (_php_pcre2_substring_free = Module2["_php_pcre2_substring_free"] = wasmExports["Ee"])(a0);
    var _php_pcre2_substring_length_byname = Module2["_php_pcre2_substring_length_byname"] = (a0, a1, a2) => (_php_pcre2_substring_length_byname = Module2["_php_pcre2_substring_length_byname"] = wasmExports["Fe"])(a0, a1, a2);
    var _php_pcre2_substring_list_get = Module2["_php_pcre2_substring_list_get"] = (a0, a1, a2) => (_php_pcre2_substring_list_get = Module2["_php_pcre2_substring_list_get"] = wasmExports["Ge"])(a0, a1, a2);
    var _php_pcre2_substring_list_free = Module2["_php_pcre2_substring_list_free"] = (a0) => (_php_pcre2_substring_list_free = Module2["_php_pcre2_substring_list_free"] = wasmExports["He"])(a0);
    var _php_pcre2_substring_number_from_name = Module2["_php_pcre2_substring_number_from_name"] = (a0, a1) => (_php_pcre2_substring_number_from_name = Module2["_php_pcre2_substring_number_from_name"] = wasmExports["Ie"])(a0, a1);
    var _pcre_get_compiled_regex_cache_ex = Module2["_pcre_get_compiled_regex_cache_ex"] = (a0, a1) => (_pcre_get_compiled_regex_cache_ex = Module2["_pcre_get_compiled_regex_cache_ex"] = wasmExports["Je"])(a0, a1);
    var _zend_string_concat2 = Module2["_zend_string_concat2"] = (a0, a1, a2, a3) => (_zend_string_concat2 = Module2["_zend_string_concat2"] = wasmExports["Ke"])(a0, a1, a2, a3);
    var _zend_hash_find = Module2["_zend_hash_find"] = (a0, a1) => (_zend_hash_find = Module2["_zend_hash_find"] = wasmExports["Le"])(a0, a1);
    var _zend_hash_apply_with_argument = Module2["_zend_hash_apply_with_argument"] = (a0, a1, a2) => (_zend_hash_apply_with_argument = Module2["_zend_hash_apply_with_argument"] = wasmExports["Me"])(a0, a1, a2);
    var _zend_hash_add_new = Module2["_zend_hash_add_new"] = (a0, a1, a2) => (_zend_hash_add_new = Module2["_zend_hash_add_new"] = wasmExports["Ne"])(a0, a1, a2);
    var ___zend_calloc = Module2["___zend_calloc"] = (a0, a1) => (___zend_calloc = Module2["___zend_calloc"] = wasmExports["Oe"])(a0, a1);
    var _pcre_get_compiled_regex_cache = Module2["_pcre_get_compiled_regex_cache"] = (a0) => (_pcre_get_compiled_regex_cache = Module2["_pcre_get_compiled_regex_cache"] = wasmExports["Pe"])(a0);
    var _pcre_get_compiled_regex = Module2["_pcre_get_compiled_regex"] = (a0, a1) => (_pcre_get_compiled_regex = Module2["_pcre_get_compiled_regex"] = wasmExports["Qe"])(a0, a1);
    var _php_pcre_create_match_data = Module2["_php_pcre_create_match_data"] = (a0, a1) => (_php_pcre_create_match_data = Module2["_php_pcre_create_match_data"] = wasmExports["Re"])(a0, a1);
    var _php_pcre_free_match_data = Module2["_php_pcre_free_match_data"] = (a0) => (_php_pcre_free_match_data = Module2["_php_pcre_free_match_data"] = wasmExports["Se"])(a0);
    var _php_pcre_match_impl = Module2["_php_pcre_match_impl"] = (a0, a1, a2, a3, a4, a5, a6) => (_php_pcre_match_impl = Module2["_php_pcre_match_impl"] = wasmExports["Te"])(a0, a1, a2, a3, a4, a5, a6);
    var _zend_try_assign_typed_ref_arr = Module2["_zend_try_assign_typed_ref_arr"] = (a0, a1) => (_zend_try_assign_typed_ref_arr = Module2["_zend_try_assign_typed_ref_arr"] = wasmExports["Ue"])(a0, a1);
    var __safe_emalloc = Module2["__safe_emalloc"] = (a0, a1, a2) => (__safe_emalloc = Module2["__safe_emalloc"] = wasmExports["Ve"])(a0, a1, a2);
    var _zend_hash_next_index_insert_new = Module2["_zend_hash_next_index_insert_new"] = (a0, a1) => (_zend_hash_next_index_insert_new = Module2["_zend_hash_next_index_insert_new"] = wasmExports["We"])(a0, a1);
    var _zend_hash_index_add_new = Module2["_zend_hash_index_add_new"] = (a0, a1, a2) => (_zend_hash_index_add_new = Module2["_zend_hash_index_add_new"] = wasmExports["Xe"])(a0, a1, a2);
    var __zend_new_array = Module2["__zend_new_array"] = (a0) => (__zend_new_array = Module2["__zend_new_array"] = wasmExports["Ye"])(a0);
    var _zend_hash_update = Module2["_zend_hash_update"] = (a0, a1, a2) => (_zend_hash_update = Module2["_zend_hash_update"] = wasmExports["Ze"])(a0, a1, a2);
    var _zend_new_pair = Module2["_zend_new_pair"] = (a0, a1) => (_zend_new_pair = Module2["_zend_new_pair"] = wasmExports["_e"])(a0, a1);
    var _add_next_index_null = Module2["_add_next_index_null"] = (a0) => (_add_next_index_null = Module2["_add_next_index_null"] = wasmExports["$e"])(a0);
    var _zend_flf_parse_arg_str_slow = Module2["_zend_flf_parse_arg_str_slow"] = (a0, a1, a2) => (_zend_flf_parse_arg_str_slow = Module2["_zend_flf_parse_arg_str_slow"] = wasmExports["af"])(a0, a1, a2);
    var _zend_wrong_parameter_type_error = Module2["_zend_wrong_parameter_type_error"] = (a0, a1, a2) => (_zend_wrong_parameter_type_error = Module2["_zend_wrong_parameter_type_error"] = wasmExports["bf"])(a0, a1, a2);
    var _php_pcre_replace = Module2["_php_pcre_replace"] = (a0, a1, a2, a3, a4, a5, a6) => (_php_pcre_replace = Module2["_php_pcre_replace"] = wasmExports["cf"])(a0, a1, a2, a3, a4, a5, a6);
    var _php_pcre_replace_impl = Module2["_php_pcre_replace_impl"] = (a0, a1, a2, a3, a4, a5, a6) => (_php_pcre_replace_impl = Module2["_php_pcre_replace_impl"] = wasmExports["df"])(a0, a1, a2, a3, a4, a5, a6);
    var _zend_argument_type_error = Module2["_zend_argument_type_error"] = (a0, a1, a2) => (_zend_argument_type_error = Module2["_zend_argument_type_error"] = wasmExports["ef"])(a0, a1, a2);
    var _zend_try_assign_typed_ref_long = Module2["_zend_try_assign_typed_ref_long"] = (a0, a1) => (_zend_try_assign_typed_ref_long = Module2["_zend_try_assign_typed_ref_long"] = wasmExports["ff"])(a0, a1);
    var _zend_fcall_info_init = Module2["_zend_fcall_info_init"] = (a0, a1, a2, a3, a4, a5) => (_zend_fcall_info_init = Module2["_zend_fcall_info_init"] = wasmExports["gf"])(a0, a1, a2, a3, a4, a5);
    var _zend_release_fcall_info_cache = Module2["_zend_release_fcall_info_cache"] = (a0) => (_zend_release_fcall_info_cache = Module2["_zend_release_fcall_info_cache"] = wasmExports["hf"])(a0);
    var _zend_is_callable_ex = Module2["_zend_is_callable_ex"] = (a0, a1, a2, a3, a4, a5) => (_zend_is_callable_ex = Module2["_zend_is_callable_ex"] = wasmExports["jf"])(a0, a1, a2, a3, a4, a5);
    var _zend_array_destroy = Module2["_zend_array_destroy"] = (a0) => (_zend_array_destroy = Module2["_zend_array_destroy"] = wasmExports["kf"])(a0);
    var _php_pcre_split_impl = Module2["_php_pcre_split_impl"] = (a0, a1, a2, a3, a4) => (_php_pcre_split_impl = Module2["_php_pcre_split_impl"] = wasmExports["lf"])(a0, a1, a2, a3, a4);
    var _php_pcre_grep_impl = Module2["_php_pcre_grep_impl"] = (a0, a1, a2, a3) => (_php_pcre_grep_impl = Module2["_php_pcre_grep_impl"] = wasmExports["mf"])(a0, a1, a2, a3);
    var _zend_hash_index_update = Module2["_zend_hash_index_update"] = (a0, a1, a2) => (_zend_hash_index_update = Module2["_zend_hash_index_update"] = wasmExports["nf"])(a0, a1, a2);
    var _zend_register_bool_constant = Module2["_zend_register_bool_constant"] = (a0, a1, a2, a3, a4) => (_zend_register_bool_constant = Module2["_zend_register_bool_constant"] = wasmExports["of"])(a0, a1, a2, a3, a4);
    var _php_pcre_mctx = Module2["_php_pcre_mctx"] = () => (_php_pcre_mctx = Module2["_php_pcre_mctx"] = wasmExports["pf"])();
    var _php_pcre_gctx = Module2["_php_pcre_gctx"] = () => (_php_pcre_gctx = Module2["_php_pcre_gctx"] = wasmExports["qf"])();
    var _php_pcre_cctx = Module2["_php_pcre_cctx"] = () => (_php_pcre_cctx = Module2["_php_pcre_cctx"] = wasmExports["rf"])();
    var _php_pcre_pce_incref = Module2["_php_pcre_pce_incref"] = (a0) => (_php_pcre_pce_incref = Module2["_php_pcre_pce_incref"] = wasmExports["sf"])(a0);
    var _php_pcre_pce_decref = Module2["_php_pcre_pce_decref"] = (a0) => (_php_pcre_pce_decref = Module2["_php_pcre_pce_decref"] = wasmExports["tf"])(a0);
    var _php_pcre_pce_re = Module2["_php_pcre_pce_re"] = (a0) => (_php_pcre_pce_re = Module2["_php_pcre_pce_re"] = wasmExports["uf"])(a0);
    var _zend_call_function = Module2["_zend_call_function"] = (a0, a1) => (_zend_call_function = Module2["_zend_call_function"] = wasmExports["vf"])(a0, a1);
    var _OnUpdateLong = Module2["_OnUpdateLong"] = (a0, a1, a2, a3, a4, a5) => (_OnUpdateLong = Module2["_OnUpdateLong"] = wasmExports["wf"])(a0, a1, a2, a3, a4, a5);
    var _PHP_ADLER32Init = Module2["_PHP_ADLER32Init"] = (a0, a1) => (_PHP_ADLER32Init = Module2["_PHP_ADLER32Init"] = wasmExports["xf"])(a0, a1);
    var _PHP_ADLER32Update = Module2["_PHP_ADLER32Update"] = (a0, a1, a2) => (_PHP_ADLER32Update = Module2["_PHP_ADLER32Update"] = wasmExports["yf"])(a0, a1, a2);
    var _PHP_ADLER32Final = Module2["_PHP_ADLER32Final"] = (a0, a1) => (_PHP_ADLER32Final = Module2["_PHP_ADLER32Final"] = wasmExports["zf"])(a0, a1);
    var _PHP_ADLER32Copy = Module2["_PHP_ADLER32Copy"] = (a0, a1, a2) => (_PHP_ADLER32Copy = Module2["_PHP_ADLER32Copy"] = wasmExports["Af"])(a0, a1, a2);
    var _php_hash_serialize = Module2["_php_hash_serialize"] = (a0, a1, a2) => (_php_hash_serialize = Module2["_php_hash_serialize"] = wasmExports["Bf"])(a0, a1, a2);
    var _php_hash_unserialize = Module2["_php_hash_unserialize"] = (a0, a1, a2) => (_php_hash_unserialize = Module2["_php_hash_unserialize"] = wasmExports["Cf"])(a0, a1, a2);
    var _PHP_CRC32Init = Module2["_PHP_CRC32Init"] = (a0, a1) => (_PHP_CRC32Init = Module2["_PHP_CRC32Init"] = wasmExports["Df"])(a0, a1);
    var _PHP_CRC32Update = Module2["_PHP_CRC32Update"] = (a0, a1, a2) => (_PHP_CRC32Update = Module2["_PHP_CRC32Update"] = wasmExports["Ef"])(a0, a1, a2);
    var _PHP_CRC32BUpdate = Module2["_PHP_CRC32BUpdate"] = (a0, a1, a2) => (_PHP_CRC32BUpdate = Module2["_PHP_CRC32BUpdate"] = wasmExports["Ff"])(a0, a1, a2);
    var _PHP_CRC32CUpdate = Module2["_PHP_CRC32CUpdate"] = (a0, a1, a2) => (_PHP_CRC32CUpdate = Module2["_PHP_CRC32CUpdate"] = wasmExports["Gf"])(a0, a1, a2);
    var _PHP_CRC32LEFinal = Module2["_PHP_CRC32LEFinal"] = (a0, a1) => (_PHP_CRC32LEFinal = Module2["_PHP_CRC32LEFinal"] = wasmExports["Hf"])(a0, a1);
    var _PHP_CRC32BEFinal = Module2["_PHP_CRC32BEFinal"] = (a0, a1) => (_PHP_CRC32BEFinal = Module2["_PHP_CRC32BEFinal"] = wasmExports["If"])(a0, a1);
    var _PHP_CRC32Copy = Module2["_PHP_CRC32Copy"] = (a0, a1, a2) => (_PHP_CRC32Copy = Module2["_PHP_CRC32Copy"] = wasmExports["Jf"])(a0, a1, a2);
    var _PHP_FNV132Init = Module2["_PHP_FNV132Init"] = (a0, a1) => (_PHP_FNV132Init = Module2["_PHP_FNV132Init"] = wasmExports["Kf"])(a0, a1);
    var _PHP_FNV132Update = Module2["_PHP_FNV132Update"] = (a0, a1, a2) => (_PHP_FNV132Update = Module2["_PHP_FNV132Update"] = wasmExports["Lf"])(a0, a1, a2);
    var _PHP_FNV132Final = Module2["_PHP_FNV132Final"] = (a0, a1) => (_PHP_FNV132Final = Module2["_PHP_FNV132Final"] = wasmExports["Mf"])(a0, a1);
    var _PHP_FNV1a32Update = Module2["_PHP_FNV1a32Update"] = (a0, a1, a2) => (_PHP_FNV1a32Update = Module2["_PHP_FNV1a32Update"] = wasmExports["Nf"])(a0, a1, a2);
    var _PHP_FNV164Init = Module2["_PHP_FNV164Init"] = (a0, a1) => (_PHP_FNV164Init = Module2["_PHP_FNV164Init"] = wasmExports["Of"])(a0, a1);
    var _PHP_FNV164Update = Module2["_PHP_FNV164Update"] = (a0, a1, a2) => (_PHP_FNV164Update = Module2["_PHP_FNV164Update"] = wasmExports["Pf"])(a0, a1, a2);
    var _PHP_FNV164Final = Module2["_PHP_FNV164Final"] = (a0, a1) => (_PHP_FNV164Final = Module2["_PHP_FNV164Final"] = wasmExports["Qf"])(a0, a1);
    var _PHP_FNV1a64Update = Module2["_PHP_FNV1a64Update"] = (a0, a1, a2) => (_PHP_FNV1a64Update = Module2["_PHP_FNV1a64Update"] = wasmExports["Rf"])(a0, a1, a2);
    var _php_hash_copy = Module2["_php_hash_copy"] = (a0, a1, a2) => (_php_hash_copy = Module2["_php_hash_copy"] = wasmExports["Sf"])(a0, a1, a2);
    var _PHP_GOSTInit = Module2["_PHP_GOSTInit"] = (a0, a1) => (_PHP_GOSTInit = Module2["_PHP_GOSTInit"] = wasmExports["Tf"])(a0, a1);
    var _PHP_GOSTInitCrypto = Module2["_PHP_GOSTInitCrypto"] = (a0, a1) => (_PHP_GOSTInitCrypto = Module2["_PHP_GOSTInitCrypto"] = wasmExports["Uf"])(a0, a1);
    var _PHP_GOSTUpdate = Module2["_PHP_GOSTUpdate"] = (a0, a1, a2) => (_PHP_GOSTUpdate = Module2["_PHP_GOSTUpdate"] = wasmExports["Vf"])(a0, a1, a2);
    var _PHP_GOSTFinal = Module2["_PHP_GOSTFinal"] = (a0, a1) => (_PHP_GOSTFinal = Module2["_PHP_GOSTFinal"] = wasmExports["Wf"])(a0, a1);
    var _php_hash_unserialize_spec = Module2["_php_hash_unserialize_spec"] = (a0, a1, a2) => (_php_hash_unserialize_spec = Module2["_php_hash_unserialize_spec"] = wasmExports["Xf"])(a0, a1, a2);
    var _PHP_3HAVAL128Init = Module2["_PHP_3HAVAL128Init"] = (a0, a1) => (_PHP_3HAVAL128Init = Module2["_PHP_3HAVAL128Init"] = wasmExports["Yf"])(a0, a1);
    var _PHP_HAVALUpdate = Module2["_PHP_HAVALUpdate"] = (a0, a1, a2) => (_PHP_HAVALUpdate = Module2["_PHP_HAVALUpdate"] = wasmExports["Zf"])(a0, a1, a2);
    var _PHP_HAVAL128Final = Module2["_PHP_HAVAL128Final"] = (a0, a1) => (_PHP_HAVAL128Final = Module2["_PHP_HAVAL128Final"] = wasmExports["_f"])(a0, a1);
    var _PHP_3HAVAL160Init = Module2["_PHP_3HAVAL160Init"] = (a0, a1) => (_PHP_3HAVAL160Init = Module2["_PHP_3HAVAL160Init"] = wasmExports["$f"])(a0, a1);
    var _PHP_HAVAL160Final = Module2["_PHP_HAVAL160Final"] = (a0, a1) => (_PHP_HAVAL160Final = Module2["_PHP_HAVAL160Final"] = wasmExports["ag"])(a0, a1);
    var _PHP_3HAVAL192Init = Module2["_PHP_3HAVAL192Init"] = (a0, a1) => (_PHP_3HAVAL192Init = Module2["_PHP_3HAVAL192Init"] = wasmExports["bg"])(a0, a1);
    var _PHP_HAVAL192Final = Module2["_PHP_HAVAL192Final"] = (a0, a1) => (_PHP_HAVAL192Final = Module2["_PHP_HAVAL192Final"] = wasmExports["cg"])(a0, a1);
    var _PHP_3HAVAL224Init = Module2["_PHP_3HAVAL224Init"] = (a0, a1) => (_PHP_3HAVAL224Init = Module2["_PHP_3HAVAL224Init"] = wasmExports["dg"])(a0, a1);
    var _PHP_HAVAL224Final = Module2["_PHP_HAVAL224Final"] = (a0, a1) => (_PHP_HAVAL224Final = Module2["_PHP_HAVAL224Final"] = wasmExports["eg"])(a0, a1);
    var _PHP_3HAVAL256Init = Module2["_PHP_3HAVAL256Init"] = (a0, a1) => (_PHP_3HAVAL256Init = Module2["_PHP_3HAVAL256Init"] = wasmExports["fg"])(a0, a1);
    var _PHP_HAVAL256Final = Module2["_PHP_HAVAL256Final"] = (a0, a1) => (_PHP_HAVAL256Final = Module2["_PHP_HAVAL256Final"] = wasmExports["gg"])(a0, a1);
    var _PHP_4HAVAL128Init = Module2["_PHP_4HAVAL128Init"] = (a0, a1) => (_PHP_4HAVAL128Init = Module2["_PHP_4HAVAL128Init"] = wasmExports["hg"])(a0, a1);
    var _PHP_4HAVAL160Init = Module2["_PHP_4HAVAL160Init"] = (a0, a1) => (_PHP_4HAVAL160Init = Module2["_PHP_4HAVAL160Init"] = wasmExports["ig"])(a0, a1);
    var _PHP_4HAVAL192Init = Module2["_PHP_4HAVAL192Init"] = (a0, a1) => (_PHP_4HAVAL192Init = Module2["_PHP_4HAVAL192Init"] = wasmExports["jg"])(a0, a1);
    var _PHP_4HAVAL224Init = Module2["_PHP_4HAVAL224Init"] = (a0, a1) => (_PHP_4HAVAL224Init = Module2["_PHP_4HAVAL224Init"] = wasmExports["kg"])(a0, a1);
    var _PHP_4HAVAL256Init = Module2["_PHP_4HAVAL256Init"] = (a0, a1) => (_PHP_4HAVAL256Init = Module2["_PHP_4HAVAL256Init"] = wasmExports["lg"])(a0, a1);
    var _PHP_5HAVAL128Init = Module2["_PHP_5HAVAL128Init"] = (a0, a1) => (_PHP_5HAVAL128Init = Module2["_PHP_5HAVAL128Init"] = wasmExports["mg"])(a0, a1);
    var _PHP_5HAVAL160Init = Module2["_PHP_5HAVAL160Init"] = (a0, a1) => (_PHP_5HAVAL160Init = Module2["_PHP_5HAVAL160Init"] = wasmExports["ng"])(a0, a1);
    var _PHP_5HAVAL192Init = Module2["_PHP_5HAVAL192Init"] = (a0, a1) => (_PHP_5HAVAL192Init = Module2["_PHP_5HAVAL192Init"] = wasmExports["og"])(a0, a1);
    var _PHP_5HAVAL224Init = Module2["_PHP_5HAVAL224Init"] = (a0, a1) => (_PHP_5HAVAL224Init = Module2["_PHP_5HAVAL224Init"] = wasmExports["pg"])(a0, a1);
    var _PHP_5HAVAL256Init = Module2["_PHP_5HAVAL256Init"] = (a0, a1) => (_PHP_5HAVAL256Init = Module2["_PHP_5HAVAL256Init"] = wasmExports["qg"])(a0, a1);
    var _PHP_JOAATInit = Module2["_PHP_JOAATInit"] = (a0, a1) => (_PHP_JOAATInit = Module2["_PHP_JOAATInit"] = wasmExports["rg"])(a0, a1);
    var _PHP_JOAATUpdate = Module2["_PHP_JOAATUpdate"] = (a0, a1, a2) => (_PHP_JOAATUpdate = Module2["_PHP_JOAATUpdate"] = wasmExports["sg"])(a0, a1, a2);
    var _PHP_JOAATFinal = Module2["_PHP_JOAATFinal"] = (a0, a1) => (_PHP_JOAATFinal = Module2["_PHP_JOAATFinal"] = wasmExports["tg"])(a0, a1);
    var _PHP_MD4InitArgs = Module2["_PHP_MD4InitArgs"] = (a0, a1) => (_PHP_MD4InitArgs = Module2["_PHP_MD4InitArgs"] = wasmExports["ug"])(a0, a1);
    var _PHP_MD4Update = Module2["_PHP_MD4Update"] = (a0, a1, a2) => (_PHP_MD4Update = Module2["_PHP_MD4Update"] = wasmExports["vg"])(a0, a1, a2);
    var _PHP_MD4Final = Module2["_PHP_MD4Final"] = (a0, a1) => (_PHP_MD4Final = Module2["_PHP_MD4Final"] = wasmExports["wg"])(a0, a1);
    var _PHP_MD2InitArgs = Module2["_PHP_MD2InitArgs"] = (a0, a1) => (_PHP_MD2InitArgs = Module2["_PHP_MD2InitArgs"] = wasmExports["xg"])(a0, a1);
    var _PHP_MD2Update = Module2["_PHP_MD2Update"] = (a0, a1, a2) => (_PHP_MD2Update = Module2["_PHP_MD2Update"] = wasmExports["yg"])(a0, a1, a2);
    var _PHP_MD2Final = Module2["_PHP_MD2Final"] = (a0, a1) => (_PHP_MD2Final = Module2["_PHP_MD2Final"] = wasmExports["zg"])(a0, a1);
    var _PHP_MD5InitArgs = Module2["_PHP_MD5InitArgs"] = (a0, a1) => (_PHP_MD5InitArgs = Module2["_PHP_MD5InitArgs"] = wasmExports["Ag"])(a0, a1);
    var _PHP_MD5Update = Module2["_PHP_MD5Update"] = (a0, a1, a2) => (_PHP_MD5Update = Module2["_PHP_MD5Update"] = wasmExports["Bg"])(a0, a1, a2);
    var _PHP_MD5Final = Module2["_PHP_MD5Final"] = (a0, a1) => (_PHP_MD5Final = Module2["_PHP_MD5Final"] = wasmExports["Cg"])(a0, a1);
    var _PHP_MURMUR3AInit = Module2["_PHP_MURMUR3AInit"] = (a0, a1) => (_PHP_MURMUR3AInit = Module2["_PHP_MURMUR3AInit"] = wasmExports["Dg"])(a0, a1);
    var _PHP_MURMUR3AUpdate = Module2["_PHP_MURMUR3AUpdate"] = (a0, a1, a2) => (_PHP_MURMUR3AUpdate = Module2["_PHP_MURMUR3AUpdate"] = wasmExports["Eg"])(a0, a1, a2);
    var _PHP_MURMUR3AFinal = Module2["_PHP_MURMUR3AFinal"] = (a0, a1) => (_PHP_MURMUR3AFinal = Module2["_PHP_MURMUR3AFinal"] = wasmExports["Fg"])(a0, a1);
    var _PHP_MURMUR3ACopy = Module2["_PHP_MURMUR3ACopy"] = (a0, a1, a2) => (_PHP_MURMUR3ACopy = Module2["_PHP_MURMUR3ACopy"] = wasmExports["Gg"])(a0, a1, a2);
    var _PHP_MURMUR3CInit = Module2["_PHP_MURMUR3CInit"] = (a0, a1) => (_PHP_MURMUR3CInit = Module2["_PHP_MURMUR3CInit"] = wasmExports["Hg"])(a0, a1);
    var _PHP_MURMUR3CUpdate = Module2["_PHP_MURMUR3CUpdate"] = (a0, a1, a2) => (_PHP_MURMUR3CUpdate = Module2["_PHP_MURMUR3CUpdate"] = wasmExports["Ig"])(a0, a1, a2);
    var _PHP_MURMUR3CFinal = Module2["_PHP_MURMUR3CFinal"] = (a0, a1) => (_PHP_MURMUR3CFinal = Module2["_PHP_MURMUR3CFinal"] = wasmExports["Jg"])(a0, a1);
    var _PHP_MURMUR3CCopy = Module2["_PHP_MURMUR3CCopy"] = (a0, a1, a2) => (_PHP_MURMUR3CCopy = Module2["_PHP_MURMUR3CCopy"] = wasmExports["Kg"])(a0, a1, a2);
    var _PHP_MURMUR3FInit = Module2["_PHP_MURMUR3FInit"] = (a0, a1) => (_PHP_MURMUR3FInit = Module2["_PHP_MURMUR3FInit"] = wasmExports["Lg"])(a0, a1);
    var _PHP_MURMUR3FUpdate = Module2["_PHP_MURMUR3FUpdate"] = (a0, a1, a2) => (_PHP_MURMUR3FUpdate = Module2["_PHP_MURMUR3FUpdate"] = wasmExports["Mg"])(a0, a1, a2);
    var _PHP_MURMUR3FFinal = Module2["_PHP_MURMUR3FFinal"] = (a0, a1) => (_PHP_MURMUR3FFinal = Module2["_PHP_MURMUR3FFinal"] = wasmExports["Ng"])(a0, a1);
    var _PHP_MURMUR3FCopy = Module2["_PHP_MURMUR3FCopy"] = (a0, a1, a2) => (_PHP_MURMUR3FCopy = Module2["_PHP_MURMUR3FCopy"] = wasmExports["Og"])(a0, a1, a2);
    var _PHP_RIPEMD128Init = Module2["_PHP_RIPEMD128Init"] = (a0, a1) => (_PHP_RIPEMD128Init = Module2["_PHP_RIPEMD128Init"] = wasmExports["Pg"])(a0, a1);
    var _PHP_RIPEMD128Update = Module2["_PHP_RIPEMD128Update"] = (a0, a1, a2) => (_PHP_RIPEMD128Update = Module2["_PHP_RIPEMD128Update"] = wasmExports["Qg"])(a0, a1, a2);
    var _PHP_RIPEMD128Final = Module2["_PHP_RIPEMD128Final"] = (a0, a1) => (_PHP_RIPEMD128Final = Module2["_PHP_RIPEMD128Final"] = wasmExports["Rg"])(a0, a1);
    var _PHP_RIPEMD160Init = Module2["_PHP_RIPEMD160Init"] = (a0, a1) => (_PHP_RIPEMD160Init = Module2["_PHP_RIPEMD160Init"] = wasmExports["Sg"])(a0, a1);
    var _PHP_RIPEMD160Update = Module2["_PHP_RIPEMD160Update"] = (a0, a1, a2) => (_PHP_RIPEMD160Update = Module2["_PHP_RIPEMD160Update"] = wasmExports["Tg"])(a0, a1, a2);
    var _PHP_RIPEMD160Final = Module2["_PHP_RIPEMD160Final"] = (a0, a1) => (_PHP_RIPEMD160Final = Module2["_PHP_RIPEMD160Final"] = wasmExports["Ug"])(a0, a1);
    var _PHP_RIPEMD256Init = Module2["_PHP_RIPEMD256Init"] = (a0, a1) => (_PHP_RIPEMD256Init = Module2["_PHP_RIPEMD256Init"] = wasmExports["Vg"])(a0, a1);
    var _PHP_RIPEMD256Update = Module2["_PHP_RIPEMD256Update"] = (a0, a1, a2) => (_PHP_RIPEMD256Update = Module2["_PHP_RIPEMD256Update"] = wasmExports["Wg"])(a0, a1, a2);
    var _PHP_RIPEMD256Final = Module2["_PHP_RIPEMD256Final"] = (a0, a1) => (_PHP_RIPEMD256Final = Module2["_PHP_RIPEMD256Final"] = wasmExports["Xg"])(a0, a1);
    var _PHP_RIPEMD320Init = Module2["_PHP_RIPEMD320Init"] = (a0, a1) => (_PHP_RIPEMD320Init = Module2["_PHP_RIPEMD320Init"] = wasmExports["Yg"])(a0, a1);
    var _PHP_RIPEMD320Update = Module2["_PHP_RIPEMD320Update"] = (a0, a1, a2) => (_PHP_RIPEMD320Update = Module2["_PHP_RIPEMD320Update"] = wasmExports["Zg"])(a0, a1, a2);
    var _PHP_RIPEMD320Final = Module2["_PHP_RIPEMD320Final"] = (a0, a1) => (_PHP_RIPEMD320Final = Module2["_PHP_RIPEMD320Final"] = wasmExports["_g"])(a0, a1);
    var _PHP_SHA256InitArgs = Module2["_PHP_SHA256InitArgs"] = (a0, a1) => (_PHP_SHA256InitArgs = Module2["_PHP_SHA256InitArgs"] = wasmExports["$g"])(a0, a1);
    var _PHP_SHA256Update = Module2["_PHP_SHA256Update"] = (a0, a1, a2) => (_PHP_SHA256Update = Module2["_PHP_SHA256Update"] = wasmExports["ah"])(a0, a1, a2);
    var _PHP_SHA256Final = Module2["_PHP_SHA256Final"] = (a0, a1) => (_PHP_SHA256Final = Module2["_PHP_SHA256Final"] = wasmExports["bh"])(a0, a1);
    var _PHP_SHA224InitArgs = Module2["_PHP_SHA224InitArgs"] = (a0, a1) => (_PHP_SHA224InitArgs = Module2["_PHP_SHA224InitArgs"] = wasmExports["ch"])(a0, a1);
    var _PHP_SHA224Update = Module2["_PHP_SHA224Update"] = (a0, a1, a2) => (_PHP_SHA224Update = Module2["_PHP_SHA224Update"] = wasmExports["dh"])(a0, a1, a2);
    var _PHP_SHA224Final = Module2["_PHP_SHA224Final"] = (a0, a1) => (_PHP_SHA224Final = Module2["_PHP_SHA224Final"] = wasmExports["eh"])(a0, a1);
    var _PHP_SHA384InitArgs = Module2["_PHP_SHA384InitArgs"] = (a0, a1) => (_PHP_SHA384InitArgs = Module2["_PHP_SHA384InitArgs"] = wasmExports["fh"])(a0, a1);
    var _PHP_SHA384Update = Module2["_PHP_SHA384Update"] = (a0, a1, a2) => (_PHP_SHA384Update = Module2["_PHP_SHA384Update"] = wasmExports["gh"])(a0, a1, a2);
    var _PHP_SHA384Final = Module2["_PHP_SHA384Final"] = (a0, a1) => (_PHP_SHA384Final = Module2["_PHP_SHA384Final"] = wasmExports["hh"])(a0, a1);
    var _PHP_SHA512InitArgs = Module2["_PHP_SHA512InitArgs"] = (a0, a1) => (_PHP_SHA512InitArgs = Module2["_PHP_SHA512InitArgs"] = wasmExports["ih"])(a0, a1);
    var _PHP_SHA512_256InitArgs = Module2["_PHP_SHA512_256InitArgs"] = (a0, a1) => (_PHP_SHA512_256InitArgs = Module2["_PHP_SHA512_256InitArgs"] = wasmExports["jh"])(a0, a1);
    var _PHP_SHA512_224InitArgs = Module2["_PHP_SHA512_224InitArgs"] = (a0, a1) => (_PHP_SHA512_224InitArgs = Module2["_PHP_SHA512_224InitArgs"] = wasmExports["kh"])(a0, a1);
    var _PHP_SHA512Update = Module2["_PHP_SHA512Update"] = (a0, a1, a2) => (_PHP_SHA512Update = Module2["_PHP_SHA512Update"] = wasmExports["lh"])(a0, a1, a2);
    var _PHP_SHA512Final = Module2["_PHP_SHA512Final"] = (a0, a1) => (_PHP_SHA512Final = Module2["_PHP_SHA512Final"] = wasmExports["mh"])(a0, a1);
    var _PHP_SHA512_256Final = Module2["_PHP_SHA512_256Final"] = (a0, a1) => (_PHP_SHA512_256Final = Module2["_PHP_SHA512_256Final"] = wasmExports["nh"])(a0, a1);
    var _PHP_SHA512_224Final = Module2["_PHP_SHA512_224Final"] = (a0, a1) => (_PHP_SHA512_224Final = Module2["_PHP_SHA512_224Final"] = wasmExports["oh"])(a0, a1);
    var _PHP_SHA1InitArgs = Module2["_PHP_SHA1InitArgs"] = (a0, a1) => (_PHP_SHA1InitArgs = Module2["_PHP_SHA1InitArgs"] = wasmExports["ph"])(a0, a1);
    var _PHP_SHA1Update = Module2["_PHP_SHA1Update"] = (a0, a1, a2) => (_PHP_SHA1Update = Module2["_PHP_SHA1Update"] = wasmExports["qh"])(a0, a1, a2);
    var _PHP_SHA1Final = Module2["_PHP_SHA1Final"] = (a0, a1) => (_PHP_SHA1Final = Module2["_PHP_SHA1Final"] = wasmExports["rh"])(a0, a1);
    var _PHP_SHA3224Init = Module2["_PHP_SHA3224Init"] = (a0, a1) => (_PHP_SHA3224Init = Module2["_PHP_SHA3224Init"] = wasmExports["sh"])(a0, a1);
    var _PHP_SHA3224Update = Module2["_PHP_SHA3224Update"] = (a0, a1, a2) => (_PHP_SHA3224Update = Module2["_PHP_SHA3224Update"] = wasmExports["th"])(a0, a1, a2);
    var _php_hash_serialize_spec = Module2["_php_hash_serialize_spec"] = (a0, a1, a2) => (_php_hash_serialize_spec = Module2["_php_hash_serialize_spec"] = wasmExports["uh"])(a0, a1, a2);
    var _PHP_SHA3256Init = Module2["_PHP_SHA3256Init"] = (a0, a1) => (_PHP_SHA3256Init = Module2["_PHP_SHA3256Init"] = wasmExports["vh"])(a0, a1);
    var _PHP_SHA3256Update = Module2["_PHP_SHA3256Update"] = (a0, a1, a2) => (_PHP_SHA3256Update = Module2["_PHP_SHA3256Update"] = wasmExports["wh"])(a0, a1, a2);
    var _PHP_SHA3384Init = Module2["_PHP_SHA3384Init"] = (a0, a1) => (_PHP_SHA3384Init = Module2["_PHP_SHA3384Init"] = wasmExports["xh"])(a0, a1);
    var _PHP_SHA3384Update = Module2["_PHP_SHA3384Update"] = (a0, a1, a2) => (_PHP_SHA3384Update = Module2["_PHP_SHA3384Update"] = wasmExports["yh"])(a0, a1, a2);
    var _PHP_SHA3512Init = Module2["_PHP_SHA3512Init"] = (a0, a1) => (_PHP_SHA3512Init = Module2["_PHP_SHA3512Init"] = wasmExports["zh"])(a0, a1);
    var _PHP_SHA3512Update = Module2["_PHP_SHA3512Update"] = (a0, a1, a2) => (_PHP_SHA3512Update = Module2["_PHP_SHA3512Update"] = wasmExports["Ah"])(a0, a1, a2);
    var _PHP_SNEFRUInit = Module2["_PHP_SNEFRUInit"] = (a0, a1) => (_PHP_SNEFRUInit = Module2["_PHP_SNEFRUInit"] = wasmExports["Bh"])(a0, a1);
    var _PHP_SNEFRUUpdate = Module2["_PHP_SNEFRUUpdate"] = (a0, a1, a2) => (_PHP_SNEFRUUpdate = Module2["_PHP_SNEFRUUpdate"] = wasmExports["Ch"])(a0, a1, a2);
    var _PHP_SNEFRUFinal = Module2["_PHP_SNEFRUFinal"] = (a0, a1) => (_PHP_SNEFRUFinal = Module2["_PHP_SNEFRUFinal"] = wasmExports["Dh"])(a0, a1);
    var _PHP_3TIGERInit = Module2["_PHP_3TIGERInit"] = (a0, a1) => (_PHP_3TIGERInit = Module2["_PHP_3TIGERInit"] = wasmExports["Eh"])(a0, a1);
    var _PHP_4TIGERInit = Module2["_PHP_4TIGERInit"] = (a0, a1) => (_PHP_4TIGERInit = Module2["_PHP_4TIGERInit"] = wasmExports["Fh"])(a0, a1);
    var _PHP_TIGERUpdate = Module2["_PHP_TIGERUpdate"] = (a0, a1, a2) => (_PHP_TIGERUpdate = Module2["_PHP_TIGERUpdate"] = wasmExports["Gh"])(a0, a1, a2);
    var _PHP_TIGER128Final = Module2["_PHP_TIGER128Final"] = (a0, a1) => (_PHP_TIGER128Final = Module2["_PHP_TIGER128Final"] = wasmExports["Hh"])(a0, a1);
    var _PHP_TIGER160Final = Module2["_PHP_TIGER160Final"] = (a0, a1) => (_PHP_TIGER160Final = Module2["_PHP_TIGER160Final"] = wasmExports["Ih"])(a0, a1);
    var _PHP_TIGER192Final = Module2["_PHP_TIGER192Final"] = (a0, a1) => (_PHP_TIGER192Final = Module2["_PHP_TIGER192Final"] = wasmExports["Jh"])(a0, a1);
    var _PHP_WHIRLPOOLInit = Module2["_PHP_WHIRLPOOLInit"] = (a0, a1) => (_PHP_WHIRLPOOLInit = Module2["_PHP_WHIRLPOOLInit"] = wasmExports["Kh"])(a0, a1);
    var _PHP_WHIRLPOOLUpdate = Module2["_PHP_WHIRLPOOLUpdate"] = (a0, a1, a2) => (_PHP_WHIRLPOOLUpdate = Module2["_PHP_WHIRLPOOLUpdate"] = wasmExports["Lh"])(a0, a1, a2);
    var _PHP_WHIRLPOOLFinal = Module2["_PHP_WHIRLPOOLFinal"] = (a0, a1) => (_PHP_WHIRLPOOLFinal = Module2["_PHP_WHIRLPOOLFinal"] = wasmExports["Mh"])(a0, a1);
    var _PHP_XXH32Init = Module2["_PHP_XXH32Init"] = (a0, a1) => (_PHP_XXH32Init = Module2["_PHP_XXH32Init"] = wasmExports["Nh"])(a0, a1);
    var _PHP_XXH32Update = Module2["_PHP_XXH32Update"] = (a0, a1, a2) => (_PHP_XXH32Update = Module2["_PHP_XXH32Update"] = wasmExports["Oh"])(a0, a1, a2);
    var _PHP_XXH32Final = Module2["_PHP_XXH32Final"] = (a0, a1) => (_PHP_XXH32Final = Module2["_PHP_XXH32Final"] = wasmExports["Ph"])(a0, a1);
    var _PHP_XXH32Copy = Module2["_PHP_XXH32Copy"] = (a0, a1, a2) => (_PHP_XXH32Copy = Module2["_PHP_XXH32Copy"] = wasmExports["Qh"])(a0, a1, a2);
    var _PHP_XXH64Init = Module2["_PHP_XXH64Init"] = (a0, a1) => (_PHP_XXH64Init = Module2["_PHP_XXH64Init"] = wasmExports["Rh"])(a0, a1);
    var _PHP_XXH64Update = Module2["_PHP_XXH64Update"] = (a0, a1, a2) => (_PHP_XXH64Update = Module2["_PHP_XXH64Update"] = wasmExports["Sh"])(a0, a1, a2);
    var _PHP_XXH64Final = Module2["_PHP_XXH64Final"] = (a0, a1) => (_PHP_XXH64Final = Module2["_PHP_XXH64Final"] = wasmExports["Th"])(a0, a1);
    var _PHP_XXH64Copy = Module2["_PHP_XXH64Copy"] = (a0, a1, a2) => (_PHP_XXH64Copy = Module2["_PHP_XXH64Copy"] = wasmExports["Uh"])(a0, a1, a2);
    var _PHP_XXH3_64_Init = Module2["_PHP_XXH3_64_Init"] = (a0, a1) => (_PHP_XXH3_64_Init = Module2["_PHP_XXH3_64_Init"] = wasmExports["Vh"])(a0, a1);
    var _zval_try_get_string_func = Module2["_zval_try_get_string_func"] = (a0) => (_zval_try_get_string_func = Module2["_zval_try_get_string_func"] = wasmExports["Wh"])(a0);
    var _PHP_XXH3_64_Update = Module2["_PHP_XXH3_64_Update"] = (a0, a1, a2) => (_PHP_XXH3_64_Update = Module2["_PHP_XXH3_64_Update"] = wasmExports["Xh"])(a0, a1, a2);
    var _PHP_XXH3_64_Final = Module2["_PHP_XXH3_64_Final"] = (a0, a1) => (_PHP_XXH3_64_Final = Module2["_PHP_XXH3_64_Final"] = wasmExports["Yh"])(a0, a1);
    var _PHP_XXH3_64_Copy = Module2["_PHP_XXH3_64_Copy"] = (a0, a1, a2) => (_PHP_XXH3_64_Copy = Module2["_PHP_XXH3_64_Copy"] = wasmExports["Zh"])(a0, a1, a2);
    var _PHP_XXH3_128_Init = Module2["_PHP_XXH3_128_Init"] = (a0, a1) => (_PHP_XXH3_128_Init = Module2["_PHP_XXH3_128_Init"] = wasmExports["_h"])(a0, a1);
    var _PHP_XXH3_128_Update = Module2["_PHP_XXH3_128_Update"] = (a0, a1, a2) => (_PHP_XXH3_128_Update = Module2["_PHP_XXH3_128_Update"] = wasmExports["$h"])(a0, a1, a2);
    var _PHP_XXH3_128_Final = Module2["_PHP_XXH3_128_Final"] = (a0, a1) => (_PHP_XXH3_128_Final = Module2["_PHP_XXH3_128_Final"] = wasmExports["ai"])(a0, a1);
    var _PHP_XXH3_128_Copy = Module2["_PHP_XXH3_128_Copy"] = (a0, a1, a2) => (_PHP_XXH3_128_Copy = Module2["_PHP_XXH3_128_Copy"] = wasmExports["bi"])(a0, a1, a2);
    var _php_hash_fetch_ops = Module2["_php_hash_fetch_ops"] = (a0) => (_php_hash_fetch_ops = Module2["_php_hash_fetch_ops"] = wasmExports["ci"])(a0);
    var _zend_string_tolower_ex = Module2["_zend_string_tolower_ex"] = (a0, a1) => (_zend_string_tolower_ex = Module2["_zend_string_tolower_ex"] = wasmExports["di"])(a0, a1);
    var _php_hash_register_algo = Module2["_php_hash_register_algo"] = (a0, a1) => (_php_hash_register_algo = Module2["_php_hash_register_algo"] = wasmExports["ei"])(a0, a1);
    var _zend_str_tolower_dup = Module2["_zend_str_tolower_dup"] = (a0, a1) => (_zend_str_tolower_dup = Module2["_zend_str_tolower_dup"] = wasmExports["fi"])(a0, a1);
    var _zend_hash_index_find = Module2["_zend_hash_index_find"] = (a0, a1) => (_zend_hash_index_find = Module2["_zend_hash_index_find"] = wasmExports["gi"])(a0, a1);
    var __php_stream_open_wrapper_ex = Module2["__php_stream_open_wrapper_ex"] = (a0, a1, a2, a3, a4) => (__php_stream_open_wrapper_ex = Module2["__php_stream_open_wrapper_ex"] = wasmExports["hi"])(a0, a1, a2, a3, a4);
    var __php_stream_read = Module2["__php_stream_read"] = (a0, a1, a2) => (__php_stream_read = Module2["__php_stream_read"] = wasmExports["ii"])(a0, a1, a2);
    var __php_stream_free = Module2["__php_stream_free"] = (a0, a1) => (__php_stream_free = Module2["__php_stream_free"] = wasmExports["ji"])(a0, a1);
    var _zend_parse_parameters = Module2["_zend_parse_parameters"] = (a0, a1, a2) => (_zend_parse_parameters = Module2["_zend_parse_parameters"] = wasmExports["ki"])(a0, a1, a2);
    var _php_file_le_stream = Module2["_php_file_le_stream"] = () => (_php_file_le_stream = Module2["_php_file_le_stream"] = wasmExports["li"])();
    var _php_file_le_pstream = Module2["_php_file_le_pstream"] = () => (_php_file_le_pstream = Module2["_php_file_le_pstream"] = wasmExports["mi"])();
    var _zend_fetch_resource2_ex = Module2["_zend_fetch_resource2_ex"] = (a0, a1, a2, a3) => (_zend_fetch_resource2_ex = Module2["_zend_fetch_resource2_ex"] = wasmExports["ni"])(a0, a1, a2, a3);
    var _php_le_stream_context = Module2["_php_le_stream_context"] = () => (_php_le_stream_context = Module2["_php_le_stream_context"] = wasmExports["oi"])();
    var _zend_fetch_resource_ex = Module2["_zend_fetch_resource_ex"] = (a0, a1, a2) => (_zend_fetch_resource_ex = Module2["_zend_fetch_resource_ex"] = wasmExports["pi"])(a0, a1, a2);
    var _php_stream_context_alloc = Module2["_php_stream_context_alloc"] = () => (_php_stream_context_alloc = Module2["_php_stream_context_alloc"] = wasmExports["qi"])();
    var _add_next_index_str = Module2["_add_next_index_str"] = (a0, a1) => (_add_next_index_str = Module2["_add_next_index_str"] = wasmExports["ri"])(a0, a1);
    var _zend_argument_must_not_be_empty_error = Module2["_zend_argument_must_not_be_empty_error"] = (a0) => (_zend_argument_must_not_be_empty_error = Module2["_zend_argument_must_not_be_empty_error"] = wasmExports["si"])(a0);
    var _zend_zval_value_name = Module2["_zend_zval_value_name"] = (a0) => (_zend_zval_value_name = Module2["_zend_zval_value_name"] = wasmExports["ti"])(a0);
    var _php_safe_bcmp = Module2["_php_safe_bcmp"] = (a0, a1) => (_php_safe_bcmp = Module2["_php_safe_bcmp"] = wasmExports["ui"])(a0, a1);
    var _zend_throw_exception = Module2["_zend_throw_exception"] = (a0, a1, a2) => (_zend_throw_exception = Module2["_zend_throw_exception"] = wasmExports["vi"])(a0, a1, a2);
    var _object_properties_load = Module2["_object_properties_load"] = (a0, a1) => (_object_properties_load = Module2["_object_properties_load"] = wasmExports["wi"])(a0, a1);
    var __is_numeric_string_ex = Module2["__is_numeric_string_ex"] = (a0, a1, a2, a3, a4, a5, a6) => (__is_numeric_string_ex = Module2["__is_numeric_string_ex"] = wasmExports["xi"])(a0, a1, a2, a3, a4, a5, a6);
    var _zend_gcvt = Module2["_zend_gcvt"] = (a0, a1, a2, a3, a4) => (_zend_gcvt = Module2["_zend_gcvt"] = wasmExports["yi"])(a0, a1, a2, a3, a4);
    var _php_next_utf8_char = Module2["_php_next_utf8_char"] = (a0, a1, a2, a3) => (_php_next_utf8_char = Module2["_php_next_utf8_char"] = wasmExports["zi"])(a0, a1, a2, a3);
    var _zend_get_recursion_guard = Module2["_zend_get_recursion_guard"] = (a0) => (_zend_get_recursion_guard = Module2["_zend_get_recursion_guard"] = wasmExports["Ai"])(a0);
    var __call_user_function_impl = Module2["__call_user_function_impl"] = (a0, a1, a2, a3, a4, a5) => (__call_user_function_impl = Module2["__call_user_function_impl"] = wasmExports["Bi"])(a0, a1, a2, a3, a4, a5);
    var _rc_dtor_func = Module2["_rc_dtor_func"] = (a0) => (_rc_dtor_func = Module2["_rc_dtor_func"] = wasmExports["Ci"])(a0);
    var _zend_get_properties_for = Module2["_zend_get_properties_for"] = (a0, a1) => (_zend_get_properties_for = Module2["_zend_get_properties_for"] = wasmExports["Di"])(a0, a1);
    var _zend_read_property_ex = Module2["_zend_read_property_ex"] = (a0, a1, a2, a3, a4) => (_zend_read_property_ex = Module2["_zend_read_property_ex"] = wasmExports["Ei"])(a0, a1, a2, a3, a4);
    var _object_init = Module2["_object_init"] = (a0) => (_object_init = Module2["_object_init"] = wasmExports["Fi"])(a0);
    var _php_json_parser_error_code = Module2["_php_json_parser_error_code"] = (a0) => (_php_json_parser_error_code = Module2["_php_json_parser_error_code"] = wasmExports["Gi"])(a0);
    var _php_json_parser_init_ex = Module2["_php_json_parser_init_ex"] = (a0, a1, a2, a3, a4, a5, a6) => (_php_json_parser_init_ex = Module2["_php_json_parser_init_ex"] = wasmExports["Hi"])(a0, a1, a2, a3, a4, a5, a6);
    var _php_json_parser_init = Module2["_php_json_parser_init"] = (a0, a1, a2, a3, a4, a5) => (_php_json_parser_init = Module2["_php_json_parser_init"] = wasmExports["Ii"])(a0, a1, a2, a3, a4, a5);
    var _php_json_parse = Module2["_php_json_parse"] = (a0) => (_php_json_parse = Module2["_php_json_parse"] = wasmExports["Ji"])(a0);
    var __zend_handle_numeric_str_ex = Module2["__zend_handle_numeric_str_ex"] = (a0, a1, a2) => (__zend_handle_numeric_str_ex = Module2["__zend_handle_numeric_str_ex"] = wasmExports["Ki"])(a0, a1, a2);
    var _zend_strtod = Module2["_zend_strtod"] = (a0, a1) => (_zend_strtod = Module2["_zend_strtod"] = wasmExports["Li"])(a0, a1);
    var _php_json_encode_string = Module2["_php_json_encode_string"] = (a0, a1, a2) => (_php_json_encode_string = Module2["_php_json_encode_string"] = wasmExports["Mi"])(a0, a1, a2);
    var _php_json_encode_ex = Module2["_php_json_encode_ex"] = (a0, a1, a2, a3) => (_php_json_encode_ex = Module2["_php_json_encode_ex"] = wasmExports["Ni"])(a0, a1, a2, a3);
    var _php_json_encode = Module2["_php_json_encode"] = (a0, a1, a2) => (_php_json_encode = Module2["_php_json_encode"] = wasmExports["Oi"])(a0, a1, a2);
    var _php_json_decode_ex = Module2["_php_json_decode_ex"] = (a0, a1, a2, a3, a4) => (_php_json_decode_ex = Module2["_php_json_decode_ex"] = wasmExports["Pi"])(a0, a1, a2, a3, a4);
    var _php_json_validate_ex = Module2["_php_json_validate_ex"] = (a0, a1, a2, a3) => (_php_json_validate_ex = Module2["_php_json_validate_ex"] = wasmExports["Qi"])(a0, a1, a2, a3);
    var _php_random_bytes_ex = Module2["_php_random_bytes_ex"] = (a0, a1, a2, a3) => (_php_random_bytes_ex = Module2["_php_random_bytes_ex"] = wasmExports["Ri"])(a0, a1, a2, a3);
    var _php_random_bytes = Module2["_php_random_bytes"] = (a0, a1, a2) => (_php_random_bytes = Module2["_php_random_bytes"] = wasmExports["Si"])(a0, a1, a2);
    var _php_random_int = Module2["_php_random_int"] = (a0, a1, a2, a3) => (_php_random_int = Module2["_php_random_int"] = wasmExports["Ti"])(a0, a1, a2, a3);
    var _php_random_csprng_shutdown = Module2["_php_random_csprng_shutdown"] = () => (_php_random_csprng_shutdown = Module2["_php_random_csprng_shutdown"] = wasmExports["Ui"])();
    var _zend_atomic_int_exchange = Module2["_zend_atomic_int_exchange"] = (a0, a1) => (_zend_atomic_int_exchange = Module2["_zend_atomic_int_exchange"] = wasmExports["Vi"])(a0, a1);
    var _php_random_mt19937_seed32 = Module2["_php_random_mt19937_seed32"] = (a0, a1) => (_php_random_mt19937_seed32 = Module2["_php_random_mt19937_seed32"] = wasmExports["Wi"])(a0, a1);
    var _php_random_range = Module2["_php_random_range"] = (a0, a1, a2) => (_php_random_range = Module2["_php_random_range"] = wasmExports["Xi"])(a0, a1, a2);
    var _php_random_bin2hex_le = Module2["_php_random_bin2hex_le"] = (a0, a1) => (_php_random_bin2hex_le = Module2["_php_random_bin2hex_le"] = wasmExports["Yi"])(a0, a1);
    var _php_random_hex2bin_le = Module2["_php_random_hex2bin_le"] = (a0, a1) => (_php_random_hex2bin_le = Module2["_php_random_hex2bin_le"] = wasmExports["Zi"])(a0, a1);
    var _php_random_mt19937_seed_default = Module2["_php_random_mt19937_seed_default"] = (a0) => (_php_random_mt19937_seed_default = Module2["_php_random_mt19937_seed_default"] = wasmExports["_i"])(a0);
    var _php_random_generate_fallback_seed = Module2["_php_random_generate_fallback_seed"] = () => (_php_random_generate_fallback_seed = Module2["_php_random_generate_fallback_seed"] = wasmExports["$i"])();
    var _php_random_pcgoneseq128xslrr64_seed128 = Module2["_php_random_pcgoneseq128xslrr64_seed128"] = (a0, a1, a2, a3, a4) => (_php_random_pcgoneseq128xslrr64_seed128 = Module2["_php_random_pcgoneseq128xslrr64_seed128"] = wasmExports["aj"])(a0, a1, a2, a3, a4);
    var _php_random_pcgoneseq128xslrr64_advance = Module2["_php_random_pcgoneseq128xslrr64_advance"] = (a0, a1, a2) => (_php_random_pcgoneseq128xslrr64_advance = Module2["_php_random_pcgoneseq128xslrr64_advance"] = wasmExports["bj"])(a0, a1, a2);
    var _zend_parse_arg_str_or_long_slow = Module2["_zend_parse_arg_str_or_long_slow"] = (a0, a1, a2, a3) => (_zend_parse_arg_str_or_long_slow = Module2["_zend_parse_arg_str_or_long_slow"] = wasmExports["cj"])(a0, a1, a2, a3);
    var _zend_call_known_function = Module2["_zend_call_known_function"] = (a0, a1, a2, a3, a4, a5, a6) => (_zend_call_known_function = Module2["_zend_call_known_function"] = wasmExports["dj"])(a0, a1, a2, a3, a4, a5, a6);
    var _php_random_xoshiro256starstar_seed256 = Module2["_php_random_xoshiro256starstar_seed256"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8) => (_php_random_xoshiro256starstar_seed256 = Module2["_php_random_xoshiro256starstar_seed256"] = wasmExports["ej"])(a0, a1, a2, a3, a4, a5, a6, a7, a8);
    var _php_random_xoshiro256starstar_seed64 = Module2["_php_random_xoshiro256starstar_seed64"] = (a0, a1, a2) => (_php_random_xoshiro256starstar_seed64 = Module2["_php_random_xoshiro256starstar_seed64"] = wasmExports["fj"])(a0, a1, a2);
    var _php_random_xoshiro256starstar_jump = Module2["_php_random_xoshiro256starstar_jump"] = (a0) => (_php_random_xoshiro256starstar_jump = Module2["_php_random_xoshiro256starstar_jump"] = wasmExports["gj"])(a0);
    var _php_random_xoshiro256starstar_jump_long = Module2["_php_random_xoshiro256starstar_jump_long"] = (a0) => (_php_random_xoshiro256starstar_jump_long = Module2["_php_random_xoshiro256starstar_jump_long"] = wasmExports["hj"])(a0);
    var _php_random_gammasection_closed_open = Module2["_php_random_gammasection_closed_open"] = (a0, a1, a2) => (_php_random_gammasection_closed_open = Module2["_php_random_gammasection_closed_open"] = wasmExports["ij"])(a0, a1, a2);
    var _php_random_range64 = Module2["_php_random_range64"] = (a0, a1, a2) => (_php_random_range64 = Module2["_php_random_range64"] = wasmExports["jj"])(a0, a1, a2);
    var _php_random_gammasection_closed_closed = Module2["_php_random_gammasection_closed_closed"] = (a0, a1, a2) => (_php_random_gammasection_closed_closed = Module2["_php_random_gammasection_closed_closed"] = wasmExports["kj"])(a0, a1, a2);
    var _php_random_gammasection_open_closed = Module2["_php_random_gammasection_open_closed"] = (a0, a1, a2) => (_php_random_gammasection_open_closed = Module2["_php_random_gammasection_open_closed"] = wasmExports["lj"])(a0, a1, a2);
    var _php_random_gammasection_open_open = Module2["_php_random_gammasection_open_open"] = (a0, a1, a2) => (_php_random_gammasection_open_open = Module2["_php_random_gammasection_open_open"] = wasmExports["mj"])(a0, a1, a2);
    var _php_random_range32 = Module2["_php_random_range32"] = (a0, a1) => (_php_random_range32 = Module2["_php_random_range32"] = wasmExports["nj"])(a0, a1);
    var _php_random_status_alloc = Module2["_php_random_status_alloc"] = (a0, a1) => (_php_random_status_alloc = Module2["_php_random_status_alloc"] = wasmExports["oj"])(a0, a1);
    var _php_random_status_copy = Module2["_php_random_status_copy"] = (a0, a1, a2) => (_php_random_status_copy = Module2["_php_random_status_copy"] = wasmExports["pj"])(a0, a1, a2);
    var _php_random_status_free = Module2["_php_random_status_free"] = (a0, a1) => (_php_random_status_free = Module2["_php_random_status_free"] = wasmExports["qj"])(a0, a1);
    var _php_random_engine_common_init = Module2["_php_random_engine_common_init"] = (a0, a1, a2) => (_php_random_engine_common_init = Module2["_php_random_engine_common_init"] = wasmExports["rj"])(a0, a1, a2);
    var _php_random_engine_common_free_object = Module2["_php_random_engine_common_free_object"] = (a0) => (_php_random_engine_common_free_object = Module2["_php_random_engine_common_free_object"] = wasmExports["sj"])(a0);
    var _php_random_engine_common_clone_object = Module2["_php_random_engine_common_clone_object"] = (a0) => (_php_random_engine_common_clone_object = Module2["_php_random_engine_common_clone_object"] = wasmExports["tj"])(a0);
    var _php_random_default_algo = Module2["_php_random_default_algo"] = () => (_php_random_default_algo = Module2["_php_random_default_algo"] = wasmExports["uj"])();
    var _php_random_default_status = Module2["_php_random_default_status"] = () => (_php_random_default_status = Module2["_php_random_default_status"] = wasmExports["vj"])();
    var _php_combined_lcg = Module2["_php_combined_lcg"] = () => (_php_combined_lcg = Module2["_php_combined_lcg"] = wasmExports["wj"])();
    var _php_random_generate_fallback_seed_ex = Module2["_php_random_generate_fallback_seed_ex"] = (a0) => (_php_random_generate_fallback_seed_ex = Module2["_php_random_generate_fallback_seed_ex"] = wasmExports["xj"])(a0);
    var _php_mt_srand = Module2["_php_mt_srand"] = (a0) => (_php_mt_srand = Module2["_php_mt_srand"] = wasmExports["yj"])(a0);
    var _php_mt_rand = Module2["_php_mt_rand"] = () => (_php_mt_rand = Module2["_php_mt_rand"] = wasmExports["zj"])();
    var _php_mt_rand_range = Module2["_php_mt_rand_range"] = (a0, a1) => (_php_mt_rand_range = Module2["_php_mt_rand_range"] = wasmExports["Aj"])(a0, a1);
    var _php_mt_rand_common = Module2["_php_mt_rand_common"] = (a0, a1) => (_php_mt_rand_common = Module2["_php_mt_rand_common"] = wasmExports["Bj"])(a0, a1);
    var _zend_register_internal_enum = Module2["_zend_register_internal_enum"] = (a0, a1, a2) => (_zend_register_internal_enum = Module2["_zend_register_internal_enum"] = wasmExports["Cj"])(a0, a1, a2);
    var _zend_enum_add_case_cstr = Module2["_zend_enum_add_case_cstr"] = (a0, a1, a2) => (_zend_enum_add_case_cstr = Module2["_zend_enum_add_case_cstr"] = wasmExports["Dj"])(a0, a1, a2);
    var _zend_objects_store_del = Module2["_zend_objects_store_del"] = (a0) => (_zend_objects_store_del = Module2["_zend_objects_store_del"] = wasmExports["Ej"])(a0);
    var _gc_possible_root = Module2["_gc_possible_root"] = (a0) => (_gc_possible_root = Module2["_gc_possible_root"] = wasmExports["Fj"])(a0);
    var _zend_value_error = Module2["_zend_value_error"] = (a0, a1) => (_zend_value_error = Module2["_zend_value_error"] = wasmExports["Gj"])(a0, a1);
    var _php_array_data_shuffle = Module2["_php_array_data_shuffle"] = (a0, a1) => (_php_array_data_shuffle = Module2["_php_array_data_shuffle"] = wasmExports["Hj"])(a0, a1);
    var _php_binary_string_shuffle = Module2["_php_binary_string_shuffle"] = (a0, a1, a2) => (_php_binary_string_shuffle = Module2["_php_binary_string_shuffle"] = wasmExports["Ij"])(a0, a1, a2);
    var _php_array_pick_keys = Module2["_php_array_pick_keys"] = (a0, a1, a2, a3, a4) => (_php_array_pick_keys = Module2["_php_array_pick_keys"] = wasmExports["Jj"])(a0, a1, a2, a3, a4);
    var _zend_read_property = Module2["_zend_read_property"] = (a0, a1, a2, a3, a4, a5) => (_zend_read_property = Module2["_zend_read_property"] = wasmExports["Kj"])(a0, a1, a2, a3, a4, a5);
    var _php_random_bytes_insecure_for_zend = Module2["_php_random_bytes_insecure_for_zend"] = (a0, a1, a2) => (_php_random_bytes_insecure_for_zend = Module2["_php_random_bytes_insecure_for_zend"] = wasmExports["Lj"])(a0, a1, a2);
    var _zend_reflection_class_factory = Module2["_zend_reflection_class_factory"] = (a0, a1) => (_zend_reflection_class_factory = Module2["_zend_reflection_class_factory"] = wasmExports["Mj"])(a0, a1);
    var _add_next_index_stringl = Module2["_add_next_index_stringl"] = (a0, a1, a2) => (_add_next_index_stringl = Module2["_add_next_index_stringl"] = wasmExports["Nj"])(a0, a1, a2);
    var _zend_get_closure_method_def = Module2["_zend_get_closure_method_def"] = (a0) => (_zend_get_closure_method_def = Module2["_zend_get_closure_method_def"] = wasmExports["Oj"])(a0);
    var _zend_str_tolower_copy = Module2["_zend_str_tolower_copy"] = (a0, a1, a2) => (_zend_str_tolower_copy = Module2["_zend_str_tolower_copy"] = wasmExports["Pj"])(a0, a1, a2);
    var _zend_fetch_function = Module2["_zend_fetch_function"] = (a0) => (_zend_fetch_function = Module2["_zend_fetch_function"] = wasmExports["Qj"])(a0);
    var _smart_str_append_printf = Module2["_smart_str_append_printf"] = (a0, a1, a2) => (_smart_str_append_printf = Module2["_smart_str_append_printf"] = wasmExports["Rj"])(a0, a1, a2);
    var _zend_type_to_string = Module2["_zend_type_to_string"] = (a0) => (_zend_type_to_string = Module2["_zend_type_to_string"] = wasmExports["Sj"])(a0);
    var _zend_get_closure_this_ptr = Module2["_zend_get_closure_this_ptr"] = (a0) => (_zend_get_closure_this_ptr = Module2["_zend_get_closure_this_ptr"] = wasmExports["Tj"])(a0);
    var _zend_create_fake_closure = Module2["_zend_create_fake_closure"] = (a0, a1, a2, a3, a4) => (_zend_create_fake_closure = Module2["_zend_create_fake_closure"] = wasmExports["Uj"])(a0, a1, a2, a3, a4);
    var _zend_lookup_class_ex = Module2["_zend_lookup_class_ex"] = (a0, a1, a2) => (_zend_lookup_class_ex = Module2["_zend_lookup_class_ex"] = wasmExports["Vj"])(a0, a1, a2);
    var _zval_add_ref = Module2["_zval_add_ref"] = (a0) => (_zval_add_ref = Module2["_zval_add_ref"] = wasmExports["Wj"])(a0);
    var _zend_hash_copy = Module2["_zend_hash_copy"] = (a0, a1, a2) => (_zend_hash_copy = Module2["_zend_hash_copy"] = wasmExports["Xj"])(a0, a1, a2);
    var __emalloc_160 = Module2["__emalloc_160"] = () => (__emalloc_160 = Module2["__emalloc_160"] = wasmExports["Yj"])();
    var __efree_32 = Module2["__efree_32"] = (a0) => (__efree_32 = Module2["__efree_32"] = wasmExports["Zj"])(a0);
    var _zend_generator_update_root = Module2["_zend_generator_update_root"] = (a0) => (_zend_generator_update_root = Module2["_zend_generator_update_root"] = wasmExports["_j"])(a0);
    var _zend_generator_update_current = Module2["_zend_generator_update_current"] = (a0) => (_zend_generator_update_current = Module2["_zend_generator_update_current"] = wasmExports["$j"])(a0);
    var _zend_fetch_debug_backtrace = Module2["_zend_fetch_debug_backtrace"] = (a0, a1, a2, a3) => (_zend_fetch_debug_backtrace = Module2["_zend_fetch_debug_backtrace"] = wasmExports["ak"])(a0, a1, a2, a3);
    var _zend_get_closure_invoke_method = Module2["_zend_get_closure_invoke_method"] = (a0) => (_zend_get_closure_invoke_method = Module2["_zend_get_closure_invoke_method"] = wasmExports["bk"])(a0);
    var _zend_binary_strcasecmp = Module2["_zend_binary_strcasecmp"] = (a0, a1, a2, a3) => (_zend_binary_strcasecmp = Module2["_zend_binary_strcasecmp"] = wasmExports["ck"])(a0, a1, a2, a3);
    var _zend_get_default_from_internal_arg_info = Module2["_zend_get_default_from_internal_arg_info"] = (a0, a1) => (_zend_get_default_from_internal_arg_info = Module2["_zend_get_default_from_internal_arg_info"] = wasmExports["dk"])(a0, a1);
    var _zval_update_constant_ex = Module2["_zval_update_constant_ex"] = (a0, a1) => (_zval_update_constant_ex = Module2["_zval_update_constant_ex"] = wasmExports["ek"])(a0, a1);
    var _zend_separate_class_constants_table = Module2["_zend_separate_class_constants_table"] = (a0) => (_zend_separate_class_constants_table = Module2["_zend_separate_class_constants_table"] = wasmExports["fk"])(a0);
    var _zend_update_class_constant = Module2["_zend_update_class_constant"] = (a0, a1, a2) => (_zend_update_class_constant = Module2["_zend_update_class_constant"] = wasmExports["gk"])(a0, a1, a2);
    var _zend_zval_type_name = Module2["_zend_zval_type_name"] = (a0) => (_zend_zval_type_name = Module2["_zend_zval_type_name"] = wasmExports["hk"])(a0);
    var _zval_copy_ctor_func = Module2["_zval_copy_ctor_func"] = (a0) => (_zval_copy_ctor_func = Module2["_zval_copy_ctor_func"] = wasmExports["ik"])(a0);
    var _zend_update_class_constants = Module2["_zend_update_class_constants"] = (a0) => (_zend_update_class_constants = Module2["_zend_update_class_constants"] = wasmExports["jk"])(a0);
    var _zend_class_init_statics = Module2["_zend_class_init_statics"] = (a0) => (_zend_class_init_statics = Module2["_zend_class_init_statics"] = wasmExports["kk"])(a0);
    var _zend_std_get_static_property = Module2["_zend_std_get_static_property"] = (a0, a1, a2) => (_zend_std_get_static_property = Module2["_zend_std_get_static_property"] = wasmExports["lk"])(a0, a1, a2);
    var _zend_std_get_static_property_with_info = Module2["_zend_std_get_static_property_with_info"] = (a0, a1, a2, a3) => (_zend_std_get_static_property_with_info = Module2["_zend_std_get_static_property_with_info"] = wasmExports["mk"])(a0, a1, a2, a3);
    var _zend_clear_exception = Module2["_zend_clear_exception"] = () => (_zend_clear_exception = Module2["_zend_clear_exception"] = wasmExports["nk"])();
    var _zend_verify_ref_assignable_zval = Module2["_zend_verify_ref_assignable_zval"] = (a0, a1, a2) => (_zend_verify_ref_assignable_zval = Module2["_zend_verify_ref_assignable_zval"] = wasmExports["ok"])(a0, a1, a2);
    var _zend_verify_property_type = Module2["_zend_verify_property_type"] = (a0, a1, a2) => (_zend_verify_property_type = Module2["_zend_verify_property_type"] = wasmExports["pk"])(a0, a1, a2);
    var _zend_get_properties_no_lazy_init = Module2["_zend_get_properties_no_lazy_init"] = (a0) => (_zend_get_properties_no_lazy_init = Module2["_zend_get_properties_no_lazy_init"] = wasmExports["qk"])(a0);
    var _zend_object_make_lazy = Module2["_zend_object_make_lazy"] = (a0, a1, a2, a3, a4) => (_zend_object_make_lazy = Module2["_zend_object_make_lazy"] = wasmExports["rk"])(a0, a1, a2, a3, a4);
    var _zend_lazy_object_init = Module2["_zend_lazy_object_init"] = (a0) => (_zend_lazy_object_init = Module2["_zend_lazy_object_init"] = wasmExports["sk"])(a0);
    var _zend_lazy_object_mark_as_initialized = Module2["_zend_lazy_object_mark_as_initialized"] = (a0) => (_zend_lazy_object_mark_as_initialized = Module2["_zend_lazy_object_mark_as_initialized"] = wasmExports["tk"])(a0);
    var _zend_fetch_class_by_name = Module2["_zend_fetch_class_by_name"] = (a0, a1, a2) => (_zend_fetch_class_by_name = Module2["_zend_fetch_class_by_name"] = wasmExports["uk"])(a0, a1, a2);
    var _zend_read_static_property_ex = Module2["_zend_read_static_property_ex"] = (a0, a1, a2) => (_zend_read_static_property_ex = Module2["_zend_read_static_property_ex"] = wasmExports["vk"])(a0, a1, a2);
    var _zend_update_static_property_ex = Module2["_zend_update_static_property_ex"] = (a0, a1, a2) => (_zend_update_static_property_ex = Module2["_zend_update_static_property_ex"] = wasmExports["wk"])(a0, a1, a2);
    var _zend_update_property_ex = Module2["_zend_update_property_ex"] = (a0, a1, a2, a3) => (_zend_update_property_ex = Module2["_zend_update_property_ex"] = wasmExports["xk"])(a0, a1, a2, a3);
    var _zend_get_property_hook_trampoline = Module2["_zend_get_property_hook_trampoline"] = (a0, a1, a2) => (_zend_get_property_hook_trampoline = Module2["_zend_get_property_hook_trampoline"] = wasmExports["yk"])(a0, a1, a2);
    var _zend_class_can_be_lazy = Module2["_zend_class_can_be_lazy"] = (a0) => (_zend_class_can_be_lazy = Module2["_zend_class_can_be_lazy"] = wasmExports["zk"])(a0);
    var _php_info_print_module = Module2["_php_info_print_module"] = (a0) => (_php_info_print_module = Module2["_php_info_print_module"] = wasmExports["Ak"])(a0);
    var _zend_get_extension = Module2["_zend_get_extension"] = (a0) => (_zend_get_extension = Module2["_zend_get_extension"] = wasmExports["Bk"])(a0);
    var _smart_str_append_zval = Module2["_smart_str_append_zval"] = (a0, a1, a2) => (_smart_str_append_zval = Module2["_smart_str_append_zval"] = wasmExports["Ck"])(a0, a1, a2);
    var _zend_ast_export = Module2["_zend_ast_export"] = (a0, a1, a2) => (_zend_ast_export = Module2["_zend_ast_export"] = wasmExports["Dk"])(a0, a1, a2);
    var _smart_str_append_escaped = Module2["_smart_str_append_escaped"] = (a0, a1, a2) => (_smart_str_append_escaped = Module2["_smart_str_append_escaped"] = wasmExports["Ek"])(a0, a1, a2);
    var _zend_is_attribute_repeated = Module2["_zend_is_attribute_repeated"] = (a0, a1) => (_zend_is_attribute_repeated = Module2["_zend_is_attribute_repeated"] = wasmExports["Fk"])(a0, a1);
    var _zend_get_attribute_value = Module2["_zend_get_attribute_value"] = (a0, a1, a2, a3) => (_zend_get_attribute_value = Module2["_zend_get_attribute_value"] = wasmExports["Gk"])(a0, a1, a2, a3);
    var _zend_get_attribute_str = Module2["_zend_get_attribute_str"] = (a0, a1, a2) => (_zend_get_attribute_str = Module2["_zend_get_attribute_str"] = wasmExports["Hk"])(a0, a1, a2);
    var _zend_get_attribute_target_names = Module2["_zend_get_attribute_target_names"] = (a0) => (_zend_get_attribute_target_names = Module2["_zend_get_attribute_target_names"] = wasmExports["Ik"])(a0);
    var _zend_get_attribute_object = Module2["_zend_get_attribute_object"] = (a0, a1, a2, a3, a4) => (_zend_get_attribute_object = Module2["_zend_get_attribute_object"] = wasmExports["Jk"])(a0, a1, a2, a3, a4);
    var _zend_get_constant_ptr = Module2["_zend_get_constant_ptr"] = (a0) => (_zend_get_constant_ptr = Module2["_zend_get_constant_ptr"] = wasmExports["Kk"])(a0);
    var _zend_stream_init_filename_ex = Module2["_zend_stream_init_filename_ex"] = (a0, a1) => (_zend_stream_init_filename_ex = Module2["_zend_stream_init_filename_ex"] = wasmExports["Lk"])(a0, a1);
    var _php_stream_open_for_zend_ex = Module2["_php_stream_open_for_zend_ex"] = (a0, a1) => (_php_stream_open_for_zend_ex = Module2["_php_stream_open_for_zend_ex"] = wasmExports["Mk"])(a0, a1);
    var _zend_execute = Module2["_zend_execute"] = (a0, a1) => (_zend_execute = Module2["_zend_execute"] = wasmExports["Nk"])(a0, a1);
    var _destroy_op_array = Module2["_destroy_op_array"] = (a0) => (_destroy_op_array = Module2["_destroy_op_array"] = wasmExports["Ok"])(a0);
    var _zend_destroy_file_handle = Module2["_zend_destroy_file_handle"] = (a0) => (_zend_destroy_file_handle = Module2["_zend_destroy_file_handle"] = wasmExports["Pk"])(a0);
    var _zend_hash_internal_pointer_reset_ex = Module2["_zend_hash_internal_pointer_reset_ex"] = (a0, a1) => (_zend_hash_internal_pointer_reset_ex = Module2["_zend_hash_internal_pointer_reset_ex"] = wasmExports["Qk"])(a0, a1);
    var _zend_hash_get_current_data_ex = Module2["_zend_hash_get_current_data_ex"] = (a0, a1) => (_zend_hash_get_current_data_ex = Module2["_zend_hash_get_current_data_ex"] = wasmExports["Rk"])(a0, a1);
    var _zend_hash_move_forward_ex = Module2["_zend_hash_move_forward_ex"] = (a0, a1) => (_zend_hash_move_forward_ex = Module2["_zend_hash_move_forward_ex"] = wasmExports["Sk"])(a0, a1);
    var _zend_hash_real_init_mixed = Module2["_zend_hash_real_init_mixed"] = (a0) => (_zend_hash_real_init_mixed = Module2["_zend_hash_real_init_mixed"] = wasmExports["Tk"])(a0);
    var _zend_hash_rehash = Module2["_zend_hash_rehash"] = (a0) => (_zend_hash_rehash = Module2["_zend_hash_rehash"] = wasmExports["Uk"])(a0);
    var _zend_hash_clean = Module2["_zend_hash_clean"] = (a0) => (_zend_hash_clean = Module2["_zend_hash_clean"] = wasmExports["Vk"])(a0);
    var _zend_hash_del_bucket = Module2["_zend_hash_del_bucket"] = (a0, a1) => (_zend_hash_del_bucket = Module2["_zend_hash_del_bucket"] = wasmExports["Wk"])(a0, a1);
    var _add_next_index_object = Module2["_add_next_index_object"] = (a0, a1) => (_add_next_index_object = Module2["_add_next_index_object"] = wasmExports["Xk"])(a0, a1);
    var _php_spl_object_hash = Module2["_php_spl_object_hash"] = (a0) => (_php_spl_object_hash = Module2["_php_spl_object_hash"] = wasmExports["Yk"])(a0);
    var _zend_call_method = Module2["_zend_call_method"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8) => (_zend_call_method = Module2["_zend_call_method"] = wasmExports["Zk"])(a0, a1, a2, a3, a4, a5, a6, a7, a8);
    var _zend_illegal_container_offset = Module2["_zend_illegal_container_offset"] = (a0, a1, a2) => (_zend_illegal_container_offset = Module2["_zend_illegal_container_offset"] = wasmExports["_k"])(a0, a1, a2);
    var _zend_hash_update_ind = Module2["_zend_hash_update_ind"] = (a0, a1, a2) => (_zend_hash_update_ind = Module2["_zend_hash_update_ind"] = wasmExports["$k"])(a0, a1, a2);
    var _zend_hash_del = Module2["_zend_hash_del"] = (a0, a1) => (_zend_hash_del = Module2["_zend_hash_del"] = wasmExports["al"])(a0, a1);
    var _zend_hash_index_del = Module2["_zend_hash_index_del"] = (a0, a1) => (_zend_hash_index_del = Module2["_zend_hash_index_del"] = wasmExports["bl"])(a0, a1);
    var _zend_hash_iterator_del = Module2["_zend_hash_iterator_del"] = (a0) => (_zend_hash_iterator_del = Module2["_zend_hash_iterator_del"] = wasmExports["cl"])(a0);
    var _zend_parse_arg_class = Module2["_zend_parse_arg_class"] = (a0, a1, a2, a3) => (_zend_parse_arg_class = Module2["_zend_parse_arg_class"] = wasmExports["dl"])(a0, a1, a2, a3);
    var _php_var_serialize_init = Module2["_php_var_serialize_init"] = () => (_php_var_serialize_init = Module2["_php_var_serialize_init"] = wasmExports["el"])();
    var _php_var_serialize = Module2["_php_var_serialize"] = (a0, a1, a2) => (_php_var_serialize = Module2["_php_var_serialize"] = wasmExports["fl"])(a0, a1, a2);
    var _php_var_serialize_destroy = Module2["_php_var_serialize_destroy"] = (a0) => (_php_var_serialize_destroy = Module2["_php_var_serialize_destroy"] = wasmExports["gl"])(a0);
    var _php_var_unserialize_init = Module2["_php_var_unserialize_init"] = () => (_php_var_unserialize_init = Module2["_php_var_unserialize_init"] = wasmExports["hl"])();
    var _var_tmp_var = Module2["_var_tmp_var"] = (a0) => (_var_tmp_var = Module2["_var_tmp_var"] = wasmExports["il"])(a0);
    var _php_var_unserialize = Module2["_php_var_unserialize"] = (a0, a1, a2, a3) => (_php_var_unserialize = Module2["_php_var_unserialize"] = wasmExports["jl"])(a0, a1, a2, a3);
    var _php_var_unserialize_destroy = Module2["_php_var_unserialize_destroy"] = (a0) => (_php_var_unserialize_destroy = Module2["_php_var_unserialize_destroy"] = wasmExports["kl"])(a0);
    var _zend_proptable_to_symtable = Module2["_zend_proptable_to_symtable"] = (a0, a1) => (_zend_proptable_to_symtable = Module2["_zend_proptable_to_symtable"] = wasmExports["ll"])(a0, a1);
    var _zend_hash_get_current_key_type_ex = Module2["_zend_hash_get_current_key_type_ex"] = (a0, a1) => (_zend_hash_get_current_key_type_ex = Module2["_zend_hash_get_current_key_type_ex"] = wasmExports["ml"])(a0, a1);
    var _zend_hash_get_current_key_zval_ex = Module2["_zend_hash_get_current_key_zval_ex"] = (a0, a1, a2) => (_zend_hash_get_current_key_zval_ex = Module2["_zend_hash_get_current_key_zval_ex"] = wasmExports["nl"])(a0, a1, a2);
    var _zend_call_known_instance_method_with_2_params = Module2["_zend_call_known_instance_method_with_2_params"] = (a0, a1, a2, a3, a4) => (_zend_call_known_instance_method_with_2_params = Module2["_zend_call_known_instance_method_with_2_params"] = wasmExports["ol"])(a0, a1, a2, a3, a4);
    var _zend_std_unset_property = Module2["_zend_std_unset_property"] = (a0, a1, a2) => (_zend_std_unset_property = Module2["_zend_std_unset_property"] = wasmExports["pl"])(a0, a1, a2);
    var _zend_compare_symbol_tables = Module2["_zend_compare_symbol_tables"] = (a0, a1) => (_zend_compare_symbol_tables = Module2["_zend_compare_symbol_tables"] = wasmExports["ql"])(a0, a1);
    var __emalloc_80 = Module2["__emalloc_80"] = () => (__emalloc_80 = Module2["__emalloc_80"] = wasmExports["rl"])();
    var _zend_incompatible_double_to_long_error = Module2["_zend_incompatible_double_to_long_error"] = (a0) => (_zend_incompatible_double_to_long_error = Module2["_zend_incompatible_double_to_long_error"] = wasmExports["sl"])(a0);
    var _zend_use_resource_as_offset = Module2["_zend_use_resource_as_offset"] = (a0) => (_zend_use_resource_as_offset = Module2["_zend_use_resource_as_offset"] = wasmExports["tl"])(a0);
    var _zend_long_to_str = Module2["_zend_long_to_str"] = (a0) => (_zend_long_to_str = Module2["_zend_long_to_str"] = wasmExports["ul"])(a0);
    var _zend_hash_get_current_key_ex = Module2["_zend_hash_get_current_key_ex"] = (a0, a1, a2, a3) => (_zend_hash_get_current_key_ex = Module2["_zend_hash_get_current_key_ex"] = wasmExports["vl"])(a0, a1, a2, a3);
    var _zend_hash_get_current_pos = Module2["_zend_hash_get_current_pos"] = (a0) => (_zend_hash_get_current_pos = Module2["_zend_hash_get_current_pos"] = wasmExports["wl"])(a0);
    var _zend_hash_iterator_add = Module2["_zend_hash_iterator_add"] = (a0, a1) => (_zend_hash_iterator_add = Module2["_zend_hash_iterator_add"] = wasmExports["xl"])(a0, a1);
    var _zend_get_property_info = Module2["_zend_get_property_info"] = (a0, a1, a2) => (_zend_get_property_info = Module2["_zend_get_property_info"] = wasmExports["yl"])(a0, a1, a2);
    var _zend_ref_add_type_source = Module2["_zend_ref_add_type_source"] = (a0, a1) => (_zend_ref_add_type_source = Module2["_zend_ref_add_type_source"] = wasmExports["zl"])(a0, a1);
    var _spl_filesystem_object_get_path = Module2["_spl_filesystem_object_get_path"] = (a0) => (_spl_filesystem_object_get_path = Module2["_spl_filesystem_object_get_path"] = wasmExports["Al"])(a0);
    var __php_glob_stream_get_path = Module2["__php_glob_stream_get_path"] = (a0, a1) => (__php_glob_stream_get_path = Module2["__php_glob_stream_get_path"] = wasmExports["Bl"])(a0, a1);
    var __php_stream_seek = Module2["__php_stream_seek"] = (a0, a1, a2) => (__php_stream_seek = Module2["__php_stream_seek"] = wasmExports["Cl"])(a0, a1, a2);
    var __php_stream_readdir = Module2["__php_stream_readdir"] = (a0, a1) => (__php_stream_readdir = Module2["__php_stream_readdir"] = wasmExports["Dl"])(a0, a1);
    var _php_basename = Module2["_php_basename"] = (a0, a1, a2, a3) => (_php_basename = Module2["_php_basename"] = wasmExports["El"])(a0, a1, a2, a3);
    var _php_stat = Module2["_php_stat"] = (a0, a1, a2) => (_php_stat = Module2["_php_stat"] = wasmExports["Fl"])(a0, a1, a2);
    var _expand_filepath_with_mode = Module2["_expand_filepath_with_mode"] = (a0, a1, a2, a3, a4) => (_expand_filepath_with_mode = Module2["_expand_filepath_with_mode"] = wasmExports["Gl"])(a0, a1, a2, a3, a4);
    var _tsrm_realpath = Module2["_tsrm_realpath"] = (a0, a1) => (_tsrm_realpath = Module2["_tsrm_realpath"] = wasmExports["Hl"])(a0, a1);
    var _zend_dirname = Module2["_zend_dirname"] = (a0, a1) => (_zend_dirname = Module2["_zend_dirname"] = wasmExports["Il"])(a0, a1);
    var _object_init_with_constructor = Module2["_object_init_with_constructor"] = (a0, a1, a2, a3, a4) => (_object_init_with_constructor = Module2["_object_init_with_constructor"] = wasmExports["Jl"])(a0, a1, a2, a3, a4);
    var __php_glob_stream_get_count = Module2["__php_glob_stream_get_count"] = (a0, a1) => (__php_glob_stream_get_count = Module2["__php_glob_stream_get_count"] = wasmExports["Kl"])(a0, a1);
    var __php_stream_eof = Module2["__php_stream_eof"] = (a0) => (__php_stream_eof = Module2["__php_stream_eof"] = wasmExports["Ll"])(a0);
    var __php_stream_get_line = Module2["__php_stream_get_line"] = (a0, a1, a2, a3) => (__php_stream_get_line = Module2["__php_stream_get_line"] = wasmExports["Ml"])(a0, a1, a2, a3);
    var _php_csv_handle_escape_argument = Module2["_php_csv_handle_escape_argument"] = (a0, a1) => (_php_csv_handle_escape_argument = Module2["_php_csv_handle_escape_argument"] = wasmExports["Nl"])(a0, a1);
    var _php_fgetcsv = Module2["_php_fgetcsv"] = (a0, a1, a2, a3, a4, a5) => (_php_fgetcsv = Module2["_php_fgetcsv"] = wasmExports["Ol"])(a0, a1, a2, a3, a4, a5);
    var _php_bc_fgetcsv_empty_line = Module2["_php_bc_fgetcsv_empty_line"] = () => (_php_bc_fgetcsv_empty_line = Module2["_php_bc_fgetcsv_empty_line"] = wasmExports["Pl"])();
    var _php_fputcsv = Module2["_php_fputcsv"] = (a0, a1, a2, a3, a4, a5) => (_php_fputcsv = Module2["_php_fputcsv"] = wasmExports["Ql"])(a0, a1, a2, a3, a4, a5);
    var _php_flock_common = Module2["_php_flock_common"] = (a0, a1, a2, a3, a4) => (_php_flock_common = Module2["_php_flock_common"] = wasmExports["Rl"])(a0, a1, a2, a3, a4);
    var __php_stream_flush = Module2["__php_stream_flush"] = (a0, a1) => (__php_stream_flush = Module2["__php_stream_flush"] = wasmExports["Sl"])(a0, a1);
    var __php_stream_tell = Module2["__php_stream_tell"] = (a0) => (__php_stream_tell = Module2["__php_stream_tell"] = wasmExports["Tl"])(a0);
    var __php_stream_getc = Module2["__php_stream_getc"] = (a0) => (__php_stream_getc = Module2["__php_stream_getc"] = wasmExports["Ul"])(a0);
    var __php_stream_passthru = Module2["__php_stream_passthru"] = (a0) => (__php_stream_passthru = Module2["__php_stream_passthru"] = wasmExports["Vl"])(a0);
    var _php_sscanf_internal = Module2["_php_sscanf_internal"] = (a0, a1, a2, a3, a4, a5) => (_php_sscanf_internal = Module2["_php_sscanf_internal"] = wasmExports["Wl"])(a0, a1, a2, a3, a4, a5);
    var _zend_wrong_param_count = Module2["_zend_wrong_param_count"] = () => (_zend_wrong_param_count = Module2["_zend_wrong_param_count"] = wasmExports["Xl"])();
    var __php_stream_write = Module2["__php_stream_write"] = (a0, a1, a2) => (__php_stream_write = Module2["__php_stream_write"] = wasmExports["Yl"])(a0, a1, a2);
    var _php_stream_read_to_str = Module2["_php_stream_read_to_str"] = (a0, a1) => (_php_stream_read_to_str = Module2["_php_stream_read_to_str"] = wasmExports["Zl"])(a0, a1);
    var _php_fstat = Module2["_php_fstat"] = (a0, a1) => (_php_fstat = Module2["_php_fstat"] = wasmExports["_l"])(a0, a1);
    var __php_stream_set_option = Module2["__php_stream_set_option"] = (a0, a1, a2, a3) => (__php_stream_set_option = Module2["__php_stream_set_option"] = wasmExports["$l"])(a0, a1, a2, a3);
    var __php_stream_truncate_set_size = Module2["__php_stream_truncate_set_size"] = (a0, a1) => (__php_stream_truncate_set_size = Module2["__php_stream_truncate_set_size"] = wasmExports["am"])(a0, a1);
    var _zend_objects_destroy_object = Module2["_zend_objects_destroy_object"] = (a0) => (_zend_objects_destroy_object = Module2["_zend_objects_destroy_object"] = wasmExports["bm"])(a0);
    var _zend_std_get_method = Module2["_zend_std_get_method"] = (a0, a1, a2) => (_zend_std_get_method = Module2["_zend_std_get_method"] = wasmExports["cm"])(a0, a1, a2);
    var __php_stream_opendir = Module2["__php_stream_opendir"] = (a0, a1, a2) => (__php_stream_opendir = Module2["__php_stream_opendir"] = wasmExports["dm"])(a0, a1, a2);
    var _var_push_dtor = Module2["_var_push_dtor"] = (a0, a1) => (_var_push_dtor = Module2["_var_push_dtor"] = wasmExports["em"])(a0, a1);
    var _zend_get_gc_buffer_create = Module2["_zend_get_gc_buffer_create"] = () => (_zend_get_gc_buffer_create = Module2["_zend_get_gc_buffer_create"] = wasmExports["fm"])();
    var _zend_get_gc_buffer_grow = Module2["_zend_get_gc_buffer_grow"] = (a0) => (_zend_get_gc_buffer_grow = Module2["_zend_get_gc_buffer_grow"] = wasmExports["gm"])(a0);
    var __safe_erealloc = Module2["__safe_erealloc"] = (a0, a1, a2, a3) => (__safe_erealloc = Module2["__safe_erealloc"] = wasmExports["hm"])(a0, a1, a2, a3);
    var _zend_mangle_property_name = Module2["_zend_mangle_property_name"] = (a0, a1, a2, a3, a4) => (_zend_mangle_property_name = Module2["_zend_mangle_property_name"] = wasmExports["im"])(a0, a1, a2, a3, a4);
    var _zend_compare = Module2["_zend_compare"] = (a0, a1) => (_zend_compare = Module2["_zend_compare"] = wasmExports["jm"])(a0, a1);
    var _zend_user_it_invalidate_current = Module2["_zend_user_it_invalidate_current"] = (a0) => (_zend_user_it_invalidate_current = Module2["_zend_user_it_invalidate_current"] = wasmExports["km"])(a0);
    var _zend_iterator_dtor = Module2["_zend_iterator_dtor"] = (a0) => (_zend_iterator_dtor = Module2["_zend_iterator_dtor"] = wasmExports["lm"])(a0);
    var _zend_get_callable_zval_from_fcc = Module2["_zend_get_callable_zval_from_fcc"] = (a0, a1) => (_zend_get_callable_zval_from_fcc = Module2["_zend_get_callable_zval_from_fcc"] = wasmExports["mm"])(a0, a1);
    var _array_set_zval_key = Module2["_array_set_zval_key"] = (a0, a1, a2) => (_array_set_zval_key = Module2["_array_set_zval_key"] = wasmExports["nm"])(a0, a1, a2);
    var __convert_to_string = Module2["__convert_to_string"] = (a0) => (__convert_to_string = Module2["__convert_to_string"] = wasmExports["om"])(a0);
    var _spl_iterator_apply = Module2["_spl_iterator_apply"] = (a0, a1, a2) => (_spl_iterator_apply = Module2["_spl_iterator_apply"] = wasmExports["pm"])(a0, a1, a2);
    var _zend_is_iterable = Module2["_zend_is_iterable"] = (a0) => (_zend_is_iterable = Module2["_zend_is_iterable"] = wasmExports["qm"])(a0);
    var _zend_array_to_list = Module2["_zend_array_to_list"] = (a0) => (_zend_array_to_list = Module2["_zend_array_to_list"] = wasmExports["rm"])(a0);
    var _php_count_recursive = Module2["_php_count_recursive"] = (a0) => (_php_count_recursive = Module2["_php_count_recursive"] = wasmExports["sm"])(a0);
    var _zend_hash_move_backwards_ex = Module2["_zend_hash_move_backwards_ex"] = (a0, a1) => (_zend_hash_move_backwards_ex = Module2["_zend_hash_move_backwards_ex"] = wasmExports["tm"])(a0, a1);
    var _var_replace = Module2["_var_replace"] = (a0, a1, a2) => (_var_replace = Module2["_var_replace"] = wasmExports["um"])(a0, a1, a2);
    var _zend_is_identical = Module2["_zend_is_identical"] = (a0, a1) => (_zend_is_identical = Module2["_zend_is_identical"] = wasmExports["vm"])(a0, a1);
    var _zend_hash_compare = Module2["_zend_hash_compare"] = (a0, a1, a2, a3) => (_zend_hash_compare = Module2["_zend_hash_compare"] = wasmExports["wm"])(a0, a1, a2, a3);
    var _zend_std_read_dimension = Module2["_zend_std_read_dimension"] = (a0, a1, a2, a3) => (_zend_std_read_dimension = Module2["_zend_std_read_dimension"] = wasmExports["xm"])(a0, a1, a2, a3);
    var _zend_std_write_dimension = Module2["_zend_std_write_dimension"] = (a0, a1, a2) => (_zend_std_write_dimension = Module2["_zend_std_write_dimension"] = wasmExports["ym"])(a0, a1, a2);
    var _zend_std_has_dimension = Module2["_zend_std_has_dimension"] = (a0, a1, a2) => (_zend_std_has_dimension = Module2["_zend_std_has_dimension"] = wasmExports["zm"])(a0, a1, a2);
    var _zend_std_cast_object_tostring = Module2["_zend_std_cast_object_tostring"] = (a0, a1, a2) => (_zend_std_cast_object_tostring = Module2["_zend_std_cast_object_tostring"] = wasmExports["Am"])(a0, a1, a2);
    var _zend_object_is_true = Module2["_zend_object_is_true"] = (a0) => (_zend_object_is_true = Module2["_zend_object_is_true"] = wasmExports["Bm"])(a0);
    var _zend_std_unset_dimension = Module2["_zend_std_unset_dimension"] = (a0, a1) => (_zend_std_unset_dimension = Module2["_zend_std_unset_dimension"] = wasmExports["Cm"])(a0, a1);
    var _zend_hash_index_lookup = Module2["_zend_hash_index_lookup"] = (a0, a1) => (_zend_hash_index_lookup = Module2["_zend_hash_index_lookup"] = wasmExports["Dm"])(a0, a1);
    var _zend_sort = Module2["_zend_sort"] = (a0, a1, a2, a3, a4) => (_zend_sort = Module2["_zend_sort"] = wasmExports["Em"])(a0, a1, a2, a3, a4);
    var _zend_hash_sort_ex = Module2["_zend_hash_sort_ex"] = (a0, a1, a2, a3) => (_zend_hash_sort_ex = Module2["_zend_hash_sort_ex"] = wasmExports["Fm"])(a0, a1, a2, a3);
    var _get_active_function_name = Module2["_get_active_function_name"] = () => (_get_active_function_name = Module2["_get_active_function_name"] = wasmExports["Gm"])();
    var _zend_hash_internal_pointer_end_ex = Module2["_zend_hash_internal_pointer_end_ex"] = (a0, a1) => (_zend_hash_internal_pointer_end_ex = Module2["_zend_hash_internal_pointer_end_ex"] = wasmExports["Hm"])(a0, a1);
    var _zend_hash_minmax = Module2["_zend_hash_minmax"] = (a0, a1, a2) => (_zend_hash_minmax = Module2["_zend_hash_minmax"] = wasmExports["Im"])(a0, a1, a2);
    var _zend_lazy_object_get_property_info_for_slot = Module2["_zend_lazy_object_get_property_info_for_slot"] = (a0, a1) => (_zend_lazy_object_get_property_info_for_slot = Module2["_zend_lazy_object_get_property_info_for_slot"] = wasmExports["Jm"])(a0, a1);
    var _zend_hash_iterator_pos_ex = Module2["_zend_hash_iterator_pos_ex"] = (a0, a1) => (_zend_hash_iterator_pos_ex = Module2["_zend_hash_iterator_pos_ex"] = wasmExports["Km"])(a0, a1);
    var _zend_hash_iterator_pos = Module2["_zend_hash_iterator_pos"] = (a0, a1) => (_zend_hash_iterator_pos = Module2["_zend_hash_iterator_pos"] = wasmExports["Lm"])(a0, a1);
    var _zendi_smart_streq = Module2["_zendi_smart_streq"] = (a0, a1) => (_zendi_smart_streq = Module2["_zendi_smart_streq"] = wasmExports["Mm"])(a0, a1);
    var _zend_flf_parse_arg_bool_slow = Module2["_zend_flf_parse_arg_bool_slow"] = (a0, a1, a2) => (_zend_flf_parse_arg_bool_slow = Module2["_zend_flf_parse_arg_bool_slow"] = wasmExports["Nm"])(a0, a1, a2);
    var _php_prefix_varname = Module2["_php_prefix_varname"] = (a0, a1, a2, a3, a4) => (_php_prefix_varname = Module2["_php_prefix_varname"] = wasmExports["Om"])(a0, a1, a2, a3, a4);
    var _zend_rebuild_symbol_table = Module2["_zend_rebuild_symbol_table"] = () => (_zend_rebuild_symbol_table = Module2["_zend_rebuild_symbol_table"] = wasmExports["Pm"])();
    var _zend_hash_find_known_hash = Module2["_zend_hash_find_known_hash"] = (a0, a1) => (_zend_hash_find_known_hash = Module2["_zend_hash_find_known_hash"] = wasmExports["Qm"])(a0, a1);
    var _zend_try_assign_typed_ref_zval_ex = Module2["_zend_try_assign_typed_ref_zval_ex"] = (a0, a1, a2) => (_zend_try_assign_typed_ref_zval_ex = Module2["_zend_try_assign_typed_ref_zval_ex"] = wasmExports["Rm"])(a0, a1, a2);
    var _zend_get_this_object = Module2["_zend_get_this_object"] = (a0) => (_zend_get_this_object = Module2["_zend_get_this_object"] = wasmExports["Sm"])(a0);
    var _php_error_docref_unchecked = Module2["_php_error_docref_unchecked"] = (a0, a1, a2, a3) => (_php_error_docref_unchecked = Module2["_php_error_docref_unchecked"] = wasmExports["Tm"])(a0, a1, a2, a3);
    var _zend_hash_real_init_packed = Module2["_zend_hash_real_init_packed"] = (a0) => (_zend_hash_real_init_packed = Module2["_zend_hash_real_init_packed"] = wasmExports["Um"])(a0);
    var _zend_parse_arg_number_or_str_slow = Module2["_zend_parse_arg_number_or_str_slow"] = (a0, a1, a2) => (_zend_parse_arg_number_or_str_slow = Module2["_zend_parse_arg_number_or_str_slow"] = wasmExports["Vm"])(a0, a1, a2);
    var __php_math_round = Module2["__php_math_round"] = (a0, a1, a2) => (__php_math_round = Module2["__php_math_round"] = wasmExports["Wm"])(a0, a1, a2);
    var _get_active_function_arg_name = Module2["_get_active_function_arg_name"] = (a0) => (_get_active_function_arg_name = Module2["_get_active_function_arg_name"] = wasmExports["Xm"])(a0);
    var _is_numeric_str_function = Module2["_is_numeric_str_function"] = (a0, a1, a2) => (_is_numeric_str_function = Module2["_is_numeric_str_function"] = wasmExports["Ym"])(a0, a1, a2);
    var _zend_hash_to_packed = Module2["_zend_hash_to_packed"] = (a0) => (_zend_hash_to_packed = Module2["_zend_hash_to_packed"] = wasmExports["Zm"])(a0);
    var _zend_hash_iterators_lower_pos = Module2["_zend_hash_iterators_lower_pos"] = (a0, a1) => (_zend_hash_iterators_lower_pos = Module2["_zend_hash_iterators_lower_pos"] = wasmExports["_m"])(a0, a1);
    var __zend_hash_iterators_update = Module2["__zend_hash_iterators_update"] = (a0, a1, a2) => (__zend_hash_iterators_update = Module2["__zend_hash_iterators_update"] = wasmExports["$m"])(a0, a1, a2);
    var _zend_hash_packed_del_val = Module2["_zend_hash_packed_del_val"] = (a0, a1) => (_zend_hash_packed_del_val = Module2["_zend_hash_packed_del_val"] = wasmExports["an"])(a0, a1);
    var _zend_hash_iterators_advance = Module2["_zend_hash_iterators_advance"] = (a0, a1) => (_zend_hash_iterators_advance = Module2["_zend_hash_iterators_advance"] = wasmExports["bn"])(a0, a1);
    var _convert_to_array = Module2["_convert_to_array"] = (a0) => (_convert_to_array = Module2["_convert_to_array"] = wasmExports["cn"])(a0);
    var _php_array_merge_recursive = Module2["_php_array_merge_recursive"] = (a0, a1) => (_php_array_merge_recursive = Module2["_php_array_merge_recursive"] = wasmExports["dn"])(a0, a1);
    var _zend_cannot_add_element = Module2["_zend_cannot_add_element"] = () => (_zend_cannot_add_element = Module2["_zend_cannot_add_element"] = wasmExports["en"])();
    var _php_array_merge = Module2["_php_array_merge"] = (a0, a1) => (_php_array_merge = Module2["_php_array_merge"] = wasmExports["fn"])(a0, a1);
    var _zend_hash_extend = Module2["_zend_hash_extend"] = (a0, a1, a2) => (_zend_hash_extend = Module2["_zend_hash_extend"] = wasmExports["gn"])(a0, a1, a2);
    var _php_array_replace_recursive = Module2["_php_array_replace_recursive"] = (a0, a1) => (_php_array_replace_recursive = Module2["_php_array_replace_recursive"] = wasmExports["hn"])(a0, a1);
    var _zend_string_hash_func = Module2["_zend_string_hash_func"] = (a0) => (_zend_string_hash_func = Module2["_zend_string_hash_func"] = wasmExports["jn"])(a0);
    var _zend_hash_merge = Module2["_zend_hash_merge"] = (a0, a1, a2, a3) => (_zend_hash_merge = Module2["_zend_hash_merge"] = wasmExports["kn"])(a0, a1, a2, a3);
    var _zend_string_toupper_ex = Module2["_zend_string_toupper_ex"] = (a0, a1) => (_zend_string_toupper_ex = Module2["_zend_string_toupper_ex"] = wasmExports["ln"])(a0, a1);
    var _zend_hash_add_empty_element = Module2["_zend_hash_add_empty_element"] = (a0, a1) => (_zend_hash_add_empty_element = Module2["_zend_hash_add_empty_element"] = wasmExports["mn"])(a0, a1);
    var _zend_hash_bucket_swap = Module2["_zend_hash_bucket_swap"] = (a0, a1) => (_zend_hash_bucket_swap = Module2["_zend_hash_bucket_swap"] = wasmExports["nn"])(a0, a1);
    var _php_multisort_compare = Module2["_php_multisort_compare"] = (a0, a1) => (_php_multisort_compare = Module2["_php_multisort_compare"] = wasmExports["on"])(a0, a1);
    var _add_function = Module2["_add_function"] = (a0, a1, a2) => (_add_function = Module2["_add_function"] = wasmExports["pn"])(a0, a1, a2);
    var _mul_function = Module2["_mul_function"] = (a0, a1, a2) => (_mul_function = Module2["_mul_function"] = wasmExports["qn"])(a0, a1, a2);
    var _zend_hash_real_init = Module2["_zend_hash_real_init"] = (a0, a1) => (_zend_hash_real_init = Module2["_zend_hash_real_init"] = wasmExports["rn"])(a0, a1);
    var _zend_binary_strcasecmp_l = Module2["_zend_binary_strcasecmp_l"] = (a0, a1, a2, a3) => (_zend_binary_strcasecmp_l = Module2["_zend_binary_strcasecmp_l"] = wasmExports["sn"])(a0, a1, a2, a3);
    var _zend_binary_strcmp = Module2["_zend_binary_strcmp"] = (a0, a1, a2, a3) => (_zend_binary_strcmp = Module2["_zend_binary_strcmp"] = wasmExports["tn"])(a0, a1, a2, a3);
    var _zendi_smart_strcmp = Module2["_zendi_smart_strcmp"] = (a0, a1) => (_zendi_smart_strcmp = Module2["_zendi_smart_strcmp"] = wasmExports["un"])(a0, a1);
    var _strnatcmp_ex = Module2["_strnatcmp_ex"] = (a0, a1, a2, a3, a4) => (_strnatcmp_ex = Module2["_strnatcmp_ex"] = wasmExports["vn"])(a0, a1, a2, a3, a4);
    var _numeric_compare_function = Module2["_numeric_compare_function"] = (a0, a1) => (_numeric_compare_function = Module2["_numeric_compare_function"] = wasmExports["wn"])(a0, a1);
    var _string_case_compare_function = Module2["_string_case_compare_function"] = (a0, a1) => (_string_case_compare_function = Module2["_string_case_compare_function"] = wasmExports["xn"])(a0, a1);
    var _string_compare_function = Module2["_string_compare_function"] = (a0, a1) => (_string_compare_function = Module2["_string_compare_function"] = wasmExports["yn"])(a0, a1);
    var _string_locale_compare_function = Module2["_string_locale_compare_function"] = (a0, a1) => (_string_locale_compare_function = Module2["_string_locale_compare_function"] = wasmExports["zn"])(a0, a1);
    var _zend_throw_exception_internal = Module2["_zend_throw_exception_internal"] = (a0) => (_zend_throw_exception_internal = Module2["_zend_throw_exception_internal"] = wasmExports["An"])(a0);
    var _zend_get_executed_lineno = Module2["_zend_get_executed_lineno"] = () => (_zend_get_executed_lineno = Module2["_zend_get_executed_lineno"] = wasmExports["Bn"])();
    var _zend_get_executed_filename_ex = Module2["_zend_get_executed_filename_ex"] = () => (_zend_get_executed_filename_ex = Module2["_zend_get_executed_filename_ex"] = wasmExports["Cn"])();
    var _zend_exception_error = Module2["_zend_exception_error"] = (a0, a1) => (_zend_exception_error = Module2["_zend_exception_error"] = wasmExports["Dn"])(a0, a1);
    var _zend_throw_unwind_exit = Module2["_zend_throw_unwind_exit"] = () => (_zend_throw_unwind_exit = Module2["_zend_throw_unwind_exit"] = wasmExports["En"])();
    var _zend_alter_ini_entry_ex = Module2["_zend_alter_ini_entry_ex"] = (a0, a1, a2, a3, a4) => (_zend_alter_ini_entry_ex = Module2["_zend_alter_ini_entry_ex"] = wasmExports["Fn"])(a0, a1, a2, a3, a4);
    var _zend_ini_parse_bool = Module2["_zend_ini_parse_bool"] = (a0) => (_zend_ini_parse_bool = Module2["_zend_ini_parse_bool"] = wasmExports["Gn"])(a0);
    var _zend_ini_boolean_displayer_cb = Module2["_zend_ini_boolean_displayer_cb"] = (a0, a1) => (_zend_ini_boolean_displayer_cb = Module2["_zend_ini_boolean_displayer_cb"] = wasmExports["Hn"])(a0, a1);
    var _php_base64_encode_ex = Module2["_php_base64_encode_ex"] = (a0, a1, a2) => (_php_base64_encode_ex = Module2["_php_base64_encode_ex"] = wasmExports["In"])(a0, a1, a2);
    var _php_base64_decode_ex = Module2["_php_base64_decode_ex"] = (a0, a1, a2) => (_php_base64_decode_ex = Module2["_php_base64_decode_ex"] = wasmExports["Jn"])(a0, a1, a2);
    var _zend_register_double_constant = Module2["_zend_register_double_constant"] = (a0, a1, a2, a3, a4) => (_zend_register_double_constant = Module2["_zend_register_double_constant"] = wasmExports["Kn"])(a0, a1, a2, a3, a4);
    var _php_register_incomplete_class_handlers = Module2["_php_register_incomplete_class_handlers"] = () => (_php_register_incomplete_class_handlers = Module2["_php_register_incomplete_class_handlers"] = wasmExports["Ln"])();
    var _php_register_url_stream_wrapper = Module2["_php_register_url_stream_wrapper"] = (a0, a1) => (_php_register_url_stream_wrapper = Module2["_php_register_url_stream_wrapper"] = wasmExports["Mn"])(a0, a1);
    var _php_unregister_url_stream_wrapper = Module2["_php_unregister_url_stream_wrapper"] = (a0) => (_php_unregister_url_stream_wrapper = Module2["_php_unregister_url_stream_wrapper"] = wasmExports["Nn"])(a0);
    var _zend_reset_lc_ctype_locale = Module2["_zend_reset_lc_ctype_locale"] = () => (_zend_reset_lc_ctype_locale = Module2["_zend_reset_lc_ctype_locale"] = wasmExports["On"])();
    var _zend_update_current_locale = Module2["_zend_update_current_locale"] = () => (_zend_update_current_locale = Module2["_zend_update_current_locale"] = wasmExports["Pn"])();
    var _zend_llist_destroy = Module2["_zend_llist_destroy"] = (a0) => (_zend_llist_destroy = Module2["_zend_llist_destroy"] = wasmExports["Qn"])(a0);
    var _php_get_nan = Module2["_php_get_nan"] = () => (_php_get_nan = Module2["_php_get_nan"] = wasmExports["Rn"])();
    var _php_get_inf = Module2["_php_get_inf"] = () => (_php_get_inf = Module2["_php_get_inf"] = wasmExports["Sn"])();
    var _zend_get_executed_scope = Module2["_zend_get_executed_scope"] = () => (_zend_get_executed_scope = Module2["_zend_get_executed_scope"] = wasmExports["Tn"])();
    var _zend_get_constant_ex = Module2["_zend_get_constant_ex"] = (a0, a1, a2) => (_zend_get_constant_ex = Module2["_zend_get_constant_ex"] = wasmExports["Un"])(a0, a1, a2);
    var _php_getenv = Module2["_php_getenv"] = (a0, a1) => (_php_getenv = Module2["_php_getenv"] = wasmExports["Vn"])(a0, a1);
    var _sapi_getenv = Module2["_sapi_getenv"] = (a0, a1) => (_sapi_getenv = Module2["_sapi_getenv"] = wasmExports["Wn"])(a0, a1);
    var _zend_strndup = Module2["_zend_strndup"] = (a0, a1) => (_zend_strndup = Module2["_zend_strndup"] = wasmExports["Xn"])(a0, a1);
    var _zend_is_auto_global = Module2["_zend_is_auto_global"] = (a0) => (_zend_is_auto_global = Module2["_zend_is_auto_global"] = wasmExports["Yn"])(a0);
    var _php_getopt = Module2["_php_getopt"] = (a0, a1, a2, a3, a4, a5, a6) => (_php_getopt = Module2["_php_getopt"] = wasmExports["Zn"])(a0, a1, a2, a3, a4, a5, a6);
    var _sapi_flush = Module2["_sapi_flush"] = () => (_sapi_flush = Module2["_sapi_flush"] = wasmExports["_n"])();
    var _php_get_current_user = Module2["_php_get_current_user"] = () => (_php_get_current_user = Module2["_php_get_current_user"] = wasmExports["$n"])();
    var _cfg_get_entry_ex = Module2["_cfg_get_entry_ex"] = (a0) => (_cfg_get_entry_ex = Module2["_cfg_get_entry_ex"] = wasmExports["ao"])(a0);
    var __php_error_log_ex = Module2["__php_error_log_ex"] = (a0, a1, a2, a3, a4) => (__php_error_log_ex = Module2["__php_error_log_ex"] = wasmExports["bo"])(a0, a1, a2, a3, a4);
    var _php_mail = Module2["_php_mail"] = (a0, a1, a2, a3, a4) => (_php_mail = Module2["_php_mail"] = wasmExports["co"])(a0, a1, a2, a3, a4);
    var _php_log_err_with_severity = Module2["_php_log_err_with_severity"] = (a0, a1) => (_php_log_err_with_severity = Module2["_php_log_err_with_severity"] = wasmExports["eo"])(a0, a1);
    var __php_error_log = Module2["__php_error_log"] = (a0, a1, a2, a3) => (__php_error_log = Module2["__php_error_log"] = wasmExports["fo"])(a0, a1, a2, a3);
    var _zend_get_called_scope = Module2["_zend_get_called_scope"] = (a0) => (_zend_get_called_scope = Module2["_zend_get_called_scope"] = wasmExports["go"])(a0);
    var _php_call_shutdown_functions = Module2["_php_call_shutdown_functions"] = () => (_php_call_shutdown_functions = Module2["_php_call_shutdown_functions"] = wasmExports["ho"])();
    var _zend_hash_apply = Module2["_zend_hash_apply"] = (a0, a1) => (_zend_hash_apply = Module2["_zend_hash_apply"] = wasmExports["io"])(a0, a1);
    var _setTempRet0 = Module2["_setTempRet0"] = (a0) => (_setTempRet0 = Module2["_setTempRet0"] = wasmExports["jo"])(a0);
    var _getTempRet0 = Module2["_getTempRet0"] = () => (_getTempRet0 = Module2["_getTempRet0"] = wasmExports["ko"])();
    var _php_free_shutdown_functions = Module2["_php_free_shutdown_functions"] = () => (_php_free_shutdown_functions = Module2["_php_free_shutdown_functions"] = wasmExports["lo"])();
    var _zend_fcall_info_argp = Module2["_zend_fcall_info_argp"] = (a0, a1, a2) => (_zend_fcall_info_argp = Module2["_zend_fcall_info_argp"] = wasmExports["mo"])(a0, a1, a2);
    var _append_user_shutdown_function = Module2["_append_user_shutdown_function"] = (a0) => (_append_user_shutdown_function = Module2["_append_user_shutdown_function"] = wasmExports["no"])(a0);
    var _register_user_shutdown_function = Module2["_register_user_shutdown_function"] = (a0, a1, a2) => (_register_user_shutdown_function = Module2["_register_user_shutdown_function"] = wasmExports["oo"])(a0, a1, a2);
    var _zend_fcall_info_args_clear = Module2["_zend_fcall_info_args_clear"] = (a0, a1) => (_zend_fcall_info_args_clear = Module2["_zend_fcall_info_args_clear"] = wasmExports["po"])(a0, a1);
    var _remove_user_shutdown_function = Module2["_remove_user_shutdown_function"] = (a0, a1) => (_remove_user_shutdown_function = Module2["_remove_user_shutdown_function"] = wasmExports["qo"])(a0, a1);
    var _zend_hash_str_del = Module2["_zend_hash_str_del"] = (a0, a1, a2) => (_zend_hash_str_del = Module2["_zend_hash_str_del"] = wasmExports["ro"])(a0, a1, a2);
    var _php_get_highlight_struct = Module2["_php_get_highlight_struct"] = (a0) => (_php_get_highlight_struct = Module2["_php_get_highlight_struct"] = wasmExports["so"])(a0);
    var _zend_ini_string_ex = Module2["_zend_ini_string_ex"] = (a0, a1, a2, a3) => (_zend_ini_string_ex = Module2["_zend_ini_string_ex"] = wasmExports["to"])(a0, a1, a2, a3);
    var _php_check_open_basedir = Module2["_php_check_open_basedir"] = (a0) => (_php_check_open_basedir = Module2["_php_check_open_basedir"] = wasmExports["uo"])(a0);
    var _php_output_start_default = Module2["_php_output_start_default"] = () => (_php_output_start_default = Module2["_php_output_start_default"] = wasmExports["vo"])();
    var _highlight_file = Module2["_highlight_file"] = (a0, a1) => (_highlight_file = Module2["_highlight_file"] = wasmExports["wo"])(a0, a1);
    var _php_output_end = Module2["_php_output_end"] = () => (_php_output_end = Module2["_php_output_end"] = wasmExports["xo"])();
    var _php_output_get_contents = Module2["_php_output_get_contents"] = (a0) => (_php_output_get_contents = Module2["_php_output_get_contents"] = wasmExports["yo"])(a0);
    var _php_output_discard = Module2["_php_output_discard"] = () => (_php_output_discard = Module2["_php_output_discard"] = wasmExports["zo"])();
    var _zend_save_lexical_state = Module2["_zend_save_lexical_state"] = (a0) => (_zend_save_lexical_state = Module2["_zend_save_lexical_state"] = wasmExports["Ao"])(a0);
    var _open_file_for_scanning = Module2["_open_file_for_scanning"] = (a0) => (_open_file_for_scanning = Module2["_open_file_for_scanning"] = wasmExports["Bo"])(a0);
    var _zend_restore_lexical_state = Module2["_zend_restore_lexical_state"] = (a0) => (_zend_restore_lexical_state = Module2["_zend_restore_lexical_state"] = wasmExports["Co"])(a0);
    var _zend_strip = Module2["_zend_strip"] = () => (_zend_strip = Module2["_zend_strip"] = wasmExports["Do"])();
    var _zend_make_compiled_string_description = Module2["_zend_make_compiled_string_description"] = (a0) => (_zend_make_compiled_string_description = Module2["_zend_make_compiled_string_description"] = wasmExports["Eo"])(a0);
    var _highlight_string = Module2["_highlight_string"] = (a0, a1, a2) => (_highlight_string = Module2["_highlight_string"] = wasmExports["Fo"])(a0, a1, a2);
    var _zend_ini_parse_quantity = Module2["_zend_ini_parse_quantity"] = (a0, a1) => (_zend_ini_parse_quantity = Module2["_zend_ini_parse_quantity"] = wasmExports["Go"])(a0, a1);
    var _zend_ini_get_value = Module2["_zend_ini_get_value"] = (a0) => (_zend_ini_get_value = Module2["_zend_ini_get_value"] = wasmExports["Ho"])(a0);
    var _zend_ini_sort_entries = Module2["_zend_ini_sort_entries"] = () => (_zend_ini_sort_entries = Module2["_zend_ini_sort_entries"] = wasmExports["Io"])();
    var _zend_restore_ini_entry = Module2["_zend_restore_ini_entry"] = (a0, a1) => (_zend_restore_ini_entry = Module2["_zend_restore_ini_entry"] = wasmExports["Jo"])(a0, a1);
    var _zend_ini_string = Module2["_zend_ini_string"] = (a0, a1, a2) => (_zend_ini_string = Module2["_zend_ini_string"] = wasmExports["Ko"])(a0, a1, a2);
    var _zend_print_zval_r = Module2["_zend_print_zval_r"] = (a0, a1) => (_zend_print_zval_r = Module2["_zend_print_zval_r"] = wasmExports["Lo"])(a0, a1);
    var _zend_print_zval_r_to_str = Module2["_zend_print_zval_r_to_str"] = (a0, a1) => (_zend_print_zval_r_to_str = Module2["_zend_print_zval_r_to_str"] = wasmExports["Mo"])(a0, a1);
    var _zend_alter_ini_entry_chars = Module2["_zend_alter_ini_entry_chars"] = (a0, a1, a2, a3, a4) => (_zend_alter_ini_entry_chars = Module2["_zend_alter_ini_entry_chars"] = wasmExports["No"])(a0, a1, a2, a3, a4);
    var _ntohs = /* @__PURE__ */ __name((a0) => (_ntohs = wasmExports["Oo"])(a0), "_ntohs");
    var _htons = /* @__PURE__ */ __name((a0) => (_htons = wasmExports["Po"])(a0), "_htons");
    var _zend_llist_init = Module2["_zend_llist_init"] = (a0, a1, a2, a3) => (_zend_llist_init = Module2["_zend_llist_init"] = wasmExports["Qo"])(a0, a1, a2, a3);
    var _php_add_tick_function = Module2["_php_add_tick_function"] = (a0, a1) => (_php_add_tick_function = Module2["_php_add_tick_function"] = wasmExports["Ro"])(a0, a1);
    var _zend_llist_add_element = Module2["_zend_llist_add_element"] = (a0, a1) => (_zend_llist_add_element = Module2["_zend_llist_add_element"] = wasmExports["So"])(a0, a1);
    var _zend_llist_apply = Module2["_zend_llist_apply"] = (a0, a1) => (_zend_llist_apply = Module2["_zend_llist_apply"] = wasmExports["To"])(a0, a1);
    var _zend_llist_del_element = Module2["_zend_llist_del_element"] = (a0, a1, a2) => (_zend_llist_del_element = Module2["_zend_llist_del_element"] = wasmExports["Uo"])(a0, a1, a2);
    var _zend_binary_zval_strcmp = Module2["_zend_binary_zval_strcmp"] = (a0, a1) => (_zend_binary_zval_strcmp = Module2["_zend_binary_zval_strcmp"] = wasmExports["Vo"])(a0, a1);
    var _zend_compare_arrays = Module2["_zend_compare_arrays"] = (a0, a1) => (_zend_compare_arrays = Module2["_zend_compare_arrays"] = wasmExports["Wo"])(a0, a1);
    var _zend_compare_objects = Module2["_zend_compare_objects"] = (a0, a1) => (_zend_compare_objects = Module2["_zend_compare_objects"] = wasmExports["Xo"])(a0, a1);
    var _php_copy_file_ex = Module2["_php_copy_file_ex"] = (a0, a1, a2) => (_php_copy_file_ex = Module2["_php_copy_file_ex"] = wasmExports["Yo"])(a0, a1, a2);
    var _zend_parse_ini_file = Module2["_zend_parse_ini_file"] = (a0, a1, a2, a3, a4) => (_zend_parse_ini_file = Module2["_zend_parse_ini_file"] = wasmExports["Zo"])(a0, a1, a2, a3, a4);
    var _zend_parse_ini_string = Module2["_zend_parse_ini_string"] = (a0, a1, a2, a3, a4) => (_zend_parse_ini_string = Module2["_zend_parse_ini_string"] = wasmExports["_o"])(a0, a1, a2, a3, a4);
    var _add_index_double = Module2["_add_index_double"] = (a0, a1, a2) => (_add_index_double = Module2["_add_index_double"] = wasmExports["$o"])(a0, a1, a2);
    var _zif_rewind = Module2["_zif_rewind"] = (a0, a1) => (_zif_rewind = Module2["_zif_rewind"] = wasmExports["ap"])(a0, a1);
    var _zif_fclose = Module2["_zif_fclose"] = (a0, a1) => (_zif_fclose = Module2["_zif_fclose"] = wasmExports["bp"])(a0, a1);
    var _zif_feof = Module2["_zif_feof"] = (a0, a1) => (_zif_feof = Module2["_zif_feof"] = wasmExports["cp"])(a0, a1);
    var _zif_fgetc = Module2["_zif_fgetc"] = (a0, a1) => (_zif_fgetc = Module2["_zif_fgetc"] = wasmExports["dp"])(a0, a1);
    var _zif_fgets = Module2["_zif_fgets"] = (a0, a1) => (_zif_fgets = Module2["_zif_fgets"] = wasmExports["ep"])(a0, a1);
    var _zif_fread = Module2["_zif_fread"] = (a0, a1) => (_zif_fread = Module2["_zif_fread"] = wasmExports["fp"])(a0, a1);
    var _zif_fpassthru = Module2["_zif_fpassthru"] = (a0, a1) => (_zif_fpassthru = Module2["_zif_fpassthru"] = wasmExports["gp"])(a0, a1);
    var _zif_fseek = Module2["_zif_fseek"] = (a0, a1) => (_zif_fseek = Module2["_zif_fseek"] = wasmExports["hp"])(a0, a1);
    var _zif_ftell = Module2["_zif_ftell"] = (a0, a1) => (_zif_ftell = Module2["_zif_ftell"] = wasmExports["ip"])(a0, a1);
    var _zif_fflush = Module2["_zif_fflush"] = (a0, a1) => (_zif_fflush = Module2["_zif_fflush"] = wasmExports["jp"])(a0, a1);
    var _zif_fwrite = Module2["_zif_fwrite"] = (a0, a1) => (_zif_fwrite = Module2["_zif_fwrite"] = wasmExports["kp"])(a0, a1);
    var _zend_stream_init_fp = Module2["_zend_stream_init_fp"] = (a0, a1, a2) => (_zend_stream_init_fp = Module2["_zend_stream_init_fp"] = wasmExports["lp"])(a0, a1, a2);
    var __emalloc_large = Module2["__emalloc_large"] = (a0) => (__emalloc_large = Module2["__emalloc_large"] = wasmExports["mp"])(a0);
    var _object_and_properties_init = Module2["_object_and_properties_init"] = (a0, a1, a2) => (_object_and_properties_init = Module2["_object_and_properties_init"] = wasmExports["np"])(a0, a1, a2);
    var _zend_memnstr_ex = Module2["_zend_memnstr_ex"] = (a0, a1, a2, a3) => (_zend_memnstr_ex = Module2["_zend_memnstr_ex"] = wasmExports["op"])(a0, a1, a2, a3);
    var __safe_realloc = Module2["__safe_realloc"] = (a0, a1, a2, a3) => (__safe_realloc = Module2["__safe_realloc"] = wasmExports["pp"])(a0, a1, a2, a3);
    var _php_crc32_bulk_update = Module2["_php_crc32_bulk_update"] = (a0, a1, a2) => (_php_crc32_bulk_update = Module2["_php_crc32_bulk_update"] = wasmExports["qp"])(a0, a1, a2);
    var _php_crc32_stream_bulk_update = Module2["_php_crc32_stream_bulk_update"] = (a0, a1, a2) => (_php_crc32_stream_bulk_update = Module2["_php_crc32_stream_bulk_update"] = wasmExports["rp"])(a0, a1, a2);
    var _php_print_credits = Module2["_php_print_credits"] = (a0) => (_php_print_credits = Module2["_php_print_credits"] = wasmExports["sp"])(a0);
    var _php_print_info_htmlhead = Module2["_php_print_info_htmlhead"] = () => (_php_print_info_htmlhead = Module2["_php_print_info_htmlhead"] = wasmExports["tp"])();
    var _php_output_write = Module2["_php_output_write"] = (a0, a1) => (_php_output_write = Module2["_php_output_write"] = wasmExports["up"])(a0, a1);
    var _php_info_print_table_header = Module2["_php_info_print_table_header"] = (a0, a1) => (_php_info_print_table_header = Module2["_php_info_print_table_header"] = wasmExports["vp"])(a0, a1);
    var _php_info_print_table_colspan_header = Module2["_php_info_print_table_colspan_header"] = (a0, a1) => (_php_info_print_table_colspan_header = Module2["_php_info_print_table_colspan_header"] = wasmExports["wp"])(a0, a1);
    var _php_crypt = Module2["_php_crypt"] = (a0, a1, a2, a3, a4) => (_php_crypt = Module2["_php_crypt"] = wasmExports["xp"])(a0, a1, a2, a3, a4);
    var __emalloc_128 = Module2["__emalloc_128"] = () => (__emalloc_128 = Module2["__emalloc_128"] = wasmExports["yp"])();
    var _php_info_print_css = Module2["_php_info_print_css"] = () => (_php_info_print_css = Module2["_php_info_print_css"] = wasmExports["zp"])();
    var _php_std_date = Module2["_php_std_date"] = (a0, a1) => (_php_std_date = Module2["_php_std_date"] = wasmExports["Ap"])(a0, a1);
    var _zend_list_delete = Module2["_zend_list_delete"] = (a0) => (_zend_list_delete = Module2["_zend_list_delete"] = wasmExports["Bp"])(a0);
    var _zend_fetch_resource = Module2["_zend_fetch_resource"] = (a0, a1, a2) => (_zend_fetch_resource = Module2["_zend_fetch_resource"] = wasmExports["Cp"])(a0, a1, a2);
    var _zend_list_close = Module2["_zend_list_close"] = (a0) => (_zend_list_close = Module2["_zend_list_close"] = wasmExports["Dp"])(a0);
    var _php_clear_stat_cache = Module2["_php_clear_stat_cache"] = (a0, a1, a2) => (_php_clear_stat_cache = Module2["_php_clear_stat_cache"] = wasmExports["Ep"])(a0, a1, a2);
    var _php_check_open_basedir_ex = Module2["_php_check_open_basedir_ex"] = (a0, a1) => (_php_check_open_basedir_ex = Module2["_php_check_open_basedir_ex"] = wasmExports["Fp"])(a0, a1);
    var _php_stream_dirent_alphasort = Module2["_php_stream_dirent_alphasort"] = (a0, a1) => (_php_stream_dirent_alphasort = Module2["_php_stream_dirent_alphasort"] = wasmExports["Gp"])(a0, a1);
    var __php_stream_scandir = Module2["__php_stream_scandir"] = (a0, a1, a2, a3, a4) => (__php_stream_scandir = Module2["__php_stream_scandir"] = wasmExports["Hp"])(a0, a1, a2, a3, a4);
    var _php_stream_dirent_alphasortr = Module2["_php_stream_dirent_alphasortr"] = (a0, a1) => (_php_stream_dirent_alphasortr = Module2["_php_stream_dirent_alphasortr"] = wasmExports["Ip"])(a0, a1);
    var _zif_dl = Module2["_zif_dl"] = (a0, a1) => (_zif_dl = Module2["_zif_dl"] = wasmExports["Jp"])(a0, a1);
    var _php_load_extension = Module2["_php_load_extension"] = (a0, a1, a2) => (_php_load_extension = Module2["_php_load_extension"] = wasmExports["Kp"])(a0, a1, a2);
    var _php_dl = Module2["_php_dl"] = (a0, a1, a2, a3) => (_php_dl = Module2["_php_dl"] = wasmExports["Lp"])(a0, a1, a2, a3);
    var _php_load_shlib = Module2["_php_load_shlib"] = (a0, a1) => (_php_load_shlib = Module2["_php_load_shlib"] = wasmExports["Mp"])(a0, a1);
    var _zend_register_module_ex = Module2["_zend_register_module_ex"] = (a0, a1) => (_zend_register_module_ex = Module2["_zend_register_module_ex"] = wasmExports["Np"])(a0, a1);
    var _zend_startup_module_ex = Module2["_zend_startup_module_ex"] = (a0) => (_zend_startup_module_ex = Module2["_zend_startup_module_ex"] = wasmExports["Op"])(a0);
    var _php_exec = Module2["_php_exec"] = (a0, a1, a2, a3) => (_php_exec = Module2["_php_exec"] = wasmExports["Pp"])(a0, a1, a2, a3);
    var __php_stream_fopen_from_pipe = Module2["__php_stream_fopen_from_pipe"] = (a0, a1) => (__php_stream_fopen_from_pipe = Module2["__php_stream_fopen_from_pipe"] = wasmExports["Qp"])(a0, a1);
    var _php_output_get_level = Module2["_php_output_get_level"] = () => (_php_output_get_level = Module2["_php_output_get_level"] = wasmExports["Rp"])();
    var _php_escape_shell_cmd = Module2["_php_escape_shell_cmd"] = (a0) => (_php_escape_shell_cmd = Module2["_php_escape_shell_cmd"] = wasmExports["Sp"])(a0);
    var _php_escape_shell_arg = Module2["_php_escape_shell_arg"] = (a0) => (_php_escape_shell_arg = Module2["_php_escape_shell_arg"] = wasmExports["Tp"])(a0);
    var __php_stream_copy_to_mem = Module2["__php_stream_copy_to_mem"] = (a0, a1, a2) => (__php_stream_copy_to_mem = Module2["__php_stream_copy_to_mem"] = wasmExports["Up"])(a0, a1, a2);
    var _zend_register_list_destructors_ex = Module2["_zend_register_list_destructors_ex"] = (a0, a1, a2, a3) => (_zend_register_list_destructors_ex = Module2["_zend_register_list_destructors_ex"] = wasmExports["Vp"])(a0, a1, a2, a3);
    var _php_stream_context_free = Module2["_php_stream_context_free"] = (a0) => (_php_stream_context_free = Module2["_php_stream_context_free"] = wasmExports["Wp"])(a0);
    var _zend_fetch_resource2 = Module2["_zend_fetch_resource2"] = (a0, a1, a2, a3) => (_zend_fetch_resource2 = Module2["_zend_fetch_resource2"] = wasmExports["Xp"])(a0, a1, a2, a3);
    var _zend_str_tolower = Module2["_zend_str_tolower"] = (a0, a1) => (_zend_str_tolower = Module2["_zend_str_tolower"] = wasmExports["Yp"])(a0, a1);
    var __php_stream_copy_to_stream_ex = Module2["__php_stream_copy_to_stream_ex"] = (a0, a1, a2, a3) => (__php_stream_copy_to_stream_ex = Module2["__php_stream_copy_to_stream_ex"] = wasmExports["Zp"])(a0, a1, a2, a3);
    var _php_stream_locate_eol = Module2["_php_stream_locate_eol"] = (a0, a1) => (_php_stream_locate_eol = Module2["_php_stream_locate_eol"] = wasmExports["_p"])(a0, a1);
    var _add_index_stringl = Module2["_add_index_stringl"] = (a0, a1, a2, a3) => (_add_index_stringl = Module2["_add_index_stringl"] = wasmExports["$p"])(a0, a1, a2, a3);
    var _php_open_temporary_fd_ex = Module2["_php_open_temporary_fd_ex"] = (a0, a1, a2, a3) => (_php_open_temporary_fd_ex = Module2["_php_open_temporary_fd_ex"] = wasmExports["aq"])(a0, a1, a2, a3);
    var __php_stream_fopen_tmpfile = Module2["__php_stream_fopen_tmpfile"] = (a0) => (__php_stream_fopen_tmpfile = Module2["__php_stream_fopen_tmpfile"] = wasmExports["bq"])(a0);
    var _php_error_docref2 = Module2["_php_error_docref2"] = (a0, a1, a2, a3, a4, a5) => (_php_error_docref2 = Module2["_php_error_docref2"] = wasmExports["cq"])(a0, a1, a2, a3, a4, a5);
    var __php_stream_mkdir = Module2["__php_stream_mkdir"] = (a0, a1, a2, a3) => (__php_stream_mkdir = Module2["__php_stream_mkdir"] = wasmExports["dq"])(a0, a1, a2, a3);
    var __php_stream_rmdir = Module2["__php_stream_rmdir"] = (a0, a1, a2) => (__php_stream_rmdir = Module2["__php_stream_rmdir"] = wasmExports["eq"])(a0, a1, a2);
    var _php_stream_locate_url_wrapper = Module2["_php_stream_locate_url_wrapper"] = (a0, a1, a2) => (_php_stream_locate_url_wrapper = Module2["_php_stream_locate_url_wrapper"] = wasmExports["fq"])(a0, a1, a2);
    var __php_stream_sync = Module2["__php_stream_sync"] = (a0, a1) => (__php_stream_sync = Module2["__php_stream_sync"] = wasmExports["gq"])(a0, a1);
    var __php_stream_stat = Module2["__php_stream_stat"] = (a0, a1) => (__php_stream_stat = Module2["__php_stream_stat"] = wasmExports["hq"])(a0, a1);
    var _zend_hash_str_add_new = Module2["_zend_hash_str_add_new"] = (a0, a1, a2, a3) => (_zend_hash_str_add_new = Module2["_zend_hash_str_add_new"] = wasmExports["iq"])(a0, a1, a2, a3);
    var _php_copy_file_ctx = Module2["_php_copy_file_ctx"] = (a0, a1, a2, a3) => (_php_copy_file_ctx = Module2["_php_copy_file_ctx"] = wasmExports["jq"])(a0, a1, a2, a3);
    var __php_stream_stat_path = Module2["__php_stream_stat_path"] = (a0, a1, a2, a3) => (__php_stream_stat_path = Module2["__php_stream_stat_path"] = wasmExports["kq"])(a0, a1, a2, a3);
    var _expand_filepath = Module2["_expand_filepath"] = (a0, a1) => (_expand_filepath = Module2["_expand_filepath"] = wasmExports["lq"])(a0, a1);
    var _php_copy_file = Module2["_php_copy_file"] = (a0, a1) => (_php_copy_file = Module2["_php_copy_file"] = wasmExports["mq"])(a0, a1);
    var _php_get_temporary_directory = Module2["_php_get_temporary_directory"] = () => (_php_get_temporary_directory = Module2["_php_get_temporary_directory"] = wasmExports["nq"])();
    var _OnUpdateBool = Module2["_OnUpdateBool"] = (a0, a1, a2, a3, a4, a5) => (_OnUpdateBool = Module2["_OnUpdateBool"] = wasmExports["oq"])(a0, a1, a2, a3, a4, a5);
    var _php_get_gid_by_name = Module2["_php_get_gid_by_name"] = (a0, a1) => (_php_get_gid_by_name = Module2["_php_get_gid_by_name"] = wasmExports["pq"])(a0, a1);
    var _php_get_uid_by_name = Module2["_php_get_uid_by_name"] = (a0, a1) => (_php_get_uid_by_name = Module2["_php_get_uid_by_name"] = wasmExports["qq"])(a0, a1);
    var _realpath_cache_del = Module2["_realpath_cache_del"] = (a0, a1) => (_realpath_cache_del = Module2["_realpath_cache_del"] = wasmExports["rq"])(a0, a1);
    var _realpath_cache_clean = Module2["_realpath_cache_clean"] = () => (_realpath_cache_clean = Module2["_realpath_cache_clean"] = wasmExports["sq"])();
    var _realpath_cache_size = Module2["_realpath_cache_size"] = () => (_realpath_cache_size = Module2["_realpath_cache_size"] = wasmExports["tq"])();
    var _realpath_cache_get_buckets = Module2["_realpath_cache_get_buckets"] = () => (_realpath_cache_get_buckets = Module2["_realpath_cache_get_buckets"] = wasmExports["uq"])();
    var _realpath_cache_max_buckets = Module2["_realpath_cache_max_buckets"] = () => (_realpath_cache_max_buckets = Module2["_realpath_cache_max_buckets"] = wasmExports["vq"])();
    var _add_assoc_stringl_ex = Module2["_add_assoc_stringl_ex"] = (a0, a1, a2, a3, a4) => (_add_assoc_stringl_ex = Module2["_add_assoc_stringl_ex"] = wasmExports["wq"])(a0, a1, a2, a3, a4);
    var _php_stream_filter_register_factory = Module2["_php_stream_filter_register_factory"] = (a0, a1) => (_php_stream_filter_register_factory = Module2["_php_stream_filter_register_factory"] = wasmExports["xq"])(a0, a1);
    var _php_stream_filter_unregister_factory = Module2["_php_stream_filter_unregister_factory"] = (a0) => (_php_stream_filter_unregister_factory = Module2["_php_stream_filter_unregister_factory"] = wasmExports["yq"])(a0);
    var _php_stream_bucket_make_writeable = Module2["_php_stream_bucket_make_writeable"] = (a0) => (_php_stream_bucket_make_writeable = Module2["_php_stream_bucket_make_writeable"] = wasmExports["zq"])(a0);
    var _php_strtr = Module2["_php_strtr"] = (a0, a1, a2, a3, a4) => (_php_strtr = Module2["_php_strtr"] = wasmExports["Aq"])(a0, a1, a2, a3, a4);
    var _php_stream_bucket_append = Module2["_php_stream_bucket_append"] = (a0, a1) => (_php_stream_bucket_append = Module2["_php_stream_bucket_append"] = wasmExports["Bq"])(a0, a1);
    var __php_stream_filter_alloc = Module2["__php_stream_filter_alloc"] = (a0, a1, a2) => (__php_stream_filter_alloc = Module2["__php_stream_filter_alloc"] = wasmExports["Cq"])(a0, a1, a2);
    var _php_stream_bucket_unlink = Module2["_php_stream_bucket_unlink"] = (a0) => (_php_stream_bucket_unlink = Module2["_php_stream_bucket_unlink"] = wasmExports["Dq"])(a0);
    var _php_stream_bucket_delref = Module2["_php_stream_bucket_delref"] = (a0) => (_php_stream_bucket_delref = Module2["_php_stream_bucket_delref"] = wasmExports["Eq"])(a0);
    var _php_stream_bucket_new = Module2["_php_stream_bucket_new"] = (a0, a1, a2, a3, a4) => (_php_stream_bucket_new = Module2["_php_stream_bucket_new"] = wasmExports["Fq"])(a0, a1, a2, a3, a4);
    var ___zend_realloc = Module2["___zend_realloc"] = (a0, a1) => (___zend_realloc = Module2["___zend_realloc"] = wasmExports["Gq"])(a0, a1);
    var ___zend_strdup = Module2["___zend_strdup"] = (a0) => (___zend_strdup = Module2["___zend_strdup"] = wasmExports["Hq"])(a0);
    var _php_flock = Module2["_php_flock"] = (a0, a1) => (_php_flock = Module2["_php_flock"] = wasmExports["Iq"])(a0, a1);
    var _php_conv_fp = Module2["_php_conv_fp"] = (a0, a1, a2, a3, a4, a5, a6, a7) => (_php_conv_fp = Module2["_php_conv_fp"] = wasmExports["Jq"])(a0, a1, a2, a3, a4, a5, a6, a7);
    var _zend_argument_count_error = Module2["_zend_argument_count_error"] = (a0, a1) => (_zend_argument_count_error = Module2["_zend_argument_count_error"] = wasmExports["Kq"])(a0, a1);
    var __php_stream_xport_create = Module2["__php_stream_xport_create"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8) => (__php_stream_xport_create = Module2["__php_stream_xport_create"] = wasmExports["Lq"])(a0, a1, a2, a3, a4, a5, a6, a7, a8);
    var _zend_try_assign_typed_ref_str = Module2["_zend_try_assign_typed_ref_str"] = (a0, a1) => (_zend_try_assign_typed_ref_str = Module2["_zend_try_assign_typed_ref_str"] = wasmExports["Mq"])(a0, a1);
    var _zend_try_assign_typed_ref_empty_string = Module2["_zend_try_assign_typed_ref_empty_string"] = (a0) => (_zend_try_assign_typed_ref_empty_string = Module2["_zend_try_assign_typed_ref_empty_string"] = wasmExports["Nq"])(a0);
    var _php_stream_wrapper_log_error = Module2["_php_stream_wrapper_log_error"] = (a0, a1, a2, a3) => (_php_stream_wrapper_log_error = Module2["_php_stream_wrapper_log_error"] = wasmExports["Oq"])(a0, a1, a2, a3);
    var _php_stream_context_get_option = Module2["_php_stream_context_get_option"] = (a0, a1, a2) => (_php_stream_context_get_option = Module2["_php_stream_context_get_option"] = wasmExports["Pq"])(a0, a1, a2);
    var __php_stream_printf = Module2["__php_stream_printf"] = (a0, a1, a2) => (__php_stream_printf = Module2["__php_stream_printf"] = wasmExports["Qq"])(a0, a1, a2);
    var _php_stream_notification_notify = Module2["_php_stream_notification_notify"] = (a0, a1, a2, a3, a4, a5, a6, a7) => (_php_stream_notification_notify = Module2["_php_stream_notification_notify"] = wasmExports["Rq"])(a0, a1, a2, a3, a4, a5, a6, a7);
    var _php_stream_context_set = Module2["_php_stream_context_set"] = (a0, a1) => (_php_stream_context_set = Module2["_php_stream_context_set"] = wasmExports["Sq"])(a0, a1);
    var _php_stream_xport_crypto_setup = Module2["_php_stream_xport_crypto_setup"] = (a0, a1, a2) => (_php_stream_xport_crypto_setup = Module2["_php_stream_xport_crypto_setup"] = wasmExports["Tq"])(a0, a1, a2);
    var _php_stream_xport_crypto_enable = Module2["_php_stream_xport_crypto_enable"] = (a0, a1) => (_php_stream_xport_crypto_enable = Module2["_php_stream_xport_crypto_enable"] = wasmExports["Uq"])(a0, a1);
    var _php_url_free = Module2["_php_url_free"] = (a0) => (_php_url_free = Module2["_php_url_free"] = wasmExports["Vq"])(a0);
    var _php_url_parse = Module2["_php_url_parse"] = (a0) => (_php_url_parse = Module2["_php_url_parse"] = wasmExports["Wq"])(a0);
    var _php_raw_url_decode = Module2["_php_raw_url_decode"] = (a0, a1) => (_php_raw_url_decode = Module2["_php_raw_url_decode"] = wasmExports["Xq"])(a0, a1);
    var __php_stream_sock_open_host = Module2["__php_stream_sock_open_host"] = (a0, a1, a2, a3, a4) => (__php_stream_sock_open_host = Module2["__php_stream_sock_open_host"] = wasmExports["Yq"])(a0, a1, a2, a3, a4);
    var __php_stream_alloc = Module2["__php_stream_alloc"] = (a0, a1, a2, a3) => (__php_stream_alloc = Module2["__php_stream_alloc"] = wasmExports["Zq"])(a0, a1, a2, a3);
    var _sapi_header_op = Module2["_sapi_header_op"] = (a0, a1) => (_sapi_header_op = Module2["_sapi_header_op"] = wasmExports["_q"])(a0, a1);
    var _php_header = Module2["_php_header"] = () => (_php_header = Module2["_php_header"] = wasmExports["$q"])();
    var _sapi_send_headers = Module2["_sapi_send_headers"] = () => (_sapi_send_headers = Module2["_sapi_send_headers"] = wasmExports["ar"])();
    var _php_setcookie = Module2["_php_setcookie"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) => (_php_setcookie = Module2["_php_setcookie"] = wasmExports["br"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
    var _php_raw_url_encode = Module2["_php_raw_url_encode"] = (a0, a1) => (_php_raw_url_encode = Module2["_php_raw_url_encode"] = wasmExports["cr"])(a0, a1);
    var _php_output_get_start_lineno = Module2["_php_output_get_start_lineno"] = () => (_php_output_get_start_lineno = Module2["_php_output_get_start_lineno"] = wasmExports["dr"])();
    var _php_output_get_start_filename = Module2["_php_output_get_start_filename"] = () => (_php_output_get_start_filename = Module2["_php_output_get_start_filename"] = wasmExports["er"])();
    var _zend_try_assign_typed_ref_string = Module2["_zend_try_assign_typed_ref_string"] = (a0, a1) => (_zend_try_assign_typed_ref_string = Module2["_zend_try_assign_typed_ref_string"] = wasmExports["fr"])(a0, a1);
    var _zend_llist_apply_with_argument = Module2["_zend_llist_apply_with_argument"] = (a0, a1, a2) => (_zend_llist_apply_with_argument = Module2["_zend_llist_apply_with_argument"] = wasmExports["gr"])(a0, a1, a2);
    var _php_unescape_html_entities = Module2["_php_unescape_html_entities"] = (a0, a1, a2, a3) => (_php_unescape_html_entities = Module2["_php_unescape_html_entities"] = wasmExports["hr"])(a0, a1, a2, a3);
    var _php_escape_html_entities = Module2["_php_escape_html_entities"] = (a0, a1, a2, a3, a4) => (_php_escape_html_entities = Module2["_php_escape_html_entities"] = wasmExports["ir"])(a0, a1, a2, a3, a4);
    var _php_escape_html_entities_ex = Module2["_php_escape_html_entities_ex"] = (a0, a1, a2, a3, a4, a5, a6) => (_php_escape_html_entities_ex = Module2["_php_escape_html_entities_ex"] = wasmExports["jr"])(a0, a1, a2, a3, a4, a5, a6);
    var _zend_set_local_var_str = Module2["_zend_set_local_var_str"] = (a0, a1, a2, a3) => (_zend_set_local_var_str = Module2["_zend_set_local_var_str"] = wasmExports["kr"])(a0, a1, a2, a3);
    var _php_stream_context_set_option = Module2["_php_stream_context_set_option"] = (a0, a1, a2, a3) => (_php_stream_context_set_option = Module2["_php_stream_context_set_option"] = wasmExports["lr"])(a0, a1, a2, a3);
    var _php_trim = Module2["_php_trim"] = (a0, a1, a2, a3) => (_php_trim = Module2["_php_trim"] = wasmExports["mr"])(a0, a1, a2, a3);
    var _php_url_decode = Module2["_php_url_decode"] = (a0, a1) => (_php_url_decode = Module2["_php_url_decode"] = wasmExports["nr"])(a0, a1);
    var _php_stream_filter_create = Module2["_php_stream_filter_create"] = (a0, a1, a2) => (_php_stream_filter_create = Module2["_php_stream_filter_create"] = wasmExports["or"])(a0, a1, a2);
    var _php_stream_filter_free = Module2["_php_stream_filter_free"] = (a0) => (_php_stream_filter_free = Module2["_php_stream_filter_free"] = wasmExports["pr"])(a0);
    var __php_stream_filter_append = Module2["__php_stream_filter_append"] = (a0, a1) => (__php_stream_filter_append = Module2["__php_stream_filter_append"] = wasmExports["qr"])(a0, a1);
    var _php_url_encode_hash_ex = Module2["_php_url_encode_hash_ex"] = (a0, a1, a2, a3, a4, a5, a6, a7) => (_php_url_encode_hash_ex = Module2["_php_url_encode_hash_ex"] = wasmExports["rr"])(a0, a1, a2, a3, a4, a5, a6, a7);
    var _zend_ini_str = Module2["_zend_ini_str"] = (a0, a1, a2) => (_zend_ini_str = Module2["_zend_ini_str"] = wasmExports["sr"])(a0, a1, a2);
    var _zend_check_property_access = Module2["_zend_check_property_access"] = (a0, a1, a2) => (_zend_check_property_access = Module2["_zend_check_property_access"] = wasmExports["tr"])(a0, a1, a2);
    var _php_url_encode = Module2["_php_url_encode"] = (a0, a1) => (_php_url_encode = Module2["_php_url_encode"] = wasmExports["ur"])(a0, a1);
    var _zend_double_to_str = Module2["_zend_double_to_str"] = (a0) => (_zend_double_to_str = Module2["_zend_double_to_str"] = wasmExports["vr"])(a0);
    var _sapi_read_post_data = Module2["_sapi_read_post_data"] = () => (_sapi_read_post_data = Module2["_sapi_read_post_data"] = wasmExports["wr"])();
    var _sapi_handle_post = Module2["_sapi_handle_post"] = (a0) => (_sapi_handle_post = Module2["_sapi_handle_post"] = wasmExports["xr"])(a0);
    var _php_is_image_avif = Module2["_php_is_image_avif"] = (a0) => (_php_is_image_avif = Module2["_php_is_image_avif"] = wasmExports["yr"])(a0);
    var _php_image_type_to_mime_type = Module2["_php_image_type_to_mime_type"] = (a0) => (_php_image_type_to_mime_type = Module2["_php_image_type_to_mime_type"] = wasmExports["zr"])(a0);
    var _php_getimagetype = Module2["_php_getimagetype"] = (a0, a1, a2) => (_php_getimagetype = Module2["_php_getimagetype"] = wasmExports["Ar"])(a0, a1, a2);
    var __php_stream_memory_open = Module2["__php_stream_memory_open"] = (a0, a1) => (__php_stream_memory_open = Module2["__php_stream_memory_open"] = wasmExports["Br"])(a0, a1);
    var _zend_objects_new = Module2["_zend_objects_new"] = (a0) => (_zend_objects_new = Module2["_zend_objects_new"] = wasmExports["Cr"])(a0);
    var _php_lookup_class_name = Module2["_php_lookup_class_name"] = (a0) => (_php_lookup_class_name = Module2["_php_lookup_class_name"] = wasmExports["Dr"])(a0);
    var _php_store_class_name = Module2["_php_store_class_name"] = (a0, a1) => (_php_store_class_name = Module2["_php_store_class_name"] = wasmExports["Er"])(a0, a1);
    var _zend_vspprintf = Module2["_zend_vspprintf"] = (a0, a1, a2, a3) => (_zend_vspprintf = Module2["_zend_vspprintf"] = wasmExports["Fr"])(a0, a1, a2, a3);
    var _php_info_print_style = Module2["_php_info_print_style"] = () => (_php_info_print_style = Module2["_php_info_print_style"] = wasmExports["Gr"])();
    var _php_get_uname = Module2["_php_get_uname"] = (a0) => (_php_get_uname = Module2["_php_get_uname"] = wasmExports["Hr"])(a0);
    var _php_print_info = Module2["_php_print_info"] = (a0) => (_php_print_info = Module2["_php_print_info"] = wasmExports["Ir"])(a0);
    var _get_zend_version = Module2["_get_zend_version"] = () => (_get_zend_version = Module2["_get_zend_version"] = wasmExports["Jr"])();
    var _is_zend_mm = Module2["_is_zend_mm"] = () => (_is_zend_mm = Module2["_is_zend_mm"] = wasmExports["Kr"])();
    var _zend_multibyte_get_functions = Module2["_zend_multibyte_get_functions"] = () => (_zend_multibyte_get_functions = Module2["_zend_multibyte_get_functions"] = wasmExports["Lr"])();
    var __php_stream_get_url_stream_wrappers_hash = Module2["__php_stream_get_url_stream_wrappers_hash"] = () => (__php_stream_get_url_stream_wrappers_hash = Module2["__php_stream_get_url_stream_wrappers_hash"] = wasmExports["Mr"])();
    var _php_stream_xport_get_hash = Module2["_php_stream_xport_get_hash"] = () => (_php_stream_xport_get_hash = Module2["_php_stream_xport_get_hash"] = wasmExports["Nr"])();
    var __php_get_stream_filters_hash = Module2["__php_get_stream_filters_hash"] = () => (__php_get_stream_filters_hash = Module2["__php_get_stream_filters_hash"] = wasmExports["Or"])();
    var _zend_html_puts = Module2["_zend_html_puts"] = (a0, a1) => (_zend_html_puts = Module2["_zend_html_puts"] = wasmExports["Pr"])(a0, a1);
    var _php_info_print_box_start = Module2["_php_info_print_box_start"] = (a0) => (_php_info_print_box_start = Module2["_php_info_print_box_start"] = wasmExports["Qr"])(a0);
    var _php_info_print_box_end = Module2["_php_info_print_box_end"] = () => (_php_info_print_box_end = Module2["_php_info_print_box_end"] = wasmExports["Rr"])();
    var _php_info_print_hr = Module2["_php_info_print_hr"] = () => (_php_info_print_hr = Module2["_php_info_print_hr"] = wasmExports["Sr"])();
    var _php_info_print_table_row_ex = Module2["_php_info_print_table_row_ex"] = (a0, a1, a2) => (_php_info_print_table_row_ex = Module2["_php_info_print_table_row_ex"] = wasmExports["Tr"])(a0, a1, a2);
    var _zend_get_module_version = Module2["_zend_get_module_version"] = (a0) => (_zend_get_module_version = Module2["_zend_get_module_version"] = wasmExports["Ur"])(a0);
    var _expand_filepath_ex = Module2["_expand_filepath_ex"] = (a0, a1, a2, a3) => (_expand_filepath_ex = Module2["_expand_filepath_ex"] = wasmExports["Vr"])(a0, a1, a2, a3);
    var _php_mail_build_headers = Module2["_php_mail_build_headers"] = (a0) => (_php_mail_build_headers = Module2["_php_mail_build_headers"] = wasmExports["Wr"])(a0);
    var _zend_ini_str_ex = Module2["_zend_ini_str_ex"] = (a0, a1, a2, a3) => (_zend_ini_str_ex = Module2["_zend_ini_str_ex"] = wasmExports["Xr"])(a0, a1, a2, a3);
    var _zend_get_executed_filename = Module2["_zend_get_executed_filename"] = () => (_zend_get_executed_filename = Module2["_zend_get_executed_filename"] = wasmExports["Yr"])();
    var _php_math_round_mode_from_enum = Module2["_php_math_round_mode_from_enum"] = (a0) => (_php_math_round_mode_from_enum = Module2["_php_math_round_mode_from_enum"] = wasmExports["Zr"])(a0);
    var _pow_function = Module2["_pow_function"] = (a0, a1, a2) => (_pow_function = Module2["_pow_function"] = wasmExports["_r"])(a0, a1, a2);
    var __php_math_basetolong = Module2["__php_math_basetolong"] = (a0, a1) => (__php_math_basetolong = Module2["__php_math_basetolong"] = wasmExports["$r"])(a0, a1);
    var __php_math_basetozval = Module2["__php_math_basetozval"] = (a0, a1, a2) => (__php_math_basetozval = Module2["__php_math_basetozval"] = wasmExports["as"])(a0, a1, a2);
    var __php_math_longtobase = Module2["__php_math_longtobase"] = (a0, a1) => (__php_math_longtobase = Module2["__php_math_longtobase"] = wasmExports["bs"])(a0, a1);
    var __php_math_zvaltobase = Module2["__php_math_zvaltobase"] = (a0, a1) => (__php_math_zvaltobase = Module2["__php_math_zvaltobase"] = wasmExports["cs"])(a0, a1);
    var _zend_flf_parse_arg_long_slow = Module2["_zend_flf_parse_arg_long_slow"] = (a0, a1, a2) => (_zend_flf_parse_arg_long_slow = Module2["_zend_flf_parse_arg_long_slow"] = wasmExports["ds"])(a0, a1, a2);
    var __php_math_number_format = Module2["__php_math_number_format"] = (a0, a1, a2, a3) => (__php_math_number_format = Module2["__php_math_number_format"] = wasmExports["es"])(a0, a1, a2, a3);
    var __php_math_number_format_ex = Module2["__php_math_number_format_ex"] = (a0, a1, a2, a3, a4, a5) => (__php_math_number_format_ex = Module2["__php_math_number_format_ex"] = wasmExports["fs"])(a0, a1, a2, a3, a4, a5);
    var __php_math_number_format_long = Module2["__php_math_number_format_long"] = (a0, a1, a2, a3, a4, a5) => (__php_math_number_format_long = Module2["__php_math_number_format_long"] = wasmExports["gs"])(a0, a1, a2, a3, a4, a5);
    var _make_digest = Module2["_make_digest"] = (a0, a1) => (_make_digest = Module2["_make_digest"] = wasmExports["hs"])(a0, a1);
    var _make_digest_ex = Module2["_make_digest_ex"] = (a0, a1, a2) => (_make_digest_ex = Module2["_make_digest_ex"] = wasmExports["is"])(a0, a1, a2);
    var __emalloc_56 = Module2["__emalloc_56"] = () => (__emalloc_56 = Module2["__emalloc_56"] = wasmExports["js"])();
    var _php_inet_ntop = Module2["_php_inet_ntop"] = (a0) => (_php_inet_ntop = Module2["_php_inet_ntop"] = wasmExports["ks"])(a0);
    var __emalloc_64 = Module2["__emalloc_64"] = () => (__emalloc_64 = Module2["__emalloc_64"] = wasmExports["ls"])();
    var __try_convert_to_string = Module2["__try_convert_to_string"] = (a0) => (__try_convert_to_string = Module2["__try_convert_to_string"] = wasmExports["ms"])(a0);
    var _convert_to_long = Module2["_convert_to_long"] = (a0) => (_convert_to_long = Module2["_convert_to_long"] = wasmExports["ns"])(a0);
    var _php_statpage = Module2["_php_statpage"] = () => (_php_statpage = Module2["_php_statpage"] = wasmExports["os"])();
    var _sapi_get_stat = Module2["_sapi_get_stat"] = () => (_sapi_get_stat = Module2["_sapi_get_stat"] = wasmExports["ps"])();
    var _php_getlastmod = Module2["_php_getlastmod"] = () => (_php_getlastmod = Module2["_php_getlastmod"] = wasmExports["qs"])();
    var _php_password_algo_register = Module2["_php_password_algo_register"] = (a0, a1) => (_php_password_algo_register = Module2["_php_password_algo_register"] = wasmExports["rs"])(a0, a1);
    var _php_password_algo_unregister = Module2["_php_password_algo_unregister"] = (a0) => (_php_password_algo_unregister = Module2["_php_password_algo_unregister"] = wasmExports["ss"])(a0);
    var _php_password_algo_default = Module2["_php_password_algo_default"] = () => (_php_password_algo_default = Module2["_php_password_algo_default"] = wasmExports["ts"])();
    var _php_password_algo_find = Module2["_php_password_algo_find"] = (a0) => (_php_password_algo_find = Module2["_php_password_algo_find"] = wasmExports["us"])(a0);
    var _php_password_algo_extract_ident = Module2["_php_password_algo_extract_ident"] = (a0) => (_php_password_algo_extract_ident = Module2["_php_password_algo_extract_ident"] = wasmExports["vs"])(a0);
    var _php_password_algo_identify_ex = Module2["_php_password_algo_identify_ex"] = (a0, a1) => (_php_password_algo_identify_ex = Module2["_php_password_algo_identify_ex"] = wasmExports["ws"])(a0, a1);
    var _php_stream_mode_from_str = Module2["_php_stream_mode_from_str"] = (a0) => (_php_stream_mode_from_str = Module2["_php_stream_mode_from_str"] = wasmExports["xs"])(a0);
    var __php_stream_temp_create = Module2["__php_stream_temp_create"] = (a0, a1) => (__php_stream_temp_create = Module2["__php_stream_temp_create"] = wasmExports["ys"])(a0, a1);
    var __php_stream_memory_create = Module2["__php_stream_memory_create"] = (a0) => (__php_stream_memory_create = Module2["__php_stream_memory_create"] = wasmExports["zs"])(a0);
    var __php_stream_temp_create_ex = Module2["__php_stream_temp_create_ex"] = (a0, a1, a2) => (__php_stream_temp_create_ex = Module2["__php_stream_temp_create_ex"] = wasmExports["As"])(a0, a1, a2);
    var __php_stream_sock_open_from_socket = Module2["__php_stream_sock_open_from_socket"] = (a0, a1) => (__php_stream_sock_open_from_socket = Module2["__php_stream_sock_open_from_socket"] = wasmExports["Bs"])(a0, a1);
    var __php_stream_fopen_from_file = Module2["__php_stream_fopen_from_file"] = (a0, a1) => (__php_stream_fopen_from_file = Module2["__php_stream_fopen_from_file"] = wasmExports["Cs"])(a0, a1);
    var __php_stream_fopen_from_fd = Module2["__php_stream_fopen_from_fd"] = (a0, a1, a2, a3) => (__php_stream_fopen_from_fd = Module2["__php_stream_fopen_from_fd"] = wasmExports["Ds"])(a0, a1, a2, a3);
    var _sapi_read_post_block = Module2["_sapi_read_post_block"] = (a0, a1) => (_sapi_read_post_block = Module2["_sapi_read_post_block"] = wasmExports["Es"])(a0, a1);
    var __php_stream_cast = Module2["__php_stream_cast"] = (a0, a1, a2, a3) => (__php_stream_cast = Module2["__php_stream_cast"] = wasmExports["Fs"])(a0, a1, a2, a3);
    var _php_socket_error_str = Module2["_php_socket_error_str"] = (a0) => (_php_socket_error_str = Module2["_php_socket_error_str"] = wasmExports["Gs"])(a0);
    var _zend_register_resource = Module2["_zend_register_resource"] = (a0, a1) => (_zend_register_resource = Module2["_zend_register_resource"] = wasmExports["Hs"])(a0, a1);
    var _php_quot_print_decode = Module2["_php_quot_print_decode"] = (a0, a1, a2) => (_php_quot_print_decode = Module2["_php_quot_print_decode"] = wasmExports["Is"])(a0, a1, a2);
    var _php_quot_print_encode = Module2["_php_quot_print_encode"] = (a0, a1) => (_php_quot_print_encode = Module2["_php_quot_print_encode"] = wasmExports["Js"])(a0, a1);
    var _ValidateFormat = Module2["_ValidateFormat"] = (a0, a1, a2) => (_ValidateFormat = Module2["_ValidateFormat"] = wasmExports["Ks"])(a0, a1, a2);
    var _convert_to_null = Module2["_convert_to_null"] = (a0) => (_convert_to_null = Module2["_convert_to_null"] = wasmExports["Ls"])(a0);
    var _zend_try_assign_typed_ref_stringl = Module2["_zend_try_assign_typed_ref_stringl"] = (a0, a1, a2) => (_zend_try_assign_typed_ref_stringl = Module2["_zend_try_assign_typed_ref_stringl"] = wasmExports["Ms"])(a0, a1, a2);
    var _zend_try_assign_typed_ref_double = Module2["_zend_try_assign_typed_ref_double"] = (a0, a1) => (_zend_try_assign_typed_ref_double = Module2["_zend_try_assign_typed_ref_double"] = wasmExports["Ns"])(a0, a1);
    var _make_sha1_digest = Module2["_make_sha1_digest"] = (a0, a1) => (_make_sha1_digest = Module2["_make_sha1_digest"] = wasmExports["Os"])(a0, a1);
    var _php_socket_strerror = Module2["_php_socket_strerror"] = (a0, a1, a2) => (_php_socket_strerror = Module2["_php_socket_strerror"] = wasmExports["Ps"])(a0, a1, a2);
    var _add_next_index_resource = Module2["_add_next_index_resource"] = (a0, a1) => (_add_next_index_resource = Module2["_add_next_index_resource"] = wasmExports["Qs"])(a0, a1);
    var _php_addslashes = Module2["_php_addslashes"] = (a0) => (_php_addslashes = Module2["_php_addslashes"] = wasmExports["Rs"])(a0);
    var _php_stream_xport_accept = Module2["_php_stream_xport_accept"] = (a0, a1, a2, a3, a4, a5, a6) => (_php_stream_xport_accept = Module2["_php_stream_xport_accept"] = wasmExports["Ss"])(a0, a1, a2, a3, a4, a5, a6);
    var _php_stream_xport_get_name = Module2["_php_stream_xport_get_name"] = (a0, a1, a2, a3, a4) => (_php_stream_xport_get_name = Module2["_php_stream_xport_get_name"] = wasmExports["Ts"])(a0, a1, a2, a3, a4);
    var _php_network_parse_network_address_with_port = Module2["_php_network_parse_network_address_with_port"] = (a0, a1, a2, a3) => (_php_network_parse_network_address_with_port = Module2["_php_network_parse_network_address_with_port"] = wasmExports["Us"])(a0, a1, a2, a3);
    var _php_stream_xport_sendto = Module2["_php_stream_xport_sendto"] = (a0, a1, a2, a3, a4, a5) => (_php_stream_xport_sendto = Module2["_php_stream_xport_sendto"] = wasmExports["Vs"])(a0, a1, a2, a3, a4, a5);
    var _zend_try_assign_typed_ref_null = Module2["_zend_try_assign_typed_ref_null"] = (a0) => (_zend_try_assign_typed_ref_null = Module2["_zend_try_assign_typed_ref_null"] = wasmExports["Ws"])(a0);
    var _php_stream_xport_recvfrom = Module2["_php_stream_xport_recvfrom"] = (a0, a1, a2, a3, a4, a5, a6) => (_php_stream_xport_recvfrom = Module2["_php_stream_xport_recvfrom"] = wasmExports["Xs"])(a0, a1, a2, a3, a4, a5, a6);
    var __php_emit_fd_setsize_warning = Module2["__php_emit_fd_setsize_warning"] = (a0) => (__php_emit_fd_setsize_warning = Module2["__php_emit_fd_setsize_warning"] = wasmExports["Ys"])(a0);
    var _php_stream_notification_free = Module2["_php_stream_notification_free"] = (a0) => (_php_stream_notification_free = Module2["_php_stream_notification_free"] = wasmExports["Zs"])(a0);
    var _php_stream_notification_alloc = Module2["_php_stream_notification_alloc"] = () => (_php_stream_notification_alloc = Module2["_php_stream_notification_alloc"] = wasmExports["_s"])();
    var _php_stream_filter_append_ex = Module2["_php_stream_filter_append_ex"] = (a0, a1) => (_php_stream_filter_append_ex = Module2["_php_stream_filter_append_ex"] = wasmExports["$s"])(a0, a1);
    var _php_stream_filter_prepend_ex = Module2["_php_stream_filter_prepend_ex"] = (a0, a1) => (_php_stream_filter_prepend_ex = Module2["_php_stream_filter_prepend_ex"] = wasmExports["at"])(a0, a1);
    var _php_stream_filter_remove = Module2["_php_stream_filter_remove"] = (a0, a1) => (_php_stream_filter_remove = Module2["_php_stream_filter_remove"] = wasmExports["bt"])(a0, a1);
    var _php_file_le_stream_filter = Module2["_php_file_le_stream_filter"] = () => (_php_file_le_stream_filter = Module2["_php_file_le_stream_filter"] = wasmExports["ct"])();
    var __php_stream_filter_flush = Module2["__php_stream_filter_flush"] = (a0, a1) => (__php_stream_filter_flush = Module2["__php_stream_filter_flush"] = wasmExports["dt"])(a0, a1);
    var _php_stream_get_record = Module2["_php_stream_get_record"] = (a0, a1, a2, a3) => (_php_stream_get_record = Module2["_php_stream_get_record"] = wasmExports["et"])(a0, a1, a2, a3);
    var _php_stream_xport_shutdown = Module2["_php_stream_xport_shutdown"] = (a0, a1) => (_php_stream_xport_shutdown = Module2["_php_stream_xport_shutdown"] = wasmExports["ft"])(a0, a1);
    var _localeconv_r = Module2["_localeconv_r"] = (a0) => (_localeconv_r = Module2["_localeconv_r"] = wasmExports["gt"])(a0);
    var _php_explode = Module2["_php_explode"] = (a0, a1, a2, a3) => (_php_explode = Module2["_php_explode"] = wasmExports["ht"])(a0, a1, a2, a3);
    var _zend_hash_packed_grow = Module2["_zend_hash_packed_grow"] = (a0) => (_zend_hash_packed_grow = Module2["_zend_hash_packed_grow"] = wasmExports["it"])(a0);
    var _php_explode_negative_limit = Module2["_php_explode_negative_limit"] = (a0, a1, a2, a3) => (_php_explode_negative_limit = Module2["_php_explode_negative_limit"] = wasmExports["jt"])(a0, a1, a2, a3);
    var __emalloc_256 = Module2["__emalloc_256"] = () => (__emalloc_256 = Module2["__emalloc_256"] = wasmExports["kt"])();
    var _php_implode = Module2["_php_implode"] = (a0, a1, a2) => (_php_implode = Module2["_php_implode"] = wasmExports["lt"])(a0, a1, a2);
    var _zend_string_only_has_ascii_alphanumeric = Module2["_zend_string_only_has_ascii_alphanumeric"] = (a0) => (_zend_string_only_has_ascii_alphanumeric = Module2["_zend_string_only_has_ascii_alphanumeric"] = wasmExports["mt"])(a0);
    var _php_dirname = Module2["_php_dirname"] = (a0, a1) => (_php_dirname = Module2["_php_dirname"] = wasmExports["nt"])(a0, a1);
    var _php_stristr = Module2["_php_stristr"] = (a0, a1, a2, a3) => (_php_stristr = Module2["_php_stristr"] = wasmExports["ot"])(a0, a1, a2, a3);
    var _php_strspn = Module2["_php_strspn"] = (a0, a1, a2, a3) => (_php_strspn = Module2["_php_strspn"] = wasmExports["pt"])(a0, a1, a2, a3);
    var _php_strcspn = Module2["_php_strcspn"] = (a0, a1, a2, a3) => (_php_strcspn = Module2["_php_strcspn"] = wasmExports["qt"])(a0, a1, a2, a3);
    var _zend_memnrstr_ex = Module2["_zend_memnrstr_ex"] = (a0, a1, a2, a3) => (_zend_memnrstr_ex = Module2["_zend_memnrstr_ex"] = wasmExports["rt"])(a0, a1, a2, a3);
    var _add_index_str = Module2["_add_index_str"] = (a0, a1, a2) => (_add_index_str = Module2["_add_index_str"] = wasmExports["st"])(a0, a1, a2);
    var _php_str_to_str = Module2["_php_str_to_str"] = (a0, a1, a2, a3, a4, a5) => (_php_str_to_str = Module2["_php_str_to_str"] = wasmExports["tt"])(a0, a1, a2, a3, a4, a5);
    var _php_addcslashes_str = Module2["_php_addcslashes_str"] = (a0, a1, a2, a3) => (_php_addcslashes_str = Module2["_php_addcslashes_str"] = wasmExports["ut"])(a0, a1, a2, a3);
    var _php_stripcslashes = Module2["_php_stripcslashes"] = (a0) => (_php_stripcslashes = Module2["_php_stripcslashes"] = wasmExports["vt"])(a0);
    var _php_stripslashes = Module2["_php_stripslashes"] = (a0) => (_php_stripslashes = Module2["_php_stripslashes"] = wasmExports["wt"])(a0);
    var _php_addcslashes = Module2["_php_addcslashes"] = (a0, a1, a2) => (_php_addcslashes = Module2["_php_addcslashes"] = wasmExports["xt"])(a0, a1, a2);
    var _php_strip_tags_ex = Module2["_php_strip_tags_ex"] = (a0, a1, a2, a3, a4) => (_php_strip_tags_ex = Module2["_php_strip_tags_ex"] = wasmExports["yt"])(a0, a1, a2, a3, a4);
    var _zend_str_tolower_dup_ex = Module2["_zend_str_tolower_dup_ex"] = (a0, a1) => (_zend_str_tolower_dup_ex = Module2["_zend_str_tolower_dup_ex"] = wasmExports["zt"])(a0, a1);
    var __emalloc_1024 = Module2["__emalloc_1024"] = () => (__emalloc_1024 = Module2["__emalloc_1024"] = wasmExports["At"])();
    var _php_strip_tags = Module2["_php_strip_tags"] = (a0, a1, a2, a3) => (_php_strip_tags = Module2["_php_strip_tags"] = wasmExports["Bt"])(a0, a1, a2, a3);
    var _zend_binary_strncmp = Module2["_zend_binary_strncmp"] = (a0, a1, a2, a3, a4) => (_zend_binary_strncmp = Module2["_zend_binary_strncmp"] = wasmExports["Ct"])(a0, a1, a2, a3, a4);
    var _zend_binary_strncasecmp_l = Module2["_zend_binary_strncasecmp_l"] = (a0, a1, a2, a3, a4) => (_zend_binary_strncasecmp_l = Module2["_zend_binary_strncasecmp_l"] = wasmExports["Dt"])(a0, a1, a2, a3, a4);
    var _zend_zval_get_legacy_type = Module2["_zend_zval_get_legacy_type"] = (a0) => (_zend_zval_get_legacy_type = Module2["_zend_zval_get_legacy_type"] = wasmExports["Et"])(a0);
    var _zend_rsrc_list_get_rsrc_type = Module2["_zend_rsrc_list_get_rsrc_type"] = (a0) => (_zend_rsrc_list_get_rsrc_type = Module2["_zend_rsrc_list_get_rsrc_type"] = wasmExports["Ft"])(a0);
    var _convert_to_double = Module2["_convert_to_double"] = (a0) => (_convert_to_double = Module2["_convert_to_double"] = wasmExports["Gt"])(a0);
    var _convert_to_object = Module2["_convert_to_object"] = (a0) => (_convert_to_object = Module2["_convert_to_object"] = wasmExports["Ht"])(a0);
    var _convert_to_boolean = Module2["_convert_to_boolean"] = (a0) => (_convert_to_boolean = Module2["_convert_to_boolean"] = wasmExports["It"])(a0);
    var _zend_try_assign_typed_ref = Module2["_zend_try_assign_typed_ref"] = (a0, a1) => (_zend_try_assign_typed_ref = Module2["_zend_try_assign_typed_ref"] = wasmExports["Jt"])(a0, a1);
    var _zend_is_countable = Module2["_zend_is_countable"] = (a0) => (_zend_is_countable = Module2["_zend_is_countable"] = wasmExports["Kt"])(a0);
    var _php_url_scanner_adapt_single_url = Module2["_php_url_scanner_adapt_single_url"] = (a0, a1, a2, a3, a4, a5) => (_php_url_scanner_adapt_single_url = Module2["_php_url_scanner_adapt_single_url"] = wasmExports["Lt"])(a0, a1, a2, a3, a4, a5);
    var _php_url_parse_ex = Module2["_php_url_parse_ex"] = (a0, a1) => (_php_url_parse_ex = Module2["_php_url_parse_ex"] = wasmExports["Mt"])(a0, a1);
    var _php_url_scanner_add_session_var = Module2["_php_url_scanner_add_session_var"] = (a0, a1, a2, a3, a4) => (_php_url_scanner_add_session_var = Module2["_php_url_scanner_add_session_var"] = wasmExports["Nt"])(a0, a1, a2, a3, a4);
    var _php_output_start_internal = Module2["_php_output_start_internal"] = (a0, a1, a2, a3, a4) => (_php_output_start_internal = Module2["_php_output_start_internal"] = wasmExports["Ot"])(a0, a1, a2, a3, a4);
    var _php_url_scanner_add_var = Module2["_php_url_scanner_add_var"] = (a0, a1, a2, a3, a4) => (_php_url_scanner_add_var = Module2["_php_url_scanner_add_var"] = wasmExports["Pt"])(a0, a1, a2, a3, a4);
    var _php_url_scanner_reset_session_vars = Module2["_php_url_scanner_reset_session_vars"] = () => (_php_url_scanner_reset_session_vars = Module2["_php_url_scanner_reset_session_vars"] = wasmExports["Qt"])();
    var _php_url_scanner_reset_vars = Module2["_php_url_scanner_reset_vars"] = () => (_php_url_scanner_reset_vars = Module2["_php_url_scanner_reset_vars"] = wasmExports["Rt"])();
    var _php_url_scanner_reset_session_var = Module2["_php_url_scanner_reset_session_var"] = (a0, a1) => (_php_url_scanner_reset_session_var = Module2["_php_url_scanner_reset_session_var"] = wasmExports["St"])(a0, a1);
    var _php_url_scanner_reset_var = Module2["_php_url_scanner_reset_var"] = (a0, a1) => (_php_url_scanner_reset_var = Module2["_php_url_scanner_reset_var"] = wasmExports["Tt"])(a0, a1);
    var _php_url_parse_ex2 = Module2["_php_url_parse_ex2"] = (a0, a1, a2) => (_php_url_parse_ex2 = Module2["_php_url_parse_ex2"] = wasmExports["Ut"])(a0, a1, a2);
    var _zend_update_property_stringl = Module2["_zend_update_property_stringl"] = (a0, a1, a2, a3, a4, a5) => (_zend_update_property_stringl = Module2["_zend_update_property_stringl"] = wasmExports["Vt"])(a0, a1, a2, a3, a4, a5);
    var _zend_update_property_long = Module2["_zend_update_property_long"] = (a0, a1, a2, a3, a4) => (_zend_update_property_long = Module2["_zend_update_property_long"] = wasmExports["Wt"])(a0, a1, a2, a3, a4);
    var _php_stream_bucket_prepend = Module2["_php_stream_bucket_prepend"] = (a0, a1) => (_php_stream_bucket_prepend = Module2["_php_stream_bucket_prepend"] = wasmExports["Xt"])(a0, a1);
    var _php_stream_filter_register_factory_volatile = Module2["_php_stream_filter_register_factory_volatile"] = (a0, a1) => (_php_stream_filter_register_factory_volatile = Module2["_php_stream_filter_register_factory_volatile"] = wasmExports["Yt"])(a0, a1);
    var _add_property_string_ex = Module2["_add_property_string_ex"] = (a0, a1, a2, a3) => (_add_property_string_ex = Module2["_add_property_string_ex"] = wasmExports["Zt"])(a0, a1, a2, a3);
    var _add_property_zval_ex = Module2["_add_property_zval_ex"] = (a0, a1, a2, a3) => (_add_property_zval_ex = Module2["_add_property_zval_ex"] = wasmExports["_t"])(a0, a1, a2, a3);
    var _add_property_null_ex = Module2["_add_property_null_ex"] = (a0, a1, a2) => (_add_property_null_ex = Module2["_add_property_null_ex"] = wasmExports["$t"])(a0, a1, a2);
    var _zend_call_method_if_exists = Module2["_zend_call_method_if_exists"] = (a0, a1, a2, a3, a4) => (_zend_call_method_if_exists = Module2["_zend_call_method_if_exists"] = wasmExports["au"])(a0, a1, a2, a3, a4);
    var _php_uuencode = Module2["_php_uuencode"] = (a0, a1) => (_php_uuencode = Module2["_php_uuencode"] = wasmExports["bu"])(a0, a1);
    var _php_uudecode = Module2["_php_uudecode"] = (a0, a1) => (_php_uudecode = Module2["_php_uudecode"] = wasmExports["cu"])(a0, a1);
    var _var_destroy = Module2["_var_destroy"] = (a0) => (_var_destroy = Module2["_var_destroy"] = wasmExports["du"])(a0);
    var __efree_large = Module2["__efree_large"] = (a0, a1) => (__efree_large = Module2["__efree_large"] = wasmExports["eu"])(a0, a1);
    var _php_var_unserialize_get_allowed_classes = Module2["_php_var_unserialize_get_allowed_classes"] = (a0) => (_php_var_unserialize_get_allowed_classes = Module2["_php_var_unserialize_get_allowed_classes"] = wasmExports["fu"])(a0);
    var _php_var_unserialize_set_allowed_classes = Module2["_php_var_unserialize_set_allowed_classes"] = (a0, a1) => (_php_var_unserialize_set_allowed_classes = Module2["_php_var_unserialize_set_allowed_classes"] = wasmExports["gu"])(a0, a1);
    var _php_var_unserialize_set_max_depth = Module2["_php_var_unserialize_set_max_depth"] = (a0, a1) => (_php_var_unserialize_set_max_depth = Module2["_php_var_unserialize_set_max_depth"] = wasmExports["hu"])(a0, a1);
    var _php_var_unserialize_get_max_depth = Module2["_php_var_unserialize_get_max_depth"] = (a0) => (_php_var_unserialize_get_max_depth = Module2["_php_var_unserialize_get_max_depth"] = wasmExports["iu"])(a0);
    var _php_var_unserialize_set_cur_depth = Module2["_php_var_unserialize_set_cur_depth"] = (a0, a1) => (_php_var_unserialize_set_cur_depth = Module2["_php_var_unserialize_set_cur_depth"] = wasmExports["ju"])(a0, a1);
    var _php_var_unserialize_get_cur_depth = Module2["_php_var_unserialize_get_cur_depth"] = (a0) => (_php_var_unserialize_get_cur_depth = Module2["_php_var_unserialize_get_cur_depth"] = wasmExports["ku"])(a0);
    var _zend_is_valid_class_name = Module2["_zend_is_valid_class_name"] = (a0) => (_zend_is_valid_class_name = Module2["_zend_is_valid_class_name"] = wasmExports["lu"])(a0);
    var _zend_hash_lookup = Module2["_zend_hash_lookup"] = (a0, a1) => (_zend_hash_lookup = Module2["_zend_hash_lookup"] = wasmExports["mu"])(a0, a1);
    var _zend_ref_del_type_source = Module2["_zend_ref_del_type_source"] = (a0, a1) => (_zend_ref_del_type_source = Module2["_zend_ref_del_type_source"] = wasmExports["nu"])(a0, a1);
    var _zend_verify_prop_assignable_by_ref = Module2["_zend_verify_prop_assignable_by_ref"] = (a0, a1, a2) => (_zend_verify_prop_assignable_by_ref = Module2["_zend_verify_prop_assignable_by_ref"] = wasmExports["ou"])(a0, a1, a2);
    var _php_var_dump = Module2["_php_var_dump"] = (a0, a1) => (_php_var_dump = Module2["_php_var_dump"] = wasmExports["pu"])(a0, a1);
    var _php_printf = Module2["_php_printf"] = (a0, a1) => (_php_printf = Module2["_php_printf"] = wasmExports["qu"])(a0, a1);
    var _php_printf_unchecked = Module2["_php_printf_unchecked"] = (a0, a1) => (_php_printf_unchecked = Module2["_php_printf_unchecked"] = wasmExports["ru"])(a0, a1);
    var _zend_array_count = Module2["_zend_array_count"] = (a0) => (_zend_array_count = Module2["_zend_array_count"] = wasmExports["su"])(a0);
    var _php_debug_zval_dump = Module2["_php_debug_zval_dump"] = (a0, a1) => (_php_debug_zval_dump = Module2["_php_debug_zval_dump"] = wasmExports["tu"])(a0, a1);
    var _php_var_export_ex = Module2["_php_var_export_ex"] = (a0, a1, a2) => (_php_var_export_ex = Module2["_php_var_export_ex"] = wasmExports["uu"])(a0, a1, a2);
    var _smart_str_append_double = Module2["_smart_str_append_double"] = (a0, a1, a2, a3) => (_smart_str_append_double = Module2["_smart_str_append_double"] = wasmExports["vu"])(a0, a1, a2, a3);
    var _php_var_export = Module2["_php_var_export"] = (a0, a1) => (_php_var_export = Module2["_php_var_export"] = wasmExports["wu"])(a0, a1);
    var _php_unserialize_with_options = Module2["_php_unserialize_with_options"] = (a0, a1, a2, a3, a4) => (_php_unserialize_with_options = Module2["_php_unserialize_with_options"] = wasmExports["xu"])(a0, a1, a2, a3, a4);
    var _zend_memory_usage = Module2["_zend_memory_usage"] = (a0) => (_zend_memory_usage = Module2["_zend_memory_usage"] = wasmExports["yu"])(a0);
    var _zend_memory_peak_usage = Module2["_zend_memory_peak_usage"] = (a0) => (_zend_memory_peak_usage = Module2["_zend_memory_peak_usage"] = wasmExports["zu"])(a0);
    var _zend_memory_reset_peak_usage = Module2["_zend_memory_reset_peak_usage"] = () => (_zend_memory_reset_peak_usage = Module2["_zend_memory_reset_peak_usage"] = wasmExports["Au"])();
    var _php_canonicalize_version = Module2["_php_canonicalize_version"] = (a0) => (_php_canonicalize_version = Module2["_php_canonicalize_version"] = wasmExports["Bu"])(a0);
    var _OnUpdateBaseDir = Module2["_OnUpdateBaseDir"] = (a0, a1, a2, a3, a4, a5) => (_OnUpdateBaseDir = Module2["_OnUpdateBaseDir"] = wasmExports["Cu"])(a0, a1, a2, a3, a4, a5);
    var _php_check_specific_open_basedir = Module2["_php_check_specific_open_basedir"] = (a0, a1) => (_php_check_specific_open_basedir = Module2["_php_check_specific_open_basedir"] = wasmExports["Du"])(a0, a1);
    var _php_fopen_primary_script = Module2["_php_fopen_primary_script"] = (a0) => (_php_fopen_primary_script = Module2["_php_fopen_primary_script"] = wasmExports["Eu"])(a0);
    var _zend_stream_open = Module2["_zend_stream_open"] = (a0) => (_zend_stream_open = Module2["_zend_stream_open"] = wasmExports["Fu"])(a0);
    var _php_resolve_path = Module2["_php_resolve_path"] = (a0, a1, a2) => (_php_resolve_path = Module2["_php_resolve_path"] = wasmExports["Gu"])(a0, a1, a2);
    var _zend_is_executing = Module2["_zend_is_executing"] = () => (_zend_is_executing = Module2["_zend_is_executing"] = wasmExports["Hu"])();
    var _php_fopen_with_path = Module2["_php_fopen_with_path"] = (a0, a1, a2, a3) => (_php_fopen_with_path = Module2["_php_fopen_with_path"] = wasmExports["Iu"])(a0, a1, a2, a3);
    var _php_strip_url_passwd = Module2["_php_strip_url_passwd"] = (a0) => (_php_strip_url_passwd = Module2["_php_strip_url_passwd"] = wasmExports["Ju"])(a0);
    var _virtual_file_ex = Module2["_virtual_file_ex"] = (a0, a1, a2, a3) => (_virtual_file_ex = Module2["_virtual_file_ex"] = wasmExports["Ku"])(a0, a1, a2, a3);
    var _php_version = Module2["_php_version"] = () => (_php_version = Module2["_php_version"] = wasmExports["Lu"])();
    var _php_version_id = Module2["_php_version_id"] = () => (_php_version_id = Module2["_php_version_id"] = wasmExports["Mu"])();
    var _php_get_version = Module2["_php_get_version"] = (a0) => (_php_get_version = Module2["_php_get_version"] = wasmExports["Nu"])(a0);
    var _php_print_version = Module2["_php_print_version"] = (a0) => (_php_print_version = Module2["_php_print_version"] = wasmExports["Ou"])(a0);
    var _php_get_internal_encoding = Module2["_php_get_internal_encoding"] = () => (_php_get_internal_encoding = Module2["_php_get_internal_encoding"] = wasmExports["Pu"])();
    var _php_get_input_encoding = Module2["_php_get_input_encoding"] = () => (_php_get_input_encoding = Module2["_php_get_input_encoding"] = wasmExports["Qu"])();
    var _php_get_output_encoding = Module2["_php_get_output_encoding"] = () => (_php_get_output_encoding = Module2["_php_get_output_encoding"] = wasmExports["Ru"])();
    var _php_during_module_startup = Module2["_php_during_module_startup"] = () => (_php_during_module_startup = Module2["_php_during_module_startup"] = wasmExports["Su"])();
    var _php_during_module_shutdown = Module2["_php_during_module_shutdown"] = () => (_php_during_module_shutdown = Module2["_php_during_module_shutdown"] = wasmExports["Tu"])();
    var _php_get_module_initialized = Module2["_php_get_module_initialized"] = () => (_php_get_module_initialized = Module2["_php_get_module_initialized"] = wasmExports["Uu"])();
    var _php_write = Module2["_php_write"] = (a0, a1) => (_php_write = Module2["_php_write"] = wasmExports["Vu"])(a0, a1);
    var _php_verror = Module2["_php_verror"] = (a0, a1, a2, a3, a4) => (_php_verror = Module2["_php_verror"] = wasmExports["Wu"])(a0, a1, a2, a3, a4);
    var _zend_vstrpprintf = Module2["_zend_vstrpprintf"] = (a0, a1, a2) => (_zend_vstrpprintf = Module2["_zend_vstrpprintf"] = wasmExports["Xu"])(a0, a1, a2);
    var _get_active_class_name = Module2["_get_active_class_name"] = (a0) => (_get_active_class_name = Module2["_get_active_class_name"] = wasmExports["Yu"])(a0);
    var _zend_strpprintf_unchecked = Module2["_zend_strpprintf_unchecked"] = (a0, a1, a2) => (_zend_strpprintf_unchecked = Module2["_zend_strpprintf_unchecked"] = wasmExports["Zu"])(a0, a1, a2);
    var _zend_error_zstr = Module2["_zend_error_zstr"] = (a0, a1) => (_zend_error_zstr = Module2["_zend_error_zstr"] = wasmExports["_u"])(a0, a1);
    var _php_error_docref1 = Module2["_php_error_docref1"] = (a0, a1, a2, a3, a4) => (_php_error_docref1 = Module2["_php_error_docref1"] = wasmExports["$u"])(a0, a1, a2, a3, a4);
    var _php_html_puts = Module2["_php_html_puts"] = (a0, a1) => (_php_html_puts = Module2["_php_html_puts"] = wasmExports["av"])(a0, a1);
    var _zend_alter_ini_entry_chars_ex = Module2["_zend_alter_ini_entry_chars_ex"] = (a0, a1, a2, a3, a4, a5) => (_zend_alter_ini_entry_chars_ex = Module2["_zend_alter_ini_entry_chars_ex"] = wasmExports["bv"])(a0, a1, a2, a3, a4, a5);
    var _php_request_startup = Module2["_php_request_startup"] = () => (_php_request_startup = Module2["_php_request_startup"] = wasmExports["cv"])();
    var _zend_interned_strings_activate = Module2["_zend_interned_strings_activate"] = () => (_zend_interned_strings_activate = Module2["_zend_interned_strings_activate"] = wasmExports["dv"])();
    var _php_output_activate = Module2["_php_output_activate"] = () => (_php_output_activate = Module2["_php_output_activate"] = wasmExports["ev"])();
    var _zend_activate = Module2["_zend_activate"] = () => (_zend_activate = Module2["_zend_activate"] = wasmExports["fv"])();
    var _sapi_activate = Module2["_sapi_activate"] = () => (_sapi_activate = Module2["_sapi_activate"] = wasmExports["gv"])();
    var _zend_set_timeout = Module2["_zend_set_timeout"] = (a0, a1) => (_zend_set_timeout = Module2["_zend_set_timeout"] = wasmExports["hv"])(a0, a1);
    var _sapi_add_header_ex = Module2["_sapi_add_header_ex"] = (a0, a1, a2, a3) => (_sapi_add_header_ex = Module2["_sapi_add_header_ex"] = wasmExports["iv"])(a0, a1, a2, a3);
    var _php_output_start_user = Module2["_php_output_start_user"] = (a0, a1, a2) => (_php_output_start_user = Module2["_php_output_start_user"] = wasmExports["jv"])(a0, a1, a2);
    var _php_output_set_implicit_flush = Module2["_php_output_set_implicit_flush"] = (a0) => (_php_output_set_implicit_flush = Module2["_php_output_set_implicit_flush"] = wasmExports["kv"])(a0);
    var _php_hash_environment = Module2["_php_hash_environment"] = () => (_php_hash_environment = Module2["_php_hash_environment"] = wasmExports["lv"])();
    var _zend_activate_modules = Module2["_zend_activate_modules"] = () => (_zend_activate_modules = Module2["_zend_activate_modules"] = wasmExports["mv"])();
    var _php_request_shutdown = Module2["_php_request_shutdown"] = (a0) => (_php_request_shutdown = Module2["_php_request_shutdown"] = wasmExports["nv"])(a0);
    var _zend_observer_fcall_end_all = Module2["_zend_observer_fcall_end_all"] = () => (_zend_observer_fcall_end_all = Module2["_zend_observer_fcall_end_all"] = wasmExports["ov"])();
    var _zend_call_destructors = Module2["_zend_call_destructors"] = () => (_zend_call_destructors = Module2["_zend_call_destructors"] = wasmExports["pv"])();
    var _php_output_end_all = Module2["_php_output_end_all"] = () => (_php_output_end_all = Module2["_php_output_end_all"] = wasmExports["qv"])();
    var _zend_unset_timeout = Module2["_zend_unset_timeout"] = () => (_zend_unset_timeout = Module2["_zend_unset_timeout"] = wasmExports["rv"])();
    var _zend_deactivate_modules = Module2["_zend_deactivate_modules"] = () => (_zend_deactivate_modules = Module2["_zend_deactivate_modules"] = wasmExports["sv"])();
    var _php_output_deactivate = Module2["_php_output_deactivate"] = () => (_php_output_deactivate = Module2["_php_output_deactivate"] = wasmExports["tv"])();
    var _zend_post_deactivate_modules = Module2["_zend_post_deactivate_modules"] = () => (_zend_post_deactivate_modules = Module2["_zend_post_deactivate_modules"] = wasmExports["uv"])();
    var _sapi_deactivate_module = Module2["_sapi_deactivate_module"] = () => (_sapi_deactivate_module = Module2["_sapi_deactivate_module"] = wasmExports["vv"])();
    var _sapi_deactivate_destroy = Module2["_sapi_deactivate_destroy"] = () => (_sapi_deactivate_destroy = Module2["_sapi_deactivate_destroy"] = wasmExports["wv"])();
    var _virtual_cwd_deactivate = Module2["_virtual_cwd_deactivate"] = () => (_virtual_cwd_deactivate = Module2["_virtual_cwd_deactivate"] = wasmExports["xv"])();
    var _zend_interned_strings_deactivate = Module2["_zend_interned_strings_deactivate"] = () => (_zend_interned_strings_deactivate = Module2["_zend_interned_strings_deactivate"] = wasmExports["yv"])();
    var _shutdown_memory_manager = Module2["_shutdown_memory_manager"] = (a0, a1) => (_shutdown_memory_manager = Module2["_shutdown_memory_manager"] = wasmExports["zv"])(a0, a1);
    var _zend_set_memory_limit = Module2["_zend_set_memory_limit"] = (a0) => (_zend_set_memory_limit = Module2["_zend_set_memory_limit"] = wasmExports["Av"])(a0);
    var _zend_deactivate = Module2["_zend_deactivate"] = () => (_zend_deactivate = Module2["_zend_deactivate"] = wasmExports["Bv"])();
    var _php_com_initialize = Module2["_php_com_initialize"] = () => (_php_com_initialize = Module2["_php_com_initialize"] = wasmExports["Cv"])();
    var _php_register_extensions = Module2["_php_register_extensions"] = (a0, a1) => (_php_register_extensions = Module2["_php_register_extensions"] = wasmExports["Dv"])(a0, a1);
    var _zend_register_internal_module = Module2["_zend_register_internal_module"] = (a0) => (_zend_register_internal_module = Module2["_zend_register_internal_module"] = wasmExports["Ev"])(a0);
    var _php_module_startup = Module2["_php_module_startup"] = (a0, a1) => (_php_module_startup = Module2["_php_module_startup"] = wasmExports["Fv"])(a0, a1);
    var _sapi_initialize_empty_request = Module2["_sapi_initialize_empty_request"] = () => (_sapi_initialize_empty_request = Module2["_sapi_initialize_empty_request"] = wasmExports["Gv"])();
    var _php_output_startup = Module2["_php_output_startup"] = () => (_php_output_startup = Module2["_php_output_startup"] = wasmExports["Hv"])();
    var _zend_observer_startup = Module2["_zend_observer_startup"] = () => (_zend_observer_startup = Module2["_zend_observer_startup"] = wasmExports["Iv"])();
    var _php_printf_to_smart_str = Module2["_php_printf_to_smart_str"] = (a0, a1, a2) => (_php_printf_to_smart_str = Module2["_php_printf_to_smart_str"] = wasmExports["Jv"])(a0, a1, a2);
    var _php_printf_to_smart_string = Module2["_php_printf_to_smart_string"] = (a0, a1, a2) => (_php_printf_to_smart_string = Module2["_php_printf_to_smart_string"] = wasmExports["Kv"])(a0, a1, a2);
    var _zend_startup_modules = Module2["_zend_startup_modules"] = () => (_zend_startup_modules = Module2["_zend_startup_modules"] = wasmExports["Lv"])();
    var _zend_collect_module_handlers = Module2["_zend_collect_module_handlers"] = () => (_zend_collect_module_handlers = Module2["_zend_collect_module_handlers"] = wasmExports["Mv"])();
    var _zend_register_functions = Module2["_zend_register_functions"] = (a0, a1, a2, a3) => (_zend_register_functions = Module2["_zend_register_functions"] = wasmExports["Nv"])(a0, a1, a2, a3);
    var _zend_disable_functions = Module2["_zend_disable_functions"] = (a0) => (_zend_disable_functions = Module2["_zend_disable_functions"] = wasmExports["Ov"])(a0);
    var _zend_disable_class = Module2["_zend_disable_class"] = (a0, a1) => (_zend_disable_class = Module2["_zend_disable_class"] = wasmExports["Pv"])(a0, a1);
    var _zend_observer_post_startup = Module2["_zend_observer_post_startup"] = () => (_zend_observer_post_startup = Module2["_zend_observer_post_startup"] = wasmExports["Qv"])();
    var _zend_init_internal_run_time_cache = Module2["_zend_init_internal_run_time_cache"] = () => (_zend_init_internal_run_time_cache = Module2["_zend_init_internal_run_time_cache"] = wasmExports["Rv"])();
    var _cfg_get_long = Module2["_cfg_get_long"] = (a0, a1) => (_cfg_get_long = Module2["_cfg_get_long"] = wasmExports["Sv"])(a0, a1);
    var _sapi_deactivate = Module2["_sapi_deactivate"] = () => (_sapi_deactivate = Module2["_sapi_deactivate"] = wasmExports["Tv"])();
    var _virtual_cwd_activate = Module2["_virtual_cwd_activate"] = () => (_virtual_cwd_activate = Module2["_virtual_cwd_activate"] = wasmExports["Uv"])();
    var _zend_interned_strings_switch_storage = Module2["_zend_interned_strings_switch_storage"] = (a0) => (_zend_interned_strings_switch_storage = Module2["_zend_interned_strings_switch_storage"] = wasmExports["Vv"])(a0);
    var _zend_throw_error_exception = Module2["_zend_throw_error_exception"] = (a0, a1, a2, a3) => (_zend_throw_error_exception = Module2["_zend_throw_error_exception"] = wasmExports["Wv"])(a0, a1, a2, a3);
    var _zend_alloc_in_memory_limit_error_reporting = Module2["_zend_alloc_in_memory_limit_error_reporting"] = () => (_zend_alloc_in_memory_limit_error_reporting = Module2["_zend_alloc_in_memory_limit_error_reporting"] = wasmExports["Xv"])();
    var _php_output_discard_all = Module2["_php_output_discard_all"] = () => (_php_output_discard_all = Module2["_php_output_discard_all"] = wasmExports["Yv"])();
    var _zend_objects_store_mark_destructed = Module2["_zend_objects_store_mark_destructed"] = (a0) => (_zend_objects_store_mark_destructed = Module2["_zend_objects_store_mark_destructed"] = wasmExports["Zv"])(a0);
    var __zend_bailout = Module2["__zend_bailout"] = (a0, a1) => (__zend_bailout = Module2["__zend_bailout"] = wasmExports["_v"])(a0, a1);
    var __php_stream_open_wrapper_as_file = Module2["__php_stream_open_wrapper_as_file"] = (a0, a1, a2, a3) => (__php_stream_open_wrapper_as_file = Module2["__php_stream_open_wrapper_as_file"] = wasmExports["$v"])(a0, a1, a2, a3);
    var _php_module_shutdown_wrapper = Module2["_php_module_shutdown_wrapper"] = (a0) => (_php_module_shutdown_wrapper = Module2["_php_module_shutdown_wrapper"] = wasmExports["aw"])(a0);
    var _php_module_shutdown = Module2["_php_module_shutdown"] = () => (_php_module_shutdown = Module2["_php_module_shutdown"] = wasmExports["bw"])();
    var _zend_ini_shutdown = Module2["_zend_ini_shutdown"] = () => (_zend_ini_shutdown = Module2["_zend_ini_shutdown"] = wasmExports["cw"])();
    var _php_output_shutdown = Module2["_php_output_shutdown"] = () => (_php_output_shutdown = Module2["_php_output_shutdown"] = wasmExports["dw"])();
    var _zend_interned_strings_dtor = Module2["_zend_interned_strings_dtor"] = () => (_zend_interned_strings_dtor = Module2["_zend_interned_strings_dtor"] = wasmExports["ew"])();
    var _zend_observer_shutdown = Module2["_zend_observer_shutdown"] = () => (_zend_observer_shutdown = Module2["_zend_observer_shutdown"] = wasmExports["fw"])();
    var _php_execute_script_ex = Module2["_php_execute_script_ex"] = (a0, a1) => (_php_execute_script_ex = Module2["_php_execute_script_ex"] = wasmExports["gw"])(a0, a1);
    var _virtual_chdir_file = Module2["_virtual_chdir_file"] = (a0, a1) => (_virtual_chdir_file = Module2["_virtual_chdir_file"] = wasmExports["hw"])(a0, a1);
    var _zend_stream_init_filename = Module2["_zend_stream_init_filename"] = (a0, a1) => (_zend_stream_init_filename = Module2["_zend_stream_init_filename"] = wasmExports["iw"])(a0, a1);
    var _zend_ini_long = Module2["_zend_ini_long"] = (a0, a1, a2) => (_zend_ini_long = Module2["_zend_ini_long"] = wasmExports["jw"])(a0, a1, a2);
    var _zend_execute_script = Module2["_zend_execute_script"] = (a0, a1, a2) => (_zend_execute_script = Module2["_zend_execute_script"] = wasmExports["kw"])(a0, a1, a2);
    var _php_execute_script = Module2["_php_execute_script"] = (a0) => (_php_execute_script = Module2["_php_execute_script"] = wasmExports["lw"])(a0);
    var _php_execute_simple_script = Module2["_php_execute_simple_script"] = (a0, a1) => (_php_execute_simple_script = Module2["_php_execute_simple_script"] = wasmExports["mw"])(a0, a1);
    var _zend_execute_scripts = Module2["_zend_execute_scripts"] = (a0, a1, a2, a3) => (_zend_execute_scripts = Module2["_zend_execute_scripts"] = wasmExports["nw"])(a0, a1, a2, a3);
    var _php_handle_aborted_connection = Module2["_php_handle_aborted_connection"] = () => (_php_handle_aborted_connection = Module2["_php_handle_aborted_connection"] = wasmExports["ow"])();
    var _php_output_set_status = Module2["_php_output_set_status"] = (a0) => (_php_output_set_status = Module2["_php_output_set_status"] = wasmExports["pw"])(a0);
    var _php_handle_auth_data = Module2["_php_handle_auth_data"] = (a0) => (_php_handle_auth_data = Module2["_php_handle_auth_data"] = wasmExports["qw"])(a0);
    var _zend_binary_strncasecmp = Module2["_zend_binary_strncasecmp"] = (a0, a1, a2, a3, a4) => (_zend_binary_strncasecmp = Module2["_zend_binary_strncasecmp"] = wasmExports["rw"])(a0, a1, a2, a3, a4);
    var _php_lint_script = Module2["_php_lint_script"] = (a0) => (_php_lint_script = Module2["_php_lint_script"] = wasmExports["sw"])(a0);
    var _zend_ini_parse_uquantity_warn = Module2["_zend_ini_parse_uquantity_warn"] = (a0, a1) => (_zend_ini_parse_uquantity_warn = Module2["_zend_ini_parse_uquantity_warn"] = wasmExports["tw"])(a0, a1);
    var _php_register_internal_extensions = Module2["_php_register_internal_extensions"] = () => (_php_register_internal_extensions = Module2["_php_register_internal_extensions"] = wasmExports["uw"])();
    var _zend_ini_color_displayer_cb = Module2["_zend_ini_color_displayer_cb"] = (a0, a1) => (_zend_ini_color_displayer_cb = Module2["_zend_ini_color_displayer_cb"] = wasmExports["vw"])(a0, a1);
    var _OnUpdateStringUnempty = Module2["_OnUpdateStringUnempty"] = (a0, a1, a2, a3, a4, a5) => (_OnUpdateStringUnempty = Module2["_OnUpdateStringUnempty"] = wasmExports["ww"])(a0, a1, a2, a3, a4, a5);
    var _OnUpdateLongGEZero = Module2["_OnUpdateLongGEZero"] = (a0, a1, a2, a3, a4, a5) => (_OnUpdateLongGEZero = Module2["_OnUpdateLongGEZero"] = wasmExports["xw"])(a0, a1, a2, a3, a4, a5);
    var _php_network_freeaddresses = Module2["_php_network_freeaddresses"] = (a0) => (_php_network_freeaddresses = Module2["_php_network_freeaddresses"] = wasmExports["yw"])(a0);
    var _php_network_getaddresses = Module2["_php_network_getaddresses"] = (a0, a1, a2, a3) => (_php_network_getaddresses = Module2["_php_network_getaddresses"] = wasmExports["zw"])(a0, a1, a2, a3);
    var _php_network_gethostbyname = Module2["_php_network_gethostbyname"] = (a0) => (_php_network_gethostbyname = Module2["_php_network_gethostbyname"] = wasmExports["Aw"])(a0);
    var _php_network_connect_socket = Module2["_php_network_connect_socket"] = (a0, a1, a2, a3, a4, a5, a6) => (_php_network_connect_socket = Module2["_php_network_connect_socket"] = wasmExports["Bw"])(a0, a1, a2, a3, a4, a5, a6);
    var _php_network_bind_socket_to_local_addr = Module2["_php_network_bind_socket_to_local_addr"] = (a0, a1, a2, a3, a4, a5) => (_php_network_bind_socket_to_local_addr = Module2["_php_network_bind_socket_to_local_addr"] = wasmExports["Cw"])(a0, a1, a2, a3, a4, a5);
    var _php_network_populate_name_from_sockaddr = Module2["_php_network_populate_name_from_sockaddr"] = (a0, a1, a2, a3, a4) => (_php_network_populate_name_from_sockaddr = Module2["_php_network_populate_name_from_sockaddr"] = wasmExports["Dw"])(a0, a1, a2, a3, a4);
    var _php_network_get_peer_name = Module2["_php_network_get_peer_name"] = (a0, a1, a2, a3) => (_php_network_get_peer_name = Module2["_php_network_get_peer_name"] = wasmExports["Ew"])(a0, a1, a2, a3);
    var _php_network_get_sock_name = Module2["_php_network_get_sock_name"] = (a0, a1, a2, a3) => (_php_network_get_sock_name = Module2["_php_network_get_sock_name"] = wasmExports["Fw"])(a0, a1, a2, a3);
    var _php_network_accept_incoming = Module2["_php_network_accept_incoming"] = (a0, a1, a2, a3, a4, a5, a6, a7) => (_php_network_accept_incoming = Module2["_php_network_accept_incoming"] = wasmExports["Gw"])(a0, a1, a2, a3, a4, a5, a6, a7);
    var _php_network_connect_socket_to_host = Module2["_php_network_connect_socket_to_host"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) => (_php_network_connect_socket_to_host = Module2["_php_network_connect_socket_to_host"] = wasmExports["Hw"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
    var _php_any_addr = Module2["_php_any_addr"] = (a0, a1, a2) => (_php_any_addr = Module2["_php_any_addr"] = wasmExports["Iw"])(a0, a1, a2);
    var _php_sockaddr_size = Module2["_php_sockaddr_size"] = (a0) => (_php_sockaddr_size = Module2["_php_sockaddr_size"] = wasmExports["Jw"])(a0);
    var _php_set_sock_blocking = Module2["_php_set_sock_blocking"] = (a0, a1) => (_php_set_sock_blocking = Module2["_php_set_sock_blocking"] = wasmExports["Kw"])(a0, a1);
    var _zend_stack_init = Module2["_zend_stack_init"] = (a0, a1) => (_zend_stack_init = Module2["_zend_stack_init"] = wasmExports["Lw"])(a0, a1);
    var _zend_stack_top = Module2["_zend_stack_top"] = (a0) => (_zend_stack_top = Module2["_zend_stack_top"] = wasmExports["Mw"])(a0);
    var _php_output_handler_dtor = Module2["_php_output_handler_dtor"] = (a0) => (_php_output_handler_dtor = Module2["_php_output_handler_dtor"] = wasmExports["Nw"])(a0);
    var _zend_stack_del_top = Module2["_zend_stack_del_top"] = (a0) => (_zend_stack_del_top = Module2["_zend_stack_del_top"] = wasmExports["Ow"])(a0);
    var _zend_stack_destroy = Module2["_zend_stack_destroy"] = (a0) => (_zend_stack_destroy = Module2["_zend_stack_destroy"] = wasmExports["Pw"])(a0);
    var _zend_is_compiling = Module2["_zend_is_compiling"] = () => (_zend_is_compiling = Module2["_zend_is_compiling"] = wasmExports["Qw"])();
    var _zend_get_compiled_filename = Module2["_zend_get_compiled_filename"] = () => (_zend_get_compiled_filename = Module2["_zend_get_compiled_filename"] = wasmExports["Rw"])();
    var _zend_get_compiled_lineno = Module2["_zend_get_compiled_lineno"] = () => (_zend_get_compiled_lineno = Module2["_zend_get_compiled_lineno"] = wasmExports["Sw"])();
    var _php_output_handler_free = Module2["_php_output_handler_free"] = (a0) => (_php_output_handler_free = Module2["_php_output_handler_free"] = wasmExports["Tw"])(a0);
    var _php_output_get_status = Module2["_php_output_get_status"] = () => (_php_output_get_status = Module2["_php_output_get_status"] = wasmExports["Uw"])();
    var _php_output_write_unbuffered = Module2["_php_output_write_unbuffered"] = (a0, a1) => (_php_output_write_unbuffered = Module2["_php_output_write_unbuffered"] = wasmExports["Vw"])(a0, a1);
    var _zend_stack_count = Module2["_zend_stack_count"] = (a0) => (_zend_stack_count = Module2["_zend_stack_count"] = wasmExports["Ww"])(a0);
    var _zend_stack_apply_with_argument = Module2["_zend_stack_apply_with_argument"] = (a0, a1, a2, a3) => (_zend_stack_apply_with_argument = Module2["_zend_stack_apply_with_argument"] = wasmExports["Xw"])(a0, a1, a2, a3);
    var _php_output_flush = Module2["_php_output_flush"] = () => (_php_output_flush = Module2["_php_output_flush"] = wasmExports["Yw"])();
    var _zend_stack_push = Module2["_zend_stack_push"] = (a0, a1) => (_zend_stack_push = Module2["_zend_stack_push"] = wasmExports["Zw"])(a0, a1);
    var _php_output_flush_all = Module2["_php_output_flush_all"] = () => (_php_output_flush_all = Module2["_php_output_flush_all"] = wasmExports["_w"])();
    var _php_output_clean = Module2["_php_output_clean"] = () => (_php_output_clean = Module2["_php_output_clean"] = wasmExports["$w"])();
    var _php_output_clean_all = Module2["_php_output_clean_all"] = () => (_php_output_clean_all = Module2["_php_output_clean_all"] = wasmExports["ax"])();
    var _php_output_get_length = Module2["_php_output_get_length"] = (a0) => (_php_output_get_length = Module2["_php_output_get_length"] = wasmExports["bx"])(a0);
    var _php_output_get_active_handler = Module2["_php_output_get_active_handler"] = () => (_php_output_get_active_handler = Module2["_php_output_get_active_handler"] = wasmExports["cx"])();
    var _php_output_handler_start = Module2["_php_output_handler_start"] = (a0) => (_php_output_handler_start = Module2["_php_output_handler_start"] = wasmExports["dx"])(a0);
    var _php_output_handler_create_internal = Module2["_php_output_handler_create_internal"] = (a0, a1, a2, a3, a4) => (_php_output_handler_create_internal = Module2["_php_output_handler_create_internal"] = wasmExports["ex"])(a0, a1, a2, a3, a4);
    var _php_output_start_devnull = Module2["_php_output_start_devnull"] = () => (_php_output_start_devnull = Module2["_php_output_start_devnull"] = wasmExports["fx"])();
    var _php_output_handler_create_user = Module2["_php_output_handler_create_user"] = (a0, a1, a2) => (_php_output_handler_create_user = Module2["_php_output_handler_create_user"] = wasmExports["gx"])(a0, a1, a2);
    var _php_output_handler_set_context = Module2["_php_output_handler_set_context"] = (a0, a1, a2) => (_php_output_handler_set_context = Module2["_php_output_handler_set_context"] = wasmExports["hx"])(a0, a1, a2);
    var _php_output_handler_alias = Module2["_php_output_handler_alias"] = (a0, a1) => (_php_output_handler_alias = Module2["_php_output_handler_alias"] = wasmExports["ix"])(a0, a1);
    var _php_output_handler_started = Module2["_php_output_handler_started"] = (a0, a1) => (_php_output_handler_started = Module2["_php_output_handler_started"] = wasmExports["jx"])(a0, a1);
    var _zend_stack_base = Module2["_zend_stack_base"] = (a0) => (_zend_stack_base = Module2["_zend_stack_base"] = wasmExports["kx"])(a0);
    var _php_output_handler_conflict = Module2["_php_output_handler_conflict"] = (a0, a1, a2, a3) => (_php_output_handler_conflict = Module2["_php_output_handler_conflict"] = wasmExports["lx"])(a0, a1, a2, a3);
    var _php_output_handler_conflict_register = Module2["_php_output_handler_conflict_register"] = (a0, a1, a2) => (_php_output_handler_conflict_register = Module2["_php_output_handler_conflict_register"] = wasmExports["mx"])(a0, a1, a2);
    var _php_output_handler_reverse_conflict_register = Module2["_php_output_handler_reverse_conflict_register"] = (a0, a1, a2) => (_php_output_handler_reverse_conflict_register = Module2["_php_output_handler_reverse_conflict_register"] = wasmExports["nx"])(a0, a1, a2);
    var _php_output_handler_alias_register = Module2["_php_output_handler_alias_register"] = (a0, a1, a2) => (_php_output_handler_alias_register = Module2["_php_output_handler_alias_register"] = wasmExports["ox"])(a0, a1, a2);
    var _php_output_handler_hook = Module2["_php_output_handler_hook"] = (a0, a1) => (_php_output_handler_hook = Module2["_php_output_handler_hook"] = wasmExports["px"])(a0, a1);
    var _php_default_post_reader = Module2["_php_default_post_reader"] = () => (_php_default_post_reader = Module2["_php_default_post_reader"] = wasmExports["qx"])();
    var _sapi_read_standard_form_data = Module2["_sapi_read_standard_form_data"] = () => (_sapi_read_standard_form_data = Module2["_sapi_read_standard_form_data"] = wasmExports["rx"])();
    var _sapi_register_default_post_reader = Module2["_sapi_register_default_post_reader"] = (a0) => (_sapi_register_default_post_reader = Module2["_sapi_register_default_post_reader"] = wasmExports["sx"])(a0);
    var _php_default_treat_data = Module2["_php_default_treat_data"] = (a0, a1, a2) => (_php_default_treat_data = Module2["_php_default_treat_data"] = wasmExports["tx"])(a0, a1, a2);
    var _sapi_register_treat_data = Module2["_sapi_register_treat_data"] = (a0) => (_sapi_register_treat_data = Module2["_sapi_register_treat_data"] = wasmExports["ux"])(a0);
    var _php_default_input_filter = Module2["_php_default_input_filter"] = (a0, a1, a2, a3, a4) => (_php_default_input_filter = Module2["_php_default_input_filter"] = wasmExports["vx"])(a0, a1, a2, a3, a4);
    var _sapi_register_input_filter = Module2["_sapi_register_input_filter"] = (a0, a1) => (_sapi_register_input_filter = Module2["_sapi_register_input_filter"] = wasmExports["wx"])(a0, a1);
    var _sapi_register_post_entries = Module2["_sapi_register_post_entries"] = (a0) => (_sapi_register_post_entries = Module2["_sapi_register_post_entries"] = wasmExports["xx"])(a0);
    var _php_std_post_handler = Module2["_php_std_post_handler"] = (a0, a1) => (_php_std_post_handler = Module2["_php_std_post_handler"] = wasmExports["yx"])(a0, a1);
    var _rfc1867_post_handler = Module2["_rfc1867_post_handler"] = (a0, a1) => (_rfc1867_post_handler = Module2["_rfc1867_post_handler"] = wasmExports["zx"])(a0, a1);
    var _php_ini_builder_prepend = Module2["_php_ini_builder_prepend"] = (a0, a1, a2) => (_php_ini_builder_prepend = Module2["_php_ini_builder_prepend"] = wasmExports["Ax"])(a0, a1, a2);
    var _php_ini_builder_unquoted = Module2["_php_ini_builder_unquoted"] = (a0, a1, a2, a3, a4) => (_php_ini_builder_unquoted = Module2["_php_ini_builder_unquoted"] = wasmExports["Bx"])(a0, a1, a2, a3, a4);
    var _php_ini_builder_quoted = Module2["_php_ini_builder_quoted"] = (a0, a1, a2, a3, a4) => (_php_ini_builder_quoted = Module2["_php_ini_builder_quoted"] = wasmExports["Cx"])(a0, a1, a2, a3, a4);
    var _php_ini_builder_define = Module2["_php_ini_builder_define"] = (a0, a1) => (_php_ini_builder_define = Module2["_php_ini_builder_define"] = wasmExports["Dx"])(a0, a1);
    var _config_zval_dtor = Module2["_config_zval_dtor"] = (a0) => (_config_zval_dtor = Module2["_config_zval_dtor"] = wasmExports["Ex"])(a0);
    var _free_estring = Module2["_free_estring"] = (a0) => (_free_estring = Module2["_free_estring"] = wasmExports["Fx"])(a0);
    var _zend_load_extension = Module2["_zend_load_extension"] = (a0) => (_zend_load_extension = Module2["_zend_load_extension"] = wasmExports["Gx"])(a0);
    var _zend_load_extension_handle = Module2["_zend_load_extension_handle"] = (a0, a1) => (_zend_load_extension_handle = Module2["_zend_load_extension_handle"] = wasmExports["Hx"])(a0, a1);
    var _php_parse_user_ini_file = Module2["_php_parse_user_ini_file"] = (a0, a1, a2) => (_php_parse_user_ini_file = Module2["_php_parse_user_ini_file"] = wasmExports["Ix"])(a0, a1, a2);
    var _php_ini_activate_config = Module2["_php_ini_activate_config"] = (a0, a1, a2) => (_php_ini_activate_config = Module2["_php_ini_activate_config"] = wasmExports["Jx"])(a0, a1, a2);
    var _php_ini_has_per_dir_config = Module2["_php_ini_has_per_dir_config"] = () => (_php_ini_has_per_dir_config = Module2["_php_ini_has_per_dir_config"] = wasmExports["Kx"])();
    var _php_ini_activate_per_dir_config = Module2["_php_ini_activate_per_dir_config"] = (a0, a1) => (_php_ini_activate_per_dir_config = Module2["_php_ini_activate_per_dir_config"] = wasmExports["Lx"])(a0, a1);
    var _php_ini_has_per_host_config = Module2["_php_ini_has_per_host_config"] = () => (_php_ini_has_per_host_config = Module2["_php_ini_has_per_host_config"] = wasmExports["Mx"])();
    var _php_ini_activate_per_host_config = Module2["_php_ini_activate_per_host_config"] = (a0, a1) => (_php_ini_activate_per_host_config = Module2["_php_ini_activate_per_host_config"] = wasmExports["Nx"])(a0, a1);
    var _cfg_get_double = Module2["_cfg_get_double"] = (a0, a1) => (_cfg_get_double = Module2["_cfg_get_double"] = wasmExports["Ox"])(a0, a1);
    var _cfg_get_string = Module2["_cfg_get_string"] = (a0, a1) => (_cfg_get_string = Module2["_cfg_get_string"] = wasmExports["Px"])(a0, a1);
    var _php_ini_get_configuration_hash = Module2["_php_ini_get_configuration_hash"] = () => (_php_ini_get_configuration_hash = Module2["_php_ini_get_configuration_hash"] = wasmExports["Qx"])();
    var _php_odbc_connstr_is_quoted = Module2["_php_odbc_connstr_is_quoted"] = (a0) => (_php_odbc_connstr_is_quoted = Module2["_php_odbc_connstr_is_quoted"] = wasmExports["Rx"])(a0);
    var _php_odbc_connstr_should_quote = Module2["_php_odbc_connstr_should_quote"] = (a0) => (_php_odbc_connstr_should_quote = Module2["_php_odbc_connstr_should_quote"] = wasmExports["Sx"])(a0);
    var _php_odbc_connstr_estimate_quote_length = Module2["_php_odbc_connstr_estimate_quote_length"] = (a0) => (_php_odbc_connstr_estimate_quote_length = Module2["_php_odbc_connstr_estimate_quote_length"] = wasmExports["Tx"])(a0);
    var _php_odbc_connstr_quote = Module2["_php_odbc_connstr_quote"] = (a0, a1, a2) => (_php_odbc_connstr_quote = Module2["_php_odbc_connstr_quote"] = wasmExports["Ux"])(a0, a1, a2);
    var _php_open_temporary_fd = Module2["_php_open_temporary_fd"] = (a0, a1, a2) => (_php_open_temporary_fd = Module2["_php_open_temporary_fd"] = wasmExports["Vx"])(a0, a1, a2);
    var _php_open_temporary_file = Module2["_php_open_temporary_file"] = (a0, a1, a2) => (_php_open_temporary_file = Module2["_php_open_temporary_file"] = wasmExports["Wx"])(a0, a1, a2);
    var _php_syslog = Module2["_php_syslog"] = (a0, a1, a2) => (_php_syslog = Module2["_php_syslog"] = wasmExports["Xx"])(a0, a1, a2);
    var _zend_llist_clean = Module2["_zend_llist_clean"] = (a0) => (_zend_llist_clean = Module2["_zend_llist_clean"] = wasmExports["Yx"])(a0);
    var _php_remove_tick_function = Module2["_php_remove_tick_function"] = (a0, a1) => (_php_remove_tick_function = Module2["_php_remove_tick_function"] = wasmExports["Zx"])(a0, a1);
    var _php_register_variable = Module2["_php_register_variable"] = (a0, a1, a2) => (_php_register_variable = Module2["_php_register_variable"] = wasmExports["_x"])(a0, a1, a2);
    var _php_register_variable_ex = Module2["_php_register_variable_ex"] = (a0, a1, a2) => (_php_register_variable_ex = Module2["_php_register_variable_ex"] = wasmExports["$x"])(a0, a1, a2);
    var _php_register_variable_safe = Module2["_php_register_variable_safe"] = (a0, a1, a2, a3) => (_php_register_variable_safe = Module2["_php_register_variable_safe"] = wasmExports["ay"])(a0, a1, a2, a3);
    var _zend_hash_str_update_ind = Module2["_zend_hash_str_update_ind"] = (a0, a1, a2, a3) => (_zend_hash_str_update_ind = Module2["_zend_hash_str_update_ind"] = wasmExports["by"])(a0, a1, a2, a3);
    var _php_register_known_variable = Module2["_php_register_known_variable"] = (a0, a1, a2, a3) => (_php_register_known_variable = Module2["_php_register_known_variable"] = wasmExports["cy"])(a0, a1, a2, a3);
    var _php_build_argv = Module2["_php_build_argv"] = (a0, a1) => (_php_build_argv = Module2["_php_build_argv"] = wasmExports["dy"])(a0, a1);
    var _zend_activate_auto_globals = Module2["_zend_activate_auto_globals"] = () => (_zend_activate_auto_globals = Module2["_zend_activate_auto_globals"] = wasmExports["ey"])();
    var _zend_register_auto_global = Module2["_zend_register_auto_global"] = (a0, a1, a2) => (_zend_register_auto_global = Module2["_zend_register_auto_global"] = wasmExports["fy"])(a0, a1, a2);
    var _sapi_get_request_time = Module2["_sapi_get_request_time"] = () => (_sapi_get_request_time = Module2["_sapi_get_request_time"] = wasmExports["gy"])();
    var _destroy_uploaded_files_hash = Module2["_destroy_uploaded_files_hash"] = () => (_destroy_uploaded_files_hash = Module2["_destroy_uploaded_files_hash"] = wasmExports["hy"])();
    var _zend_multibyte_get_internal_encoding = Module2["_zend_multibyte_get_internal_encoding"] = () => (_zend_multibyte_get_internal_encoding = Module2["_zend_multibyte_get_internal_encoding"] = wasmExports["iy"])();
    var _zend_multibyte_encoding_detector = Module2["_zend_multibyte_encoding_detector"] = (a0, a1, a2, a3) => (_zend_multibyte_encoding_detector = Module2["_zend_multibyte_encoding_detector"] = wasmExports["jy"])(a0, a1, a2, a3);
    var __smart_string_alloc = Module2["__smart_string_alloc"] = (a0, a1) => (__smart_string_alloc = Module2["__smart_string_alloc"] = wasmExports["ky"])(a0, a1);
    var _zend_llist_get_first_ex = Module2["_zend_llist_get_first_ex"] = (a0, a1) => (_zend_llist_get_first_ex = Module2["_zend_llist_get_first_ex"] = wasmExports["ly"])(a0, a1);
    var _zend_llist_get_next_ex = Module2["_zend_llist_get_next_ex"] = (a0, a1) => (_zend_llist_get_next_ex = Module2["_zend_llist_get_next_ex"] = wasmExports["my"])(a0, a1);
    var _zend_multibyte_encoding_converter = Module2["_zend_multibyte_encoding_converter"] = (a0, a1, a2, a3, a4, a5) => (_zend_multibyte_encoding_converter = Module2["_zend_multibyte_encoding_converter"] = wasmExports["ny"])(a0, a1, a2, a3, a4, a5);
    var _zend_hash_str_add_empty_element = Module2["_zend_hash_str_add_empty_element"] = (a0, a1, a2) => (_zend_hash_str_add_empty_element = Module2["_zend_hash_str_add_empty_element"] = wasmExports["oy"])(a0, a1, a2);
    var _php_rfc1867_set_multibyte_callbacks = Module2["_php_rfc1867_set_multibyte_callbacks"] = (a0, a1, a2, a3, a4, a5) => (_php_rfc1867_set_multibyte_callbacks = Module2["_php_rfc1867_set_multibyte_callbacks"] = wasmExports["py"])(a0, a1, a2, a3, a4, a5);
    var _sapi_startup = Module2["_sapi_startup"] = (a0) => (_sapi_startup = Module2["_sapi_startup"] = wasmExports["qy"])(a0);
    var _sapi_shutdown = Module2["_sapi_shutdown"] = () => (_sapi_shutdown = Module2["_sapi_shutdown"] = wasmExports["ry"])();
    var _sapi_free_header = Module2["_sapi_free_header"] = (a0) => (_sapi_free_header = Module2["_sapi_free_header"] = wasmExports["sy"])(a0);
    var _sapi_get_default_content_type = Module2["_sapi_get_default_content_type"] = () => (_sapi_get_default_content_type = Module2["_sapi_get_default_content_type"] = wasmExports["ty"])();
    var _sapi_get_default_content_type_header = Module2["_sapi_get_default_content_type_header"] = (a0) => (_sapi_get_default_content_type_header = Module2["_sapi_get_default_content_type_header"] = wasmExports["uy"])(a0);
    var _sapi_apply_default_charset = Module2["_sapi_apply_default_charset"] = (a0, a1) => (_sapi_apply_default_charset = Module2["_sapi_apply_default_charset"] = wasmExports["vy"])(a0, a1);
    var _sapi_activate_headers_only = Module2["_sapi_activate_headers_only"] = () => (_sapi_activate_headers_only = Module2["_sapi_activate_headers_only"] = wasmExports["wy"])();
    var _sapi_register_post_entry = Module2["_sapi_register_post_entry"] = (a0) => (_sapi_register_post_entry = Module2["_sapi_register_post_entry"] = wasmExports["xy"])(a0);
    var _sapi_unregister_post_entry = Module2["_sapi_unregister_post_entry"] = (a0) => (_sapi_unregister_post_entry = Module2["_sapi_unregister_post_entry"] = wasmExports["yy"])(a0);
    var _sapi_get_fd = Module2["_sapi_get_fd"] = (a0) => (_sapi_get_fd = Module2["_sapi_get_fd"] = wasmExports["zy"])(a0);
    var _sapi_force_http_10 = Module2["_sapi_force_http_10"] = () => (_sapi_force_http_10 = Module2["_sapi_force_http_10"] = wasmExports["Ay"])();
    var _sapi_get_target_uid = Module2["_sapi_get_target_uid"] = (a0) => (_sapi_get_target_uid = Module2["_sapi_get_target_uid"] = wasmExports["By"])(a0);
    var _sapi_get_target_gid = Module2["_sapi_get_target_gid"] = (a0) => (_sapi_get_target_gid = Module2["_sapi_get_target_gid"] = wasmExports["Cy"])(a0);
    var _sapi_terminate_process = Module2["_sapi_terminate_process"] = () => (_sapi_terminate_process = Module2["_sapi_terminate_process"] = wasmExports["Dy"])();
    var _sapi_add_request_header = Module2["_sapi_add_request_header"] = (a0, a1, a2, a3, a4) => (_sapi_add_request_header = Module2["_sapi_add_request_header"] = wasmExports["Ey"])(a0, a1, a2, a3, a4);
    var _ap_php_conv_10 = Module2["_ap_php_conv_10"] = (a0, a1, a2, a3, a4, a5) => (_ap_php_conv_10 = Module2["_ap_php_conv_10"] = wasmExports["Fy"])(a0, a1, a2, a3, a4, a5);
    var _ap_php_conv_p2 = Module2["_ap_php_conv_p2"] = (a0, a1, a2, a3, a4, a5) => (_ap_php_conv_p2 = Module2["_ap_php_conv_p2"] = wasmExports["Gy"])(a0, a1, a2, a3, a4, a5);
    var _ap_php_vslprintf = Module2["_ap_php_vslprintf"] = (a0, a1, a2, a3) => (_ap_php_vslprintf = Module2["_ap_php_vslprintf"] = wasmExports["Hy"])(a0, a1, a2, a3);
    var _ap_php_vsnprintf = Module2["_ap_php_vsnprintf"] = (a0, a1, a2, a3) => (_ap_php_vsnprintf = Module2["_ap_php_vsnprintf"] = wasmExports["Iy"])(a0, a1, a2, a3);
    var _ap_php_vasprintf = Module2["_ap_php_vasprintf"] = (a0, a1, a2) => (_ap_php_vasprintf = Module2["_ap_php_vasprintf"] = wasmExports["Jy"])(a0, a1, a2);
    var _ap_php_asprintf = Module2["_ap_php_asprintf"] = (a0, a1, a2) => (_ap_php_asprintf = Module2["_ap_php_asprintf"] = wasmExports["Ky"])(a0, a1, a2);
    var _zend_dtoa = Module2["_zend_dtoa"] = (a0, a1, a2, a3, a4, a5) => (_zend_dtoa = Module2["_zend_dtoa"] = wasmExports["Ly"])(a0, a1, a2, a3, a4, a5);
    var _zend_freedtoa = Module2["_zend_freedtoa"] = (a0) => (_zend_freedtoa = Module2["_zend_freedtoa"] = wasmExports["My"])(a0);
    var __php_stream_make_seekable = Module2["__php_stream_make_seekable"] = (a0, a1, a2) => (__php_stream_make_seekable = Module2["__php_stream_make_seekable"] = wasmExports["Ny"])(a0, a1, a2);
    var _php_get_stream_filters_hash_global = Module2["_php_get_stream_filters_hash_global"] = () => (_php_get_stream_filters_hash_global = Module2["_php_get_stream_filters_hash_global"] = wasmExports["Oy"])();
    var _php_stream_bucket_split = Module2["_php_stream_bucket_split"] = (a0, a1, a2, a3) => (_php_stream_bucket_split = Module2["_php_stream_bucket_split"] = wasmExports["Py"])(a0, a1, a2, a3);
    var __php_stream_filter_prepend = Module2["__php_stream_filter_prepend"] = (a0, a1) => (__php_stream_filter_prepend = Module2["__php_stream_filter_prepend"] = wasmExports["Qy"])(a0, a1);
    var __php_glob_stream_get_pattern = Module2["__php_glob_stream_get_pattern"] = (a0, a1) => (__php_glob_stream_get_pattern = Module2["__php_glob_stream_get_pattern"] = wasmExports["Ry"])(a0, a1);
    var __php_stream_mode_to_str = Module2["__php_stream_mode_to_str"] = (a0) => (__php_stream_mode_to_str = Module2["__php_stream_mode_to_str"] = wasmExports["Sy"])(a0);
    var __php_stream_memory_get_buffer = Module2["__php_stream_memory_get_buffer"] = (a0) => (__php_stream_memory_get_buffer = Module2["__php_stream_memory_get_buffer"] = wasmExports["Ty"])(a0);
    var __php_stream_fopen_temporary_file = Module2["__php_stream_fopen_temporary_file"] = (a0, a1, a2) => (__php_stream_fopen_temporary_file = Module2["__php_stream_fopen_temporary_file"] = wasmExports["Uy"])(a0, a1, a2);
    var __php_stream_free_enclosed = Module2["__php_stream_free_enclosed"] = (a0, a1) => (__php_stream_free_enclosed = Module2["__php_stream_free_enclosed"] = wasmExports["Vy"])(a0, a1);
    var _php_stream_encloses = Module2["_php_stream_encloses"] = (a0, a1) => (_php_stream_encloses = Module2["_php_stream_encloses"] = wasmExports["Wy"])(a0, a1);
    var __php_stream_temp_open = Module2["__php_stream_temp_open"] = (a0, a1, a2, a3) => (__php_stream_temp_open = Module2["__php_stream_temp_open"] = wasmExports["Xy"])(a0, a1, a2, a3);
    var __php_stream_mmap_range = Module2["__php_stream_mmap_range"] = (a0, a1, a2, a3, a4) => (__php_stream_mmap_range = Module2["__php_stream_mmap_range"] = wasmExports["Yy"])(a0, a1, a2, a3, a4);
    var __php_stream_mmap_unmap = Module2["__php_stream_mmap_unmap"] = (a0) => (__php_stream_mmap_unmap = Module2["__php_stream_mmap_unmap"] = wasmExports["Zy"])(a0);
    var __php_stream_mmap_unmap_ex = Module2["__php_stream_mmap_unmap_ex"] = (a0, a1) => (__php_stream_mmap_unmap_ex = Module2["__php_stream_mmap_unmap_ex"] = wasmExports["_y"])(a0, a1);
    var _php_stream_parse_fopen_modes = Module2["_php_stream_parse_fopen_modes"] = (a0, a1) => (_php_stream_parse_fopen_modes = Module2["_php_stream_parse_fopen_modes"] = wasmExports["$y"])(a0, a1);
    var __php_stream_fopen = Module2["__php_stream_fopen"] = (a0, a1, a2, a3) => (__php_stream_fopen = Module2["__php_stream_fopen"] = wasmExports["az"])(a0, a1, a2, a3);
    var _php_stream_from_persistent_id = Module2["_php_stream_from_persistent_id"] = (a0, a1) => (_php_stream_from_persistent_id = Module2["_php_stream_from_persistent_id"] = wasmExports["bz"])(a0, a1);
    var __php_stream_fopen_with_path = Module2["__php_stream_fopen_with_path"] = (a0, a1, a2, a3, a4) => (__php_stream_fopen_with_path = Module2["__php_stream_fopen_with_path"] = wasmExports["cz"])(a0, a1, a2, a3, a4);
    var _php_stream_get_url_stream_wrappers_hash_global = Module2["_php_stream_get_url_stream_wrappers_hash_global"] = () => (_php_stream_get_url_stream_wrappers_hash_global = Module2["_php_stream_get_url_stream_wrappers_hash_global"] = wasmExports["dz"])();
    var _zend_register_persistent_resource = Module2["_zend_register_persistent_resource"] = (a0, a1, a2, a3) => (_zend_register_persistent_resource = Module2["_zend_register_persistent_resource"] = wasmExports["ez"])(a0, a1, a2, a3);
    var __php_stream_fill_read_buffer = Module2["__php_stream_fill_read_buffer"] = (a0, a1) => (__php_stream_fill_read_buffer = Module2["__php_stream_fill_read_buffer"] = wasmExports["fz"])(a0, a1);
    var __php_stream_putc = Module2["__php_stream_putc"] = (a0, a1) => (__php_stream_putc = Module2["__php_stream_putc"] = wasmExports["gz"])(a0, a1);
    var __php_stream_puts = Module2["__php_stream_puts"] = (a0, a1) => (__php_stream_puts = Module2["__php_stream_puts"] = wasmExports["hz"])(a0, a1);
    var __php_stream_copy_to_stream = Module2["__php_stream_copy_to_stream"] = (a0, a1, a2) => (__php_stream_copy_to_stream = Module2["__php_stream_copy_to_stream"] = wasmExports["iz"])(a0, a1, a2);
    var _php_stream_generic_socket_factory = Module2["_php_stream_generic_socket_factory"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8) => (_php_stream_generic_socket_factory = Module2["_php_stream_generic_socket_factory"] = wasmExports["jz"])(a0, a1, a2, a3, a4, a5, a6, a7, a8);
    var _php_stream_xport_register = Module2["_php_stream_xport_register"] = (a0, a1) => (_php_stream_xport_register = Module2["_php_stream_xport_register"] = wasmExports["kz"])(a0, a1);
    var _php_register_url_stream_wrapper_volatile = Module2["_php_register_url_stream_wrapper_volatile"] = (a0, a1) => (_php_register_url_stream_wrapper_volatile = Module2["_php_register_url_stream_wrapper_volatile"] = wasmExports["lz"])(a0, a1);
    var _php_unregister_url_stream_wrapper_volatile = Module2["_php_unregister_url_stream_wrapper_volatile"] = (a0) => (_php_unregister_url_stream_wrapper_volatile = Module2["_php_unregister_url_stream_wrapper_volatile"] = wasmExports["mz"])(a0);
    var _zend_llist_count = Module2["_zend_llist_count"] = (a0) => (_zend_llist_count = Module2["_zend_llist_count"] = wasmExports["nz"])(a0);
    var _php_stream_xport_unregister = Module2["_php_stream_xport_unregister"] = (a0) => (_php_stream_xport_unregister = Module2["_php_stream_xport_unregister"] = wasmExports["oz"])(a0);
    var _php_stream_xport_listen = Module2["_php_stream_xport_listen"] = (a0, a1, a2) => (_php_stream_xport_listen = Module2["_php_stream_xport_listen"] = wasmExports["pz"])(a0, a1, a2);
    var _php_stream_xport_connect = Module2["_php_stream_xport_connect"] = (a0, a1, a2, a3, a4, a5, a6) => (_php_stream_xport_connect = Module2["_php_stream_xport_connect"] = wasmExports["qz"])(a0, a1, a2, a3, a4, a5, a6);
    var _php_stream_xport_bind = Module2["_php_stream_xport_bind"] = (a0, a1, a2, a3) => (_php_stream_xport_bind = Module2["_php_stream_xport_bind"] = wasmExports["rz"])(a0, a1, a2, a3);
    var _add_property_resource_ex = Module2["_add_property_resource_ex"] = (a0, a1, a2, a3) => (_add_property_resource_ex = Module2["_add_property_resource_ex"] = wasmExports["sz"])(a0, a1, a2, a3);
    var __zend_get_special_const = Module2["__zend_get_special_const"] = (a0, a1) => (__zend_get_special_const = Module2["__zend_get_special_const"] = wasmExports["tz"])(a0, a1);
    var _zend_build_cfg = Module2["_zend_build_cfg"] = (a0, a1, a2, a3) => (_zend_build_cfg = Module2["_zend_build_cfg"] = wasmExports["uz"])(a0, a1, a2, a3);
    var _zend_dump_op_array = Module2["_zend_dump_op_array"] = (a0, a1, a2, a3) => (_zend_dump_op_array = Module2["_zend_dump_op_array"] = wasmExports["vz"])(a0, a1, a2, a3);
    var _zend_create_member_string = Module2["_zend_create_member_string"] = (a0, a1) => (_zend_create_member_string = Module2["_zend_create_member_string"] = wasmExports["wz"])(a0, a1);
    var _zend_array_type_info = Module2["_zend_array_type_info"] = (a0) => (_zend_array_type_info = Module2["_zend_array_type_info"] = wasmExports["xz"])(a0);
    var _zend_may_throw = Module2["_zend_may_throw"] = (a0, a1, a2, a3) => (_zend_may_throw = Module2["_zend_may_throw"] = wasmExports["yz"])(a0, a1, a2, a3);
    var _zend_cfg_build_predecessors = Module2["_zend_cfg_build_predecessors"] = (a0, a1) => (_zend_cfg_build_predecessors = Module2["_zend_cfg_build_predecessors"] = wasmExports["zz"])(a0, a1);
    var _zend_cfg_compute_dominators_tree = Module2["_zend_cfg_compute_dominators_tree"] = (a0, a1) => (_zend_cfg_compute_dominators_tree = Module2["_zend_cfg_compute_dominators_tree"] = wasmExports["Az"])(a0, a1);
    var _zend_cfg_identify_loops = Module2["_zend_cfg_identify_loops"] = (a0, a1) => (_zend_cfg_identify_loops = Module2["_zend_cfg_identify_loops"] = wasmExports["Bz"])(a0, a1);
    var _zend_build_ssa = Module2["_zend_build_ssa"] = (a0, a1, a2, a3, a4) => (_zend_build_ssa = Module2["_zend_build_ssa"] = wasmExports["Cz"])(a0, a1, a2, a3, a4);
    var _zend_ssa_compute_use_def_chains = Module2["_zend_ssa_compute_use_def_chains"] = (a0, a1, a2) => (_zend_ssa_compute_use_def_chains = Module2["_zend_ssa_compute_use_def_chains"] = wasmExports["Dz"])(a0, a1, a2);
    var _zend_ssa_find_false_dependencies = Module2["_zend_ssa_find_false_dependencies"] = (a0, a1) => (_zend_ssa_find_false_dependencies = Module2["_zend_ssa_find_false_dependencies"] = wasmExports["Ez"])(a0, a1);
    var _zend_ssa_find_sccs = Module2["_zend_ssa_find_sccs"] = (a0, a1) => (_zend_ssa_find_sccs = Module2["_zend_ssa_find_sccs"] = wasmExports["Fz"])(a0, a1);
    var _zend_ssa_inference = Module2["_zend_ssa_inference"] = (a0, a1, a2, a3, a4) => (_zend_ssa_inference = Module2["_zend_ssa_inference"] = wasmExports["Gz"])(a0, a1, a2, a3, a4);
    var _zend_hash_index_add = Module2["_zend_hash_index_add"] = (a0, a1, a2) => (_zend_hash_index_add = Module2["_zend_hash_index_add"] = wasmExports["Hz"])(a0, a1, a2);
    var _zend_std_get_constructor = Module2["_zend_std_get_constructor"] = (a0) => (_zend_std_get_constructor = Module2["_zend_std_get_constructor"] = wasmExports["Iz"])(a0);
    var _zend_get_call_op = Module2["_zend_get_call_op"] = (a0, a1) => (_zend_get_call_op = Module2["_zend_get_call_op"] = wasmExports["Jz"])(a0, a1);
    var _zend_get_constant_str = Module2["_zend_get_constant_str"] = (a0, a1) => (_zend_get_constant_str = Module2["_zend_get_constant_str"] = wasmExports["Kz"])(a0, a1);
    var _zend_dump_var = Module2["_zend_dump_var"] = (a0, a1, a2) => (_zend_dump_var = Module2["_zend_dump_var"] = wasmExports["Lz"])(a0, a1, a2);
    var _increment_function = Module2["_increment_function"] = (a0) => (_increment_function = Module2["_increment_function"] = wasmExports["Mz"])(a0);
    var _decrement_function = Module2["_decrement_function"] = (a0) => (_decrement_function = Module2["_decrement_function"] = wasmExports["Nz"])(a0);
    var _zend_analyze_calls = Module2["_zend_analyze_calls"] = (a0, a1, a2, a3, a4) => (_zend_analyze_calls = Module2["_zend_analyze_calls"] = wasmExports["Oz"])(a0, a1, a2, a3, a4);
    var _zend_build_call_graph = Module2["_zend_build_call_graph"] = (a0, a1, a2) => (_zend_build_call_graph = Module2["_zend_build_call_graph"] = wasmExports["Pz"])(a0, a1, a2);
    var _zend_analyze_call_graph = Module2["_zend_analyze_call_graph"] = (a0, a1, a2) => (_zend_analyze_call_graph = Module2["_zend_analyze_call_graph"] = wasmExports["Qz"])(a0, a1, a2);
    var _zend_build_call_map = Module2["_zend_build_call_map"] = (a0, a1, a2) => (_zend_build_call_map = Module2["_zend_build_call_map"] = wasmExports["Rz"])(a0, a1, a2);
    var _zend_dfg_add_use_def_op = Module2["_zend_dfg_add_use_def_op"] = (a0, a1, a2, a3, a4) => (_zend_dfg_add_use_def_op = Module2["_zend_dfg_add_use_def_op"] = wasmExports["Sz"])(a0, a1, a2, a3, a4);
    var _zend_dump_ssa_var = Module2["_zend_dump_ssa_var"] = (a0, a1, a2, a3, a4, a5) => (_zend_dump_ssa_var = Module2["_zend_dump_ssa_var"] = wasmExports["Tz"])(a0, a1, a2, a3, a4, a5);
    var _zend_dump_op = Module2["_zend_dump_op"] = (a0, a1, a2, a3, a4, a5) => (_zend_dump_op = Module2["_zend_dump_op"] = wasmExports["Uz"])(a0, a1, a2, a3, a4, a5);
    var _zend_get_opcode_name = Module2["_zend_get_opcode_name"] = (a0) => (_zend_get_opcode_name = Module2["_zend_get_opcode_name"] = wasmExports["Vz"])(a0);
    var _zend_get_opcode_flags = Module2["_zend_get_opcode_flags"] = (a0) => (_zend_get_opcode_flags = Module2["_zend_get_opcode_flags"] = wasmExports["Wz"])(a0);
    var _zend_dump_op_line = Module2["_zend_dump_op_line"] = (a0, a1, a2, a3, a4) => (_zend_dump_op_line = Module2["_zend_dump_op_line"] = wasmExports["Xz"])(a0, a1, a2, a3, a4);
    var _zend_get_func_info = Module2["_zend_get_func_info"] = (a0, a1, a2, a3) => (_zend_get_func_info = Module2["_zend_get_func_info"] = wasmExports["Yz"])(a0, a1, a2, a3);
    var _zend_get_resource_handle = Module2["_zend_get_resource_handle"] = (a0) => (_zend_get_resource_handle = Module2["_zend_get_resource_handle"] = wasmExports["Zz"])(a0);
    var _zend_inference_propagate_range = Module2["_zend_inference_propagate_range"] = (a0, a1, a2, a3, a4, a5) => (_zend_inference_propagate_range = Module2["_zend_inference_propagate_range"] = wasmExports["_z"])(a0, a1, a2, a3, a4, a5);
    var _zend_array_element_type = Module2["_zend_array_element_type"] = (a0, a1, a2, a3) => (_zend_array_element_type = Module2["_zend_array_element_type"] = wasmExports["$z"])(a0, a1, a2, a3);
    var _zend_fetch_arg_info_type = Module2["_zend_fetch_arg_info_type"] = (a0, a1, a2) => (_zend_fetch_arg_info_type = Module2["_zend_fetch_arg_info_type"] = wasmExports["aA"])(a0, a1, a2);
    var _zend_update_type_info = Module2["_zend_update_type_info"] = (a0, a1, a2, a3, a4, a5, a6) => (_zend_update_type_info = Module2["_zend_update_type_info"] = wasmExports["bA"])(a0, a1, a2, a3, a4, a5, a6);
    var _zend_error_at = Module2["_zend_error_at"] = (a0, a1, a2, a3, a4) => (_zend_error_at = Module2["_zend_error_at"] = wasmExports["cA"])(a0, a1, a2, a3, a4);
    var _zend_init_func_return_info = Module2["_zend_init_func_return_info"] = (a0, a1, a2) => (_zend_init_func_return_info = Module2["_zend_init_func_return_info"] = wasmExports["dA"])(a0, a1, a2);
    var _zend_may_throw_ex = Module2["_zend_may_throw_ex"] = (a0, a1, a2, a3, a4, a5) => (_zend_may_throw_ex = Module2["_zend_may_throw_ex"] = wasmExports["eA"])(a0, a1, a2, a3, a4, a5);
    var _get_binary_op = Module2["_get_binary_op"] = (a0) => (_get_binary_op = Module2["_get_binary_op"] = wasmExports["fA"])(a0);
    var _zend_binary_op_produces_error = Module2["_zend_binary_op_produces_error"] = (a0, a1, a2) => (_zend_binary_op_produces_error = Module2["_zend_binary_op_produces_error"] = wasmExports["gA"])(a0, a1, a2);
    var _get_unary_op = Module2["_get_unary_op"] = (a0) => (_get_unary_op = Module2["_get_unary_op"] = wasmExports["hA"])(a0);
    var _zend_unary_op_produces_error = Module2["_zend_unary_op_produces_error"] = (a0, a1) => (_zend_unary_op_produces_error = Module2["_zend_unary_op_produces_error"] = wasmExports["iA"])(a0, a1);
    var _zend_optimize_script = Module2["_zend_optimize_script"] = (a0, a1, a2) => (_zend_optimize_script = Module2["_zend_optimize_script"] = wasmExports["jA"])(a0, a1, a2);
    var _zend_vm_set_opcode_handler_ex = Module2["_zend_vm_set_opcode_handler_ex"] = (a0, a1, a2, a3) => (_zend_vm_set_opcode_handler_ex = Module2["_zend_vm_set_opcode_handler_ex"] = wasmExports["kA"])(a0, a1, a2, a3);
    var _zend_recalc_live_ranges = Module2["_zend_recalc_live_ranges"] = (a0, a1) => (_zend_recalc_live_ranges = Module2["_zend_recalc_live_ranges"] = wasmExports["lA"])(a0, a1);
    var _zend_vm_set_opcode_handler = Module2["_zend_vm_set_opcode_handler"] = (a0) => (_zend_vm_set_opcode_handler = Module2["_zend_vm_set_opcode_handler"] = wasmExports["mA"])(a0);
    var _zend_optimizer_register_pass = Module2["_zend_optimizer_register_pass"] = (a0) => (_zend_optimizer_register_pass = Module2["_zend_optimizer_register_pass"] = wasmExports["nA"])(a0);
    var _zend_optimizer_unregister_pass = Module2["_zend_optimizer_unregister_pass"] = (a0) => (_zend_optimizer_unregister_pass = Module2["_zend_optimizer_unregister_pass"] = wasmExports["oA"])(a0);
    var _zend_ssa_rename_op = Module2["_zend_ssa_rename_op"] = (a0, a1, a2, a3, a4, a5, a6) => (_zend_ssa_rename_op = Module2["_zend_ssa_rename_op"] = wasmExports["pA"])(a0, a1, a2, a3, a4, a5, a6);
    var _zend_mm_gc = Module2["_zend_mm_gc"] = (a0) => (_zend_mm_gc = Module2["_zend_mm_gc"] = wasmExports["qA"])(a0);
    var _zend_mm_shutdown = Module2["_zend_mm_shutdown"] = (a0, a1, a2) => (_zend_mm_shutdown = Module2["_zend_mm_shutdown"] = wasmExports["rA"])(a0, a1, a2);
    var ___zend_free = Module2["___zend_free"] = (a0) => (___zend_free = Module2["___zend_free"] = wasmExports["sA"])(a0);
    var __zend_mm_alloc = Module2["__zend_mm_alloc"] = (a0, a1) => (__zend_mm_alloc = Module2["__zend_mm_alloc"] = wasmExports["tA"])(a0, a1);
    var __zend_mm_free = Module2["__zend_mm_free"] = (a0, a1) => (__zend_mm_free = Module2["__zend_mm_free"] = wasmExports["uA"])(a0, a1);
    var __zend_mm_realloc = Module2["__zend_mm_realloc"] = (a0, a1, a2) => (__zend_mm_realloc = Module2["__zend_mm_realloc"] = wasmExports["vA"])(a0, a1, a2);
    var __zend_mm_realloc2 = Module2["__zend_mm_realloc2"] = (a0, a1, a2, a3) => (__zend_mm_realloc2 = Module2["__zend_mm_realloc2"] = wasmExports["wA"])(a0, a1, a2, a3);
    var __zend_mm_block_size = Module2["__zend_mm_block_size"] = (a0, a1) => (__zend_mm_block_size = Module2["__zend_mm_block_size"] = wasmExports["xA"])(a0, a1);
    var _is_zend_ptr = Module2["_is_zend_ptr"] = (a0) => (_is_zend_ptr = Module2["_is_zend_ptr"] = wasmExports["yA"])(a0);
    var __emalloc_112 = Module2["__emalloc_112"] = () => (__emalloc_112 = Module2["__emalloc_112"] = wasmExports["zA"])();
    var __emalloc_192 = Module2["__emalloc_192"] = () => (__emalloc_192 = Module2["__emalloc_192"] = wasmExports["AA"])();
    var __emalloc_224 = Module2["__emalloc_224"] = () => (__emalloc_224 = Module2["__emalloc_224"] = wasmExports["BA"])();
    var __emalloc_384 = Module2["__emalloc_384"] = () => (__emalloc_384 = Module2["__emalloc_384"] = wasmExports["CA"])();
    var __emalloc_448 = Module2["__emalloc_448"] = () => (__emalloc_448 = Module2["__emalloc_448"] = wasmExports["DA"])();
    var __emalloc_512 = Module2["__emalloc_512"] = () => (__emalloc_512 = Module2["__emalloc_512"] = wasmExports["EA"])();
    var __emalloc_640 = Module2["__emalloc_640"] = () => (__emalloc_640 = Module2["__emalloc_640"] = wasmExports["FA"])();
    var __emalloc_768 = Module2["__emalloc_768"] = () => (__emalloc_768 = Module2["__emalloc_768"] = wasmExports["GA"])();
    var __emalloc_896 = Module2["__emalloc_896"] = () => (__emalloc_896 = Module2["__emalloc_896"] = wasmExports["HA"])();
    var __emalloc_1280 = Module2["__emalloc_1280"] = () => (__emalloc_1280 = Module2["__emalloc_1280"] = wasmExports["IA"])();
    var __emalloc_1536 = Module2["__emalloc_1536"] = () => (__emalloc_1536 = Module2["__emalloc_1536"] = wasmExports["JA"])();
    var __emalloc_1792 = Module2["__emalloc_1792"] = () => (__emalloc_1792 = Module2["__emalloc_1792"] = wasmExports["KA"])();
    var __emalloc_2048 = Module2["__emalloc_2048"] = () => (__emalloc_2048 = Module2["__emalloc_2048"] = wasmExports["LA"])();
    var __emalloc_2560 = Module2["__emalloc_2560"] = () => (__emalloc_2560 = Module2["__emalloc_2560"] = wasmExports["MA"])();
    var __emalloc_3072 = Module2["__emalloc_3072"] = () => (__emalloc_3072 = Module2["__emalloc_3072"] = wasmExports["NA"])();
    var __emalloc_huge = Module2["__emalloc_huge"] = (a0) => (__emalloc_huge = Module2["__emalloc_huge"] = wasmExports["OA"])(a0);
    var __efree_8 = Module2["__efree_8"] = (a0) => (__efree_8 = Module2["__efree_8"] = wasmExports["PA"])(a0);
    var __efree_16 = Module2["__efree_16"] = (a0) => (__efree_16 = Module2["__efree_16"] = wasmExports["QA"])(a0);
    var __efree_24 = Module2["__efree_24"] = (a0) => (__efree_24 = Module2["__efree_24"] = wasmExports["RA"])(a0);
    var __efree_40 = Module2["__efree_40"] = (a0) => (__efree_40 = Module2["__efree_40"] = wasmExports["SA"])(a0);
    var __efree_56 = Module2["__efree_56"] = (a0) => (__efree_56 = Module2["__efree_56"] = wasmExports["TA"])(a0);
    var __efree_64 = Module2["__efree_64"] = (a0) => (__efree_64 = Module2["__efree_64"] = wasmExports["UA"])(a0);
    var __efree_80 = Module2["__efree_80"] = (a0) => (__efree_80 = Module2["__efree_80"] = wasmExports["VA"])(a0);
    var __efree_96 = Module2["__efree_96"] = (a0) => (__efree_96 = Module2["__efree_96"] = wasmExports["WA"])(a0);
    var __efree_112 = Module2["__efree_112"] = (a0) => (__efree_112 = Module2["__efree_112"] = wasmExports["XA"])(a0);
    var __efree_128 = Module2["__efree_128"] = (a0) => (__efree_128 = Module2["__efree_128"] = wasmExports["YA"])(a0);
    var __efree_160 = Module2["__efree_160"] = (a0) => (__efree_160 = Module2["__efree_160"] = wasmExports["ZA"])(a0);
    var __efree_192 = Module2["__efree_192"] = (a0) => (__efree_192 = Module2["__efree_192"] = wasmExports["_A"])(a0);
    var __efree_224 = Module2["__efree_224"] = (a0) => (__efree_224 = Module2["__efree_224"] = wasmExports["$A"])(a0);
    var __efree_256 = Module2["__efree_256"] = (a0) => (__efree_256 = Module2["__efree_256"] = wasmExports["aB"])(a0);
    var __efree_320 = Module2["__efree_320"] = (a0) => (__efree_320 = Module2["__efree_320"] = wasmExports["bB"])(a0);
    var __efree_384 = Module2["__efree_384"] = (a0) => (__efree_384 = Module2["__efree_384"] = wasmExports["cB"])(a0);
    var __efree_448 = Module2["__efree_448"] = (a0) => (__efree_448 = Module2["__efree_448"] = wasmExports["dB"])(a0);
    var __efree_512 = Module2["__efree_512"] = (a0) => (__efree_512 = Module2["__efree_512"] = wasmExports["eB"])(a0);
    var __efree_640 = Module2["__efree_640"] = (a0) => (__efree_640 = Module2["__efree_640"] = wasmExports["fB"])(a0);
    var __efree_768 = Module2["__efree_768"] = (a0) => (__efree_768 = Module2["__efree_768"] = wasmExports["gB"])(a0);
    var __efree_896 = Module2["__efree_896"] = (a0) => (__efree_896 = Module2["__efree_896"] = wasmExports["hB"])(a0);
    var __efree_1024 = Module2["__efree_1024"] = (a0) => (__efree_1024 = Module2["__efree_1024"] = wasmExports["iB"])(a0);
    var __efree_1280 = Module2["__efree_1280"] = (a0) => (__efree_1280 = Module2["__efree_1280"] = wasmExports["jB"])(a0);
    var __efree_1536 = Module2["__efree_1536"] = (a0) => (__efree_1536 = Module2["__efree_1536"] = wasmExports["kB"])(a0);
    var __efree_1792 = Module2["__efree_1792"] = (a0) => (__efree_1792 = Module2["__efree_1792"] = wasmExports["lB"])(a0);
    var __efree_2048 = Module2["__efree_2048"] = (a0) => (__efree_2048 = Module2["__efree_2048"] = wasmExports["mB"])(a0);
    var __efree_2560 = Module2["__efree_2560"] = (a0) => (__efree_2560 = Module2["__efree_2560"] = wasmExports["nB"])(a0);
    var __efree_3072 = Module2["__efree_3072"] = (a0) => (__efree_3072 = Module2["__efree_3072"] = wasmExports["oB"])(a0);
    var __efree_huge = Module2["__efree_huge"] = (a0, a1) => (__efree_huge = Module2["__efree_huge"] = wasmExports["pB"])(a0, a1);
    var __erealloc2 = Module2["__erealloc2"] = (a0, a1, a2) => (__erealloc2 = Module2["__erealloc2"] = wasmExports["qB"])(a0, a1, a2);
    var __zend_mem_block_size = Module2["__zend_mem_block_size"] = (a0) => (__zend_mem_block_size = Module2["__zend_mem_block_size"] = wasmExports["rB"])(a0);
    var __safe_malloc = Module2["__safe_malloc"] = (a0, a1, a2) => (__safe_malloc = Module2["__safe_malloc"] = wasmExports["sB"])(a0, a1, a2);
    var _start_memory_manager = Module2["_start_memory_manager"] = () => (_start_memory_manager = Module2["_start_memory_manager"] = wasmExports["tB"])();
    var _zend_mm_set_heap = Module2["_zend_mm_set_heap"] = (a0) => (_zend_mm_set_heap = Module2["_zend_mm_set_heap"] = wasmExports["uB"])(a0);
    var _zend_mm_get_heap = Module2["_zend_mm_get_heap"] = () => (_zend_mm_get_heap = Module2["_zend_mm_get_heap"] = wasmExports["vB"])();
    var _zend_mm_is_custom_heap = Module2["_zend_mm_is_custom_heap"] = (a0) => (_zend_mm_is_custom_heap = Module2["_zend_mm_is_custom_heap"] = wasmExports["wB"])(a0);
    var _zend_mm_set_custom_handlers = Module2["_zend_mm_set_custom_handlers"] = (a0, a1, a2, a3) => (_zend_mm_set_custom_handlers = Module2["_zend_mm_set_custom_handlers"] = wasmExports["xB"])(a0, a1, a2, a3);
    var _zend_mm_set_custom_handlers_ex = Module2["_zend_mm_set_custom_handlers_ex"] = (a0, a1, a2, a3, a4, a5) => (_zend_mm_set_custom_handlers_ex = Module2["_zend_mm_set_custom_handlers_ex"] = wasmExports["yB"])(a0, a1, a2, a3, a4, a5);
    var _zend_mm_get_custom_handlers = Module2["_zend_mm_get_custom_handlers"] = (a0, a1, a2, a3) => (_zend_mm_get_custom_handlers = Module2["_zend_mm_get_custom_handlers"] = wasmExports["zB"])(a0, a1, a2, a3);
    var _zend_mm_get_custom_handlers_ex = Module2["_zend_mm_get_custom_handlers_ex"] = (a0, a1, a2, a3, a4, a5) => (_zend_mm_get_custom_handlers_ex = Module2["_zend_mm_get_custom_handlers_ex"] = wasmExports["AB"])(a0, a1, a2, a3, a4, a5);
    var _zend_mm_get_storage = Module2["_zend_mm_get_storage"] = (a0) => (_zend_mm_get_storage = Module2["_zend_mm_get_storage"] = wasmExports["BB"])(a0);
    var _zend_mm_startup = Module2["_zend_mm_startup"] = () => (_zend_mm_startup = Module2["_zend_mm_startup"] = wasmExports["CB"])();
    var _zend_mm_startup_ex = Module2["_zend_mm_startup_ex"] = (a0, a1, a2) => (_zend_mm_startup_ex = Module2["_zend_mm_startup_ex"] = wasmExports["DB"])(a0, a1, a2);
    var _zend_get_parameters_array_ex = Module2["_zend_get_parameters_array_ex"] = (a0, a1) => (_zend_get_parameters_array_ex = Module2["_zend_get_parameters_array_ex"] = wasmExports["EB"])(a0, a1);
    var _zend_copy_parameters_array = Module2["_zend_copy_parameters_array"] = (a0, a1) => (_zend_copy_parameters_array = Module2["_zend_copy_parameters_array"] = wasmExports["FB"])(a0, a1);
    var _zend_wrong_property_read = Module2["_zend_wrong_property_read"] = (a0, a1) => (_zend_wrong_property_read = Module2["_zend_wrong_property_read"] = wasmExports["GB"])(a0, a1);
    var _zend_get_type_by_const = Module2["_zend_get_type_by_const"] = (a0) => (_zend_get_type_by_const = Module2["_zend_get_type_by_const"] = wasmExports["HB"])(a0);
    var _zend_wrong_callback_error = Module2["_zend_wrong_callback_error"] = (a0, a1) => (_zend_wrong_callback_error = Module2["_zend_wrong_callback_error"] = wasmExports["IB"])(a0, a1);
    var _zend_wrong_callback_or_null_error = Module2["_zend_wrong_callback_or_null_error"] = (a0, a1) => (_zend_wrong_callback_or_null_error = Module2["_zend_wrong_callback_or_null_error"] = wasmExports["JB"])(a0, a1);
    var _zend_wrong_parameter_class_error = Module2["_zend_wrong_parameter_class_error"] = (a0, a1, a2) => (_zend_wrong_parameter_class_error = Module2["_zend_wrong_parameter_class_error"] = wasmExports["KB"])(a0, a1, a2);
    var _zend_wrong_parameter_class_or_null_error = Module2["_zend_wrong_parameter_class_or_null_error"] = (a0, a1, a2) => (_zend_wrong_parameter_class_or_null_error = Module2["_zend_wrong_parameter_class_or_null_error"] = wasmExports["LB"])(a0, a1, a2);
    var _zend_wrong_parameter_class_or_string_error = Module2["_zend_wrong_parameter_class_or_string_error"] = (a0, a1, a2) => (_zend_wrong_parameter_class_or_string_error = Module2["_zend_wrong_parameter_class_or_string_error"] = wasmExports["MB"])(a0, a1, a2);
    var _zend_wrong_parameter_class_or_string_or_null_error = Module2["_zend_wrong_parameter_class_or_string_or_null_error"] = (a0, a1, a2) => (_zend_wrong_parameter_class_or_string_or_null_error = Module2["_zend_wrong_parameter_class_or_string_or_null_error"] = wasmExports["NB"])(a0, a1, a2);
    var _zend_wrong_parameter_class_or_long_error = Module2["_zend_wrong_parameter_class_or_long_error"] = (a0, a1, a2) => (_zend_wrong_parameter_class_or_long_error = Module2["_zend_wrong_parameter_class_or_long_error"] = wasmExports["OB"])(a0, a1, a2);
    var _zend_wrong_parameter_class_or_long_or_null_error = Module2["_zend_wrong_parameter_class_or_long_or_null_error"] = (a0, a1, a2) => (_zend_wrong_parameter_class_or_long_or_null_error = Module2["_zend_wrong_parameter_class_or_long_or_null_error"] = wasmExports["PB"])(a0, a1, a2);
    var _zend_unexpected_extra_named_error = Module2["_zend_unexpected_extra_named_error"] = () => (_zend_unexpected_extra_named_error = Module2["_zend_unexpected_extra_named_error"] = wasmExports["QB"])();
    var _zend_argument_error_variadic = Module2["_zend_argument_error_variadic"] = (a0, a1, a2, a3) => (_zend_argument_error_variadic = Module2["_zend_argument_error_variadic"] = wasmExports["RB"])(a0, a1, a2, a3);
    var _zend_class_redeclaration_error_ex = Module2["_zend_class_redeclaration_error_ex"] = (a0, a1, a2) => (_zend_class_redeclaration_error_ex = Module2["_zend_class_redeclaration_error_ex"] = wasmExports["SB"])(a0, a1, a2);
    var _zend_class_redeclaration_error = Module2["_zend_class_redeclaration_error"] = (a0, a1) => (_zend_class_redeclaration_error = Module2["_zend_class_redeclaration_error"] = wasmExports["TB"])(a0, a1);
    var _zend_parse_arg_bool_weak = Module2["_zend_parse_arg_bool_weak"] = (a0, a1, a2) => (_zend_parse_arg_bool_weak = Module2["_zend_parse_arg_bool_weak"] = wasmExports["UB"])(a0, a1, a2);
    var _zend_active_function_ex = Module2["_zend_active_function_ex"] = (a0) => (_zend_active_function_ex = Module2["_zend_active_function_ex"] = wasmExports["VB"])(a0);
    var _zend_parse_arg_long_weak = Module2["_zend_parse_arg_long_weak"] = (a0, a1, a2) => (_zend_parse_arg_long_weak = Module2["_zend_parse_arg_long_weak"] = wasmExports["WB"])(a0, a1, a2);
    var _zend_incompatible_string_to_long_error = Module2["_zend_incompatible_string_to_long_error"] = (a0) => (_zend_incompatible_string_to_long_error = Module2["_zend_incompatible_string_to_long_error"] = wasmExports["XB"])(a0);
    var _zend_parse_arg_double_weak = Module2["_zend_parse_arg_double_weak"] = (a0, a1, a2) => (_zend_parse_arg_double_weak = Module2["_zend_parse_arg_double_weak"] = wasmExports["YB"])(a0, a1, a2);
    var _zend_parse_arg_str_weak = Module2["_zend_parse_arg_str_weak"] = (a0, a1, a2) => (_zend_parse_arg_str_weak = Module2["_zend_parse_arg_str_weak"] = wasmExports["ZB"])(a0, a1, a2);
    var _zend_parse_parameter = Module2["_zend_parse_parameter"] = (a0, a1, a2, a3, a4) => (_zend_parse_parameter = Module2["_zend_parse_parameter"] = wasmExports["_B"])(a0, a1, a2, a3, a4);
    var _zend_is_callable_at_frame = Module2["_zend_is_callable_at_frame"] = (a0, a1, a2, a3, a4, a5) => (_zend_is_callable_at_frame = Module2["_zend_is_callable_at_frame"] = wasmExports["$B"])(a0, a1, a2, a3, a4, a5);
    var _zend_parse_method_parameters_ex = Module2["_zend_parse_method_parameters_ex"] = (a0, a1, a2, a3, a4) => (_zend_parse_method_parameters_ex = Module2["_zend_parse_method_parameters_ex"] = wasmExports["aC"])(a0, a1, a2, a3, a4);
    var _zend_merge_properties = Module2["_zend_merge_properties"] = (a0, a1) => (_zend_merge_properties = Module2["_zend_merge_properties"] = wasmExports["bC"])(a0, a1);
    var _zend_verify_class_constant_type = Module2["_zend_verify_class_constant_type"] = (a0, a1, a2) => (_zend_verify_class_constant_type = Module2["_zend_verify_class_constant_type"] = wasmExports["cC"])(a0, a1, a2);
    var _object_properties_init_ex = Module2["_object_properties_init_ex"] = (a0, a1) => (_object_properties_init_ex = Module2["_object_properties_init_ex"] = wasmExports["dC"])(a0, a1);
    var _add_assoc_resource_ex = Module2["_add_assoc_resource_ex"] = (a0, a1, a2, a3) => (_add_assoc_resource_ex = Module2["_add_assoc_resource_ex"] = wasmExports["eC"])(a0, a1, a2, a3);
    var _add_assoc_array_ex = Module2["_add_assoc_array_ex"] = (a0, a1, a2, a3) => (_add_assoc_array_ex = Module2["_add_assoc_array_ex"] = wasmExports["fC"])(a0, a1, a2, a3);
    var _add_assoc_object_ex = Module2["_add_assoc_object_ex"] = (a0, a1, a2, a3) => (_add_assoc_object_ex = Module2["_add_assoc_object_ex"] = wasmExports["gC"])(a0, a1, a2, a3);
    var _add_assoc_reference_ex = Module2["_add_assoc_reference_ex"] = (a0, a1, a2, a3) => (_add_assoc_reference_ex = Module2["_add_assoc_reference_ex"] = wasmExports["hC"])(a0, a1, a2, a3);
    var _add_index_null = Module2["_add_index_null"] = (a0, a1) => (_add_index_null = Module2["_add_index_null"] = wasmExports["iC"])(a0, a1);
    var _add_index_bool = Module2["_add_index_bool"] = (a0, a1, a2) => (_add_index_bool = Module2["_add_index_bool"] = wasmExports["jC"])(a0, a1, a2);
    var _add_index_resource = Module2["_add_index_resource"] = (a0, a1, a2) => (_add_index_resource = Module2["_add_index_resource"] = wasmExports["kC"])(a0, a1, a2);
    var _add_index_array = Module2["_add_index_array"] = (a0, a1, a2) => (_add_index_array = Module2["_add_index_array"] = wasmExports["lC"])(a0, a1, a2);
    var _add_index_object = Module2["_add_index_object"] = (a0, a1, a2) => (_add_index_object = Module2["_add_index_object"] = wasmExports["mC"])(a0, a1, a2);
    var _add_index_reference = Module2["_add_index_reference"] = (a0, a1, a2) => (_add_index_reference = Module2["_add_index_reference"] = wasmExports["nC"])(a0, a1, a2);
    var _add_next_index_bool = Module2["_add_next_index_bool"] = (a0, a1) => (_add_next_index_bool = Module2["_add_next_index_bool"] = wasmExports["oC"])(a0, a1);
    var _add_next_index_double = Module2["_add_next_index_double"] = (a0, a1) => (_add_next_index_double = Module2["_add_next_index_double"] = wasmExports["pC"])(a0, a1);
    var _add_next_index_array = Module2["_add_next_index_array"] = (a0, a1) => (_add_next_index_array = Module2["_add_next_index_array"] = wasmExports["qC"])(a0, a1);
    var _add_next_index_reference = Module2["_add_next_index_reference"] = (a0, a1) => (_add_next_index_reference = Module2["_add_next_index_reference"] = wasmExports["rC"])(a0, a1);
    var _add_property_long_ex = Module2["_add_property_long_ex"] = (a0, a1, a2, a3) => (_add_property_long_ex = Module2["_add_property_long_ex"] = wasmExports["sC"])(a0, a1, a2, a3);
    var _add_property_bool_ex = Module2["_add_property_bool_ex"] = (a0, a1, a2, a3) => (_add_property_bool_ex = Module2["_add_property_bool_ex"] = wasmExports["tC"])(a0, a1, a2, a3);
    var _add_property_double_ex = Module2["_add_property_double_ex"] = (a0, a1, a2, a3) => (_add_property_double_ex = Module2["_add_property_double_ex"] = wasmExports["uC"])(a0, a1, a2, a3);
    var _add_property_str_ex = Module2["_add_property_str_ex"] = (a0, a1, a2, a3) => (_add_property_str_ex = Module2["_add_property_str_ex"] = wasmExports["vC"])(a0, a1, a2, a3);
    var _add_property_stringl_ex = Module2["_add_property_stringl_ex"] = (a0, a1, a2, a3, a4) => (_add_property_stringl_ex = Module2["_add_property_stringl_ex"] = wasmExports["wC"])(a0, a1, a2, a3, a4);
    var _add_property_array_ex = Module2["_add_property_array_ex"] = (a0, a1, a2, a3) => (_add_property_array_ex = Module2["_add_property_array_ex"] = wasmExports["xC"])(a0, a1, a2, a3);
    var _add_property_object_ex = Module2["_add_property_object_ex"] = (a0, a1, a2, a3) => (_add_property_object_ex = Module2["_add_property_object_ex"] = wasmExports["yC"])(a0, a1, a2, a3);
    var _add_property_reference_ex = Module2["_add_property_reference_ex"] = (a0, a1, a2, a3) => (_add_property_reference_ex = Module2["_add_property_reference_ex"] = wasmExports["zC"])(a0, a1, a2, a3);
    var _zend_destroy_modules = Module2["_zend_destroy_modules"] = () => (_zend_destroy_modules = Module2["_zend_destroy_modules"] = wasmExports["AC"])();
    var _zend_hash_graceful_reverse_destroy = Module2["_zend_hash_graceful_reverse_destroy"] = (a0) => (_zend_hash_graceful_reverse_destroy = Module2["_zend_hash_graceful_reverse_destroy"] = wasmExports["BC"])(a0);
    var _zend_next_free_module = Module2["_zend_next_free_module"] = () => (_zend_next_free_module = Module2["_zend_next_free_module"] = wasmExports["CC"])();
    var _zend_internal_run_time_cache_reserved_size = Module2["_zend_internal_run_time_cache_reserved_size"] = () => (_zend_internal_run_time_cache_reserved_size = Module2["_zend_internal_run_time_cache_reserved_size"] = wasmExports["DC"])();
    var _zend_set_function_arg_flags = Module2["_zend_set_function_arg_flags"] = (a0) => (_zend_set_function_arg_flags = Module2["_zend_set_function_arg_flags"] = wasmExports["EC"])(a0);
    var _zend_unregister_functions = Module2["_zend_unregister_functions"] = (a0, a1, a2) => (_zend_unregister_functions = Module2["_zend_unregister_functions"] = wasmExports["FC"])(a0, a1, a2);
    var _zend_alloc_ce_cache = Module2["_zend_alloc_ce_cache"] = (a0) => (_zend_alloc_ce_cache = Module2["_zend_alloc_ce_cache"] = wasmExports["GC"])(a0);
    var _zend_check_magic_method_implementation = Module2["_zend_check_magic_method_implementation"] = (a0, a1, a2, a3) => (_zend_check_magic_method_implementation = Module2["_zend_check_magic_method_implementation"] = wasmExports["HC"])(a0, a1, a2, a3);
    var _zend_add_magic_method = Module2["_zend_add_magic_method"] = (a0, a1, a2) => (_zend_add_magic_method = Module2["_zend_add_magic_method"] = wasmExports["IC"])(a0, a1, a2);
    var _zend_startup_module = Module2["_zend_startup_module"] = (a0) => (_zend_startup_module = Module2["_zend_startup_module"] = wasmExports["JC"])(a0);
    var _zend_get_module_started = Module2["_zend_get_module_started"] = (a0) => (_zend_get_module_started = Module2["_zend_get_module_started"] = wasmExports["KC"])(a0);
    var _zend_register_internal_class_ex = Module2["_zend_register_internal_class_ex"] = (a0, a1) => (_zend_register_internal_class_ex = Module2["_zend_register_internal_class_ex"] = wasmExports["LC"])(a0, a1);
    var _zend_do_inheritance_ex = Module2["_zend_do_inheritance_ex"] = (a0, a1, a2) => (_zend_do_inheritance_ex = Module2["_zend_do_inheritance_ex"] = wasmExports["MC"])(a0, a1, a2);
    var _zend_initialize_class_data = Module2["_zend_initialize_class_data"] = (a0, a1) => (_zend_initialize_class_data = Module2["_zend_initialize_class_data"] = wasmExports["NC"])(a0, a1);
    var _zend_do_implement_interface = Module2["_zend_do_implement_interface"] = (a0, a1) => (_zend_do_implement_interface = Module2["_zend_do_implement_interface"] = wasmExports["OC"])(a0, a1);
    var _zend_class_implements_interface = Module2["_zend_class_implements_interface"] = (a0, a1) => (_zend_class_implements_interface = Module2["_zend_class_implements_interface"] = wasmExports["PC"])(a0, a1);
    var _zend_register_internal_class = Module2["_zend_register_internal_class"] = (a0) => (_zend_register_internal_class = Module2["_zend_register_internal_class"] = wasmExports["QC"])(a0);
    var _zend_register_class_alias_ex = Module2["_zend_register_class_alias_ex"] = (a0, a1, a2, a3) => (_zend_register_class_alias_ex = Module2["_zend_register_class_alias_ex"] = wasmExports["RC"])(a0, a1, a2, a3);
    var __zend_observer_class_linked_notify = Module2["__zend_observer_class_linked_notify"] = (a0, a1) => (__zend_observer_class_linked_notify = Module2["__zend_observer_class_linked_notify"] = wasmExports["SC"])(a0, a1);
    var _zend_set_hash_symbol = Module2["_zend_set_hash_symbol"] = (a0, a1, a2, a3, a4, a5) => (_zend_set_hash_symbol = Module2["_zend_set_hash_symbol"] = wasmExports["TC"])(a0, a1, a2, a3, a4, a5);
    var _zend_type_release = Module2["_zend_type_release"] = (a0, a1) => (_zend_type_release = Module2["_zend_type_release"] = wasmExports["UC"])(a0, a1);
    var _zend_get_callable_name_ex = Module2["_zend_get_callable_name_ex"] = (a0, a1) => (_zend_get_callable_name_ex = Module2["_zend_get_callable_name_ex"] = wasmExports["VC"])(a0, a1);
    var _zend_get_callable_name = Module2["_zend_get_callable_name"] = (a0) => (_zend_get_callable_name = Module2["_zend_get_callable_name"] = wasmExports["WC"])(a0);
    var _zend_check_protected = Module2["_zend_check_protected"] = (a0, a1) => (_zend_check_protected = Module2["_zend_check_protected"] = wasmExports["XC"])(a0, a1);
    var _zend_get_call_trampoline_func = Module2["_zend_get_call_trampoline_func"] = (a0, a1, a2) => (_zend_get_call_trampoline_func = Module2["_zend_get_call_trampoline_func"] = wasmExports["YC"])(a0, a1, a2);
    var _zend_std_get_static_method = Module2["_zend_std_get_static_method"] = (a0, a1, a2) => (_zend_std_get_static_method = Module2["_zend_std_get_static_method"] = wasmExports["ZC"])(a0, a1, a2);
    var _zend_is_callable = Module2["_zend_is_callable"] = (a0, a1, a2) => (_zend_is_callable = Module2["_zend_is_callable"] = wasmExports["_C"])(a0, a1, a2);
    var _zend_make_callable = Module2["_zend_make_callable"] = (a0, a1) => (_zend_make_callable = Module2["_zend_make_callable"] = wasmExports["$C"])(a0, a1);
    var _zend_fcall_info_args_save = Module2["_zend_fcall_info_args_save"] = (a0, a1, a2) => (_zend_fcall_info_args_save = Module2["_zend_fcall_info_args_save"] = wasmExports["aD"])(a0, a1, a2);
    var _zend_fcall_info_args_restore = Module2["_zend_fcall_info_args_restore"] = (a0, a1, a2) => (_zend_fcall_info_args_restore = Module2["_zend_fcall_info_args_restore"] = wasmExports["bD"])(a0, a1, a2);
    var _zend_fcall_info_args_ex = Module2["_zend_fcall_info_args_ex"] = (a0, a1, a2) => (_zend_fcall_info_args_ex = Module2["_zend_fcall_info_args_ex"] = wasmExports["cD"])(a0, a1, a2);
    var _zend_fcall_info_args = Module2["_zend_fcall_info_args"] = (a0, a1) => (_zend_fcall_info_args = Module2["_zend_fcall_info_args"] = wasmExports["dD"])(a0, a1);
    var _zend_fcall_info_argv = Module2["_zend_fcall_info_argv"] = (a0, a1, a2) => (_zend_fcall_info_argv = Module2["_zend_fcall_info_argv"] = wasmExports["eD"])(a0, a1, a2);
    var _zend_fcall_info_argn = Module2["_zend_fcall_info_argn"] = (a0, a1, a2) => (_zend_fcall_info_argn = Module2["_zend_fcall_info_argn"] = wasmExports["fD"])(a0, a1, a2);
    var _zend_fcall_info_call = Module2["_zend_fcall_info_call"] = (a0, a1, a2, a3) => (_zend_fcall_info_call = Module2["_zend_fcall_info_call"] = wasmExports["gD"])(a0, a1, a2, a3);
    var _zend_map_ptr_new = Module2["_zend_map_ptr_new"] = () => (_zend_map_ptr_new = Module2["_zend_map_ptr_new"] = wasmExports["hD"])();
    var _zend_try_assign_typed_ref_ex = Module2["_zend_try_assign_typed_ref_ex"] = (a0, a1, a2) => (_zend_try_assign_typed_ref_ex = Module2["_zend_try_assign_typed_ref_ex"] = wasmExports["iD"])(a0, a1, a2);
    var _zend_try_assign_typed_ref_bool = Module2["_zend_try_assign_typed_ref_bool"] = (a0, a1) => (_zend_try_assign_typed_ref_bool = Module2["_zend_try_assign_typed_ref_bool"] = wasmExports["jD"])(a0, a1);
    var _zend_try_assign_typed_ref_res = Module2["_zend_try_assign_typed_ref_res"] = (a0, a1) => (_zend_try_assign_typed_ref_res = Module2["_zend_try_assign_typed_ref_res"] = wasmExports["kD"])(a0, a1);
    var _zend_try_assign_typed_ref_zval = Module2["_zend_try_assign_typed_ref_zval"] = (a0, a1) => (_zend_try_assign_typed_ref_zval = Module2["_zend_try_assign_typed_ref_zval"] = wasmExports["lD"])(a0, a1);
    var _zend_declare_property_ex = Module2["_zend_declare_property_ex"] = (a0, a1, a2, a3, a4) => (_zend_declare_property_ex = Module2["_zend_declare_property_ex"] = wasmExports["mD"])(a0, a1, a2, a3, a4);
    var _zend_declare_property = Module2["_zend_declare_property"] = (a0, a1, a2, a3, a4) => (_zend_declare_property = Module2["_zend_declare_property"] = wasmExports["nD"])(a0, a1, a2, a3, a4);
    var _zend_declare_property_null = Module2["_zend_declare_property_null"] = (a0, a1, a2, a3) => (_zend_declare_property_null = Module2["_zend_declare_property_null"] = wasmExports["oD"])(a0, a1, a2, a3);
    var _zend_declare_property_bool = Module2["_zend_declare_property_bool"] = (a0, a1, a2, a3, a4) => (_zend_declare_property_bool = Module2["_zend_declare_property_bool"] = wasmExports["pD"])(a0, a1, a2, a3, a4);
    var _zend_declare_property_long = Module2["_zend_declare_property_long"] = (a0, a1, a2, a3, a4) => (_zend_declare_property_long = Module2["_zend_declare_property_long"] = wasmExports["qD"])(a0, a1, a2, a3, a4);
    var _zend_declare_property_double = Module2["_zend_declare_property_double"] = (a0, a1, a2, a3, a4) => (_zend_declare_property_double = Module2["_zend_declare_property_double"] = wasmExports["rD"])(a0, a1, a2, a3, a4);
    var _zend_declare_property_string = Module2["_zend_declare_property_string"] = (a0, a1, a2, a3, a4) => (_zend_declare_property_string = Module2["_zend_declare_property_string"] = wasmExports["sD"])(a0, a1, a2, a3, a4);
    var _zend_declare_property_stringl = Module2["_zend_declare_property_stringl"] = (a0, a1, a2, a3, a4, a5) => (_zend_declare_property_stringl = Module2["_zend_declare_property_stringl"] = wasmExports["tD"])(a0, a1, a2, a3, a4, a5);
    var _zend_declare_class_constant_ex = Module2["_zend_declare_class_constant_ex"] = (a0, a1, a2, a3, a4) => (_zend_declare_class_constant_ex = Module2["_zend_declare_class_constant_ex"] = wasmExports["uD"])(a0, a1, a2, a3, a4);
    var _zend_declare_class_constant = Module2["_zend_declare_class_constant"] = (a0, a1, a2, a3) => (_zend_declare_class_constant = Module2["_zend_declare_class_constant"] = wasmExports["vD"])(a0, a1, a2, a3);
    var _zend_declare_class_constant_null = Module2["_zend_declare_class_constant_null"] = (a0, a1, a2) => (_zend_declare_class_constant_null = Module2["_zend_declare_class_constant_null"] = wasmExports["wD"])(a0, a1, a2);
    var _zend_declare_class_constant_long = Module2["_zend_declare_class_constant_long"] = (a0, a1, a2, a3) => (_zend_declare_class_constant_long = Module2["_zend_declare_class_constant_long"] = wasmExports["xD"])(a0, a1, a2, a3);
    var _zend_declare_class_constant_bool = Module2["_zend_declare_class_constant_bool"] = (a0, a1, a2, a3) => (_zend_declare_class_constant_bool = Module2["_zend_declare_class_constant_bool"] = wasmExports["yD"])(a0, a1, a2, a3);
    var _zend_declare_class_constant_double = Module2["_zend_declare_class_constant_double"] = (a0, a1, a2, a3) => (_zend_declare_class_constant_double = Module2["_zend_declare_class_constant_double"] = wasmExports["zD"])(a0, a1, a2, a3);
    var _zend_declare_class_constant_stringl = Module2["_zend_declare_class_constant_stringl"] = (a0, a1, a2, a3, a4) => (_zend_declare_class_constant_stringl = Module2["_zend_declare_class_constant_stringl"] = wasmExports["AD"])(a0, a1, a2, a3, a4);
    var _zend_declare_class_constant_string = Module2["_zend_declare_class_constant_string"] = (a0, a1, a2, a3) => (_zend_declare_class_constant_string = Module2["_zend_declare_class_constant_string"] = wasmExports["BD"])(a0, a1, a2, a3);
    var _zend_update_property_null = Module2["_zend_update_property_null"] = (a0, a1, a2, a3) => (_zend_update_property_null = Module2["_zend_update_property_null"] = wasmExports["CD"])(a0, a1, a2, a3);
    var _zend_unset_property = Module2["_zend_unset_property"] = (a0, a1, a2, a3) => (_zend_unset_property = Module2["_zend_unset_property"] = wasmExports["DD"])(a0, a1, a2, a3);
    var _zend_update_property_bool = Module2["_zend_update_property_bool"] = (a0, a1, a2, a3, a4) => (_zend_update_property_bool = Module2["_zend_update_property_bool"] = wasmExports["ED"])(a0, a1, a2, a3, a4);
    var _zend_update_property_double = Module2["_zend_update_property_double"] = (a0, a1, a2, a3, a4) => (_zend_update_property_double = Module2["_zend_update_property_double"] = wasmExports["FD"])(a0, a1, a2, a3, a4);
    var _zend_update_property_str = Module2["_zend_update_property_str"] = (a0, a1, a2, a3, a4) => (_zend_update_property_str = Module2["_zend_update_property_str"] = wasmExports["GD"])(a0, a1, a2, a3, a4);
    var _zend_update_property_string = Module2["_zend_update_property_string"] = (a0, a1, a2, a3, a4) => (_zend_update_property_string = Module2["_zend_update_property_string"] = wasmExports["HD"])(a0, a1, a2, a3, a4);
    var _zend_assign_to_typed_ref = Module2["_zend_assign_to_typed_ref"] = (a0, a1, a2, a3) => (_zend_assign_to_typed_ref = Module2["_zend_assign_to_typed_ref"] = wasmExports["ID"])(a0, a1, a2, a3);
    var _zend_update_static_property = Module2["_zend_update_static_property"] = (a0, a1, a2, a3) => (_zend_update_static_property = Module2["_zend_update_static_property"] = wasmExports["JD"])(a0, a1, a2, a3);
    var _zend_update_static_property_null = Module2["_zend_update_static_property_null"] = (a0, a1, a2) => (_zend_update_static_property_null = Module2["_zend_update_static_property_null"] = wasmExports["KD"])(a0, a1, a2);
    var _zend_update_static_property_bool = Module2["_zend_update_static_property_bool"] = (a0, a1, a2, a3) => (_zend_update_static_property_bool = Module2["_zend_update_static_property_bool"] = wasmExports["LD"])(a0, a1, a2, a3);
    var _zend_update_static_property_long = Module2["_zend_update_static_property_long"] = (a0, a1, a2, a3) => (_zend_update_static_property_long = Module2["_zend_update_static_property_long"] = wasmExports["MD"])(a0, a1, a2, a3);
    var _zend_update_static_property_double = Module2["_zend_update_static_property_double"] = (a0, a1, a2, a3) => (_zend_update_static_property_double = Module2["_zend_update_static_property_double"] = wasmExports["ND"])(a0, a1, a2, a3);
    var _zend_update_static_property_string = Module2["_zend_update_static_property_string"] = (a0, a1, a2, a3) => (_zend_update_static_property_string = Module2["_zend_update_static_property_string"] = wasmExports["OD"])(a0, a1, a2, a3);
    var _zend_update_static_property_stringl = Module2["_zend_update_static_property_stringl"] = (a0, a1, a2, a3, a4) => (_zend_update_static_property_stringl = Module2["_zend_update_static_property_stringl"] = wasmExports["PD"])(a0, a1, a2, a3, a4);
    var _zend_read_static_property = Module2["_zend_read_static_property"] = (a0, a1, a2, a3) => (_zend_read_static_property = Module2["_zend_read_static_property"] = wasmExports["QD"])(a0, a1, a2, a3);
    var _zend_save_error_handling = Module2["_zend_save_error_handling"] = (a0) => (_zend_save_error_handling = Module2["_zend_save_error_handling"] = wasmExports["RD"])(a0);
    var _zend_get_object_type_case = Module2["_zend_get_object_type_case"] = (a0, a1) => (_zend_get_object_type_case = Module2["_zend_get_object_type_case"] = wasmExports["SD"])(a0, a1);
    var _zend_compile_string_to_ast = Module2["_zend_compile_string_to_ast"] = (a0, a1, a2) => (_zend_compile_string_to_ast = Module2["_zend_compile_string_to_ast"] = wasmExports["TD"])(a0, a1, a2);
    var _zend_ast_destroy = Module2["_zend_ast_destroy"] = (a0) => (_zend_ast_destroy = Module2["_zend_ast_destroy"] = wasmExports["UD"])(a0);
    var _zend_ast_create_znode = Module2["_zend_ast_create_znode"] = (a0) => (_zend_ast_create_znode = Module2["_zend_ast_create_znode"] = wasmExports["VD"])(a0);
    var _zend_ast_create_zval_with_lineno = Module2["_zend_ast_create_zval_with_lineno"] = (a0, a1) => (_zend_ast_create_zval_with_lineno = Module2["_zend_ast_create_zval_with_lineno"] = wasmExports["WD"])(a0, a1);
    var _zend_ast_create_zval_ex = Module2["_zend_ast_create_zval_ex"] = (a0, a1) => (_zend_ast_create_zval_ex = Module2["_zend_ast_create_zval_ex"] = wasmExports["XD"])(a0, a1);
    var _zend_ast_create_zval = Module2["_zend_ast_create_zval"] = (a0) => (_zend_ast_create_zval = Module2["_zend_ast_create_zval"] = wasmExports["YD"])(a0);
    var _zend_ast_create_zval_from_str = Module2["_zend_ast_create_zval_from_str"] = (a0) => (_zend_ast_create_zval_from_str = Module2["_zend_ast_create_zval_from_str"] = wasmExports["ZD"])(a0);
    var _zend_ast_create_zval_from_long = Module2["_zend_ast_create_zval_from_long"] = (a0) => (_zend_ast_create_zval_from_long = Module2["_zend_ast_create_zval_from_long"] = wasmExports["_D"])(a0);
    var _zend_ast_create_constant = Module2["_zend_ast_create_constant"] = (a0, a1) => (_zend_ast_create_constant = Module2["_zend_ast_create_constant"] = wasmExports["$D"])(a0, a1);
    var _zend_ast_create_class_const_or_name = Module2["_zend_ast_create_class_const_or_name"] = (a0, a1) => (_zend_ast_create_class_const_or_name = Module2["_zend_ast_create_class_const_or_name"] = wasmExports["aE"])(a0, a1);
    var _zend_ast_create_1 = Module2["_zend_ast_create_1"] = (a0, a1) => (_zend_ast_create_1 = Module2["_zend_ast_create_1"] = wasmExports["bE"])(a0, a1);
    var _zend_ast_create_2 = Module2["_zend_ast_create_2"] = (a0, a1, a2) => (_zend_ast_create_2 = Module2["_zend_ast_create_2"] = wasmExports["cE"])(a0, a1, a2);
    var _zend_ast_create_decl = Module2["_zend_ast_create_decl"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) => (_zend_ast_create_decl = Module2["_zend_ast_create_decl"] = wasmExports["dE"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
    var _zend_ast_create_0 = Module2["_zend_ast_create_0"] = (a0) => (_zend_ast_create_0 = Module2["_zend_ast_create_0"] = wasmExports["eE"])(a0);
    var _zend_ast_create_3 = Module2["_zend_ast_create_3"] = (a0, a1, a2, a3) => (_zend_ast_create_3 = Module2["_zend_ast_create_3"] = wasmExports["fE"])(a0, a1, a2, a3);
    var _zend_ast_create_4 = Module2["_zend_ast_create_4"] = (a0, a1, a2, a3, a4) => (_zend_ast_create_4 = Module2["_zend_ast_create_4"] = wasmExports["gE"])(a0, a1, a2, a3, a4);
    var _zend_ast_create_5 = Module2["_zend_ast_create_5"] = (a0, a1, a2, a3, a4, a5) => (_zend_ast_create_5 = Module2["_zend_ast_create_5"] = wasmExports["hE"])(a0, a1, a2, a3, a4, a5);
    var _zend_ast_create_va = Module2["_zend_ast_create_va"] = (a0, a1, a2) => (_zend_ast_create_va = Module2["_zend_ast_create_va"] = wasmExports["iE"])(a0, a1, a2);
    var _zend_ast_create_n = Module2["_zend_ast_create_n"] = (a0, a1) => (_zend_ast_create_n = Module2["_zend_ast_create_n"] = wasmExports["jE"])(a0, a1);
    var _zend_ast_create_ex_n = Module2["_zend_ast_create_ex_n"] = (a0, a1, a2) => (_zend_ast_create_ex_n = Module2["_zend_ast_create_ex_n"] = wasmExports["kE"])(a0, a1, a2);
    var _zend_ast_create_list_0 = Module2["_zend_ast_create_list_0"] = (a0) => (_zend_ast_create_list_0 = Module2["_zend_ast_create_list_0"] = wasmExports["lE"])(a0);
    var _zend_ast_create_list_1 = Module2["_zend_ast_create_list_1"] = (a0, a1) => (_zend_ast_create_list_1 = Module2["_zend_ast_create_list_1"] = wasmExports["mE"])(a0, a1);
    var _zend_ast_create_list_2 = Module2["_zend_ast_create_list_2"] = (a0, a1, a2) => (_zend_ast_create_list_2 = Module2["_zend_ast_create_list_2"] = wasmExports["nE"])(a0, a1, a2);
    var _concat_function = Module2["_concat_function"] = (a0, a1, a2) => (_concat_function = Module2["_concat_function"] = wasmExports["oE"])(a0, a1, a2);
    var _zend_ast_list_add = Module2["_zend_ast_list_add"] = (a0, a1) => (_zend_ast_list_add = Module2["_zend_ast_list_add"] = wasmExports["pE"])(a0, a1);
    var _zend_ast_evaluate_ex = Module2["_zend_ast_evaluate_ex"] = (a0, a1, a2, a3, a4) => (_zend_ast_evaluate_ex = Module2["_zend_ast_evaluate_ex"] = wasmExports["qE"])(a0, a1, a2, a3, a4);
    var _zend_ast_evaluate_inner = Module2["_zend_ast_evaluate_inner"] = (a0, a1, a2, a3, a4) => (_zend_ast_evaluate_inner = Module2["_zend_ast_evaluate_inner"] = wasmExports["rE"])(a0, a1, a2, a3, a4);
    var _is_smaller_function = Module2["_is_smaller_function"] = (a0, a1, a2) => (_is_smaller_function = Module2["_is_smaller_function"] = wasmExports["sE"])(a0, a1, a2);
    var _is_smaller_or_equal_function = Module2["_is_smaller_or_equal_function"] = (a0, a1, a2) => (_is_smaller_or_equal_function = Module2["_is_smaller_or_equal_function"] = wasmExports["tE"])(a0, a1, a2);
    var _zend_fetch_class_with_scope = Module2["_zend_fetch_class_with_scope"] = (a0, a1, a2) => (_zend_fetch_class_with_scope = Module2["_zend_fetch_class_with_scope"] = wasmExports["uE"])(a0, a1, a2);
    var _zend_invalid_class_constant_type_error = Module2["_zend_invalid_class_constant_type_error"] = (a0) => (_zend_invalid_class_constant_type_error = Module2["_zend_invalid_class_constant_type_error"] = wasmExports["vE"])(a0);
    var _zend_get_class_constant_ex = Module2["_zend_get_class_constant_ex"] = (a0, a1, a2, a3) => (_zend_get_class_constant_ex = Module2["_zend_get_class_constant_ex"] = wasmExports["wE"])(a0, a1, a2, a3);
    var _zend_fetch_dimension_const = Module2["_zend_fetch_dimension_const"] = (a0, a1, a2, a3) => (_zend_fetch_dimension_const = Module2["_zend_fetch_dimension_const"] = wasmExports["xE"])(a0, a1, a2, a3);
    var _zend_ast_evaluate = Module2["_zend_ast_evaluate"] = (a0, a1, a2) => (_zend_ast_evaluate = Module2["_zend_ast_evaluate"] = wasmExports["yE"])(a0, a1, a2);
    var _zend_ast_copy = Module2["_zend_ast_copy"] = (a0) => (_zend_ast_copy = Module2["_zend_ast_copy"] = wasmExports["zE"])(a0);
    var _zend_ast_ref_destroy = Module2["_zend_ast_ref_destroy"] = (a0) => (_zend_ast_ref_destroy = Module2["_zend_ast_ref_destroy"] = wasmExports["AE"])(a0);
    var _zend_ast_apply = Module2["_zend_ast_apply"] = (a0, a1, a2) => (_zend_ast_apply = Module2["_zend_ast_apply"] = wasmExports["BE"])(a0, a1, a2);
    var _zend_atomic_bool_init = Module2["_zend_atomic_bool_init"] = (a0, a1) => (_zend_atomic_bool_init = Module2["_zend_atomic_bool_init"] = wasmExports["CE"])(a0, a1);
    var _zend_atomic_int_init = Module2["_zend_atomic_int_init"] = (a0, a1) => (_zend_atomic_int_init = Module2["_zend_atomic_int_init"] = wasmExports["DE"])(a0, a1);
    var _zend_atomic_bool_exchange = Module2["_zend_atomic_bool_exchange"] = (a0, a1) => (_zend_atomic_bool_exchange = Module2["_zend_atomic_bool_exchange"] = wasmExports["EE"])(a0, a1);
    var _zend_atomic_bool_compare_exchange = Module2["_zend_atomic_bool_compare_exchange"] = (a0, a1, a2) => (_zend_atomic_bool_compare_exchange = Module2["_zend_atomic_bool_compare_exchange"] = wasmExports["FE"])(a0, a1, a2);
    var _zend_atomic_int_compare_exchange = Module2["_zend_atomic_int_compare_exchange"] = (a0, a1, a2) => (_zend_atomic_int_compare_exchange = Module2["_zend_atomic_int_compare_exchange"] = wasmExports["GE"])(a0, a1, a2);
    var _zend_atomic_bool_store = Module2["_zend_atomic_bool_store"] = (a0, a1) => (_zend_atomic_bool_store = Module2["_zend_atomic_bool_store"] = wasmExports["HE"])(a0, a1);
    var _zend_atomic_int_store = Module2["_zend_atomic_int_store"] = (a0, a1) => (_zend_atomic_int_store = Module2["_zend_atomic_int_store"] = wasmExports["IE"])(a0, a1);
    var _zend_atomic_bool_load = Module2["_zend_atomic_bool_load"] = (a0) => (_zend_atomic_bool_load = Module2["_zend_atomic_bool_load"] = wasmExports["JE"])(a0);
    var _zend_atomic_int_load = Module2["_zend_atomic_int_load"] = (a0) => (_zend_atomic_int_load = Module2["_zend_atomic_int_load"] = wasmExports["KE"])(a0);
    var _zend_get_attribute = Module2["_zend_get_attribute"] = (a0, a1) => (_zend_get_attribute = Module2["_zend_get_attribute"] = wasmExports["LE"])(a0, a1);
    var _zend_get_parameter_attribute = Module2["_zend_get_parameter_attribute"] = (a0, a1, a2) => (_zend_get_parameter_attribute = Module2["_zend_get_parameter_attribute"] = wasmExports["ME"])(a0, a1, a2);
    var _zend_get_parameter_attribute_str = Module2["_zend_get_parameter_attribute_str"] = (a0, a1, a2, a3) => (_zend_get_parameter_attribute_str = Module2["_zend_get_parameter_attribute_str"] = wasmExports["NE"])(a0, a1, a2, a3);
    var _zend_vm_stack_extend = Module2["_zend_vm_stack_extend"] = (a0) => (_zend_vm_stack_extend = Module2["_zend_vm_stack_extend"] = wasmExports["OE"])(a0);
    var _zval_internal_ptr_dtor = Module2["_zval_internal_ptr_dtor"] = (a0) => (_zval_internal_ptr_dtor = Module2["_zval_internal_ptr_dtor"] = wasmExports["PE"])(a0);
    var _zend_mark_internal_attribute = Module2["_zend_mark_internal_attribute"] = (a0) => (_zend_mark_internal_attribute = Module2["_zend_mark_internal_attribute"] = wasmExports["QE"])(a0);
    var _zend_internal_attribute_register = Module2["_zend_internal_attribute_register"] = (a0, a1) => (_zend_internal_attribute_register = Module2["_zend_internal_attribute_register"] = wasmExports["RE"])(a0, a1);
    var _zend_internal_attribute_get = Module2["_zend_internal_attribute_get"] = (a0) => (_zend_internal_attribute_get = Module2["_zend_internal_attribute_get"] = wasmExports["SE"])(a0);
    var _zend_register_default_classes = Module2["_zend_register_default_classes"] = () => (_zend_register_default_classes = Module2["_zend_register_default_classes"] = wasmExports["TE"])();
    var _gc_enabled = Module2["_gc_enabled"] = () => (_gc_enabled = Module2["_gc_enabled"] = wasmExports["UE"])();
    var _zend_gc_get_status = Module2["_zend_gc_get_status"] = (a0) => (_zend_gc_get_status = Module2["_zend_gc_get_status"] = wasmExports["VE"])(a0);
    var _zend_register_constant = Module2["_zend_register_constant"] = (a0) => (_zend_register_constant = Module2["_zend_register_constant"] = wasmExports["WE"])(a0);
    var _zend_error_zstr_at = Module2["_zend_error_zstr_at"] = (a0, a1, a2, a3) => (_zend_error_zstr_at = Module2["_zend_error_zstr_at"] = wasmExports["XE"])(a0, a1, a2, a3);
    var _zend_stack_is_empty = Module2["_zend_stack_is_empty"] = (a0) => (_zend_stack_is_empty = Module2["_zend_stack_is_empty"] = wasmExports["YE"])(a0);
    var _zend_stack_int_top = Module2["_zend_stack_int_top"] = (a0) => (_zend_stack_int_top = Module2["_zend_stack_int_top"] = wasmExports["ZE"])(a0);
    var _zend_fetch_list_dtor_id = Module2["_zend_fetch_list_dtor_id"] = (a0) => (_zend_fetch_list_dtor_id = Module2["_zend_fetch_list_dtor_id"] = wasmExports["_E"])(a0);
    var _zend_trace_to_string = Module2["_zend_trace_to_string"] = (a0, a1) => (_zend_trace_to_string = Module2["_zend_trace_to_string"] = wasmExports["$E"])(a0, a1);
    var _zend_generator_check_placeholder_frame = Module2["_zend_generator_check_placeholder_frame"] = (a0) => (_zend_generator_check_placeholder_frame = Module2["_zend_generator_check_placeholder_frame"] = wasmExports["aF"])(a0);
    var _zend_get_zval_ptr = Module2["_zend_get_zval_ptr"] = (a0, a1, a2, a3) => (_zend_get_zval_ptr = Module2["_zend_get_zval_ptr"] = wasmExports["bF"])(a0, a1, a2, a3);
    var _zend_std_get_class_name = Module2["_zend_std_get_class_name"] = (a0) => (_zend_std_get_class_name = Module2["_zend_std_get_class_name"] = wasmExports["cF"])(a0);
    var _zend_create_closure = Module2["_zend_create_closure"] = (a0, a1, a2, a3, a4) => (_zend_create_closure = Module2["_zend_create_closure"] = wasmExports["dF"])(a0, a1, a2, a3, a4);
    var _zend_destroy_static_vars = Module2["_zend_destroy_static_vars"] = (a0) => (_zend_destroy_static_vars = Module2["_zend_destroy_static_vars"] = wasmExports["eF"])(a0);
    var _zend_init_rsrc_list = Module2["_zend_init_rsrc_list"] = () => (_zend_init_rsrc_list = Module2["_zend_init_rsrc_list"] = wasmExports["fF"])();
    var _zend_restore_compiled_filename = Module2["_zend_restore_compiled_filename"] = (a0) => (_zend_restore_compiled_filename = Module2["_zend_restore_compiled_filename"] = wasmExports["gF"])(a0);
    var _zend_set_compiled_filename = Module2["_zend_set_compiled_filename"] = (a0) => (_zend_set_compiled_filename = Module2["_zend_set_compiled_filename"] = wasmExports["hF"])(a0);
    var _function_add_ref = Module2["_function_add_ref"] = (a0) => (_function_add_ref = Module2["_function_add_ref"] = wasmExports["iF"])(a0);
    var _do_bind_function = Module2["_do_bind_function"] = (a0, a1) => (_do_bind_function = Module2["_do_bind_function"] = wasmExports["jF"])(a0, a1);
    var __zend_observer_function_declared_notify = Module2["__zend_observer_function_declared_notify"] = (a0, a1) => (__zend_observer_function_declared_notify = Module2["__zend_observer_function_declared_notify"] = wasmExports["kF"])(a0, a1);
    var _zend_bind_class_in_slot = Module2["_zend_bind_class_in_slot"] = (a0, a1, a2) => (_zend_bind_class_in_slot = Module2["_zend_bind_class_in_slot"] = wasmExports["lF"])(a0, a1, a2);
    var _zend_hash_set_bucket_key = Module2["_zend_hash_set_bucket_key"] = (a0, a1, a2) => (_zend_hash_set_bucket_key = Module2["_zend_hash_set_bucket_key"] = wasmExports["mF"])(a0, a1, a2);
    var _zend_do_link_class = Module2["_zend_do_link_class"] = (a0, a1, a2) => (_zend_do_link_class = Module2["_zend_do_link_class"] = wasmExports["nF"])(a0, a1, a2);
    var _do_bind_class = Module2["_do_bind_class"] = (a0, a1) => (_do_bind_class = Module2["_do_bind_class"] = wasmExports["oF"])(a0, a1);
    var _zend_is_auto_global_str = Module2["_zend_is_auto_global_str"] = (a0, a1) => (_zend_is_auto_global_str = Module2["_zend_is_auto_global_str"] = wasmExports["pF"])(a0, a1);
    var _lex_scan = Module2["_lex_scan"] = (a0, a1) => (_lex_scan = Module2["_lex_scan"] = wasmExports["qF"])(a0, a1);
    var _zend_function_dtor = Module2["_zend_function_dtor"] = (a0) => (_zend_function_dtor = Module2["_zend_function_dtor"] = wasmExports["rF"])(a0);
    var _zend_get_compiled_variable_name = Module2["_zend_get_compiled_variable_name"] = (a0, a1) => (_zend_get_compiled_variable_name = Module2["_zend_get_compiled_variable_name"] = wasmExports["sF"])(a0, a1);
    var _zend_is_smart_branch = Module2["_zend_is_smart_branch"] = (a0) => (_zend_is_smart_branch = Module2["_zend_is_smart_branch"] = wasmExports["tF"])(a0);
    var _execute_ex = Module2["_execute_ex"] = (a0) => (_execute_ex = Module2["_execute_ex"] = wasmExports["uF"])(a0);
    var _zend_multibyte_fetch_encoding = Module2["_zend_multibyte_fetch_encoding"] = (a0) => (_zend_multibyte_fetch_encoding = Module2["_zend_multibyte_fetch_encoding"] = wasmExports["vF"])(a0);
    var _zend_multibyte_set_filter = Module2["_zend_multibyte_set_filter"] = (a0) => (_zend_multibyte_set_filter = Module2["_zend_multibyte_set_filter"] = wasmExports["wF"])(a0);
    var _zend_multibyte_yyinput_again = Module2["_zend_multibyte_yyinput_again"] = (a0, a1) => (_zend_multibyte_yyinput_again = Module2["_zend_multibyte_yyinput_again"] = wasmExports["xF"])(a0, a1);
    var _zend_is_op_long_compatible = Module2["_zend_is_op_long_compatible"] = (a0) => (_zend_is_op_long_compatible = Module2["_zend_is_op_long_compatible"] = wasmExports["yF"])(a0);
    var _zend_hash_find_ptr_lc = Module2["_zend_hash_find_ptr_lc"] = (a0, a1) => (_zend_hash_find_ptr_lc = Module2["_zend_hash_find_ptr_lc"] = wasmExports["zF"])(a0, a1);
    var _zend_try_early_bind = Module2["_zend_try_early_bind"] = (a0, a1, a2, a3) => (_zend_try_early_bind = Module2["_zend_try_early_bind"] = wasmExports["AF"])(a0, a1, a2, a3);
    var _zend_hash_str_find_ptr_lc = Module2["_zend_hash_str_find_ptr_lc"] = (a0, a1, a2) => (_zend_hash_str_find_ptr_lc = Module2["_zend_hash_str_find_ptr_lc"] = wasmExports["BF"])(a0, a1, a2);
    var _init_op_array = Module2["_init_op_array"] = (a0, a1, a2) => (_init_op_array = Module2["_init_op_array"] = wasmExports["CF"])(a0, a1, a2);
    var _get_function_or_method_name = Module2["_get_function_or_method_name"] = (a0) => (_get_function_or_method_name = Module2["_get_function_or_method_name"] = wasmExports["DF"])(a0);
    var _zend_error_noreturn_unchecked = Module2["_zend_error_noreturn_unchecked"] = (a0, a1, a2) => (_zend_error_noreturn_unchecked = Module2["_zend_error_noreturn_unchecked"] = wasmExports["EF"])(a0, a1, a2);
    var _pass_two = Module2["_pass_two"] = (a0) => (_pass_two = Module2["_pass_two"] = wasmExports["FF"])(a0);
    var _zend_hooked_property_variance_error_ex = Module2["_zend_hooked_property_variance_error_ex"] = (a0, a1, a2) => (_zend_hooked_property_variance_error_ex = Module2["_zend_hooked_property_variance_error_ex"] = wasmExports["GF"])(a0, a1, a2);
    var _zend_verify_property_hook_variance = Module2["_zend_verify_property_hook_variance"] = (a0, a1) => (_zend_verify_property_hook_variance = Module2["_zend_verify_property_hook_variance"] = wasmExports["HF"])(a0, a1);
    var _zend_hooked_property_variance_error = Module2["_zend_hooked_property_variance_error"] = (a0) => (_zend_hooked_property_variance_error = Module2["_zend_hooked_property_variance_error"] = wasmExports["IF"])(a0);
    var _zend_hooked_object_get_iterator = Module2["_zend_hooked_object_get_iterator"] = (a0, a1, a2) => (_zend_hooked_object_get_iterator = Module2["_zend_hooked_object_get_iterator"] = wasmExports["JF"])(a0, a1, a2);
    var _zend_verify_hooked_property = Module2["_zend_verify_hooked_property"] = (a0, a1, a2) => (_zend_verify_hooked_property = Module2["_zend_verify_hooked_property"] = wasmExports["KF"])(a0, a1, a2);
    var _zend_register_null_constant = Module2["_zend_register_null_constant"] = (a0, a1, a2, a3) => (_zend_register_null_constant = Module2["_zend_register_null_constant"] = wasmExports["LF"])(a0, a1, a2, a3);
    var _zend_register_stringl_constant = Module2["_zend_register_stringl_constant"] = (a0, a1, a2, a3, a4, a5) => (_zend_register_stringl_constant = Module2["_zend_register_stringl_constant"] = wasmExports["MF"])(a0, a1, a2, a3, a4, a5);
    var _zend_verify_const_access = Module2["_zend_verify_const_access"] = (a0, a1) => (_zend_verify_const_access = Module2["_zend_verify_const_access"] = wasmExports["NF"])(a0, a1);
    var _zend_get_constant = Module2["_zend_get_constant"] = (a0) => (_zend_get_constant = Module2["_zend_get_constant"] = wasmExports["OF"])(a0);
    var _zend_fetch_class = Module2["_zend_fetch_class"] = (a0, a1) => (_zend_fetch_class = Module2["_zend_fetch_class"] = wasmExports["PF"])(a0, a1);
    var _zend_deprecated_class_constant = Module2["_zend_deprecated_class_constant"] = (a0, a1) => (_zend_deprecated_class_constant = Module2["_zend_deprecated_class_constant"] = wasmExports["QF"])(a0, a1);
    var _zend_cpu_supports = Module2["_zend_cpu_supports"] = (a0) => (_zend_cpu_supports = Module2["_zend_cpu_supports"] = wasmExports["RF"])(a0);
    var _zend_register_interfaces = Module2["_zend_register_interfaces"] = () => (_zend_register_interfaces = Module2["_zend_register_interfaces"] = wasmExports["SF"])();
    var _zend_register_iterator_wrapper = Module2["_zend_register_iterator_wrapper"] = () => (_zend_register_iterator_wrapper = Module2["_zend_register_iterator_wrapper"] = wasmExports["TF"])();
    var _zend_objects_not_comparable = Module2["_zend_objects_not_comparable"] = (a0, a1) => (_zend_objects_not_comparable = Module2["_zend_objects_not_comparable"] = wasmExports["UF"])(a0, a1);
    var _zend_enum_get_case_by_value = Module2["_zend_enum_get_case_by_value"] = (a0, a1, a2, a3, a4) => (_zend_enum_get_case_by_value = Module2["_zend_enum_get_case_by_value"] = wasmExports["VF"])(a0, a1, a2, a3, a4);
    var _zend_enum_add_case = Module2["_zend_enum_add_case"] = (a0, a1, a2) => (_zend_enum_add_case = Module2["_zend_enum_add_case"] = wasmExports["WF"])(a0, a1, a2);
    var _zend_enum_get_case = Module2["_zend_enum_get_case"] = (a0, a1) => (_zend_enum_get_case = Module2["_zend_enum_get_case"] = wasmExports["XF"])(a0, a1);
    var _zend_enum_get_case_cstr = Module2["_zend_enum_get_case_cstr"] = (a0, a1) => (_zend_enum_get_case_cstr = Module2["_zend_enum_get_case_cstr"] = wasmExports["YF"])(a0, a1);
    var _zend_get_exception_base = Module2["_zend_get_exception_base"] = (a0) => (_zend_get_exception_base = Module2["_zend_get_exception_base"] = wasmExports["ZF"])(a0);
    var _zend_exception_set_previous = Module2["_zend_exception_set_previous"] = (a0, a1) => (_zend_exception_set_previous = Module2["_zend_exception_set_previous"] = wasmExports["_F"])(a0, a1);
    var _zend_is_unwind_exit = Module2["_zend_is_unwind_exit"] = (a0) => (_zend_is_unwind_exit = Module2["_zend_is_unwind_exit"] = wasmExports["$F"])(a0);
    var _zend_is_graceful_exit = Module2["_zend_is_graceful_exit"] = (a0) => (_zend_is_graceful_exit = Module2["_zend_is_graceful_exit"] = wasmExports["aG"])(a0);
    var _zend_exception_save = Module2["_zend_exception_save"] = () => (_zend_exception_save = Module2["_zend_exception_save"] = wasmExports["bG"])();
    var _zend_exception_restore = Module2["_zend_exception_restore"] = () => (_zend_exception_restore = Module2["_zend_exception_restore"] = wasmExports["cG"])();
    var _zend_user_exception_handler = Module2["_zend_user_exception_handler"] = () => (_zend_user_exception_handler = Module2["_zend_user_exception_handler"] = wasmExports["dG"])();
    var __zend_observer_error_notify = Module2["__zend_observer_error_notify"] = (a0, a1, a2, a3) => (__zend_observer_error_notify = Module2["__zend_observer_error_notify"] = wasmExports["eG"])(a0, a1, a2, a3);
    var _zend_exception_get_default = Module2["_zend_exception_get_default"] = () => (_zend_exception_get_default = Module2["_zend_exception_get_default"] = wasmExports["fG"])();
    var _zend_get_error_exception = Module2["_zend_get_error_exception"] = () => (_zend_get_error_exception = Module2["_zend_get_error_exception"] = wasmExports["gG"])();
    var _zend_throw_exception_object = Module2["_zend_throw_exception_object"] = (a0) => (_zend_throw_exception_object = Module2["_zend_throw_exception_object"] = wasmExports["hG"])(a0);
    var _zend_create_unwind_exit = Module2["_zend_create_unwind_exit"] = () => (_zend_create_unwind_exit = Module2["_zend_create_unwind_exit"] = wasmExports["iG"])();
    var _zend_create_graceful_exit = Module2["_zend_create_graceful_exit"] = () => (_zend_create_graceful_exit = Module2["_zend_create_graceful_exit"] = wasmExports["jG"])();
    var _zend_throw_graceful_exit = Module2["_zend_throw_graceful_exit"] = () => (_zend_throw_graceful_exit = Module2["_zend_throw_graceful_exit"] = wasmExports["kG"])();
    var _zend_init_fpu = Module2["_zend_init_fpu"] = () => (_zend_init_fpu = Module2["_zend_init_fpu"] = wasmExports["lG"])();
    var _zend_vm_stack_init = Module2["_zend_vm_stack_init"] = () => (_zend_vm_stack_init = Module2["_zend_vm_stack_init"] = wasmExports["mG"])();
    var _zend_objects_store_init = Module2["_zend_objects_store_init"] = (a0, a1) => (_zend_objects_store_init = Module2["_zend_objects_store_init"] = wasmExports["nG"])(a0, a1);
    var _zend_hash_reverse_apply = Module2["_zend_hash_reverse_apply"] = (a0, a1) => (_zend_hash_reverse_apply = Module2["_zend_hash_reverse_apply"] = wasmExports["oG"])(a0, a1);
    var _zend_objects_store_call_destructors = Module2["_zend_objects_store_call_destructors"] = (a0) => (_zend_objects_store_call_destructors = Module2["_zend_objects_store_call_destructors"] = wasmExports["pG"])(a0);
    var _zend_shutdown_executor_values = Module2["_zend_shutdown_executor_values"] = (a0) => (_zend_shutdown_executor_values = Module2["_zend_shutdown_executor_values"] = wasmExports["qG"])(a0);
    var _zend_cleanup_internal_class_data = Module2["_zend_cleanup_internal_class_data"] = (a0) => (_zend_cleanup_internal_class_data = Module2["_zend_cleanup_internal_class_data"] = wasmExports["rG"])(a0);
    var _zend_cleanup_mutable_class_data = Module2["_zend_cleanup_mutable_class_data"] = (a0) => (_zend_cleanup_mutable_class_data = Module2["_zend_cleanup_mutable_class_data"] = wasmExports["sG"])(a0);
    var _zend_stack_clean = Module2["_zend_stack_clean"] = (a0, a1, a2) => (_zend_stack_clean = Module2["_zend_stack_clean"] = wasmExports["tG"])(a0, a1, a2);
    var _zend_hash_discard = Module2["_zend_hash_discard"] = (a0, a1) => (_zend_hash_discard = Module2["_zend_hash_discard"] = wasmExports["uG"])(a0, a1);
    var _zend_objects_store_free_object_storage = Module2["_zend_objects_store_free_object_storage"] = (a0, a1) => (_zend_objects_store_free_object_storage = Module2["_zend_objects_store_free_object_storage"] = wasmExports["vG"])(a0, a1);
    var _zend_vm_stack_destroy = Module2["_zend_vm_stack_destroy"] = () => (_zend_vm_stack_destroy = Module2["_zend_vm_stack_destroy"] = wasmExports["wG"])();
    var _destroy_zend_class = Module2["_destroy_zend_class"] = (a0) => (_destroy_zend_class = Module2["_destroy_zend_class"] = wasmExports["xG"])(a0);
    var _zend_objects_store_destroy = Module2["_zend_objects_store_destroy"] = (a0) => (_zend_objects_store_destroy = Module2["_zend_objects_store_destroy"] = wasmExports["yG"])(a0);
    var _zend_shutdown_fpu = Module2["_zend_shutdown_fpu"] = () => (_zend_shutdown_fpu = Module2["_zend_shutdown_fpu"] = wasmExports["zG"])();
    var _get_function_arg_name = Module2["_get_function_arg_name"] = (a0, a1) => (_get_function_arg_name = Module2["_get_function_arg_name"] = wasmExports["AG"])(a0, a1);
    var _zval_update_constant_with_ctx = Module2["_zval_update_constant_with_ctx"] = (a0, a1, a2) => (_zval_update_constant_with_ctx = Module2["_zval_update_constant_with_ctx"] = wasmExports["BG"])(a0, a1, a2);
    var _zval_update_constant = Module2["_zval_update_constant"] = (a0) => (_zval_update_constant = Module2["_zval_update_constant"] = wasmExports["CG"])(a0);
    var _zend_deprecated_function = Module2["_zend_deprecated_function"] = (a0) => (_zend_deprecated_function = Module2["_zend_deprecated_function"] = wasmExports["DG"])(a0);
    var _zend_handle_undef_args = Module2["_zend_handle_undef_args"] = (a0) => (_zend_handle_undef_args = Module2["_zend_handle_undef_args"] = wasmExports["EG"])(a0);
    var _zend_init_func_execute_data = Module2["_zend_init_func_execute_data"] = (a0, a1, a2) => (_zend_init_func_execute_data = Module2["_zend_init_func_execute_data"] = wasmExports["FG"])(a0, a1, a2);
    var _zend_observer_fcall_begin = Module2["_zend_observer_fcall_begin"] = (a0) => (_zend_observer_fcall_begin = Module2["_zend_observer_fcall_begin"] = wasmExports["GG"])(a0);
    var _zend_observer_fcall_end_prechecked = Module2["_zend_observer_fcall_end_prechecked"] = (a0, a1) => (_zend_observer_fcall_end_prechecked = Module2["_zend_observer_fcall_end_prechecked"] = wasmExports["HG"])(a0, a1);
    var _zend_timeout = Module2["_zend_timeout"] = () => (_zend_timeout = Module2["_zend_timeout"] = wasmExports["IG"])();
    var _zend_hash_index_add_empty_element = Module2["_zend_hash_index_add_empty_element"] = (a0, a1) => (_zend_hash_index_add_empty_element = Module2["_zend_hash_index_add_empty_element"] = wasmExports["JG"])(a0, a1);
    var _zend_eval_stringl = Module2["_zend_eval_stringl"] = (a0, a1, a2, a3) => (_zend_eval_stringl = Module2["_zend_eval_stringl"] = wasmExports["KG"])(a0, a1, a2, a3);
    var _zend_eval_string = Module2["_zend_eval_string"] = (a0, a1, a2) => (_zend_eval_string = Module2["_zend_eval_string"] = wasmExports["LG"])(a0, a1, a2);
    var _zend_eval_stringl_ex = Module2["_zend_eval_stringl_ex"] = (a0, a1, a2, a3, a4) => (_zend_eval_stringl_ex = Module2["_zend_eval_stringl_ex"] = wasmExports["MG"])(a0, a1, a2, a3, a4);
    var _zend_eval_string_ex = Module2["_zend_eval_string_ex"] = (a0, a1, a2, a3) => (_zend_eval_string_ex = Module2["_zend_eval_string_ex"] = wasmExports["NG"])(a0, a1, a2, a3);
    var _zend_signal = Module2["_zend_signal"] = (a0, a1) => (_zend_signal = Module2["_zend_signal"] = wasmExports["OG"])(a0, a1);
    var _zend_delete_global_variable = Module2["_zend_delete_global_variable"] = (a0) => (_zend_delete_global_variable = Module2["_zend_delete_global_variable"] = wasmExports["PG"])(a0);
    var _zend_hash_del_ind = Module2["_zend_hash_del_ind"] = (a0, a1) => (_zend_hash_del_ind = Module2["_zend_hash_del_ind"] = wasmExports["QG"])(a0, a1);
    var _zend_attach_symbol_table = Module2["_zend_attach_symbol_table"] = (a0) => (_zend_attach_symbol_table = Module2["_zend_attach_symbol_table"] = wasmExports["RG"])(a0);
    var _zend_detach_symbol_table = Module2["_zend_detach_symbol_table"] = (a0) => (_zend_detach_symbol_table = Module2["_zend_detach_symbol_table"] = wasmExports["SG"])(a0);
    var _zend_set_local_var = Module2["_zend_set_local_var"] = (a0, a1, a2) => (_zend_set_local_var = Module2["_zend_set_local_var"] = wasmExports["TG"])(a0, a1, a2);
    var _zend_hash_func = Module2["_zend_hash_func"] = (a0, a1) => (_zend_hash_func = Module2["_zend_hash_func"] = wasmExports["UG"])(a0, a1);
    var _zend_vm_stack_init_ex = Module2["_zend_vm_stack_init_ex"] = (a0) => (_zend_vm_stack_init_ex = Module2["_zend_vm_stack_init_ex"] = wasmExports["VG"])(a0);
    var _zend_get_compiled_variable_value = Module2["_zend_get_compiled_variable_value"] = (a0, a1) => (_zend_get_compiled_variable_value = Module2["_zend_get_compiled_variable_value"] = wasmExports["WG"])(a0, a1);
    var _zend_gcc_global_regs = Module2["_zend_gcc_global_regs"] = () => (_zend_gcc_global_regs = Module2["_zend_gcc_global_regs"] = wasmExports["XG"])();
    var _zend_cannot_pass_by_reference = Module2["_zend_cannot_pass_by_reference"] = (a0) => (_zend_cannot_pass_by_reference = Module2["_zend_cannot_pass_by_reference"] = wasmExports["YG"])(a0);
    var _zend_verify_arg_error = Module2["_zend_verify_arg_error"] = (a0, a1, a2, a3) => (_zend_verify_arg_error = Module2["_zend_verify_arg_error"] = wasmExports["ZG"])(a0, a1, a2, a3);
    var _zend_verify_scalar_type_hint = Module2["_zend_verify_scalar_type_hint"] = (a0, a1, a2, a3) => (_zend_verify_scalar_type_hint = Module2["_zend_verify_scalar_type_hint"] = wasmExports["_G"])(a0, a1, a2, a3);
    var _zend_readonly_property_modification_error = Module2["_zend_readonly_property_modification_error"] = (a0) => (_zend_readonly_property_modification_error = Module2["_zend_readonly_property_modification_error"] = wasmExports["$G"])(a0);
    var _zend_readonly_property_indirect_modification_error = Module2["_zend_readonly_property_indirect_modification_error"] = (a0) => (_zend_readonly_property_indirect_modification_error = Module2["_zend_readonly_property_indirect_modification_error"] = wasmExports["aH"])(a0);
    var _zend_object_released_while_assigning_to_property_error = Module2["_zend_object_released_while_assigning_to_property_error"] = (a0) => (_zend_object_released_while_assigning_to_property_error = Module2["_zend_object_released_while_assigning_to_property_error"] = wasmExports["bH"])(a0);
    var _zend_asymmetric_visibility_property_modification_error = Module2["_zend_asymmetric_visibility_property_modification_error"] = (a0, a1) => (_zend_asymmetric_visibility_property_modification_error = Module2["_zend_asymmetric_visibility_property_modification_error"] = wasmExports["cH"])(a0, a1);
    var _zend_check_user_type_slow = Module2["_zend_check_user_type_slow"] = (a0, a1, a2, a3, a4) => (_zend_check_user_type_slow = Module2["_zend_check_user_type_slow"] = wasmExports["dH"])(a0, a1, a2, a3, a4);
    var _zend_missing_arg_error = Module2["_zend_missing_arg_error"] = (a0) => (_zend_missing_arg_error = Module2["_zend_missing_arg_error"] = wasmExports["eH"])(a0);
    var _zend_verify_return_error = Module2["_zend_verify_return_error"] = (a0, a1) => (_zend_verify_return_error = Module2["_zend_verify_return_error"] = wasmExports["fH"])(a0, a1);
    var _zend_verify_never_error = Module2["_zend_verify_never_error"] = (a0) => (_zend_verify_never_error = Module2["_zend_verify_never_error"] = wasmExports["gH"])(a0);
    var _zend_frameless_observed_call = Module2["_zend_frameless_observed_call"] = (a0) => (_zend_frameless_observed_call = Module2["_zend_frameless_observed_call"] = wasmExports["hH"])(a0);
    var _zend_observer_fcall_begin_prechecked = Module2["_zend_observer_fcall_begin_prechecked"] = (a0, a1) => (_zend_observer_fcall_begin_prechecked = Module2["_zend_observer_fcall_begin_prechecked"] = wasmExports["iH"])(a0, a1);
    var _zend_wrong_string_offset_error = Module2["_zend_wrong_string_offset_error"] = () => (_zend_wrong_string_offset_error = Module2["_zend_wrong_string_offset_error"] = wasmExports["jH"])();
    var _zend_error_unchecked = Module2["_zend_error_unchecked"] = (a0, a1, a2) => (_zend_error_unchecked = Module2["_zend_error_unchecked"] = wasmExports["kH"])(a0, a1, a2);
    var _zend_false_to_array_deprecated = Module2["_zend_false_to_array_deprecated"] = () => (_zend_false_to_array_deprecated = Module2["_zend_false_to_array_deprecated"] = wasmExports["lH"])();
    var _zend_undefined_offset_write = Module2["_zend_undefined_offset_write"] = (a0, a1) => (_zend_undefined_offset_write = Module2["_zend_undefined_offset_write"] = wasmExports["mH"])(a0, a1);
    var _zend_undefined_index_write = Module2["_zend_undefined_index_write"] = (a0, a1) => (_zend_undefined_index_write = Module2["_zend_undefined_index_write"] = wasmExports["nH"])(a0, a1);
    var __zend_hash_index_find = Module2["__zend_hash_index_find"] = (a0, a1) => (__zend_hash_index_find = Module2["__zend_hash_index_find"] = wasmExports["oH"])(a0, a1);
    var _zend_verify_ref_array_assignable = Module2["_zend_verify_ref_array_assignable"] = (a0) => (_zend_verify_ref_array_assignable = Module2["_zend_verify_ref_array_assignable"] = wasmExports["pH"])(a0);
    var _zend_throw_ref_type_error_type = Module2["_zend_throw_ref_type_error_type"] = (a0, a1, a2) => (_zend_throw_ref_type_error_type = Module2["_zend_throw_ref_type_error_type"] = wasmExports["qH"])(a0, a1, a2);
    var _zend_throw_ref_type_error_zval = Module2["_zend_throw_ref_type_error_zval"] = (a0, a1) => (_zend_throw_ref_type_error_zval = Module2["_zend_throw_ref_type_error_zval"] = wasmExports["rH"])(a0, a1);
    var _zend_throw_conflicting_coercion_error = Module2["_zend_throw_conflicting_coercion_error"] = (a0, a1, a2) => (_zend_throw_conflicting_coercion_error = Module2["_zend_throw_conflicting_coercion_error"] = wasmExports["sH"])(a0, a1, a2);
    var _zend_assign_to_typed_ref_ex = Module2["_zend_assign_to_typed_ref_ex"] = (a0, a1, a2, a3, a4) => (_zend_assign_to_typed_ref_ex = Module2["_zend_assign_to_typed_ref_ex"] = wasmExports["tH"])(a0, a1, a2, a3, a4);
    var _zend_verify_prop_assignable_by_ref_ex = Module2["_zend_verify_prop_assignable_by_ref_ex"] = (a0, a1, a2, a3) => (_zend_verify_prop_assignable_by_ref_ex = Module2["_zend_verify_prop_assignable_by_ref_ex"] = wasmExports["uH"])(a0, a1, a2, a3);
    var _execute_internal = Module2["_execute_internal"] = (a0, a1) => (_execute_internal = Module2["_execute_internal"] = wasmExports["vH"])(a0, a1);
    var _zend_clean_and_cache_symbol_table = Module2["_zend_clean_and_cache_symbol_table"] = (a0) => (_zend_clean_and_cache_symbol_table = Module2["_zend_clean_and_cache_symbol_table"] = wasmExports["wH"])(a0);
    var _zend_symtable_clean = Module2["_zend_symtable_clean"] = (a0) => (_zend_symtable_clean = Module2["_zend_symtable_clean"] = wasmExports["xH"])(a0);
    var _zend_free_compiled_variables = Module2["_zend_free_compiled_variables"] = (a0) => (_zend_free_compiled_variables = Module2["_zend_free_compiled_variables"] = wasmExports["yH"])(a0);
    var _zend_fcall_interrupt = Module2["_zend_fcall_interrupt"] = (a0) => (_zend_fcall_interrupt = Module2["_zend_fcall_interrupt"] = wasmExports["zH"])(a0);
    var _zend_fetch_function_str = Module2["_zend_fetch_function_str"] = (a0, a1) => (_zend_fetch_function_str = Module2["_zend_fetch_function_str"] = wasmExports["AH"])(a0, a1);
    var _zend_init_func_run_time_cache = Module2["_zend_init_func_run_time_cache"] = (a0) => (_zend_init_func_run_time_cache = Module2["_zend_init_func_run_time_cache"] = wasmExports["BH"])(a0);
    var _zend_init_code_execute_data = Module2["_zend_init_code_execute_data"] = (a0, a1, a2) => (_zend_init_code_execute_data = Module2["_zend_init_code_execute_data"] = wasmExports["CH"])(a0, a1, a2);
    var _zend_init_execute_data = Module2["_zend_init_execute_data"] = (a0, a1, a2) => (_zend_init_execute_data = Module2["_zend_init_execute_data"] = wasmExports["DH"])(a0, a1, a2);
    var _zend_unfinished_calls_gc = Module2["_zend_unfinished_calls_gc"] = (a0, a1, a2, a3) => (_zend_unfinished_calls_gc = Module2["_zend_unfinished_calls_gc"] = wasmExports["EH"])(a0, a1, a2, a3);
    var _zend_cleanup_unfinished_execution = Module2["_zend_cleanup_unfinished_execution"] = (a0, a1, a2) => (_zend_cleanup_unfinished_execution = Module2["_zend_cleanup_unfinished_execution"] = wasmExports["FH"])(a0, a1, a2);
    var _zend_free_extra_named_params = Module2["_zend_free_extra_named_params"] = (a0) => (_zend_free_extra_named_params = Module2["_zend_free_extra_named_params"] = wasmExports["GH"])(a0);
    var _zend_unfinished_execution_gc = Module2["_zend_unfinished_execution_gc"] = (a0, a1, a2) => (_zend_unfinished_execution_gc = Module2["_zend_unfinished_execution_gc"] = wasmExports["HH"])(a0, a1, a2);
    var _zend_unfinished_execution_gc_ex = Module2["_zend_unfinished_execution_gc_ex"] = (a0, a1, a2, a3) => (_zend_unfinished_execution_gc_ex = Module2["_zend_unfinished_execution_gc_ex"] = wasmExports["IH"])(a0, a1, a2, a3);
    var _div_function = Module2["_div_function"] = (a0, a1, a2) => (_div_function = Module2["_div_function"] = wasmExports["JH"])(a0, a1, a2);
    var _boolean_xor_function = Module2["_boolean_xor_function"] = (a0, a1, a2) => (_boolean_xor_function = Module2["_boolean_xor_function"] = wasmExports["KH"])(a0, a1, a2);
    var _zend_symtable_to_proptable = Module2["_zend_symtable_to_proptable"] = (a0) => (_zend_symtable_to_proptable = Module2["_zend_symtable_to_proptable"] = wasmExports["LH"])(a0);
    var _zend_std_build_object_properties_array = Module2["_zend_std_build_object_properties_array"] = (a0) => (_zend_std_build_object_properties_array = Module2["_zend_std_build_object_properties_array"] = wasmExports["MH"])(a0);
    var _zend_asymmetric_property_has_set_access = Module2["_zend_asymmetric_property_has_set_access"] = (a0) => (_zend_asymmetric_property_has_set_access = Module2["_zend_asymmetric_property_has_set_access"] = wasmExports["NH"])(a0);
    var _zend_fiber_switch_block = Module2["_zend_fiber_switch_block"] = () => (_zend_fiber_switch_block = Module2["_zend_fiber_switch_block"] = wasmExports["OH"])();
    var _zend_fiber_switch_unblock = Module2["_zend_fiber_switch_unblock"] = () => (_zend_fiber_switch_unblock = Module2["_zend_fiber_switch_unblock"] = wasmExports["PH"])();
    var _zend_iterator_unwrap = Module2["_zend_iterator_unwrap"] = (a0) => (_zend_iterator_unwrap = Module2["_zend_iterator_unwrap"] = wasmExports["QH"])(a0);
    var _zend_generator_close = Module2["_zend_generator_close"] = (a0, a1) => (_zend_generator_close = Module2["_zend_generator_close"] = wasmExports["RH"])(a0, a1);
    var _compare_function = Module2["_compare_function"] = (a0, a1, a2) => (_compare_function = Module2["_compare_function"] = wasmExports["SH"])(a0, a1, a2);
    var _zend_std_unset_static_property = Module2["_zend_std_unset_static_property"] = (a0, a1) => (_zend_std_unset_static_property = Module2["_zend_std_unset_static_property"] = wasmExports["TH"])(a0, a1);
    var _zend_serialize_opcode_handler = Module2["_zend_serialize_opcode_handler"] = (a0) => (_zend_serialize_opcode_handler = Module2["_zend_serialize_opcode_handler"] = wasmExports["UH"])(a0);
    var _zend_deserialize_opcode_handler = Module2["_zend_deserialize_opcode_handler"] = (a0) => (_zend_deserialize_opcode_handler = Module2["_zend_deserialize_opcode_handler"] = wasmExports["VH"])(a0);
    var _zend_get_opcode_handler_func = Module2["_zend_get_opcode_handler_func"] = (a0) => (_zend_get_opcode_handler_func = Module2["_zend_get_opcode_handler_func"] = wasmExports["WH"])(a0);
    var _zend_get_halt_op = Module2["_zend_get_halt_op"] = () => (_zend_get_halt_op = Module2["_zend_get_halt_op"] = wasmExports["XH"])();
    var _zend_vm_kind = Module2["_zend_vm_kind"] = () => (_zend_vm_kind = Module2["_zend_vm_kind"] = wasmExports["YH"])();
    var _zend_vm_call_opcode_handler = Module2["_zend_vm_call_opcode_handler"] = (a0) => (_zend_vm_call_opcode_handler = Module2["_zend_vm_call_opcode_handler"] = wasmExports["ZH"])(a0);
    var _zend_set_user_opcode_handler = Module2["_zend_set_user_opcode_handler"] = (a0, a1) => (_zend_set_user_opcode_handler = Module2["_zend_set_user_opcode_handler"] = wasmExports["_H"])(a0, a1);
    var _zend_get_user_opcode_handler = Module2["_zend_get_user_opcode_handler"] = (a0) => (_zend_get_user_opcode_handler = Module2["_zend_get_user_opcode_handler"] = wasmExports["$H"])(a0);
    var _sub_function = Module2["_sub_function"] = (a0, a1, a2) => (_sub_function = Module2["_sub_function"] = wasmExports["aI"])(a0, a1, a2);
    var _mod_function = Module2["_mod_function"] = (a0, a1, a2) => (_mod_function = Module2["_mod_function"] = wasmExports["bI"])(a0, a1, a2);
    var _shift_left_function = Module2["_shift_left_function"] = (a0, a1, a2) => (_shift_left_function = Module2["_shift_left_function"] = wasmExports["cI"])(a0, a1, a2);
    var _shift_right_function = Module2["_shift_right_function"] = (a0, a1, a2) => (_shift_right_function = Module2["_shift_right_function"] = wasmExports["dI"])(a0, a1, a2);
    var _bitwise_or_function = Module2["_bitwise_or_function"] = (a0, a1, a2) => (_bitwise_or_function = Module2["_bitwise_or_function"] = wasmExports["eI"])(a0, a1, a2);
    var _bitwise_and_function = Module2["_bitwise_and_function"] = (a0, a1, a2) => (_bitwise_and_function = Module2["_bitwise_and_function"] = wasmExports["fI"])(a0, a1, a2);
    var _bitwise_xor_function = Module2["_bitwise_xor_function"] = (a0, a1, a2) => (_bitwise_xor_function = Module2["_bitwise_xor_function"] = wasmExports["gI"])(a0, a1, a2);
    var _bitwise_not_function = Module2["_bitwise_not_function"] = (a0, a1) => (_bitwise_not_function = Module2["_bitwise_not_function"] = wasmExports["hI"])(a0, a1);
    var _zend_message_dispatcher = Module2["_zend_message_dispatcher"] = (a0, a1) => (_zend_message_dispatcher = Module2["_zend_message_dispatcher"] = wasmExports["iI"])(a0, a1);
    var _compile_filename = Module2["_compile_filename"] = (a0, a1) => (_compile_filename = Module2["_compile_filename"] = wasmExports["jI"])(a0, a1);
    var _zend_llist_apply_with_arguments = Module2["_zend_llist_apply_with_arguments"] = (a0, a1, a2, a3) => (_zend_llist_apply_with_arguments = Module2["_zend_llist_apply_with_arguments"] = wasmExports["kI"])(a0, a1, a2, a3);
    var _zend_register_extension = Module2["_zend_register_extension"] = (a0, a1) => (_zend_register_extension = Module2["_zend_register_extension"] = wasmExports["lI"])(a0, a1);
    var _zend_extension_dispatch_message = Module2["_zend_extension_dispatch_message"] = (a0, a1) => (_zend_extension_dispatch_message = Module2["_zend_extension_dispatch_message"] = wasmExports["mI"])(a0, a1);
    var _zend_llist_apply_with_del = Module2["_zend_llist_apply_with_del"] = (a0, a1) => (_zend_llist_apply_with_del = Module2["_zend_llist_apply_with_del"] = wasmExports["nI"])(a0, a1);
    var _zend_append_version_info = Module2["_zend_append_version_info"] = (a0) => (_zend_append_version_info = Module2["_zend_append_version_info"] = wasmExports["oI"])(a0);
    var _zend_add_system_entropy = Module2["_zend_add_system_entropy"] = (a0, a1, a2, a3) => (_zend_add_system_entropy = Module2["_zend_add_system_entropy"] = wasmExports["pI"])(a0, a1, a2, a3);
    var _zend_get_op_array_extension_handle = Module2["_zend_get_op_array_extension_handle"] = (a0) => (_zend_get_op_array_extension_handle = Module2["_zend_get_op_array_extension_handle"] = wasmExports["qI"])(a0);
    var _zend_get_op_array_extension_handles = Module2["_zend_get_op_array_extension_handles"] = (a0, a1) => (_zend_get_op_array_extension_handles = Module2["_zend_get_op_array_extension_handles"] = wasmExports["rI"])(a0, a1);
    var _zend_get_internal_function_extension_handle = Module2["_zend_get_internal_function_extension_handle"] = (a0) => (_zend_get_internal_function_extension_handle = Module2["_zend_get_internal_function_extension_handle"] = wasmExports["sI"])(a0);
    var _zend_get_internal_function_extension_handles = Module2["_zend_get_internal_function_extension_handles"] = (a0, a1) => (_zend_get_internal_function_extension_handles = Module2["_zend_get_internal_function_extension_handles"] = wasmExports["tI"])(a0, a1);
    var _zend_reset_internal_run_time_cache = Module2["_zend_reset_internal_run_time_cache"] = () => (_zend_reset_internal_run_time_cache = Module2["_zend_reset_internal_run_time_cache"] = wasmExports["uI"])();
    var _zend_extensions_op_array_persist_calc = Module2["_zend_extensions_op_array_persist_calc"] = (a0) => (_zend_extensions_op_array_persist_calc = Module2["_zend_extensions_op_array_persist_calc"] = wasmExports["vI"])(a0);
    var _zend_extensions_op_array_persist = Module2["_zend_extensions_op_array_persist"] = (a0, a1) => (_zend_extensions_op_array_persist = Module2["_zend_extensions_op_array_persist"] = wasmExports["wI"])(a0, a1);
    var _zend_fiber_switch_blocked = Module2["_zend_fiber_switch_blocked"] = () => (_zend_fiber_switch_blocked = Module2["_zend_fiber_switch_blocked"] = wasmExports["xI"])();
    var _zend_fiber_init_context = Module2["_zend_fiber_init_context"] = (a0, a1, a2, a3) => (_zend_fiber_init_context = Module2["_zend_fiber_init_context"] = wasmExports["yI"])(a0, a1, a2, a3);
    var _zend_get_page_size = Module2["_zend_get_page_size"] = () => (_zend_get_page_size = Module2["_zend_get_page_size"] = wasmExports["zI"])();
    var _zend_observer_fiber_init_notify = Module2["_zend_observer_fiber_init_notify"] = (a0) => (_zend_observer_fiber_init_notify = Module2["_zend_observer_fiber_init_notify"] = wasmExports["AI"])(a0);
    var _zend_observer_fiber_destroy_notify = Module2["_zend_observer_fiber_destroy_notify"] = (a0) => (_zend_observer_fiber_destroy_notify = Module2["_zend_observer_fiber_destroy_notify"] = wasmExports["BI"])(a0);
    var _zend_fiber_switch_context = Module2["_zend_fiber_switch_context"] = (a0) => (_zend_fiber_switch_context = Module2["_zend_fiber_switch_context"] = wasmExports["CI"])(a0);
    var _zend_fiber_destroy_context = Module2["_zend_fiber_destroy_context"] = (a0) => (_zend_fiber_destroy_context = Module2["_zend_fiber_destroy_context"] = wasmExports["DI"])(a0);
    var _zend_observer_fiber_switch_notify = Module2["_zend_observer_fiber_switch_notify"] = (a0, a1) => (_zend_observer_fiber_switch_notify = Module2["_zend_observer_fiber_switch_notify"] = wasmExports["EI"])(a0, a1);
    var _zend_fiber_start = Module2["_zend_fiber_start"] = (a0, a1) => (_zend_fiber_start = Module2["_zend_fiber_start"] = wasmExports["FI"])(a0, a1);
    var _zend_fiber_resume = Module2["_zend_fiber_resume"] = (a0, a1, a2) => (_zend_fiber_resume = Module2["_zend_fiber_resume"] = wasmExports["GI"])(a0, a1, a2);
    var _zend_fiber_resume_exception = Module2["_zend_fiber_resume_exception"] = (a0, a1, a2) => (_zend_fiber_resume_exception = Module2["_zend_fiber_resume_exception"] = wasmExports["HI"])(a0, a1, a2);
    var _zend_fiber_suspend = Module2["_zend_fiber_suspend"] = (a0, a1, a2) => (_zend_fiber_suspend = Module2["_zend_fiber_suspend"] = wasmExports["II"])(a0, a1, a2);
    var _zend_ensure_fpu_mode = Module2["_zend_ensure_fpu_mode"] = () => (_zend_ensure_fpu_mode = Module2["_zend_ensure_fpu_mode"] = wasmExports["JI"])();
    var _gc_enable = Module2["_gc_enable"] = (a0) => (_gc_enable = Module2["_gc_enable"] = wasmExports["KI"])(a0);
    var _gc_protect = Module2["_gc_protect"] = (a0) => (_gc_protect = Module2["_gc_protect"] = wasmExports["LI"])(a0);
    var _gc_protected = Module2["_gc_protected"] = () => (_gc_protected = Module2["_gc_protected"] = wasmExports["MI"])();
    var _gc_remove_from_buffer = Module2["_gc_remove_from_buffer"] = (a0) => (_gc_remove_from_buffer = Module2["_gc_remove_from_buffer"] = wasmExports["NI"])(a0);
    var _zend_gc_collect_cycles = Module2["_zend_gc_collect_cycles"] = () => (_zend_gc_collect_cycles = Module2["_zend_gc_collect_cycles"] = wasmExports["OI"])();
    var ___jit_debug_register_code = Module2["___jit_debug_register_code"] = () => (___jit_debug_register_code = Module2["___jit_debug_register_code"] = wasmExports["PI"])();
    var _zend_gdb_register_code = Module2["_zend_gdb_register_code"] = (a0, a1) => (_zend_gdb_register_code = Module2["_zend_gdb_register_code"] = wasmExports["QI"])(a0, a1);
    var _zend_gdb_unregister_all = Module2["_zend_gdb_unregister_all"] = () => (_zend_gdb_unregister_all = Module2["_zend_gdb_unregister_all"] = wasmExports["RI"])();
    var _zend_gdb_present = Module2["_zend_gdb_present"] = () => (_zend_gdb_present = Module2["_zend_gdb_present"] = wasmExports["SI"])();
    var _zend_generator_restore_call_stack = Module2["_zend_generator_restore_call_stack"] = (a0) => (_zend_generator_restore_call_stack = Module2["_zend_generator_restore_call_stack"] = wasmExports["TI"])(a0);
    var _zend_generator_freeze_call_stack = Module2["_zend_generator_freeze_call_stack"] = (a0) => (_zend_generator_freeze_call_stack = Module2["_zend_generator_freeze_call_stack"] = wasmExports["UI"])(a0);
    var _zend_generator_resume = Module2["_zend_generator_resume"] = (a0) => (_zend_generator_resume = Module2["_zend_generator_resume"] = wasmExports["VI"])(a0);
    var _zend_observer_generator_resume = Module2["_zend_observer_generator_resume"] = (a0) => (_zend_observer_generator_resume = Module2["_zend_observer_generator_resume"] = wasmExports["WI"])(a0);
    var _zend_hash_packed_to_hash = Module2["_zend_hash_packed_to_hash"] = (a0) => (_zend_hash_packed_to_hash = Module2["_zend_hash_packed_to_hash"] = wasmExports["XI"])(a0);
    var _zend_hash_get_current_pos_ex = Module2["_zend_hash_get_current_pos_ex"] = (a0, a1) => (_zend_hash_get_current_pos_ex = Module2["_zend_hash_get_current_pos_ex"] = wasmExports["YI"])(a0, a1);
    var _zend_hash_add_or_update = Module2["_zend_hash_add_or_update"] = (a0, a1, a2, a3) => (_zend_hash_add_or_update = Module2["_zend_hash_add_or_update"] = wasmExports["ZI"])(a0, a1, a2, a3);
    var _zend_hash_str_add_or_update = Module2["_zend_hash_str_add_or_update"] = (a0, a1, a2, a3, a4) => (_zend_hash_str_add_or_update = Module2["_zend_hash_str_add_or_update"] = wasmExports["_I"])(a0, a1, a2, a3, a4);
    var _zend_hash_index_add_or_update = Module2["_zend_hash_index_add_or_update"] = (a0, a1, a2, a3) => (_zend_hash_index_add_or_update = Module2["_zend_hash_index_add_or_update"] = wasmExports["$I"])(a0, a1, a2, a3);
    var _zend_hash_str_del_ind = Module2["_zend_hash_str_del_ind"] = (a0, a1, a2) => (_zend_hash_str_del_ind = Module2["_zend_hash_str_del_ind"] = wasmExports["aJ"])(a0, a1, a2);
    var _zend_hash_graceful_destroy = Module2["_zend_hash_graceful_destroy"] = (a0) => (_zend_hash_graceful_destroy = Module2["_zend_hash_graceful_destroy"] = wasmExports["bJ"])(a0);
    var _zend_hash_apply_with_arguments = Module2["_zend_hash_apply_with_arguments"] = (a0, a1, a2, a3) => (_zend_hash_apply_with_arguments = Module2["_zend_hash_apply_with_arguments"] = wasmExports["cJ"])(a0, a1, a2, a3);
    var _zend_hash_merge_ex = Module2["_zend_hash_merge_ex"] = (a0, a1, a2, a3, a4) => (_zend_hash_merge_ex = Module2["_zend_hash_merge_ex"] = wasmExports["dJ"])(a0, a1, a2, a3, a4);
    var _zend_hash_bucket_renum_swap = Module2["_zend_hash_bucket_renum_swap"] = (a0, a1) => (_zend_hash_bucket_renum_swap = Module2["_zend_hash_bucket_renum_swap"] = wasmExports["eJ"])(a0, a1);
    var _zend_hash_bucket_packed_swap = Module2["_zend_hash_bucket_packed_swap"] = (a0, a1) => (_zend_hash_bucket_packed_swap = Module2["_zend_hash_bucket_packed_swap"] = wasmExports["fJ"])(a0, a1);
    var _zend_html_putc = Module2["_zend_html_putc"] = (a0) => (_zend_html_putc = Module2["_zend_html_putc"] = wasmExports["gJ"])(a0);
    var _zend_highlight = Module2["_zend_highlight"] = (a0) => (_zend_highlight = Module2["_zend_highlight"] = wasmExports["hJ"])(a0);
    var _zend_perform_covariant_type_check = Module2["_zend_perform_covariant_type_check"] = (a0, a1, a2, a3) => (_zend_perform_covariant_type_check = Module2["_zend_perform_covariant_type_check"] = wasmExports["iJ"])(a0, a1, a2, a3);
    var _zend_error_at_noreturn = Module2["_zend_error_at_noreturn"] = (a0, a1, a2, a3, a4) => (_zend_error_at_noreturn = Module2["_zend_error_at_noreturn"] = wasmExports["jJ"])(a0, a1, a2, a3, a4);
    var _zend_begin_record_errors = Module2["_zend_begin_record_errors"] = () => (_zend_begin_record_errors = Module2["_zend_begin_record_errors"] = wasmExports["kJ"])();
    var _zend_free_recorded_errors = Module2["_zend_free_recorded_errors"] = () => (_zend_free_recorded_errors = Module2["_zend_free_recorded_errors"] = wasmExports["lJ"])();
    var _zend_get_configuration_directive = Module2["_zend_get_configuration_directive"] = (a0) => (_zend_get_configuration_directive = Module2["_zend_get_configuration_directive"] = wasmExports["mJ"])(a0);
    var _zend_stream_fixup = Module2["_zend_stream_fixup"] = (a0, a1, a2) => (_zend_stream_fixup = Module2["_zend_stream_fixup"] = wasmExports["nJ"])(a0, a1, a2);
    var _zend_ini_startup = Module2["_zend_ini_startup"] = () => (_zend_ini_startup = Module2["_zend_ini_startup"] = wasmExports["oJ"])();
    var _zend_ini_dtor = Module2["_zend_ini_dtor"] = (a0) => (_zend_ini_dtor = Module2["_zend_ini_dtor"] = wasmExports["pJ"])(a0);
    var _zend_ini_global_shutdown = Module2["_zend_ini_global_shutdown"] = () => (_zend_ini_global_shutdown = Module2["_zend_ini_global_shutdown"] = wasmExports["qJ"])();
    var _zend_ini_deactivate = Module2["_zend_ini_deactivate"] = () => (_zend_ini_deactivate = Module2["_zend_ini_deactivate"] = wasmExports["rJ"])();
    var _zend_register_ini_entries = Module2["_zend_register_ini_entries"] = (a0, a1) => (_zend_register_ini_entries = Module2["_zend_register_ini_entries"] = wasmExports["sJ"])(a0, a1);
    var _zend_unregister_ini_entries = Module2["_zend_unregister_ini_entries"] = (a0) => (_zend_unregister_ini_entries = Module2["_zend_unregister_ini_entries"] = wasmExports["tJ"])(a0);
    var _zend_alter_ini_entry = Module2["_zend_alter_ini_entry"] = (a0, a1, a2, a3) => (_zend_alter_ini_entry = Module2["_zend_alter_ini_entry"] = wasmExports["uJ"])(a0, a1, a2, a3);
    var _zend_ini_register_displayer = Module2["_zend_ini_register_displayer"] = (a0, a1, a2) => (_zend_ini_register_displayer = Module2["_zend_ini_register_displayer"] = wasmExports["vJ"])(a0, a1, a2);
    var _zend_ini_parse_uquantity = Module2["_zend_ini_parse_uquantity"] = (a0, a1) => (_zend_ini_parse_uquantity = Module2["_zend_ini_parse_uquantity"] = wasmExports["wJ"])(a0, a1);
    var _zend_ini_parse_quantity_warn = Module2["_zend_ini_parse_quantity_warn"] = (a0, a1) => (_zend_ini_parse_quantity_warn = Module2["_zend_ini_parse_quantity_warn"] = wasmExports["xJ"])(a0, a1);
    var _display_link_numbers = Module2["_display_link_numbers"] = (a0, a1) => (_display_link_numbers = Module2["_display_link_numbers"] = wasmExports["yJ"])(a0, a1);
    var _OnUpdateReal = Module2["_OnUpdateReal"] = (a0, a1, a2, a3, a4, a5) => (_OnUpdateReal = Module2["_OnUpdateReal"] = wasmExports["zJ"])(a0, a1, a2, a3, a4, a5);
    var _OnUpdateStr = Module2["_OnUpdateStr"] = (a0, a1, a2, a3, a4, a5) => (_OnUpdateStr = Module2["_OnUpdateStr"] = wasmExports["AJ"])(a0, a1, a2, a3, a4, a5);
    var _OnUpdateStrNotEmpty = Module2["_OnUpdateStrNotEmpty"] = (a0, a1, a2, a3, a4, a5) => (_OnUpdateStrNotEmpty = Module2["_OnUpdateStrNotEmpty"] = wasmExports["BJ"])(a0, a1, a2, a3, a4, a5);
    var _zend_user_it_new_iterator = Module2["_zend_user_it_new_iterator"] = (a0, a1, a2) => (_zend_user_it_new_iterator = Module2["_zend_user_it_new_iterator"] = wasmExports["CJ"])(a0, a1, a2);
    var _zend_user_it_valid = Module2["_zend_user_it_valid"] = (a0) => (_zend_user_it_valid = Module2["_zend_user_it_valid"] = wasmExports["DJ"])(a0);
    var _zend_user_it_get_current_data = Module2["_zend_user_it_get_current_data"] = (a0) => (_zend_user_it_get_current_data = Module2["_zend_user_it_get_current_data"] = wasmExports["EJ"])(a0);
    var _zend_user_it_get_current_key = Module2["_zend_user_it_get_current_key"] = (a0, a1) => (_zend_user_it_get_current_key = Module2["_zend_user_it_get_current_key"] = wasmExports["FJ"])(a0, a1);
    var _zend_user_it_move_forward = Module2["_zend_user_it_move_forward"] = (a0) => (_zend_user_it_move_forward = Module2["_zend_user_it_move_forward"] = wasmExports["GJ"])(a0);
    var _zend_user_it_rewind = Module2["_zend_user_it_rewind"] = (a0) => (_zend_user_it_rewind = Module2["_zend_user_it_rewind"] = wasmExports["HJ"])(a0);
    var _zend_user_it_get_gc = Module2["_zend_user_it_get_gc"] = (a0, a1, a2) => (_zend_user_it_get_gc = Module2["_zend_user_it_get_gc"] = wasmExports["IJ"])(a0, a1, a2);
    var _zend_user_it_get_new_iterator = Module2["_zend_user_it_get_new_iterator"] = (a0, a1, a2) => (_zend_user_it_get_new_iterator = Module2["_zend_user_it_get_new_iterator"] = wasmExports["JJ"])(a0, a1, a2);
    var _zend_user_serialize = Module2["_zend_user_serialize"] = (a0, a1, a2, a3) => (_zend_user_serialize = Module2["_zend_user_serialize"] = wasmExports["KJ"])(a0, a1, a2, a3);
    var _zend_user_unserialize = Module2["_zend_user_unserialize"] = (a0, a1, a2, a3, a4) => (_zend_user_unserialize = Module2["_zend_user_unserialize"] = wasmExports["LJ"])(a0, a1, a2, a3, a4);
    var _zendparse = Module2["_zendparse"] = () => (_zendparse = Module2["_zendparse"] = wasmExports["MJ"])();
    var _zend_lex_tstring = Module2["_zend_lex_tstring"] = (a0, a1) => (_zend_lex_tstring = Module2["_zend_lex_tstring"] = wasmExports["NJ"])(a0, a1);
    var _zend_get_scanned_file_offset = Module2["_zend_get_scanned_file_offset"] = () => (_zend_get_scanned_file_offset = Module2["_zend_get_scanned_file_offset"] = wasmExports["OJ"])();
    var _zend_ptr_stack_init = Module2["_zend_ptr_stack_init"] = (a0) => (_zend_ptr_stack_init = Module2["_zend_ptr_stack_init"] = wasmExports["PJ"])(a0);
    var _zend_ptr_stack_clean = Module2["_zend_ptr_stack_clean"] = (a0, a1, a2) => (_zend_ptr_stack_clean = Module2["_zend_ptr_stack_clean"] = wasmExports["QJ"])(a0, a1, a2);
    var _zend_ptr_stack_destroy = Module2["_zend_ptr_stack_destroy"] = (a0) => (_zend_ptr_stack_destroy = Module2["_zend_ptr_stack_destroy"] = wasmExports["RJ"])(a0);
    var _zend_multibyte_check_lexer_compatibility = Module2["_zend_multibyte_check_lexer_compatibility"] = (a0) => (_zend_multibyte_check_lexer_compatibility = Module2["_zend_multibyte_check_lexer_compatibility"] = wasmExports["SJ"])(a0);
    var _zend_multibyte_get_encoding_name = Module2["_zend_multibyte_get_encoding_name"] = (a0) => (_zend_multibyte_get_encoding_name = Module2["_zend_multibyte_get_encoding_name"] = wasmExports["TJ"])(a0);
    var _compile_file = Module2["_compile_file"] = (a0, a1) => (_compile_file = Module2["_compile_file"] = wasmExports["UJ"])(a0, a1);
    var _zend_prepare_string_for_scanning = Module2["_zend_prepare_string_for_scanning"] = (a0, a1) => (_zend_prepare_string_for_scanning = Module2["_zend_prepare_string_for_scanning"] = wasmExports["VJ"])(a0, a1);
    var _compile_string = Module2["_compile_string"] = (a0, a1, a2) => (_compile_string = Module2["_compile_string"] = wasmExports["WJ"])(a0, a1, a2);
    var _zend_ptr_stack_reverse_apply = Module2["_zend_ptr_stack_reverse_apply"] = (a0, a1) => (_zend_ptr_stack_reverse_apply = Module2["_zend_ptr_stack_reverse_apply"] = wasmExports["XJ"])(a0, a1);
    var _zend_hex_strtod = Module2["_zend_hex_strtod"] = (a0, a1) => (_zend_hex_strtod = Module2["_zend_hex_strtod"] = wasmExports["YJ"])(a0, a1);
    var _zend_oct_strtod = Module2["_zend_oct_strtod"] = (a0, a1) => (_zend_oct_strtod = Module2["_zend_oct_strtod"] = wasmExports["ZJ"])(a0, a1);
    var _zend_bin_strtod = Module2["_zend_bin_strtod"] = (a0, a1) => (_zend_bin_strtod = Module2["_zend_bin_strtod"] = wasmExports["_J"])(a0, a1);
    var _zend_objects_clone_obj = Module2["_zend_objects_clone_obj"] = (a0) => (_zend_objects_clone_obj = Module2["_zend_objects_clone_obj"] = wasmExports["$J"])(a0);
    var _zend_list_insert = Module2["_zend_list_insert"] = (a0, a1) => (_zend_list_insert = Module2["_zend_list_insert"] = wasmExports["aK"])(a0, a1);
    var _zend_list_free = Module2["_zend_list_free"] = (a0) => (_zend_list_free = Module2["_zend_list_free"] = wasmExports["bK"])(a0);
    var _zend_register_persistent_resource_ex = Module2["_zend_register_persistent_resource_ex"] = (a0, a1, a2) => (_zend_register_persistent_resource_ex = Module2["_zend_register_persistent_resource_ex"] = wasmExports["cK"])(a0, a1, a2);
    var _zend_llist_prepend_element = Module2["_zend_llist_prepend_element"] = (a0, a1) => (_zend_llist_prepend_element = Module2["_zend_llist_prepend_element"] = wasmExports["dK"])(a0, a1);
    var _zend_llist_remove_tail = Module2["_zend_llist_remove_tail"] = (a0) => (_zend_llist_remove_tail = Module2["_zend_llist_remove_tail"] = wasmExports["eK"])(a0);
    var _zend_llist_copy = Module2["_zend_llist_copy"] = (a0, a1) => (_zend_llist_copy = Module2["_zend_llist_copy"] = wasmExports["fK"])(a0, a1);
    var _zend_llist_sort = Module2["_zend_llist_sort"] = (a0, a1) => (_zend_llist_sort = Module2["_zend_llist_sort"] = wasmExports["gK"])(a0, a1);
    var _zend_llist_get_last_ex = Module2["_zend_llist_get_last_ex"] = (a0, a1) => (_zend_llist_get_last_ex = Module2["_zend_llist_get_last_ex"] = wasmExports["hK"])(a0, a1);
    var _zend_llist_get_prev_ex = Module2["_zend_llist_get_prev_ex"] = (a0, a1) => (_zend_llist_get_prev_ex = Module2["_zend_llist_get_prev_ex"] = wasmExports["iK"])(a0, a1);
    var _zend_multibyte_set_functions = Module2["_zend_multibyte_set_functions"] = (a0) => (_zend_multibyte_set_functions = Module2["_zend_multibyte_set_functions"] = wasmExports["jK"])(a0);
    var _zend_multibyte_set_script_encoding_by_string = Module2["_zend_multibyte_set_script_encoding_by_string"] = (a0, a1) => (_zend_multibyte_set_script_encoding_by_string = Module2["_zend_multibyte_set_script_encoding_by_string"] = wasmExports["kK"])(a0, a1);
    var _zend_multibyte_restore_functions = Module2["_zend_multibyte_restore_functions"] = () => (_zend_multibyte_restore_functions = Module2["_zend_multibyte_restore_functions"] = wasmExports["lK"])();
    var _zend_multibyte_parse_encoding_list = Module2["_zend_multibyte_parse_encoding_list"] = (a0, a1, a2, a3, a4) => (_zend_multibyte_parse_encoding_list = Module2["_zend_multibyte_parse_encoding_list"] = wasmExports["mK"])(a0, a1, a2, a3, a4);
    var _zend_multibyte_get_script_encoding = Module2["_zend_multibyte_get_script_encoding"] = () => (_zend_multibyte_get_script_encoding = Module2["_zend_multibyte_get_script_encoding"] = wasmExports["nK"])();
    var _zend_multibyte_set_script_encoding = Module2["_zend_multibyte_set_script_encoding"] = (a0, a1) => (_zend_multibyte_set_script_encoding = Module2["_zend_multibyte_set_script_encoding"] = wasmExports["oK"])(a0, a1);
    var _zend_multibyte_set_internal_encoding = Module2["_zend_multibyte_set_internal_encoding"] = (a0) => (_zend_multibyte_set_internal_encoding = Module2["_zend_multibyte_set_internal_encoding"] = wasmExports["pK"])(a0);
    var _zend_std_get_gc = Module2["_zend_std_get_gc"] = (a0, a1, a2) => (_zend_std_get_gc = Module2["_zend_std_get_gc"] = wasmExports["qK"])(a0, a1, a2);
    var _zend_std_get_debug_info = Module2["_zend_std_get_debug_info"] = (a0, a1) => (_zend_std_get_debug_info = Module2["_zend_std_get_debug_info"] = wasmExports["rK"])(a0, a1);
    var _zend_get_property_guard = Module2["_zend_get_property_guard"] = (a0, a1) => (_zend_get_property_guard = Module2["_zend_get_property_guard"] = wasmExports["sK"])(a0, a1);
    var _zend_std_get_closure = Module2["_zend_std_get_closure"] = (a0, a1, a2, a3, a4) => (_zend_std_get_closure = Module2["_zend_std_get_closure"] = wasmExports["tK"])(a0, a1, a2, a3, a4);
    var _zend_hooked_object_build_properties = Module2["_zend_hooked_object_build_properties"] = (a0) => (_zend_hooked_object_build_properties = Module2["_zend_hooked_object_build_properties"] = wasmExports["uK"])(a0);
    var _zend_objects_store_put = Module2["_zend_objects_store_put"] = (a0) => (_zend_objects_store_put = Module2["_zend_objects_store_put"] = wasmExports["vK"])(a0);
    var _zend_weakrefs_notify = Module2["_zend_weakrefs_notify"] = (a0) => (_zend_weakrefs_notify = Module2["_zend_weakrefs_notify"] = wasmExports["wK"])(a0);
    var _zend_observer_fcall_register = Module2["_zend_observer_fcall_register"] = (a0) => (_zend_observer_fcall_register = Module2["_zend_observer_fcall_register"] = wasmExports["xK"])(a0);
    var _zend_observer_activate = Module2["_zend_observer_activate"] = () => (_zend_observer_activate = Module2["_zend_observer_activate"] = wasmExports["yK"])();
    var _zend_observer_add_begin_handler = Module2["_zend_observer_add_begin_handler"] = (a0, a1) => (_zend_observer_add_begin_handler = Module2["_zend_observer_add_begin_handler"] = wasmExports["zK"])(a0, a1);
    var _zend_observer_remove_begin_handler = Module2["_zend_observer_remove_begin_handler"] = (a0, a1, a2) => (_zend_observer_remove_begin_handler = Module2["_zend_observer_remove_begin_handler"] = wasmExports["AK"])(a0, a1, a2);
    var _zend_observer_add_end_handler = Module2["_zend_observer_add_end_handler"] = (a0, a1) => (_zend_observer_add_end_handler = Module2["_zend_observer_add_end_handler"] = wasmExports["BK"])(a0, a1);
    var _zend_observer_remove_end_handler = Module2["_zend_observer_remove_end_handler"] = (a0, a1, a2) => (_zend_observer_remove_end_handler = Module2["_zend_observer_remove_end_handler"] = wasmExports["CK"])(a0, a1, a2);
    var _zend_observer_function_declared_register = Module2["_zend_observer_function_declared_register"] = (a0) => (_zend_observer_function_declared_register = Module2["_zend_observer_function_declared_register"] = wasmExports["DK"])(a0);
    var _zend_observer_class_linked_register = Module2["_zend_observer_class_linked_register"] = (a0) => (_zend_observer_class_linked_register = Module2["_zend_observer_class_linked_register"] = wasmExports["EK"])(a0);
    var _zend_observer_error_register = Module2["_zend_observer_error_register"] = (a0) => (_zend_observer_error_register = Module2["_zend_observer_error_register"] = wasmExports["FK"])(a0);
    var _zend_observer_fiber_init_register = Module2["_zend_observer_fiber_init_register"] = (a0) => (_zend_observer_fiber_init_register = Module2["_zend_observer_fiber_init_register"] = wasmExports["GK"])(a0);
    var _zend_observer_fiber_switch_register = Module2["_zend_observer_fiber_switch_register"] = (a0) => (_zend_observer_fiber_switch_register = Module2["_zend_observer_fiber_switch_register"] = wasmExports["HK"])(a0);
    var _zend_observer_fiber_destroy_register = Module2["_zend_observer_fiber_destroy_register"] = (a0) => (_zend_observer_fiber_destroy_register = Module2["_zend_observer_fiber_destroy_register"] = wasmExports["IK"])(a0);
    var _destroy_zend_function = Module2["_destroy_zend_function"] = (a0) => (_destroy_zend_function = Module2["_destroy_zend_function"] = wasmExports["JK"])(a0);
    var _boolean_not_function = Module2["_boolean_not_function"] = (a0, a1) => (_boolean_not_function = Module2["_boolean_not_function"] = wasmExports["KK"])(a0, a1);
    var _is_identical_function = Module2["_is_identical_function"] = (a0, a1, a2) => (_is_identical_function = Module2["_is_identical_function"] = wasmExports["LK"])(a0, a1, a2);
    var _is_not_identical_function = Module2["_is_not_identical_function"] = (a0, a1, a2) => (_is_not_identical_function = Module2["_is_not_identical_function"] = wasmExports["MK"])(a0, a1, a2);
    var _is_equal_function = Module2["_is_equal_function"] = (a0, a1, a2) => (_is_equal_function = Module2["_is_equal_function"] = wasmExports["NK"])(a0, a1, a2);
    var _is_not_equal_function = Module2["_is_not_equal_function"] = (a0, a1, a2) => (_is_not_equal_function = Module2["_is_not_equal_function"] = wasmExports["OK"])(a0, a1, a2);
    var _zend_atol = Module2["_zend_atol"] = (a0, a1) => (_zend_atol = Module2["_zend_atol"] = wasmExports["PK"])(a0, a1);
    var _zend_atoi = Module2["_zend_atoi"] = (a0, a1) => (_zend_atoi = Module2["_zend_atoi"] = wasmExports["QK"])(a0, a1);
    var _convert_scalar_to_number = Module2["_convert_scalar_to_number"] = (a0) => (_convert_scalar_to_number = Module2["_convert_scalar_to_number"] = wasmExports["RK"])(a0);
    var _zval_try_get_long = Module2["_zval_try_get_long"] = (a0, a1) => (_zval_try_get_long = Module2["_zval_try_get_long"] = wasmExports["SK"])(a0, a1);
    var _string_compare_function_ex = Module2["_string_compare_function_ex"] = (a0, a1, a2) => (_string_compare_function_ex = Module2["_string_compare_function_ex"] = wasmExports["TK"])(a0, a1, a2);
    var _zend_str_toupper_copy = Module2["_zend_str_toupper_copy"] = (a0, a1, a2) => (_zend_str_toupper_copy = Module2["_zend_str_toupper_copy"] = wasmExports["UK"])(a0, a1, a2);
    var _zend_str_toupper_dup = Module2["_zend_str_toupper_dup"] = (a0, a1) => (_zend_str_toupper_dup = Module2["_zend_str_toupper_dup"] = wasmExports["VK"])(a0, a1);
    var _zend_str_toupper = Module2["_zend_str_toupper"] = (a0, a1) => (_zend_str_toupper = Module2["_zend_str_toupper"] = wasmExports["WK"])(a0, a1);
    var _zend_str_toupper_dup_ex = Module2["_zend_str_toupper_dup_ex"] = (a0, a1) => (_zend_str_toupper_dup_ex = Module2["_zend_str_toupper_dup_ex"] = wasmExports["XK"])(a0, a1);
    var _zend_binary_zval_strncmp = Module2["_zend_binary_zval_strncmp"] = (a0, a1, a2) => (_zend_binary_zval_strncmp = Module2["_zend_binary_zval_strncmp"] = wasmExports["YK"])(a0, a1, a2);
    var _zend_ulong_to_str = Module2["_zend_ulong_to_str"] = (a0) => (_zend_ulong_to_str = Module2["_zend_ulong_to_str"] = wasmExports["ZK"])(a0);
    var _zend_u64_to_str = Module2["_zend_u64_to_str"] = (a0, a1) => (_zend_u64_to_str = Module2["_zend_u64_to_str"] = wasmExports["_K"])(a0, a1);
    var _zend_i64_to_str = Module2["_zend_i64_to_str"] = (a0, a1) => (_zend_i64_to_str = Module2["_zend_i64_to_str"] = wasmExports["$K"])(a0, a1);
    var _zend_ptr_stack_init_ex = Module2["_zend_ptr_stack_init_ex"] = (a0, a1) => (_zend_ptr_stack_init_ex = Module2["_zend_ptr_stack_init_ex"] = wasmExports["aL"])(a0, a1);
    var _zend_ptr_stack_n_push = Module2["_zend_ptr_stack_n_push"] = (a0, a1, a2) => (_zend_ptr_stack_n_push = Module2["_zend_ptr_stack_n_push"] = wasmExports["bL"])(a0, a1, a2);
    var _zend_ptr_stack_n_pop = Module2["_zend_ptr_stack_n_pop"] = (a0, a1, a2) => (_zend_ptr_stack_n_pop = Module2["_zend_ptr_stack_n_pop"] = wasmExports["cL"])(a0, a1, a2);
    var _zend_ptr_stack_apply = Module2["_zend_ptr_stack_apply"] = (a0, a1) => (_zend_ptr_stack_apply = Module2["_zend_ptr_stack_apply"] = wasmExports["dL"])(a0, a1);
    var _zend_ptr_stack_num_elements = Module2["_zend_ptr_stack_num_elements"] = (a0) => (_zend_ptr_stack_num_elements = Module2["_zend_ptr_stack_num_elements"] = wasmExports["eL"])(a0);
    var _zend_signal_handler_unblock = Module2["_zend_signal_handler_unblock"] = () => (_zend_signal_handler_unblock = Module2["_zend_signal_handler_unblock"] = wasmExports["fL"])();
    var _zend_sigaction = Module2["_zend_sigaction"] = (a0, a1, a2) => (_zend_sigaction = Module2["_zend_sigaction"] = wasmExports["gL"])(a0, a1, a2);
    var _zend_signal_startup = Module2["_zend_signal_startup"] = () => (_zend_signal_startup = Module2["_zend_signal_startup"] = wasmExports["hL"])();
    var _smart_str_realloc = Module2["_smart_str_realloc"] = (a0, a1) => (_smart_str_realloc = Module2["_smart_str_realloc"] = wasmExports["iL"])(a0, a1);
    var __smart_string_alloc_persistent = Module2["__smart_string_alloc_persistent"] = (a0, a1) => (__smart_string_alloc_persistent = Module2["__smart_string_alloc_persistent"] = wasmExports["jL"])(a0, a1);
    var _smart_str_append_escaped_truncated = Module2["_smart_str_append_escaped_truncated"] = (a0, a1, a2) => (_smart_str_append_escaped_truncated = Module2["_smart_str_append_escaped_truncated"] = wasmExports["kL"])(a0, a1, a2);
    var _smart_str_append_scalar = Module2["_smart_str_append_scalar"] = (a0, a1, a2) => (_smart_str_append_scalar = Module2["_smart_str_append_scalar"] = wasmExports["lL"])(a0, a1, a2);
    var _zend_insert_sort = Module2["_zend_insert_sort"] = (a0, a1, a2, a3, a4) => (_zend_insert_sort = Module2["_zend_insert_sort"] = wasmExports["mL"])(a0, a1, a2, a3, a4);
    var _zend_stack_apply = Module2["_zend_stack_apply"] = (a0, a1, a2) => (_zend_stack_apply = Module2["_zend_stack_apply"] = wasmExports["nL"])(a0, a1, a2);
    var _zend_interned_strings_init = Module2["_zend_interned_strings_init"] = () => (_zend_interned_strings_init = Module2["_zend_interned_strings_init"] = wasmExports["oL"])();
    var _zend_interned_string_find_permanent = Module2["_zend_interned_string_find_permanent"] = (a0) => (_zend_interned_string_find_permanent = Module2["_zend_interned_string_find_permanent"] = wasmExports["pL"])(a0);
    var _zend_interned_strings_set_request_storage_handlers = Module2["_zend_interned_strings_set_request_storage_handlers"] = (a0, a1, a2) => (_zend_interned_strings_set_request_storage_handlers = Module2["_zend_interned_strings_set_request_storage_handlers"] = wasmExports["qL"])(a0, a1, a2);
    var _zend_shutdown_strtod = Module2["_zend_shutdown_strtod"] = () => (_zend_shutdown_strtod = Module2["_zend_shutdown_strtod"] = wasmExports["rL"])();
    var _virtual_cwd_startup = Module2["_virtual_cwd_startup"] = () => (_virtual_cwd_startup = Module2["_virtual_cwd_startup"] = wasmExports["sL"])();
    var _virtual_cwd_shutdown = Module2["_virtual_cwd_shutdown"] = () => (_virtual_cwd_shutdown = Module2["_virtual_cwd_shutdown"] = wasmExports["tL"])();
    var _virtual_getcwd_ex = Module2["_virtual_getcwd_ex"] = (a0) => (_virtual_getcwd_ex = Module2["_virtual_getcwd_ex"] = wasmExports["uL"])(a0);
    var _virtual_getcwd = Module2["_virtual_getcwd"] = (a0, a1) => (_virtual_getcwd = Module2["_virtual_getcwd"] = wasmExports["vL"])(a0, a1);
    var _realpath_cache_lookup = Module2["_realpath_cache_lookup"] = (a0, a1, a2, a3) => (_realpath_cache_lookup = Module2["_realpath_cache_lookup"] = wasmExports["wL"])(a0, a1, a2, a3);
    var _virtual_chdir = Module2["_virtual_chdir"] = (a0) => (_virtual_chdir = Module2["_virtual_chdir"] = wasmExports["xL"])(a0);
    var _virtual_realpath = Module2["_virtual_realpath"] = (a0, a1) => (_virtual_realpath = Module2["_virtual_realpath"] = wasmExports["yL"])(a0, a1);
    var _virtual_filepath_ex = Module2["_virtual_filepath_ex"] = (a0, a1, a2) => (_virtual_filepath_ex = Module2["_virtual_filepath_ex"] = wasmExports["zL"])(a0, a1, a2);
    var _virtual_filepath = Module2["_virtual_filepath"] = (a0, a1) => (_virtual_filepath = Module2["_virtual_filepath"] = wasmExports["AL"])(a0, a1);
    var _virtual_fopen = Module2["_virtual_fopen"] = (a0, a1) => (_virtual_fopen = Module2["_virtual_fopen"] = wasmExports["BL"])(a0, a1);
    var _virtual_access = Module2["_virtual_access"] = (a0, a1) => (_virtual_access = Module2["_virtual_access"] = wasmExports["CL"])(a0, a1);
    var _virtual_utime = Module2["_virtual_utime"] = (a0, a1) => (_virtual_utime = Module2["_virtual_utime"] = wasmExports["DL"])(a0, a1);
    var _virtual_chmod = Module2["_virtual_chmod"] = (a0, a1) => (_virtual_chmod = Module2["_virtual_chmod"] = wasmExports["EL"])(a0, a1);
    var _virtual_chown = Module2["_virtual_chown"] = (a0, a1, a2, a3) => (_virtual_chown = Module2["_virtual_chown"] = wasmExports["FL"])(a0, a1, a2, a3);
    var _virtual_open = Module2["_virtual_open"] = (a0, a1, a2) => (_virtual_open = Module2["_virtual_open"] = wasmExports["GL"])(a0, a1, a2);
    var _virtual_creat = Module2["_virtual_creat"] = (a0, a1) => (_virtual_creat = Module2["_virtual_creat"] = wasmExports["HL"])(a0, a1);
    var _virtual_rename = Module2["_virtual_rename"] = (a0, a1) => (_virtual_rename = Module2["_virtual_rename"] = wasmExports["IL"])(a0, a1);
    var _virtual_stat = Module2["_virtual_stat"] = (a0, a1) => (_virtual_stat = Module2["_virtual_stat"] = wasmExports["JL"])(a0, a1);
    var _virtual_lstat = Module2["_virtual_lstat"] = (a0, a1) => (_virtual_lstat = Module2["_virtual_lstat"] = wasmExports["KL"])(a0, a1);
    var _virtual_unlink = Module2["_virtual_unlink"] = (a0) => (_virtual_unlink = Module2["_virtual_unlink"] = wasmExports["LL"])(a0);
    var _virtual_mkdir = Module2["_virtual_mkdir"] = (a0, a1) => (_virtual_mkdir = Module2["_virtual_mkdir"] = wasmExports["ML"])(a0, a1);
    var _virtual_rmdir = Module2["_virtual_rmdir"] = (a0) => (_virtual_rmdir = Module2["_virtual_rmdir"] = wasmExports["NL"])(a0);
    var _virtual_opendir = Module2["_virtual_opendir"] = (a0) => (_virtual_opendir = Module2["_virtual_opendir"] = wasmExports["OL"])(a0);
    var _virtual_popen = Module2["_virtual_popen"] = (a0, a1) => (_virtual_popen = Module2["_virtual_popen"] = wasmExports["PL"])(a0, a1);
    var _zend_get_opcode_id = Module2["_zend_get_opcode_id"] = (a0, a1) => (_zend_get_opcode_id = Module2["_zend_get_opcode_id"] = wasmExports["QL"])(a0, a1);
    var _zend_weakrefs_hash_add = Module2["_zend_weakrefs_hash_add"] = (a0, a1, a2) => (_zend_weakrefs_hash_add = Module2["_zend_weakrefs_hash_add"] = wasmExports["RL"])(a0, a1, a2);
    var _zend_weakrefs_hash_del = Module2["_zend_weakrefs_hash_del"] = (a0, a1) => (_zend_weakrefs_hash_del = Module2["_zend_weakrefs_hash_del"] = wasmExports["SL"])(a0, a1);
    var _zend_spprintf_unchecked = Module2["_zend_spprintf_unchecked"] = (a0, a1, a2, a3) => (_zend_spprintf_unchecked = Module2["_zend_spprintf_unchecked"] = wasmExports["TL"])(a0, a1, a2, a3);
    var _zend_make_printable_zval = Module2["_zend_make_printable_zval"] = (a0, a1) => (_zend_make_printable_zval = Module2["_zend_make_printable_zval"] = wasmExports["UL"])(a0, a1);
    var _zend_print_zval = Module2["_zend_print_zval"] = (a0, a1) => (_zend_print_zval = Module2["_zend_print_zval"] = wasmExports["VL"])(a0, a1);
    var _zend_print_flat_zval_r = Module2["_zend_print_flat_zval_r"] = (a0) => (_zend_print_flat_zval_r = Module2["_zend_print_flat_zval_r"] = wasmExports["WL"])(a0);
    var _zend_output_debug_string = Module2["_zend_output_debug_string"] = (a0, a1, a2) => (_zend_output_debug_string = Module2["_zend_output_debug_string"] = wasmExports["XL"])(a0, a1, a2);
    var _zend_map_ptr_reset = Module2["_zend_map_ptr_reset"] = () => (_zend_map_ptr_reset = Module2["_zend_map_ptr_reset"] = wasmExports["YL"])();
    var _zend_strerror_noreturn = Module2["_zend_strerror_noreturn"] = (a0, a1, a2) => (_zend_strerror_noreturn = Module2["_zend_strerror_noreturn"] = wasmExports["ZL"])(a0, a1, a2);
    var _zend_emit_recorded_errors = Module2["_zend_emit_recorded_errors"] = () => (_zend_emit_recorded_errors = Module2["_zend_emit_recorded_errors"] = wasmExports["_L"])();
    var _zend_map_ptr_new_static = Module2["_zend_map_ptr_new_static"] = () => (_zend_map_ptr_new_static = Module2["_zend_map_ptr_new_static"] = wasmExports["$L"])();
    var _zend_map_ptr_extend = Module2["_zend_map_ptr_extend"] = (a0) => (_zend_map_ptr_extend = Module2["_zend_map_ptr_extend"] = wasmExports["aM"])(a0);
    var _php_cli_get_shell_callbacks = Module2["_php_cli_get_shell_callbacks"] = () => (_php_cli_get_shell_callbacks = Module2["_php_cli_get_shell_callbacks"] = wasmExports["bM"])();
    var _sapi_cli_single_write = Module2["_sapi_cli_single_write"] = (a0, a1) => (_sapi_cli_single_write = Module2["_sapi_cli_single_write"] = wasmExports["cM"])(a0, a1);
    var _main = Module2["_main"] = (a0, a1) => (_main = Module2["_main"] = wasmExports["dM"])(a0, a1);
    var _emscripten_builtin_memalign = /* @__PURE__ */ __name((a0, a1) => (_emscripten_builtin_memalign = wasmExports["eM"])(a0, a1), "_emscripten_builtin_memalign");
    var __emscripten_timeout = /* @__PURE__ */ __name((a0, a1) => (__emscripten_timeout = wasmExports["fM"])(a0, a1), "__emscripten_timeout");
    var _setThrew = /* @__PURE__ */ __name((a0, a1) => (_setThrew = wasmExports["gM"])(a0, a1), "_setThrew");
    var __emscripten_stack_restore = /* @__PURE__ */ __name((a0) => (__emscripten_stack_restore = wasmExports["hM"])(a0), "__emscripten_stack_restore");
    var __emscripten_stack_alloc = /* @__PURE__ */ __name((a0) => (__emscripten_stack_alloc = wasmExports["iM"])(a0), "__emscripten_stack_alloc");
    var _emscripten_stack_get_current = /* @__PURE__ */ __name(() => (_emscripten_stack_get_current = wasmExports["jM"])(), "_emscripten_stack_get_current");
    var _zend_string_init_interned = Module2["_zend_string_init_interned"] = 1285008;
    var _std_object_handlers = Module2["_std_object_handlers"] = 1138368;
    var _zend_ce_aggregate = Module2["_zend_ce_aggregate"] = 1281832;
    var _zend_ce_error = Module2["_zend_ce_error"] = 1279624;
    var _zend_ce_exception = Module2["_zend_ce_exception"] = 1279508;
    var _compiler_globals = Module2["_compiler_globals"] = 1277712;
    var _zend_known_strings = Module2["_zend_known_strings"] = 1284956;
    var _zend_empty_string = Module2["_zend_empty_string"] = 1284952;
    var _executor_globals = Module2["_executor_globals"] = 1278088;
    var _basic_globals = Module2["_basic_globals"] = 1196400;
    var _pcre_globals = Module2["_pcre_globals"] = 1191496;
    var _zend_one_char_string = Module2["_zend_one_char_string"] = 1285024;
    var _file_globals = Module2["_file_globals"] = 1205608;
    var _php_hashcontext_ce = Module2["_php_hashcontext_ce"] = 1191704;
    var _zend_ce_value_error = Module2["_zend_ce_value_error"] = 1279628;
    var _core_globals = Module2["_core_globals"] = 1275784;
    var _php_json_serializable_ce = Module2["_php_json_serializable_ce"] = 1191824;
    var _zend_empty_array = Module2["_zend_empty_array"] = 1080040;
    var _php_json_exception_ce = Module2["_php_json_exception_ce"] = 1191820;
    var _json_globals = Module2["_json_globals"] = 1191808;
    var _random_ce_Random_RandomException = Module2["_random_ce_Random_RandomException"] = 1194380;
    var _php_random_algo_mt19937 = Module2["_php_random_algo_mt19937"] = 808880;
    var _php_random_algo_pcgoneseq128xslrr64 = Module2["_php_random_algo_pcgoneseq128xslrr64"] = 808900;
    var _php_random_algo_secure = Module2["_php_random_algo_secure"] = 808920;
    var _random_ce_Random_BrokenRandomEngineError = Module2["_random_ce_Random_BrokenRandomEngineError"] = 1191828;
    var _php_random_algo_user = Module2["_php_random_algo_user"] = 808940;
    var _php_random_algo_xoshiro256starstar = Module2["_php_random_algo_xoshiro256starstar"] = 808960;
    var _random_globals = Module2["_random_globals"] = 1191832;
    var _random_ce_Random_Engine = Module2["_random_ce_Random_Engine"] = 1194368;
    var _random_ce_Random_CryptoSafeEngine = Module2["_random_ce_Random_CryptoSafeEngine"] = 1194372;
    var _random_ce_Random_RandomError = Module2["_random_ce_Random_RandomError"] = 1194376;
    var _random_ce_Random_Engine_Mt19937 = Module2["_random_ce_Random_Engine_Mt19937"] = 1194384;
    var _random_ce_Random_Engine_PcgOneseq128XslRr64 = Module2["_random_ce_Random_Engine_PcgOneseq128XslRr64"] = 1194488;
    var _random_ce_Random_Engine_Xoshiro256StarStar = Module2["_random_ce_Random_Engine_Xoshiro256StarStar"] = 1194592;
    var _random_ce_Random_Engine_Secure = Module2["_random_ce_Random_Engine_Secure"] = 1194696;
    var _random_ce_Random_Randomizer = Module2["_random_ce_Random_Randomizer"] = 1194800;
    var _random_ce_Random_IntervalBoundary = Module2["_random_ce_Random_IntervalBoundary"] = 1194904;
    var _reflection_enum_ptr = Module2["_reflection_enum_ptr"] = 1194908;
    var _reflection_class_ptr = Module2["_reflection_class_ptr"] = 1194912;
    var _reflection_exception_ptr = Module2["_reflection_exception_ptr"] = 1194916;
    var _zend_ce_closure = Module2["_zend_ce_closure"] = 1277608;
    var _reflection_attribute_ptr = Module2["_reflection_attribute_ptr"] = 1195112;
    var _reflection_parameter_ptr = Module2["_reflection_parameter_ptr"] = 1195068;
    var _module_registry = Module2["_module_registry"] = 1277368;
    var _reflection_extension_ptr = Module2["_reflection_extension_ptr"] = 1195104;
    var _zend_ce_generator = Module2["_zend_ce_generator"] = 1281636;
    var _reflection_function_ptr = Module2["_reflection_function_ptr"] = 1195060;
    var _reflection_method_ptr = Module2["_reflection_method_ptr"] = 1195088;
    var _reflection_intersection_type_ptr = Module2["_reflection_intersection_type_ptr"] = 1195084;
    var _reflection_union_type_ptr = Module2["_reflection_union_type_ptr"] = 1195080;
    var _reflection_named_type_ptr = Module2["_reflection_named_type_ptr"] = 1195076;
    var _reflection_property_ptr = Module2["_reflection_property_ptr"] = 1195096;
    var _reflection_class_constant_ptr = Module2["_reflection_class_constant_ptr"] = 1195100;
    var _zend_ce_traversable = Module2["_zend_ce_traversable"] = 1281828;
    var _reflection_property_hook_type_ptr = Module2["_reflection_property_hook_type_ptr"] = 1194920;
    var _reflection_reference_ptr = Module2["_reflection_reference_ptr"] = 1194924;
    var _reflection_enum_backed_case_ptr = Module2["_reflection_enum_backed_case_ptr"] = 1195120;
    var _reflection_enum_unit_case_ptr = Module2["_reflection_enum_unit_case_ptr"] = 1195116;
    var _zend_ce_fiber = Module2["_zend_ce_fiber"] = 1281412;
    var _reflection_ptr = Module2["_reflection_ptr"] = 1195048;
    var _zend_ce_stringable = Module2["_zend_ce_stringable"] = 1281852;
    var _reflector_ptr = Module2["_reflector_ptr"] = 1195052;
    var _reflection_function_abstract_ptr = Module2["_reflection_function_abstract_ptr"] = 1195056;
    var _reflection_generator_ptr = Module2["_reflection_generator_ptr"] = 1195064;
    var _reflection_type_ptr = Module2["_reflection_type_ptr"] = 1195072;
    var _reflection_object_ptr = Module2["_reflection_object_ptr"] = 1195092;
    var _reflection_zend_extension_ptr = Module2["_reflection_zend_extension_ptr"] = 1195108;
    var _reflection_fiber_ptr = Module2["_reflection_fiber_ptr"] = 1195124;
    var _reflection_constant_ptr = Module2["_reflection_constant_ptr"] = 1195128;
    var _spl_ce_AppendIterator = Module2["_spl_ce_AppendIterator"] = 1196028;
    var _spl_ce_ArrayIterator = Module2["_spl_ce_ArrayIterator"] = 1195140;
    var _spl_ce_ArrayObject = Module2["_spl_ce_ArrayObject"] = 1195144;
    var _spl_ce_BadFunctionCallException = Module2["_spl_ce_BadFunctionCallException"] = 1195596;
    var _spl_ce_BadMethodCallException = Module2["_spl_ce_BadMethodCallException"] = 1195600;
    var _spl_ce_CachingIterator = Module2["_spl_ce_CachingIterator"] = 1196008;
    var _spl_ce_CallbackFilterIterator = Module2["_spl_ce_CallbackFilterIterator"] = 1195976;
    var _spl_ce_DirectoryIterator = Module2["_spl_ce_DirectoryIterator"] = 1195360;
    var _spl_ce_DomainException = Module2["_spl_ce_DomainException"] = 1195604;
    var _spl_ce_EmptyIterator = Module2["_spl_ce_EmptyIterator"] = 1196240;
    var _spl_ce_FilesystemIterator = Module2["_spl_ce_FilesystemIterator"] = 1195364;
    var _spl_ce_FilterIterator = Module2["_spl_ce_FilterIterator"] = 1195972;
    var _spl_ce_GlobIterator = Module2["_spl_ce_GlobIterator"] = 1195472;
    var _spl_ce_InfiniteIterator = Module2["_spl_ce_InfiniteIterator"] = 1196024;
    var _spl_ce_InvalidArgumentException = Module2["_spl_ce_InvalidArgumentException"] = 1195608;
    var _spl_ce_IteratorIterator = Module2["_spl_ce_IteratorIterator"] = 1196016;
    var _spl_ce_LengthException = Module2["_spl_ce_LengthException"] = 1195612;
    var _spl_ce_LimitIterator = Module2["_spl_ce_LimitIterator"] = 1196004;
    var _spl_ce_LogicException = Module2["_spl_ce_LogicException"] = 1195592;
    var _spl_ce_MultipleIterator = Module2["_spl_ce_MultipleIterator"] = 1196356;
    var _spl_ce_NoRewindIterator = Module2["_spl_ce_NoRewindIterator"] = 1196020;
    var _spl_ce_OuterIterator = Module2["_spl_ce_OuterIterator"] = 1196032;
    var _spl_ce_OutOfBoundsException = Module2["_spl_ce_OutOfBoundsException"] = 1195624;
    var _spl_ce_OutOfRangeException = Module2["_spl_ce_OutOfRangeException"] = 1195616;
    var _spl_ce_OverflowException = Module2["_spl_ce_OverflowException"] = 1195628;
    var _spl_ce_ParentIterator = Module2["_spl_ce_ParentIterator"] = 1195992;
    var _spl_ce_RangeException = Module2["_spl_ce_RangeException"] = 1195632;
    var _spl_ce_RecursiveArrayIterator = Module2["_spl_ce_RecursiveArrayIterator"] = 1195248;
    var _spl_ce_RecursiveCachingIterator = Module2["_spl_ce_RecursiveCachingIterator"] = 1196012;
    var _spl_ce_RecursiveCallbackFilterIterator = Module2["_spl_ce_RecursiveCallbackFilterIterator"] = 1195980;
    var _spl_ce_RecursiveDirectoryIterator = Module2["_spl_ce_RecursiveDirectoryIterator"] = 1195368;
    var _spl_ce_RecursiveFilterIterator = Module2["_spl_ce_RecursiveFilterIterator"] = 1195988;
    var _spl_ce_RecursiveIterator = Module2["_spl_ce_RecursiveIterator"] = 1195984;
    var _spl_ce_RecursiveIteratorIterator = Module2["_spl_ce_RecursiveIteratorIterator"] = 1195964;
    var _spl_ce_RecursiveRegexIterator = Module2["_spl_ce_RecursiveRegexIterator"] = 1196e3;
    var _spl_ce_RecursiveTreeIterator = Module2["_spl_ce_RecursiveTreeIterator"] = 1195968;
    var _spl_ce_RegexIterator = Module2["_spl_ce_RegexIterator"] = 1195996;
    var _spl_ce_RuntimeException = Module2["_spl_ce_RuntimeException"] = 1195620;
    var _spl_ce_SeekableIterator = Module2["_spl_ce_SeekableIterator"] = 1196236;
    var _spl_ce_SplDoublyLinkedList = Module2["_spl_ce_SplDoublyLinkedList"] = 1195480;
    var _spl_ce_SplFileInfo = Module2["_spl_ce_SplFileInfo"] = 1195256;
    var _spl_ce_SplFileObject = Module2["_spl_ce_SplFileObject"] = 1195252;
    var _spl_ce_SplFixedArray = Module2["_spl_ce_SplFixedArray"] = 1195644;
    var _spl_ce_SplHeap = Module2["_spl_ce_SplHeap"] = 1195748;
    var _spl_ce_SplMinHeap = Module2["_spl_ce_SplMinHeap"] = 1195856;
    var _spl_ce_SplMaxHeap = Module2["_spl_ce_SplMaxHeap"] = 1195860;
    var _spl_ce_SplObjectStorage = Module2["_spl_ce_SplObjectStorage"] = 1196244;
    var _spl_ce_SplObserver = Module2["_spl_ce_SplObserver"] = 1196248;
    var _spl_ce_SplPriorityQueue = Module2["_spl_ce_SplPriorityQueue"] = 1195752;
    var _spl_ce_SplQueue = Module2["_spl_ce_SplQueue"] = 1195584;
    var _spl_ce_SplStack = Module2["_spl_ce_SplStack"] = 1195588;
    var _spl_ce_SplSubject = Module2["_spl_ce_SplSubject"] = 1196252;
    var _spl_ce_SplTempFileObject = Module2["_spl_ce_SplTempFileObject"] = 1195476;
    var _spl_ce_UnderflowException = Module2["_spl_ce_UnderflowException"] = 1195636;
    var _spl_ce_UnexpectedValueException = Module2["_spl_ce_UnexpectedValueException"] = 1195640;
    var _zend_compile_file = Module2["_zend_compile_file"] = 1279360;
    var _zend_autoload = Module2["_zend_autoload"] = 1280312;
    var _zend_ce_iterator = Module2["_zend_ce_iterator"] = 1281836;
    var _zend_ce_arrayaccess = Module2["_zend_ce_arrayaccess"] = 1281844;
    var _zend_ce_serializable = Module2["_zend_ce_serializable"] = 1281840;
    var _zend_ce_countable = Module2["_zend_ce_countable"] = 1281848;
    var _php_glob_stream_ops = Module2["_php_glob_stream_ops"] = 1047136;
    var _empty_fcall_info_cache = Module2["_empty_fcall_info_cache"] = 1063728;
    var _empty_fcall_info = Module2["_empty_fcall_info"] = 1063680;
    var _zend_ce_throwable = Module2["_zend_ce_throwable"] = 1279504;
    var _assertion_error_ce = Module2["_assertion_error_ce"] = 1196392;
    var _php_ce_incomplete_class = Module2["_php_ce_incomplete_class"] = 1205784;
    var _rounding_mode_ce = Module2["_rounding_mode_ce"] = 1205788;
    var _php_stream_php_wrapper = Module2["_php_stream_php_wrapper"] = 1033688;
    var _php_plain_files_wrapper = Module2["_php_plain_files_wrapper"] = 1189392;
    var _php_glob_stream_wrapper = Module2["_php_glob_stream_wrapper"] = 1047216;
    var _php_stream_rfc2397_wrapper = Module2["_php_stream_rfc2397_wrapper"] = 1047380;
    var _php_stream_http_wrapper = Module2["_php_stream_http_wrapper"] = 1033020;
    var _php_stream_ftp_wrapper = Module2["_php_stream_ftp_wrapper"] = 876096;
    var _php_load_environment_variables = Module2["_php_load_environment_variables"] = 1189360;
    var _php_optidx = Module2["_php_optidx"] = 1189344;
    var _sapi_module = Module2["_sapi_module"] = 1276500;
    var _sapi_globals = Module2["_sapi_globals"] = 1276648;
    var _zend_tolower_map = Module2["_zend_tolower_map"] = 1138480;
    var _zend_standard_class_def = Module2["_zend_standard_class_def"] = 1290572;
    var _zend_new_interned_string = Module2["_zend_new_interned_string"] = 1285004;
    var _php_stream_stdio_ops = Module2["_php_stream_stdio_ops"] = 1189404;
    var _zend_ce_request_parse_body_exception = Module2["_zend_ce_request_parse_body_exception"] = 1279644;
    var _php_sig_gif = Module2["_php_sig_gif"] = 1033032;
    var _php_sig_jpg = Module2["_php_sig_jpg"] = 1033047;
    var _php_sig_png = Module2["_php_sig_png"] = 1033050;
    var _php_sig_swf = Module2["_php_sig_swf"] = 1033041;
    var _php_sig_swc = Module2["_php_sig_swc"] = 1033044;
    var _php_sig_psd = Module2["_php_sig_psd"] = 1033035;
    var _php_sig_jpc = Module2["_php_sig_jpc"] = 1033066;
    var _php_sig_riff = Module2["_php_sig_riff"] = 1033089;
    var _php_sig_jp2 = Module2["_php_sig_jp2"] = 1033069;
    var _php_sig_bmp = Module2["_php_sig_bmp"] = 1033039;
    var _php_sig_tif_ii = Module2["_php_sig_tif_ii"] = 1033058;
    var _php_sig_tif_mm = Module2["_php_sig_tif_mm"] = 1033062;
    var _php_sig_iff = Module2["_php_sig_iff"] = 1033081;
    var _php_sig_ico = Module2["_php_sig_ico"] = 1033085;
    var _php_sig_webp = Module2["_php_sig_webp"] = 1033093;
    var _php_tiff_bytes_per_format = Module2["_php_tiff_bytes_per_format"] = 1033104;
    var _php_ini_opened_path = Module2["_php_ini_opened_path"] = 1276360;
    var _php_ini_scanned_path = Module2["_php_ini_scanned_path"] = 1276364;
    var _php_ini_scanned_files = Module2["_php_ini_scanned_files"] = 1276368;
    var _zend_ce_division_by_zero_error = Module2["_zend_ce_division_by_zero_error"] = 1279636;
    var _zend_ce_arithmetic_error = Module2["_zend_ce_arithmetic_error"] = 1279632;
    var _php_stream_socket_ops = Module2["_php_stream_socket_ops"] = 1047656;
    var _zend_resolve_path = Module2["_zend_resolve_path"] = 1290644;
    var _zend_toupper_map = Module2["_zend_toupper_map"] = 1138736;
    var _zend_string_init_existing_interned = Module2["_zend_string_init_existing_interned"] = 1285012;
    var _zend_write = Module2["_zend_write"] = 1290604;
    var _zend_observer_fcall_op_array_extension = Module2["_zend_observer_fcall_op_array_extension"] = 1282704;
    var _le_index_ptr = Module2["_le_index_ptr"] = 1282468;
    var _php_register_internal_extensions_func = Module2["_php_register_internal_extensions_func"] = 1189348;
    var _zend_post_shutdown_cb = Module2["_zend_post_shutdown_cb"] = 1290580;
    var _php_internal_encoding_changed = Module2["_php_internal_encoding_changed"] = 1276184;
    var _output_globals = Module2["_output_globals"] = 1276192;
    var _php_import_environment_variables = Module2["_php_import_environment_variables"] = 1189356;
    var _php_rfc1867_callback = Module2["_php_rfc1867_callback"] = 1276488;
    var _php_stream_memory_ops = Module2["_php_stream_memory_ops"] = 1047228;
    var _php_stream_temp_ops = Module2["_php_stream_temp_ops"] = 1047264;
    var _php_stream_rfc2397_ops = Module2["_php_stream_rfc2397_ops"] = 1047300;
    var _php_stream_rfc2397_wops = Module2["_php_stream_rfc2397_wops"] = 1047336;
    var _php_stream_userspace_ops = Module2["_php_stream_userspace_ops"] = 1047548;
    var _php_stream_userspace_dir_ops = Module2["_php_stream_userspace_dir_ops"] = 1047584;
    var _zend_op_array_extension_handles = Module2["_zend_op_array_extension_handles"] = 1281364;
    var _zend_func_info_rid = Module2["_zend_func_info_rid"] = 1189452;
    var _zend_flf_functions = Module2["_zend_flf_functions"] = 1281536;
    var _zend_random_bytes_insecure = Module2["_zend_random_bytes_insecure"] = 1290592;
    var _zend_ce_type_error = Module2["_zend_ce_type_error"] = 1279512;
    var _zend_flf_handlers = Module2["_zend_flf_handlers"] = 1281532;
    var _zend_observer_class_linked_observed = Module2["_zend_observer_class_linked_observed"] = 1282713;
    var _zend_ast_process = Module2["_zend_ast_process"] = 1277432;
    var _zend_ce_sensitive_parameter_value = Module2["_zend_ce_sensitive_parameter_value"] = 1277436;
    var _zend_ce_deprecated = Module2["_zend_ce_deprecated"] = 1277440;
    var _zend_ce_attribute = Module2["_zend_ce_attribute"] = 1277444;
    var _zend_ce_return_type_will_change_attribute = Module2["_zend_ce_return_type_will_change_attribute"] = 1277492;
    var _zend_ce_allow_dynamic_properties = Module2["_zend_ce_allow_dynamic_properties"] = 1277496;
    var _zend_ce_sensitive_parameter = Module2["_zend_ce_sensitive_parameter"] = 1277500;
    var _zend_ce_override = Module2["_zend_ce_override"] = 1277604;
    var _gc_collect_cycles = Module2["_gc_collect_cycles"] = 1281632;
    var _zend_extensions = Module2["_zend_extensions"] = 1281372;
    var _language_scanner_globals = Module2["_language_scanner_globals"] = 1282284;
    var _zend_ce_compile_error = Module2["_zend_ce_compile_error"] = 1279496;
    var _zend_observer_function_declared_observed = Module2["_zend_observer_function_declared_observed"] = 1282712;
    var _zend_execute_internal = Module2["_zend_execute_internal"] = 1280308;
    var _zend_execute_ex = Module2["_zend_execute_ex"] = 1280304;
    var _zend_compile_string = Module2["_zend_compile_string"] = 1279364;
    var _zend_ce_unit_enum = Module2["_zend_ce_unit_enum"] = 1279384;
    var _zend_ce_backed_enum = Module2["_zend_ce_backed_enum"] = 1279388;
    var _zend_enum_object_handlers = Module2["_zend_enum_object_handlers"] = 1279392;
    var _zend_ce_parse_error = Module2["_zend_ce_parse_error"] = 1279492;
    var _zend_throw_exception_hook = Module2["_zend_throw_exception_hook"] = 1279500;
    var _zend_observer_errors_observed = Module2["_zend_observer_errors_observed"] = 1282714;
    var _zend_error_cb = Module2["_zend_error_cb"] = 1290608;
    var _zend_ce_argument_count_error = Module2["_zend_ce_argument_count_error"] = 1279516;
    var _zend_ce_error_exception = Module2["_zend_ce_error_exception"] = 1279620;
    var _zend_ce_unhandled_match_error = Module2["_zend_ce_unhandled_match_error"] = 1279640;
    var _zend_interrupt_function = Module2["_zend_interrupt_function"] = 1290648;
    var _zend_on_timeout = Module2["_zend_on_timeout"] = 1290636;
    var _zend_observer_fcall_internal_function_extension = Module2["_zend_observer_fcall_internal_function_extension"] = 1282708;
    var _zend_pass_function = Module2["_zend_pass_function"] = 1063808;
    var _zend_ticks_function = Module2["_zend_ticks_function"] = 1290632;
    var _zend_touch_vm_stack_data = Module2["_zend_touch_vm_stack_data"] = 1280316;
    var _zend_extension_flags = Module2["_zend_extension_flags"] = 1281360;
    var _zend_internal_function_extension_handles = Module2["_zend_internal_function_extension_handles"] = 1281368;
    var ___jit_debug_descriptor = Module2["___jit_debug_descriptor"] = 1190064;
    var _zend_ce_ClosedGeneratorException = Module2["_zend_ce_ClosedGeneratorException"] = 1281640;
    var _zend_printf = Module2["_zend_printf"] = 1290612;
    var _zend_inheritance_cache_get = Module2["_zend_inheritance_cache_get"] = 1281744;
    var _zend_inheritance_cache_add = Module2["_zend_inheritance_cache_add"] = 1281748;
    var _ini_scanner_globals = Module2["_ini_scanner_globals"] = 1281752;
    var _zend_getenv = Module2["_zend_getenv"] = 1290640;
    var _zend_uv = Module2["_zend_uv"] = 1290676;
    var _zend_ce_internal_iterator = Module2["_zend_ce_internal_iterator"] = 1281824;
    var _zend_multibyte_encoding_utf32be = Module2["_zend_multibyte_encoding_utf32be"] = 1190080;
    var _zend_multibyte_encoding_utf32le = Module2["_zend_multibyte_encoding_utf32le"] = 1190084;
    var _zend_multibyte_encoding_utf16be = Module2["_zend_multibyte_encoding_utf16be"] = 1190088;
    var _zend_multibyte_encoding_utf16le = Module2["_zend_multibyte_encoding_utf16le"] = 1190092;
    var _zend_multibyte_encoding_utf8 = Module2["_zend_multibyte_encoding_utf8"] = 1190096;
    var _zend_signal_globals = Module2["_zend_signal_globals"] = 1282716;
    var _zend_stream_open_function = Module2["_zend_stream_open_function"] = 1290620;
    var _zend_fopen = Module2["_zend_fopen"] = 1290616;
    var _zend_system_id = Module2["_zend_system_id"] = 1286208;
    var _zend_ce_weakref = Module2["_zend_ce_weakref"] = 1290364;
    var _zend_random_bytes = Module2["_zend_random_bytes"] = 1290588;
    var _zend_map_ptr_static_size = Module2["_zend_map_ptr_static_size"] = 1290660;
    var _zend_post_startup_cb = Module2["_zend_post_startup_cb"] = 1290576;
    var _zend_map_ptr_static_last = Module2["_zend_map_ptr_static_last"] = 1290672;
    var _zend_accel_schedule_restart_hook = Module2["_zend_accel_schedule_restart_hook"] = 1290584;
    var _zend_dtrace_enabled = Module2["_zend_dtrace_enabled"] = 1290677;
    function invoke_vii(index, a1, a2) {
      var sp = stackSave();
      try {
        getWasmTableEntry(index)(a1, a2);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    __name(invoke_vii, "invoke_vii");
    function invoke_vi(index, a1) {
      var sp = stackSave();
      try {
        getWasmTableEntry(index)(a1);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    __name(invoke_vi, "invoke_vi");
    function invoke_v(index) {
      var sp = stackSave();
      try {
        getWasmTableEntry(index)();
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    __name(invoke_v, "invoke_v");
    function invoke_i(index) {
      var sp = stackSave();
      try {
        return getWasmTableEntry(index)();
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    __name(invoke_i, "invoke_i");
    function invoke_iiiii(index, a1, a2, a3, a4) {
      var sp = stackSave();
      try {
        return getWasmTableEntry(index)(a1, a2, a3, a4);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    __name(invoke_iiiii, "invoke_iiiii");
    function invoke_ii(index, a1) {
      var sp = stackSave();
      try {
        return getWasmTableEntry(index)(a1);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    __name(invoke_ii, "invoke_ii");
    function invoke_iiii(index, a1, a2, a3) {
      var sp = stackSave();
      try {
        return getWasmTableEntry(index)(a1, a2, a3);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    __name(invoke_iiii, "invoke_iiii");
    function invoke_iii(index, a1, a2) {
      var sp = stackSave();
      try {
        return getWasmTableEntry(index)(a1, a2);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    __name(invoke_iii, "invoke_iii");
    function invoke_viiiii(index, a1, a2, a3, a4, a5) {
      var sp = stackSave();
      try {
        getWasmTableEntry(index)(a1, a2, a3, a4, a5);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    __name(invoke_viiiii, "invoke_viiiii");
    function invoke_viidii(index, a1, a2, a3, a4, a5) {
      var sp = stackSave();
      try {
        getWasmTableEntry(index)(a1, a2, a3, a4, a5);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    __name(invoke_viidii, "invoke_viidii");
    function invoke_viii(index, a1, a2, a3) {
      var sp = stackSave();
      try {
        getWasmTableEntry(index)(a1, a2, a3);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    __name(invoke_viii, "invoke_viii");
    function invoke_viiii(index, a1, a2, a3, a4) {
      var sp = stackSave();
      try {
        getWasmTableEntry(index)(a1, a2, a3, a4);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    __name(invoke_viiii, "invoke_viiii");
    function invoke_iiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
      var sp = stackSave();
      try {
        return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    __name(invoke_iiiiiiiiii, "invoke_iiiiiiiiii");
    function invoke_iiiiii(index, a1, a2, a3, a4, a5) {
      var sp = stackSave();
      try {
        return getWasmTableEntry(index)(a1, a2, a3, a4, a5);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    __name(invoke_iiiiii, "invoke_iiiiii");
    function invoke_iiiiiii(index, a1, a2, a3, a4, a5, a6) {
      var sp = stackSave();
      try {
        return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    __name(invoke_iiiiiii, "invoke_iiiiiii");
    function invoke_iiiiiiii(index, a1, a2, a3, a4, a5, a6, a7) {
      var sp = stackSave();
      try {
        return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    __name(invoke_iiiiiiii, "invoke_iiiiiiii");
    function invoke_viiiiiii(index, a1, a2, a3, a4, a5, a6, a7) {
      var sp = stackSave();
      try {
        getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    __name(invoke_viiiiiii, "invoke_viiiiiii");
    var calledRun;
    dependenciesFulfilled = /* @__PURE__ */ __name(function runCaller() {
      if (!calledRun) run();
      if (!calledRun) dependenciesFulfilled = runCaller;
    }, "runCaller");
    function callMain(args = []) {
      var entryFunction = _main;
      args.unshift(thisProgram);
      var argc = args.length;
      var argv = stackAlloc((argc + 1) * 4);
      var argv_ptr = argv;
      args.forEach((arg) => {
        HEAPU32[argv_ptr >> 2] = stringToUTF8OnStack(arg);
        argv_ptr += 4;
      });
      HEAPU32[argv_ptr >> 2] = 0;
      try {
        var ret = entryFunction(argc, argv);
        exitJS(ret, true);
        return ret;
      } catch (e) {
        return handleException(e);
      }
    }
    __name(callMain, "callMain");
    function run(args = arguments_) {
      if (runDependencies > 0) {
        return;
      }
      preRun();
      if (runDependencies > 0) {
        return;
      }
      function doRun() {
        if (calledRun) return;
        calledRun = true;
        Module2["calledRun"] = true;
        if (ABORT) return;
        initRuntime();
        preMain();
        readyPromiseResolve(Module2);
        Module2["onRuntimeInitialized"]?.();
        if (shouldRunNow) callMain(args);
        postRun();
      }
      __name(doRun, "doRun");
      if (Module2["setStatus"]) {
        Module2["setStatus"]("Running...");
        setTimeout(() => {
          setTimeout(() => Module2["setStatus"](""), 1);
          doRun();
        }, 1);
      } else {
        doRun();
      }
    }
    __name(run, "run");
    if (Module2["preInit"]) {
      if (typeof Module2["preInit"] == "function") Module2["preInit"] = [Module2["preInit"]];
      while (Module2["preInit"].length > 0) {
        Module2["preInit"].pop()();
      }
    }
    var shouldRunNow = true;
    if (Module2["noInitialRun"]) shouldRunNow = false;
    run();
    moduleRtn = readyPromise;
    return moduleRtn;
  };
})();
var php_8_4_cf_default = Module;

// src/index.ts
var WASM_UPSTREAM = "https://raw.githubusercontent.com/szzdmj/wasmphp/main/scripts/php_8_4.wasm";
var SCRIPTS_PATH = "/scripts/php_8_4.wasm";
var WASM_PATH = "/wasm/php_8_4.wasm";
async function fetchInfo(urlStr) {
  try {
    const r = await fetch(urlStr, { method: "GET" });
    const headers = {};
    for (const [k, v] of r.headers) headers[k] = v;
    return { ok: r.ok, status: r.status, headers, error: null };
  } catch (e) {
    return { ok: false, status: -1, headers: {}, error: e?.stack || String(e) };
  }
}
__name(fetchInfo, "fetchInfo");
var src_default = {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/health") {
      return new Response("ok", { headers: { "content-type": "text/plain" } });
    }
    if (url.pathname === SCRIPTS_PATH) {
      const res = await fetch(WASM_UPSTREAM, {
        // @ts-ignore
        cf: { cacheTtl: 300, cacheEverything: true }
      });
      if (!res.ok) {
        return new Response(`Upstream wasm fetch failed: ${res.status}`, {
          status: 502,
          headers: {
            "content-type": "text/plain; charset=utf-8",
            "x-worker-route": "scripts",
            "x-wasm-upstream-status": String(res.status)
          }
        });
      }
      const body = await res.arrayBuffer();
      return new Response(body, {
        headers: {
          "content-type": "application/wasm",
          "cache-control": "public, max-age=300",
          "x-worker-route": "scripts",
          "x-wasm-upstream-status": String(res.status)
        }
      });
    }
    if (url.pathname === WASM_PATH) {
      const res = await fetch(WASM_UPSTREAM, {
        // @ts-ignore
        cf: { cacheTtl: 300, cacheEverything: true }
      });
      if (!res.ok) {
        return new Response(`Upstream wasm fetch failed: ${res.status}`, {
          status: 502,
          headers: {
            "content-type": "text/plain; charset=utf-8",
            "x-worker-route": "wasm",
            "x-wasm-upstream-status": String(res.status)
          }
        });
      }
      const body = await res.arrayBuffer();
      return new Response(body, {
        headers: {
          "content-type": "application/wasm",
          "cache-control": "public, max-age=300",
          "x-worker-route": "wasm",
          "x-wasm-upstream-status": String(res.status)
        }
      });
    }
    if (url.pathname === "/__probe") {
      let importMetaUrl = null;
      try {
        importMetaUrl = import.meta?.url ?? null;
      } catch {
        importMetaUrl = null;
      }
      const scriptsURL = `${url.origin}${SCRIPTS_PATH}`;
      const wasmURL = `${url.origin}${WASM_PATH}`;
      const checkScripts = await fetchInfo(`${scriptsURL}?__ping=1`);
      const checkWasm = await fetchInfo(`${wasmURL}?__ping=1`);
      const fromUpstream = await fetchInfo(WASM_UPSTREAM);
      const routeHitScripts = checkScripts.headers["x-worker-route"] === "scripts";
      const routeHitWasm = checkWasm.headers["x-worker-route"] === "wasm";
      const selfFetchLikelyBlocked = !routeHitScripts && !routeHitWasm && checkScripts.status === 404 && checkWasm.status === 404 && fromUpstream.ok;
      const payload = {
        importMetaUrlPresent: typeof importMetaUrl === "string",
        importMetaUrl,
        scriptsURL,
        wasmURL,
        routeHitScripts,
        routeHitWasm,
        selfFetchLikelyBlocked,
        fetch_scripts: checkScripts,
        fetch_wasm: checkWasm,
        fetch_from_upstream: fromUpstream
      };
      return new Response(JSON.stringify(payload, null, 2), {
        headers: { "content-type": "application/json; charset=utf-8" }
      });
    }
    let out = "";
    try {
      const useOrigin = url.searchParams.get("useOrigin");
      const useUpstream = url.searchParams.get("useUpstream") === "1";
      const inline = url.searchParams.get("inline") === "1";
      let wasmBinary;
      if (inline) {
        const upstreamRes = await fetch(WASM_UPSTREAM, {
          // @ts-ignore
          cf: { cacheTtl: 300, cacheEverything: true }
        });
        if (!upstreamRes.ok) {
          return new Response(`Prefetch upstream wasm failed: ${upstreamRes.status}`, { status: 502 });
        }
        const buf = await upstreamRes.arrayBuffer();
        wasmBinary = new Uint8Array(buf);
      }
      const php = await php_8_4_cf_default({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...wasmBinary ? { wasmBinary } : {},
        locateFile: /* @__PURE__ */ __name((p) => {
          if (p.endsWith(".wasm")) {
            if (useUpstream) return WASM_UPSTREAM;
            if (useOrigin === "wasm") return `${url.origin}/wasm/${p}`;
            if (useOrigin === "scripts") return `${url.origin}/scripts/${p}`;
            return `${url.origin}/scripts/${p}`;
          }
          return p;
        }, "locateFile"),
        print: /* @__PURE__ */ __name((txt) => {
          out += txt + "\n";
        }, "print"),
        printErr: /* @__PURE__ */ __name((txt) => {
          out += "[stderr] " + txt + "\n";
        }, "printErr")
      });
      if (url.pathname === "/info") {
        php.callMain(["-r", "phpinfo();"]);
      } else {
        const code = url.searchParams.get("code") ?? 'echo "Hello from PHP WASM in Cloudflare Worker\\n";';
        php.callMain(["-r", code]);
      }
      return new Response(out, { headers: { "content-type": "text/plain; charset=utf-8" } });
    } catch (e) {
      const msg = e?.stack || String(e);
      return new Response("Runtime error:\n" + msg, {
        status: 500,
        headers: { "content-type": "text/plain; charset=utf-8" }
      });
    }
  }
};

// ../../../../../usr/local/lib/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../../../usr/local/lib/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-zRXiW1/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// ../../../../../usr/local/lib/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-zRXiW1/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
