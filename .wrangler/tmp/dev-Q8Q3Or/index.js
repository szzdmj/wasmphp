var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.ts
var JS_UPSTREAM = "https://raw.githubusercontent.com/szzdmj/wasmphp/main/scripts/php_8_4.js";
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
async function loadCreatePHP() {
  const res = await fetch(JS_UPSTREAM, {
    // @ts-ignore 可选缓存
    cf: { cacheTtl: 300, cacheEverything: true }
  });
  if (!res.ok) {
    throw new Error(`Fetch JS upstream failed: ${res.status}`);
  }
  let code = await res.text();
  code = code.replaceAll("import.meta.url", "undefined");
  code = code.replace("export default Module;", "globalThis.__PHP_FACTORY__ = Module;");
  const wrapper = `
    (function () {
      var module = undefined;
      var require = undefined;
      var window = undefined;
      var document = undefined;
      ${code}
    })();
  `;
  new Function(wrapper)();
  const factory = globalThis.__PHP_FACTORY__;
  if (typeof factory !== "function") {
    throw new Error("Patched PHP factory not found on globalThis");
  }
  return factory;
}
__name(loadCreatePHP, "loadCreatePHP");
var src_default = {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/health") {
      return new Response("ok", { headers: { "content-type": "text/plain" } });
    }
    if (url.pathname === SCRIPTS_PATH) {
      const res = await fetch(WASM_UPSTREAM, {
        // @ts-ignore Cloudflare 可选缓存
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
        // @ts-ignore Cloudflare 可选缓存
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
          // @ts-ignore 可选缓存
          cf: { cacheTtl: 300, cacheEverything: true }
        });
        if (!upstreamRes.ok) {
          return new Response(`Prefetch upstream wasm failed: ${upstreamRes.status}`, { status: 502 });
        }
        const buf = await upstreamRes.arrayBuffer();
        wasmBinary = new Uint8Array(buf);
      }
      const createPHP = await loadCreatePHP();
      const php = await createPHP({
        // 若提供 wasmBinary，Emscripten 将不会再发起网络请求加载 .wasm
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

// .wrangler/tmp/bundle-2IoZ21/middleware-insertion-facade.js
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

// .wrangler/tmp/bundle-2IoZ21/middleware-loader.entry.ts
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
