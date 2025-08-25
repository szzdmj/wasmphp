// V32 执行版（Minimal Runtime 适配）
// 结论：glue 不导出 callMain/run/ccall/cwrap，但导出了 _main。
// 方案：把 noInitialRun=false 与 arguments 传给工厂函数，
//       让 Emscripten 在初始化阶段自动执行 main(argv)，我们只收集输出。
// 保留 /__probe /__jsplus /__mod 诊断路由。

import wasmAsset from "../scripts/php_8_4.wasm";

// 轻量 polyfill，避免 glue 顶层访问 location/self 抛错
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
  // 兼容 Emscripten：既返回 exports，也调用 successCallback
  return (imports: WebAssembly.Imports, successCallback: (i: WebAssembly.Instance) => void) => {
    const instance = new WebAssembly.Instance(wasmModule, imports);
    try {
      successCallback(instance);
    } catch {}
    return instance.exports as any;
  };
}

function textResponse(body: string, status = 200, headers: Record<string, string> = {}) {
  return new Response(body, {
    status,
    headers: { "content-type": "text/plain; charset=utf-8", ...headers },
  });
}

async function buildModuleOptions(argv: string[]) {
  // 注意：noInitialRun=false 让 Emscripten 在初始化完成后自动执行 main(argv)
  const opts: any = {
    noInitialRun: false,
    arguments: argv.slice(),
    print: () => {},
    printErr: () => {},
    onRuntimeInitialized: () => {},
    // 捕获退出码，防止直接抛异常导致 1101
    quit: (status: number, toThrow?: any) => {
      // Emscripten 会在 exit 时调用 quit；我们不抛错，记录状态即可
      (opts as any).__exitStatus = status;
      (opts as any).__exitThrown = toThrow ? String(toThrow) : "";
    },
  };

  if (isWasmModule(wasmAsset)) {
    opts.instantiateWasm = makeInstantiateWithModule(wasmAsset as WebAssembly.Module);
    return opts;
  }

  if (typeof wasmAsset === "string") {
    const res = await fetch(wasmAsset);
    if (!res.ok) throw new Error(`Failed to fetch wasm from URL: ${res.status}`);
    const buf = await res.arrayBuffer();
    opts.wasmBinary = new Uint8Array(buf);
    return opts;
  }

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

async function createPhpModuleAndRun(argv: string[]) {
  const debug: string[] = [];
  const stdout: string[] = [];
  const stderr: string[] = [];
  let exitStatus: number | null = null;

  try {
    debug.push("step:import-glue");
    const phpModule = await import("../scripts/php_8_4.js");
    const initCandidate =
      (phpModule as any).init || (phpModule as any).default || (phpModule as any);
    if (typeof initCandidate !== "function") {
      return {
        ok: false,
        debug,
        stdout,
        stderr,
        error:
          "PHP init function not found on module export. " +
          "Hint: ensure -s MODULARIZE=1 -s EXPORT_ES6=1. " +
          `Exports: ${Object.keys(phpModule || {}).join(", ")}`,
      };
    }

    debug.push("step:build-options");
    const moduleOptions: any = await buildModuleOptions(argv);
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
      // 仅用于 trace；minimal runtime 会在此后自动调用 main(argv)
      debug.push("event:onRuntimeInitialized");
    };

    debug.push("step:init-factory");
    let php: any;
    try {
      php = await (initCandidate as any)(moduleOptions);
    } catch (e1: any) {
      try {
        php = await (initCandidate as any)("WORKER", moduleOptions);
        debug.push("factory:retry-with-WORKER:ok");
      } catch (e2: any) {
        return {
          ok: false,
          debug,
          stdout,
          stderr,
          error:
            "PHP factory invocation failed.\n" +
            "First error: " +
            (e1?.stack || e1) +
            "\n" +
            "Retry error: " +
            (e2?.stack || e2),
        };
      }
    }

    // 等待 runtime 初始化和 main 自动执行。为了稳妥，给一次短暂让步。
    debug.push("step:await-output");
    const WAIT_MS = 8000;
    const start = Date.now();
    while (Date.now() - start < WAIT_MS) {
      // 若 glue 维护 calledRun 标志，尝试读取
      if (typeof (php as any).calledRun !== "undefined") {
        debug.push("probe:calledRun=" + String((php as any).calledRun));
      }
      // 若退出码已记录，提前结束等待
      if (typeof moduleOptions.__exitStatus === "number") {
        exitStatus = moduleOptions.__exitStatus;
        break;
      }
      // 若已有明显输出，也可提前结束
      if (stdout.length > 0) break;
      await new Promise((r) => setTimeout(r, 50));
    }

    if (typeof moduleOptions.__exitStatus === "number") {
      exitStatus = moduleOptions.__exitStatus;
      debug.push("exit:" + String(exitStatus));
    }

    return { ok: true, debug, stdout, stderr, php, exitStatus };
  } catch (e: any) {
    return {
      ok: false,
      debug: ["catch-top", e?.message || String(e)],
      stdout,
      stderr,
      error: e?.stack || String(e),
    };
  }
}

async function runPhpInfo(): Promise<{ body: string; status: number; contentType: string }> {
  const argv = ["-r", "phpinfo();"];
  const res = await createPhpModuleAndRun(argv);

  if (!res.ok) {
    const body =
      (res.stderr.length ? res.stderr.join("\n") + "\n" : "") +
      (res.error || "Unknown error") +
      "\ntrace: " +
      (res.debug || []).join("->");
    return { body, status: 500, contentType: "text/plain; charset=utf-8" };
  }

  const ok = res.stdout.length ? res.stdout.join("\n") : "";
  const err = res.stderr.length ? res.stderr.join("\n") : "";
  const trace = res.debug && res.debug.length ? `\n<!-- trace:${res.debug.join("->")} -->` : "";
  const status = ok ? 200 : err ? 500 : typeof res.exitStatus === "number" ? (res.exitStatus === 0 ? 204 : 500) : 204;
  return {
    body: (ok || err || "") + trace,
    status,
    contentType: ok ? "text/html; charset=utf-8" : "text/plain; charset=utf-8",
  };
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

    if (pathname === "/__mod") {
      const argv = ["-r", "phpinfo();"];
      const res = await createPhpModuleAndRun(argv);
      const summary =
        res.ok
          ? {
              keys: res.php ? Object.keys(res.php) : [],
              has: {
                callMain: typeof (res.php as any)?.callMain === "function",
                run: typeof (res.php as any)?.run === "function",
                ccall: typeof (res.php as any)?.ccall === "function",
                cwrap: typeof (res.php as any)?.cwrap === "function",
                _main: typeof (res.php as any)?._main === "function",
                FS: !!(res.php as any)?.FS,
              },
              calledRun: (res.php as any)?.calledRun ?? undefined,
              exitStatus: res.exitStatus ?? undefined,
              trace: res.debug,
              stdoutSample: (res.stdout || []).slice(0, 2),
              stderrSample: (res.stderr || []).slice(0, 2),
            }
          : { error: res.error, trace: res.debug, stderr: res.stderr.slice(0, 5) };

      return new Response(JSON.stringify(summary, null, 2), {
        status: 200,
        headers: { "content-type": "application/json; charset=utf-8" },
      });
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
