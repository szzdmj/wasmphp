// V33 执行版（Minimal Runtime + 路由扩展）
// - 构建形态：不导出 callMain/run，仅有 _main（minimal runtime）
// - 方案：noInitialRun=false + arguments，让初始化后自动执行 main(argv)
// - 新增：/run (GET/POST 执行代码)、/version、/help，保留 /info(/ /index.php)、诊断路由

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

type RunResult = {
  ok: boolean;
  stdout: string[];
  stderr: string[];
  debug: string[];
  exitStatus?: number;
  php?: any;
  error?: string;
};

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

async function createPhpModuleAndRun(argv: string[], waitMs = 8000): Promise<RunResult> {
  const debug: string[] = [];
  const stdout: string[] = [];
  const stderr: string[] = [];
  let exitStatus: number | undefined;

  try {
    debug.push("step:import-glue");
    const phpModule = await import("../scripts/php_8_4.js");
    const initCandidate =
      (phpModule as any).init || (phpModule as any).default || (phpModule as any);
    if (typeof initCandidate !== "function") {
      return {
        ok: false,
        stdout,
        stderr,
        debug,
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
          stdout,
          stderr,
          debug,
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

    // 等待 runtime 初始化和 main 自动执行
    debug.push("step:await-output");
    const start = Date.now();
    while (Date.now() - start < waitMs) {
      if (typeof (php as any).calledRun !== "undefined") {
        debug.push("probe:calledRun=" + String((php as any).calledRun));
      }
      if (typeof moduleOptions.__exitStatus === "number") {
        exitStatus = moduleOptions.__exitStatus;
        debug.push("exit:" + String(exitStatus));
        break;
      }
      // 若有明显输出也可提前结束
      if (stdout.length > 0) break;
      await new Promise((r) => setTimeout(r, 50));
    }

    return { ok: true, stdout, stderr, debug, php, exitStatus };
  } catch (e: any) {
    return {
      ok: false,
      stdout,
      stderr,
      debug: ["catch-top", e?.message || String(e)],
      error: e?.stack || String(e),
    };
  }
}

function buildArgvForCode(code: string, iniList: string[] = []): string[] {
  const argv: string[] = [];
  // 注入 -d 选项
  for (const d of iniList) {
    if (!d) continue;
    argv.push("-d", d);
  }
  // 使用 -r 执行代码
  argv.push("-r", code);
  return argv;
}

function parseIniParams(url: URL): string[] {
  // 支持 ?d=key=value 可重复；兼容 ?ini=key=value
  const out: string[] = [];
  const ds = url.searchParams.getAll("d").concat(url.searchParams.getAll("ini"));
  for (const s of ds) {
    const t = s.trim();
    if (t && t.includes("=")) out.push(t);
  }
  return out;
}

function inferContentTypeFromOutput(stdout: string, fallback = "text/plain; charset=utf-8") {
  // phpinfo() 输出为 HTML；其他默认纯文本
  if (stdout.includes("<html") || stdout.includes("<!DOCTYPE html")) {
    return "text/html; charset=utf-8";
  }
  return fallback;
}

async function routeInfo(): Promise<Response> {
  const argv = ["-r", "phpinfo();"];
  const res = await createPhpModuleAndRun(argv);
  if (!res.ok) {
    const body =
      (res.stderr.length ? res.stderr.join("\n") + "\n" : "") +
      (res.error || "Unknown error") +
      "\ntrace: " +
      (res.debug || []).join("->");
    return textResponse(body, 500);
  }
  const stdout = res.stdout.join("\n");
  const err = res.stderr.join("\n");
  const ct = inferContentTypeFromOutput(stdout, "text/html; charset=utf-8");
  const trace = res.debug.length ? `\n<!-- trace:${res.debug.join("->")} -->` : "";
  const body = (stdout || err || "") + trace;
  const status =
    stdout ? 200 : err ? 500 : typeof res.exitStatus === "number" ? (res.exitStatus === 0 ? 204 : 500) : 204;
  return new Response(body, { status, headers: { "content-type": ct } });
}

async function routeRunGET(url: URL): Promise<Response> {
  const codeRaw = url.searchParams.get("code") ?? "";
  const code = codeRaw;
  if (!code) return textResponse("Bad Request: missing code", 400);
  if (code.length > 64 * 1024) return textResponse("Payload Too Large", 413);
  const ini = parseIniParams(url);
  const argv = buildArgvForCode(code, ini);
  const res = await createPhpModuleAndRun(argv);
  if (!res.ok) {
    const body =
      (res.stderr.length ? res.stderr.join("\n") + "\n" : "") +
      (res.error || "Unknown error") +
      "\ntrace: " +
      (res.debug || []).join("->");
    return textResponse(body, 500);
  }
  const stdout = res.stdout.join("\n");
  const err = res.stderr.join("\n");
  const ct = inferContentTypeFromOutput(stdout);
  const trace = res.debug.length ? `\n<!-- trace:${res.debug.join("->")} -->` : "";
  const body = (stdout || err || "") + trace;
  const status =
    stdout ? 200 : err ? 500 : typeof res.exitStatus === "number" ? (res.exitStatus === 0 ? 204 : 500) : 204;
  return new Response(body, { status, headers: { "content-type": ct } });
}

async function routeRunPOST(request: Request, url: URL): Promise<Response> {
  const code = await request.text();
  if (!code) return textResponse("Bad Request: empty body", 400);
  if (code.length > 256 * 1024) return textResponse("Payload Too Large", 413);
  const ini = parseIniParams(url);
  const argv = buildArgvForCode(code, ini);
  const res = await createPhpModuleAndRun(argv, 10000);
  if (!res.ok) {
    const body =
      (res.stderr.length ? res.stderr.join("\n") + "\n" : "") +
      (res.error || "Unknown error") +
      "\ntrace: " +
      (res.debug || []).join("->");
    return textResponse(body, 500);
  }
  const stdout = res.stdout.join("\n");
  const err = res.stderr.join("\n");
  const ct = inferContentTypeFromOutput(stdout);
  const trace = res.debug.length ? `\n<!-- trace:${res.debug.join("->")} -->` : "";
  const body = (stdout || err || "") + trace;
  const status =
    stdout ? 200 : err ? 500 : typeof res.exitStatus === "number" ? (res.exitStatus === 0 ? 204 : 500) : 204;
  return new Response(body, { status, headers: { "content-type": ct } });
}

async function routeVersion(): Promise<Response> {
  const res = await createPhpModuleAndRun(["-v"]);
  const body = (res.stdout.join("\n") || res.stderr.join("\n") || "") + (res.debug.length ? `\ntrace:${res.debug.join("->")}` : "");
  return textResponse(body || "", res.ok ? 200 : 500);
}

async function routeHelp(): Promise<Response> {
  const res = await createPhpModuleAndRun(["-h"]);
  const body = (res.stdout.join("\n") || res.stderr.join("\n") || "") + (res.debug.length ? `\ntrace:${res.debug.join("->")}` : "");
  return textResponse(body || "", res.ok ? 200 : 500);
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    if (pathname === "/health") return textResponse("ok");

    // 诊断：环境
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

    // 诊断：仅导入 glue
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

    // 诊断：模块导出形态（初始化后）
    if (pathname === "/__mod") {
      const res = await createPhpModuleAndRun(["-r", "echo 'ok';"]);
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

    // 信息页：phpinfo
    if (pathname === "/" || pathname === "/index.php" || pathname === "/info") {
      return routeInfo();
    }

    // 执行：GET 代码
    if (pathname === "/run" && request.method === "GET") {
      return routeRunGET(url);
    }
    // 执行：POST 代码（text/plain）
    if (pathname === "/run" && request.method === "POST") {
      return routeRunPOST(request, url);
    }

    // php -v / -h
    if (pathname === "/version") return routeVersion();
    if (pathname === "/help") return routeHelp();

    return textResponse("Not Found", 404);
  },
};
