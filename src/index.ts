// src/index.ts
// wasmphp worker - KV first, GitHub fallback, auto-run (eval) mode
// Clean and runnable version

import wasmAsset from "../scripts/php_8_4.wasm"; // must exist in project

type Env = {
  SRC?: KVNamespace;
  ADMIN_TOKEN?: string;
};

// --- Ensure minimal globals for Emscripten glue in Workers ---
(function ensureGlobals() {
  const g = globalThis as any;
  if (typeof g.location === "undefined" || typeof g.location?.href === "undefined") {
    try { Object.defineProperty(g, "location", { value: { href: "file:///" }, configurable: true }); } catch {}
  }
  if (typeof g.self === "undefined") {
    try { Object.defineProperty(g, "self", { value: g, configurable: true }); } catch {}
  } else if (typeof (g.self as any).location === "undefined" && typeof g.location !== "undefined") {
    try { (g.self as any).location = g.location; } catch {}
  }
})();

const DEFAULT_INIS = [
  "pcre.jit=0",
  "opcache.enable=0",
  "opcache.enable_cli=0",
  "opcache.jit=0",
  "opcache.jit_buffer_size=0",
  "opcache.file_cache=",
  "output_buffering=0",
  "implicit_flush=1",
  "zlib.output_compression=0",
  "display_errors=1",
  "display_startup_errors=1",
];

function textResponse(body: string, status = 200, headers: Record<string, string> = {}) {
  return new Response(body, { status, headers: { "content-type": "text/plain; charset=utf-8", ...headers } });
}

function parseIniParams(url: URL): string[] {
  const out: string[] = [];
  const ds = url.searchParams.getAll("d").concat(url.searchParams.getAll("ini"));
  for (const s of ds) {
    const t = s.trim();
    if (t && t.includes("=")) out.push(t);
  }
  return out;
}

function buildArgvForCode(code: string, iniList: string[] = []): string[] {
  const argv: string[] = [];
  for (const d of DEFAULT_INIS) argv.push("-d", d);
  for (const d of iniList) if (d) argv.push("-d", d);
  argv.push("-r", code);
  return argv;
}

function wrapCodeWithShutdownNewline(code: string): string {
  return `register_shutdown_function(function(){echo "\\n";}); ${code}`;
}

function kvKeyFromPath(pathname: string): string | null {
  let p = decodeURIComponent(pathname);
  if (p.endsWith("/")) p += "index.php";
  if (p === "/") p = "/index.php";
  let key = p.replace(/^\/+/, "");
  if (!key || key.endsWith("/") || key.includes("..")) return null;
  if (!key.startsWith("public/")) key = "public/" + key;
  key = key.replace(/^public\/public\//, "public/"); // 防 double public
  return key;
}

function normalizePhpCodeForEval(src: string): string {
  let s = src.trimStart();
  if (s.charCodeAt(0) === 0xfeff) s = s.slice(1);
  if (s.startsWith("<?php")) s = s.slice(5);
  else if (s.startsWith("<?")) s = s.slice(2);
  s = s.replace(/\?>\s*$/s, "");
  return s;
}

function isWasmModule(x: any): x is WebAssembly.Module {
  return Object.prototype.toString.call(x) === "[object WebAssembly.Module]";
}
function makeInstantiateWithModule(wasmModule: WebAssembly.Module) {
  return (imports: WebAssembly.Imports, successCallback: (i: WebAssembly.Instance) => void) => {
    const instance = new WebAssembly.Instance(wasmModule, imports);
    try { successCallback(instance); } catch {}
    return instance.exports as any;
  };
}

async function buildInitOptions(base: Partial<any>) {
  const opts: any = {
    noInitialRun: false,
    print: () => {},
    printErr: () => {},
    onRuntimeInitialized: () => {},
    quit: (status: number, toThrow?: any) => {
      (opts as any).__exitStatus = status;
      (opts as any).__exitThrown = toThrow ? String(toThrow) : "";
    },
    ...base,
  };

  if (isWasmModule(wasmAsset)) {
    opts.instantiateWasm = makeInstantiateWithModule(wasmAsset);
    return opts;
  }
  if (typeof wasmAsset === "string") {
    const res = await fetch(wasmAsset);
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
  return opts;
}

// --- runAuto: import glue and init once ---
async function runAuto(argv: string[], waitMs = 8000) {
  const debug: string[] = [];
  const stdout: string[] = [];
  const stderr: string[] = [];
  let exitStatus: number | undefined;
  try {
    debug.push("auto:import-glue");
    const phpModule = await import("../scripts/php_8_4.js");
    const initCandidate = (phpModule as any).init || (phpModule as any).default || (phpModule as any);
    if (typeof initCandidate !== "function") {
      return { ok: false, stdout, stderr, debug, error: "PHP init factory not found" };
    }
    debug.push("auto:build-options");
    const moduleOptions: any = await buildInitOptions({ arguments: argv.slice() });
    moduleOptions.print = (txt: string) => { stdout.push(String(txt)); };
    moduleOptions.printErr = (txt: string) => { stderr.push(String(txt)); };
    moduleOptions.onRuntimeInitialized = () => { debug.push("auto:event:onRuntimeInitialized"); };

    debug.push("auto:init-factory");
    await initCandidate(moduleOptions);

    const start = Date.now();
    while (Date.now() - start < waitMs) {
      if (typeof moduleOptions.__exitStatus === "number") {
        exitStatus = moduleOptions.__exitStatus;
        debug.push("auto:exit:" + String(exitStatus));
        break;
      }
      if (stdout.length > 0) break;
      await new Promise((r) => setTimeout(r, 20));
    }

    return { ok: true, stdout, stderr, debug, exitStatus };
  } catch (e: any) {
    return { ok: false, stdout, stderr, debug: ["auto:catch-top", e?.message || String(e)], error: e?.stack || String(e) };
  }
}

// --- Worker fetch ---
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);
      const pathname = url.pathname;

      if (pathname === "/run" && request.method === "GET") {
        const code = url.searchParams.get("code") || "";
        const iniList = parseIniParams(url);
        const argv = buildArgvForCode(wrapCodeWithShutdownNewline(normalizePhpCodeForEval(code)), iniList);
        const result = await runAuto(argv);
        return textResponse(result.stdout.join("\n"));
      }

      if (pathname === "/version") return textResponse("wasmphp worker v1");
      if (pathname === "/help") return textResponse("usage: /run?code=echo 123;");

      return textResponse("Not Found", 404);
    } catch (err: any) {
      return new Response("WASM PHP runtime error:\n" + (err?.stack || err), { status: 500 });
    }
  },
};
