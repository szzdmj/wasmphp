// src/index.ts
// wasmphp worker - KV first, GitHub fallback, auto-run (eval) mode
// Minimal, cleaned, and runnable version based on your prior code.

import wasmAsset from "../scripts/php_8_4.wasm"; // must match your project file
// note: glue loader is imported dynamically inside runAuto: ../scripts/php_8_4.js

// --- Types ---
type Env = {
  SRC?: KVNamespace;
  ADMIN_TOKEN?: string;
  // other env keys allowed
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

// --- Defaults / helpers ---
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
  // ensure there is a trailing newline printed to mark EOF
  return `register_shutdown_function(function(){echo "\\n";}); ${code}`;
}

function toBase64Utf8(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

// --- KV key normalization (防 double public) ---
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

// --- normalize/clean php source for eval (strip <?php etc) ---
function normalizePhpCodeForEval(src: string): string {
  let s = src.trimStart();
  if (s.charCodeAt(0) === 0xfeff) s = s.slice(1);
  if (s.startsWith("<?php")) s = s.slice(5);
  else if (s.startsWith("<?")) s = s.slice(2);
  s = s.replace(/\?>\s*$/s, "");
  return s;
}

// --- build init options (handles wasmAsset types) ---
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
    noInitialRun: false, // auto-run
    print: () => {},
    printErr: () => {},
    onRuntimeInitialized: () => {},
    quit: (status: number, toThrow?: any) => {
      (opts as any).__exitStatus = status;
      (opts as any).__exitThrown = toThrow ? String(toThrow) : "";
    },
    ...base,
  };

  // normalize wasmAsset into Uint8Array (most glue variants accept this reliably)
  try {
  if (isWasmModule(wasmAsset)) {
      // If compiled-in Module, use instantiate hook (no binary)
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
      // copy into a compact Uint8Array slice to avoid exposing larger backing buffers
      opts.wasmBinary = new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
      // create a copy to be extra safe
      opts.wasmBinary = new Uint8Array(opts.wasmBinary);
    return opts;
  }

    // Last resort: leave to glue to fetch; return opts as-is
  return opts;
  } catch (e) {
    // If something unexpected happens, surface a clearer error
    throw new Error("buildInitOptions error: " + (e?.message || String(e)));
  }
}

// --- runAuto: import glue and init with argv (auto-run) ---
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
    await initCandidate(moduleOptions);  // ✅ 只用这一种调用

    // wait for output or exit marker
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

      // KV diag/put
      if (pathname === "/__kv") return routeKvDiag(url, env);
      if (pathname === "/__put" && (request.method === "POST" || request.method === "PUT")) return routeKvPut(request, url, env);

      // Root / index -> repo index (KV first)
      if (pathname === "/" || pathname === "/index.php" || pathname === "/public/index.php") {
        return routeRepoIndex(url, env);
      }

      // info / run / version / help
      if (pathname === "/info") return routeInfo(url);
      if (pathname === "/run" && request.method === "GET") return routeRunGET(url);
      if (pathname === "/run" && request.method === "POST") return routeRunPOST(request, url);
      if (pathname === "/version") return routeVersion();
      if (pathname === "/help") return routeHelp();

      // fallback: for any other path, try to treat it as request for a key; attempt to run code if `code` present
      // For static resources we expect them served by other worker logic; here we respond 404.
      return textResponse("Not Found", 404);
    } catch (err: any) {
      return new Response("WASM PHP runtime error:\n" + (err?.stack || err), { status: 500 });
    }
  },
};
