import dependencyFilename from './php_8_4.wasm';
export { dependencyFilename };
export const dependenciesTotalSize = 20087917;
const phpVersionString = '8.4.10';
export async function init(RuntimeName, PHPLoader) {
    // The rest of the code comes from the built php.js file and esm-suffix.js
    var Module = typeof PHPLoader != "undefined" ? PHPLoader : {};
    var ENVIRONMENT_IS_WEB = RuntimeName === "WEB";
    var ENVIRONMENT_IS_WORKER = RuntimeName === "WORKER";
    var ENVIRONMENT_IS_NODE = RuntimeName === "NODE";
    var moduleOverrides = {};
    var key, value;
    var arguments_ = [];
    var thisProgram = "./this.program";
    var quit_ = (status, toThrow) => { throw toThrow };
    var scriptDirectory = "";
    var wasmBinary = Module["wasmBinary"];

    // FIX: instantiateWasm 必须是同步签名，且返回 exports 或空对象（回调路径）
    Module.instantiateWasm = function(importObject, successCallback) {
      try {
        const bin = Module["wasmBinary"];

        // 1) 绑定为已编译的 WebAssembly.Module（wrangler wasm_modules 注入的典型形态）
        if (typeof WebAssembly !== "undefined" && bin instanceof WebAssembly.Module) {
          const instance = new WebAssembly.Instance(bin, importObject);
          successCallback(instance);
          return instance.exports; // 同步返回 exports
        }

        // 2) 绑定为 ArrayBuffer / Uint8Array（二进制）
        if (bin && (bin instanceof ArrayBuffer || (bin.buffer instanceof ArrayBuffer))) {
          WebAssembly.instantiate(bin, importObject).then(({ instance }) => {
            successCallback(instance);
          }).catch((e) => {
            if (Module.printErr) Module.printErr("instantiateWasm failed: " + e?.message);
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
    var ExitStatus = class PHPExitStatus extends Error {
        constructor(status) {
            super(status);
            this.name = 'ExitStatus';
            this.message = 'Program terminated with exit(' + status + ')';
            this.status = status;
        }
    };
    var callRuntimeCallbacks = callbacks => { while (callbacks.length > 0) { callbacks.shift()(Module); } };
    var onPostRuns = [];
    var addOnPostRun = cb => onPostRuns.unshift(cb);
    var onPreRuns = [];
    var addOnPreRun = cb => onPreRuns.unshift(cb);
    var noExitRuntime = Module["noExitRuntime"] || false;
    var stackRestore = val => __emscripten_stack_restore(val);
    var stackSave = () => _emscripten_stack_get_current();
    var UTF8Decoder = typeof TextDecoder != "undefined" ? new TextDecoder("utf8") : undefined;

    PHPLoader.debug = 'debug' in PHPLoader ? PHPLoader.debug : true;
    if (PHPLoader.debug && typeof Asyncify !== "undefined") {
        const originalHandleSleep = Asyncify.handleSleep;
        Asyncify.handleSleep = function (startAsync) {
            if (!ABORT) {
                Module["lastAsyncifyStackSource"] = new Error();
            }
            return originalHandleSleep(startAsync);
        }
    }

    const originalRemoveRunDependency = PHPLoader['removeRunDependency'];
    PHPLoader['removeRunDependency'] = function (...args) {
        try {
            originalRemoveRunDependency(...args);
        } catch (e) {
            PHPLoader['onAbort'](e);
        }
    }

    PHPLoader['malloc'] = _malloc;
    PHPLoader['free'] = typeof _free === 'function' ? _free : PHPLoader['_wasm_free'];

    if (typeof NODEFS === 'object') {
        const originalCreateNode = NODEFS.createNode;
        NODEFS.createNode = function createNodeWithSharedFlag() {
            const node = originalCreateNode.apply(NODEFS, arguments);
            node.isSharedFS = true;
            return node;
        };

        var originalHashAddNode = FS.hashAddNode;
        FS.hashAddNode = function hashAddNodeIfNotSharedFS(node) {
            if (
                typeof locking === 'object' &&
                locking?.is_shared_fs_node(node)
            ) {
                return;
            }
            return originalHashAddNode.apply(FS, arguments);
        };
    }

    PHPLoader['phpVersion'] = (() => {
        const [major, minor, patch] = phpVersionString.split('.').map(Number);
        return { major, minor, patch };
    })();

    return PHPLoader;
}
