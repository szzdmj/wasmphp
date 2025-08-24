import dependencyFilename from './php_8_4.wasm';
export { dependencyFilename };
export const dependenciesTotalSize = 20087917;
const phpVersionString = '8.4.10';

export async function init(PHPLoader) {
  // The rest of the code comes from the built php.js file and esm-suffix.js
  var Module = typeof PHPLoader != "undefined" ? PHPLoader : {};

  // 兜底：如果外部没传 wasmBinary，则使用打包进来的
  Module["wasmBinary"] = Module["wasmBinary"] || dependencyFilename;

  // Auto-detect environment, defaulting to WORKER for Cloudflare Workers
  var RuntimeName = Module["environment"] || (typeof self !== "undefined" && typeof window === "undefined" ? "WORKER" : "WEB");
  var ENVIRONMENT_IS_WEB = RuntimeName === "WEB";
  var ENVIRONMENT_IS_WORKER = RuntimeName === "WORKER";  
  var ENVIRONMENT_IS_NODE = RuntimeName === "NODE";
  var moduleOverrides = {};
  var key, value;
  var arguments_ = [];
  var thisProgram = "./this.program";
  var quit_ = (status, toThrow) => { throw toThrow };
  var scriptDirectory = "";

  // FIX: instantiateWasm 必须是同步签名，且返回 exports 或空对象（回调路径）
  Module.instantiateWasm = function(importObject, successCallback) {
    try {
      const bin = Module["wasmBinary"];

      // 1) 已编译的 WebAssembly.Module（Workers wasm_modules 注入的典型形态）
      if (typeof WebAssembly !== "undefined" && bin instanceof WebAssembly.Module) {
        const instance = new WebAssembly.Instance(bin, importObject);
        successCallback(instance);
        return instance.exports; // 同步返回 exports
      }

      // 2) 原始二进制：ArrayBuffer / Uint8Array
      if (bin && (bin instanceof ArrayBuffer || (bin.buffer instanceof ArrayBuffer))) {
        WebAssembly.instantiate(bin, importObject).then(({ instance }) => {
          successCallback(instance);
        }).catch((e) => {
          if (Module.printErr) Module.printErr("instantiateWasm failed: " + (e?.message || e));
          throw e;
        });
        return {}; // 走回调路径时返回空对象
      }

      // 无有效二进制
      throw new Error("wasmBinary not provided or invalid. Expect WebAssembly.Module or ArrayBuffer.");
    } catch (e) {
      if (Module.printErr) Module.printErr("instantiateWasm exception: " + (e?.message || e));
      throw e;
    }
  };

  function locateFile(path) {
    if (Module["locateFile"]) {
      return Module["locateFile"](path, scriptDirectory)
    }
    return scriptDirectory + path
  }

  var readAsync, readBinary;
  if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
    if (ENVIRONMENT_IS_WORKER) {
      scriptDirectory = (typeof self !== "undefined" && self.location && self.location.href) ? self.location.href : "";
    }
    // EventEmitter 精简保留
    var EventEmitter = class EventEmitter {
      constructor() { this.listeners = {}; }
      emit(eventName, data) {
        if (this.listeners[eventName]) {
          this.listeners[eventName].forEach(callback => { callback(data); });
        }
      }
      once(eventName, callback) {
        const self = this;
        function removedCallback() {
          callback(...arguments);
          self.removeListener(eventName, removedCallback);
        }
        this.on(eventName, removedCallback);
      }
      on(eventName, callback) {
        if (!this.listeners[eventName]) this.listeners[eventName] = [];
        this.listeners[eventName].push(callback);
      }
      removeListener(eventName, callback) {
        if (!this.listeners[eventName]) return;
        const idx = this.listeners[eventName].indexOf(callback);
        if (idx >= 0) this.listeners[eventName].splice(idx, 1);
      }
    };
    // 不 fetch，不引用 url
  }

  var out = Module["print"] || console.log.bind(console);
  var err = Module["printErr"] || console.error.bind(console);
  Object.assign(Module, moduleOverrides); moduleOverrides = null;
  if (Module["arguments"]) arguments_ = Module["arguments"];
  if (Module["thisProgram"]) thisProgram = Module["thisProgram"];
  if (Module["quit"]) quit_ = Module["quit"];
  var wasmMemory;
  var ABORT = false;
  var EXITSTATUS;
  function assert(condition, text) { if (!condition) { abort(text) } }
  var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAP64, HEAPU64, HEAPF64;
  var runtimeInitialized = false;
  var runtimeExited = false;
  function callRuntimeCallbacks(callbacks) { while (callbacks.length > 0) { callbacks.shift()(Module) } }

  // 严格模式下要声明
  var ExitStatus = class PHPExitStatus extends Error {
    constructor(status) {
      super(status);
      this.name = 'ExitStatus';
      this.message = 'Program terminated with exit(' + status + ')';
      this.status = status;
    }
  };

  // For the single-object calling pattern, just return the Module
  // The initialization should be handle by the underlying Emscripten runtime
  if (typeof addOnPostRun === 'function') {
    addOnPostRun(() => {
      PHPLoader.malloc = Module._malloc || (Module.cwrap && Module.cwrap('malloc', 'number', ['number']));
      PHPLoader.free = Module._free || (Module.cwrap && Module.cwrap('free', null, ['number'])) || PHPLoader._wasm_free;
    });
  } else {
    // 兜底：如果当前位置还没有 addOnPostRun 就用 onRuntimeInitialized
    Module.onRuntimeInitialized = () => {
      PHPLoader.malloc = Module._malloc || (Module.cwrap && Module.cwrap('malloc', 'number', ['number']));
      PHPLoader.free = Module._free || (Module.cwrap && Module.cwrap('free', null, ['number'])) || PHPLoader._wasm_free;
    };
  }

  return PHPLoader;
}
