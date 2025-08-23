import dependencyFilename from './php_8_4.wasm';
export { dependencyFilename }; 
export const dependenciesTotalSize = 20087917; 
const phpVersionString = '8.4.10';
export async function init(RuntimeName, PHPLoader) {
    // The rest of the code comes from the built php.js file and esm-suffix.js
var Module=typeof PHPLoader!="undefined"?PHPLoader:{};
var ENVIRONMENT_IS_WEB=RuntimeName==="WEB";
var ENVIRONMENT_IS_WORKER=RuntimeName==="WORKER";
var ENVIRONMENT_IS_NODE=RuntimeName==="NODE";
    var moduleOverrides = {};
    var key, value;
var arguments_=[];
var thisProgram="./this.program";
    var quit_ = (status, toThrow) => { throw toThrow };
var scriptDirectory="";
    function locateFile(path) {
        if (Module["locateFile"]) {
            return Module["locateFile"](path, scriptDirectory)
        }
        return scriptDirectory + path
    }
var readAsync,readBinary;
    if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
        if (ENVIRONMENT_IS_WORKER) {
            scriptDirectory = self.location.href;
        }
        // --- EventEmitter: only browser implementation, no Node require ---
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
// --- End EventEmitter patch ---
var response=await fetch(url,{credentials:"same-origin"});
    if (response.ok) { return response.arrayBuffer(); }
    throw new Error(response.status + " : " + response.url);
}
var out=Module["print"]||console.log.bind(console);
var err=Module["printErr"]||console.error.bind(console);Object.assign(Module,moduleOverrides);moduleOverrides=null;if(Module["arguments"])arguments_=Module["arguments"];if(Module["thisProgram"])thisProgram=Module["thisProgram"];
if (Module["quit"]) quit_=Module["quit"];
var wasmBinary=Module["wasmBinary"];
var wasmMemory;
var ABORT=false;
var EXITSTATUS;
function assert(condition,text){if(!condition){abort(text)}}var HEAP8,HEAPU8,HEAP16,HEAPU16,HEAP32,HEAPU32,HEAPF32,HEAP64,HEAPU64,HEAPF64;var runtimeInitialized=false;var runtimeExited=false;function callRuntimeCallbacks(callbacks){while(callbacks.length>0){callbacks.shift()(Module)}}
ExitStatus = class PHPExitStatus extends Error {
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
var addOnPreRun=cb=>onPreRuns.unshift(cb);
    var noExitRuntime = Module["noExitRuntime"] || false;
    var stackRestore = val => __emscripten_stack_restore(val);
    var stackSave = () => _emscripten_stack_get_current();
    var UTF8Decoder = typeof TextDecoder != "undefined" ? new TextDecoder("utf8") : undefined;
    // url = SOCKFS.websocketArgs["url"](...arguments); // removed for Cloudflare/Browser use
/**
 * Debugging Asyncify errors is tricky because the stack trace is lost when the
 * error is thrown. This code saves the stack trace in a global variable
 * so that it can be inspected later.
 */
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

/**
 * Data dependencies call removeRunDependency() when they are loaded.
 * The synchronous call stack then continues to run. If an error occurs
 * in PHP initialization, e.g. Out Of Memory error, it will not be
 * caught by any try/catch. This override propagates the failure to
 * PHPLoader.onAbort() so that it can be handled.
 */
const originalRemoveRunDependency = PHPLoader['removeRunDependency'];
PHPLoader['removeRunDependency'] = function (...args) {
    try {
        originalRemoveRunDependency(...args);
    } catch (e) {
        PHPLoader['onAbort'](e);
    }
}

/**
 * Other exports live in the Dockerfile in:
 *
 * * EXPORTED_RUNTIME_METHODS
 * * EXPORTED_FUNCTIONS
 *
 * These exports, however, live in here because:
 *
 * * Listing them in EXPORTED_RUNTIME_METHODS doesn't actually
 *   export them. This could be a bug in Emscripten or a consequence of
 *   that option being deprecated.
 * * Listing them in EXPORTED_FUNCTIONS works, but they are overridden
 *   on every `BasePHP.run()` call. This is a problem because we want to
 *   spy on these calls in some unit tests.
 *
 * Therefore, we export them here.
 */
PHPLoader['malloc'] = _malloc;
PHPLoader['free'] = typeof _free === 'function' ? _free : PHPLoader['_wasm_free'];

if (typeof NODEFS === 'object') {
    // We override NODEFS.createNode() to add an `isSharedFS` flag to all NODEFS
    // nodes. This way we can tell whether file-locking is needed and possible
    // for an FS node, even if wrapped with PROXYFS.
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
            // Avoid caching shared VFS nodes so multiple instances
            // can access the same underlying filesystem without
            // conflicting caches.
            return;
        }
        return originalHashAddNode.apply(FS, arguments);
    };
}

/**
 * Expose the PHP version so the PHP class can make version-specific
 * adjustments to `php.ini`.
 */
PHPLoader['phpVersion'] = (() => {
    const [ major, minor, patch ] = phpVersionString.split('.').map(Number);
    return { major, minor, patch };
})();

return PHPLoader;

// Close the opening bracket from esm-prefix.js:
}
