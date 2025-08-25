// V31 执行版（增强健壮性）：单线程构建前提下运行 phpinfo()
// - 直接 ESM import .wasm（Wrangler 产出 WebAssembly.Module）
// - instantiateWasm 兼容实现：调用 successCallback 并返回 exports
// - 更细的错误捕捉 + 更长初始化超时，避免 Cloudflare 1101 并回传可读错误

import wasmAsset from "../scripts/php_8_4.wasm";

(function ensureGlobals() {
  const g = globalThis as any;
  if (typeof g.location === "undefined" || typeof g.location?.href === "undefined") {
    try {
      Object.defineProperty(g, "location", {
        value: { href: "file:///" },
        configurable: true,
        enumerable: false,
        writable: false,
      });
    } catch {}
  }
  if (typeof g.self === "undefined") {
    try {
      Object.defineProperty(g, "self", {
        value: g,
        configurable: true,
        enumerable: false,
        writable: false,
      });
    } catch {}
  } else if (typeof g.self.location === "undefined" && typeof g.location !== "undefined") {
    try {
      g.self.location = g.location;
    } catch {}
  }
})();

function isWasmModule(x: any): x is WebAssembly.Module {
  return Object.prototype.toString.call(x) === "[object WebAssembly.Module]";
}

function makeInstantiateWithModule(wasmModule: WebAssembly.Module) {
  // 兼容 Emscripten 的两种模式：返回 exports 或调用 successCallback
  return (imports: WebAssembly.Imports, successCallback: (i: WebAssembly.Instance) => void) => {
    const instance = new WebAssembly.Instance(wasmModule, imports);
    try {
      // 调用回调，确保走到 Emscripten 的标准路径
      successCallback(instance);
    } catch {
      // 即便回调失败，返回 exports 也可让 Emscripten继续
    }
    return instance.exports as any;
  };
}

function textResponse(body: string, status = 200, headers: Record<string, string> = {}) {
  return new Response(body, {
    status,
    headers: { "content-type": "text/plain; charset=utf-8", ...headers },
  });
}

async function buildModuleOptions(): Promise<any> {
  const opts: any = {
    noInitialRun: true,
    print: () => {},
    printErr: () => {},
    onRuntimeInitialized: () => {},
  };

  // 优先使用 ESM 导入产出的 WebAssembly.Module
  if (isWasmModule(wasmAsset)) {
    opts.instantiateWasm = makeInstantiateWithModule(wasmAsset as WebAssembly.Module);
    return opts;
  }

  // 兜底：若是 URL 字符串（极少数打包形态）
  if (typeof wasmAsset === "string") {
    const res = await fetch(wasmAsset);
    if (!res.ok) throw new Error(`Failed to fetch wasm from URL: ${res.status}`);
    const buf = await res.arrayBuffer();
    opts.wasmBinary = new Uint8Array(buf);
    return opts;
  }

  // 兜底：二进制
  if (wasmAsset instanceof ArrayBuffer) {
    opts.wasmBinary = new Uint8Array(wasmAsset);
    return opts;
  }
  if (ArrayBuffer.isView(wasmAsset)) {
    const view = wasmAsset as ArrayBufferView;
    opts.wasmBinary = new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
    return opts;
  }

  throw new Error("Unsupported wasm asset type at runtime");
}

async function runPhpInfo(): Promise<{ body: string; status: number; contentType: string }> {
  const debug: string[] = [];
  try {
    debug.push("step:import-glue");
    const phpModule = await import("../scripts/php_8_4.js");

    const initCandidate =
      (phpModule as any).init || (phpModule as any).default || (phpModule as any);
    if (typeof initCandidate !== "function") {
      return {
        body:
          "Runtime error: PHP init function not found on module export\n" +
          "Hint: ensure -s MODULARIZE=1 -s EXPORT_ES6=1\n" +
          `Exports: ${Object.keys(phpModule || {}).join(", ")}`,
        status: 500,
        contentType: "text/plain; charset=utf-8",
      };
    }

    debug.push("step:build-options");
    const stdout: string[] = [];
    const stderr: string[] = [];
    let resolveReady: () => void = () => {};
    const runtimeReady = new Promise<void>((res) => (resolveReady = res));

    const moduleOptions = await buildModuleOptions();
    moduleOptions.print = (txt: string) => {
      try {
        stdout.push(String(txt));
      } catch {}
    };
    moduleOptions.printErr = (txt: string) => {
      try {
        stderr.push(String(txt));
      } catch {}
    };
    moduleOptions.onRuntimeInitialized = () => {
      try {
        resolveReady();
      } catch {}
    };

    debug.push("step:init-factory");
    let php: any;
    try {
      php = await (initCandidate as any)(moduleOptions);
    } catch (e1: any) {
      // 某些构建变体可尝试传入环境字符串
      debug.push("factory:error-1:" + (e1?.message || e1));
      try {
        php = await (initCandidate as any)("WORKER", moduleOptions);
        debug.push("factory:retry-with-WORKER:ok");
      } catch (e2: any) {
        return {
          body:
            "Runtime error: PHP factory invocation failed\n" +
            "First error: " + (e1?.stack || e1) + "\n" +
            "Retry error: " + (e2?.stack || e2) + "\n",
          status: 500,
          contentType: "text/plain; charset=utf-8",
        };
      }
    }

    debug.push("step:await-ready");
    const READY_TIMEOUT_MS = 8000;
    const ready = await Promise.race([
      runtimeReady.then(() => true),
      new Promise<boolean>((res) => setTimeout(() => res(false), READY_TIMEOUT_MS)),
    ]);
    if (!ready) {
      const hint =
        "Emscripten runtime not initialized within timeout. Ensure the WASM build is single-threaded (no USE_PTHREADS/PROXY_TO_PTHREAD).";
      return {
        body:
          (stderr.length ? stderr.join("\n") + "\n" : "") +
          hint +
          "\nSee docs/BUILD-EMSCRIPTEN.md\n" +
          "trace: " + debug.join(" -> "),
        status: 500,
        contentType: "text/plain; charset=utf-8",
      };
    }

    debug.push("step:callMain");
    try {
      php.callMain(["-r", "phpinfo();"]);
    } catch (e: any) {
      if (e?.message) stderr.push("[callMain] " + e.message);
    }

    const ok = stdout.length ? stdout.join("\n") : "";
    const err = stderr.length ? stderr.join("\n") : "";
    return {
      body: (ok || err || "") + (debug.length ? `\n<!-- trace:${debug.join("->")} -->` : ""),
      status: ok ? 200 : err ? 500 : 204,
      contentType: ok ? "text/html; charset=utf-8" : "text/plain; charset=utf-8",
    };
  } catch (e: any) {
    return {
      body:
        "Runtime error (top-level): " + (e?.stack || String(e)) + "\n" +
        "trace: " + debug.join(" -> "),
      status: 500,
      contentType: "text/plain; charset=utf-8",
    };
  }
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    if (pathname === "/health") return textResponse("ok");

    if (pathname === "/__probe") {
      let importMetaUrl: string | null = null;
      try {
        importMetaUrl = (import.meta as any)?.url ?? null;
      } catch {
        importMetaUrl = null;
      }
      const body = {
        env: {
          esm: true,
          hasWorkerCtor: typeof (globalThis as any).Worker !== "undefined",
          hasSharedArrayBuffer: typeof (globalThis as any).SharedArrayBuffer !== "undefined",
          userAgent: (globalThis as any).navigator?.userAgent ?? null,
        },
        importMeta: { available: typeof import.meta !== "undefined", url: importMetaUrl },
      };
      return new Response(JSON.stringify(body, null, 2), {
        status: 200,
        headers: { "content-type": "application/json; charset=utf-8" },
      });
    }

    if (pathname === "/__jsplus") {
      try {
        const mod = await import("../scripts/php_8_4.js");
        const def = (mod as any)?.default ?? null;
        const hasFactory = typeof def === "function";
        const payload = {
          imported: true,
          hasDefaultFactory: hasFactory,
          exportKeys: Object.keys(mod || {}),
          note: "仅探测模块导出形态，不触发初始化。",
        };
        return new Response(JSON.stringify(payload, null, 2), {
          status: 200,
          headers: { "content-type": "application/json; charset=utf-8" },
        });
      } catch (e: any) {
        return textResponse("Import glue failed:\n" + (e?.stack || String(e)), 500);
      }
    }

    if (pathname === "/" || pathname === "/index.php") {
      try {
        const { body, status, contentType } = await runPhpInfo();
        return new Response(body, { status, headers: { "content-type": contentType } });
      } catch (e: any) {
        return textResponse("Runtime error (fetch): " + (e?.stack || String(e)), 500);
      }
    }

    return textResponse("Not Found", 404);
  },
};
