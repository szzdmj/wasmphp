// src/index.ts
// wasmphp worker - KV first, GitHub fallback, auto-run (eval) mode
// Fully self-contained, no local index.php import, Hono-free

import wasmAsset from "../scripts/php_8_4.wasm"; // must match your project file

// --- Types ---
type Env = {
  SRC?: KVNamespace;
  ADMIN_TOKEN?: string;
};

// --- Ensure minimal globals for Emscripten ---
(function ensureGlobals() {
  const g = globalThis as any;
  if (typeof g.location === "undefined") {
    try { Object.defineProperty(g, "location", { value: { href: "file:///" }, configurable: true }); } catch {}
  }
  if (typeof g.self === "undefined") {
    try { Object.defineProperty(g, "self", { value: g, configurable: true }); } catch {}
  } else if (typeof (g.self as any).location === "undefined") {
    try { (g.self as any).location = g.location; } catch {}
  }
})();

// --- Defaults ---
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

function toBase64Utf8(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

// --- normalize/clean php source for eval ---
function normalizePhpCodeForEval(src: string): string {
  let s = src.trimStart();
  if (s.charCodeAt(0) === 0xfeff) s = s.slice(1);
  if (s.startsWith("<?php")) s = s.slice(5);
  else if (s.startsWith("<?")) s = s.slice(2);
  s = s.replace(/\?>\s*$/s, "");
  return s;
}

// --- build init options ---
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
    opts.instantiateWasm = makeInstantiateWithModule(wasmAsset as WebAssembly.Module);
    return opts;
  }
  if (typeof wasmAsset === "string") {
    const res = await fetch(wasmAsset);
    if (!res.ok) throw new Error(`Failed to fetch wasm from URL: ${res.status}`);
    const buf = await res.arrayBuffer();
    opts.wasmBinary = buf;
    return opts;
  }
  if (wasmAsset instanceof ArrayBuffer) {
    opts.wasmBinary = wasmAsset;
    return opts;
  }
  if (ArrayBuffer.isView(wasmAsset)) {
    const view = wasmAsset as ArrayBufferView;
    opts.wasmBinary = view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength);
    return opts;
  }
  return opts;
}

// --- runAuto ---
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
    moduleOptions.print = (txt: string) => { try { stdout.push(String(txt)); } catch {} };
    moduleOptions.printErr = (txt: string) => { try { stderr.push(String(txt)); } catch {} };
    moduleOptions.onRuntimeInitialized = () => { debug.push("auto:event:onRuntimeInitialized"); };

    debug.push("auto:init-factory");
    try {
      await (initCandidate as any)(moduleOptions);
    } catch (e1: any) {
      try {
        await (initCandidate as any)("WORKER", moduleOptions);
        debug.push("auto:factory:WORKER:ok");
      } catch (e2: any) {
        return { ok: false, stdout, stderr, debug, error: "autoRun factory failed: " + (e1?.message || e1) + " / " + (e2?.message || e2) };
      }
    }

    const start = Date.now();
    while (Date.now() - start < waitMs) {
      if (typeof moduleOptions.__exitStatus === "number") { exitStatus = moduleOptions.__exitStatus; debug.push("auto:exit:" + String(exitStatus)); break; }
      if (stdout.length > 0) break;
      await new Promise((r) => setTimeout(r, 20));
    }
    return { ok: true, stdout, stderr, debug, exitStatus };
  } catch (e: any) {
    return { ok: false, stdout, stderr, debug: ["auto:catch-top", e?.message || String(e)], error: e?.stack || String(e) };
  }
}

// --- KV / GitHub source fetch ---
async function fetchKVPhpSource(env: Env, key: string): Promise<{ ok: boolean; code?: string; err?: string }> {
  try {
    if (!env || !env.SRC || typeof env.SRC.get !== "function") {
      return { ok: false, err: "KV binding SRC is not configured" };
    }
    const txt = await env.SRC.get(key, "text");
    if (txt == null) return { ok: false, err: `KV object not found: ${key}` };
    return { ok: true, code: normalizePhpCodeForEval(txt) };
  } catch (e: any) {
    return { ok: false, err: "KV get failed: " + (e?.message || String(e)) };
  }
}

async function fetchGithubPhpSource(owner: string, repo: string, path: string, ref?: string): Promise<{ ok: boolean; code?: string; err?: string }> {
  try {
    const branch = (ref && ref.trim()) || "main";
    const u = `https://raw.githubusercontent.com/${owner}/${repo}/${encodeURIComponent(branch)}/${path.replace(/^\/+/, "")}`;
    const headers: Record<string, string> = {
      "cache-control": "no-cache",
      "user-agent": "wasmphp-worker",
      "accept": "text/plain, */*",
    };
    let res = await fetch(u, { method: "GET", headers });
    if (res.ok) {
      const txt = await res.text();
      return { ok: true, code: normalizePhpCodeForEval(txt) };
    }
    return { ok: false, err: `Raw fetch failed: ${owner}/${repo}:${branch}/${path} (${res.status})` };
  } catch (e: any) {
    return { ok: false, err: "Raw fetch threw: " + (e?.message || String(e)) };
  }
}

// --- route helpers ---
async function routeRepoIndex(url: URL, env: Env) {
  const key = "public/index.php";
  let codeNormalized: string | undefined;
  if (env?.SRC) {
    const kv = await fetchKVPhpSource(env, key);
    if (kv.ok) codeNormalized = kv.code;
  }
  if (!codeNormalized) {
    const gh = await fetchGithubPhpSource("szzdmj", "wasmphp", key);
    if (!gh.ok) return textResponse(gh.err || "Fetch error", 502);
    codeNormalized = gh.code;
  }

  const b64 = toBase64Utf8(codeNormalized || "");
  const oneLiner = wrapCodeWithShutdownNewline(`eval(base64_decode('${b64}'));`);
  const ini = parseIniParams(url);
  const argv = buildArgvForCode(oneLiner, ini);
  const res = await runAuto(argv, 10000);
  return finalizeOk(url, res, "text/html; charset=utf-8");
}

async function routeRunGET(url: URL) {
  const codeRaw = url.searchParams.get("code") ?? "";
  if (!codeRaw) return textResponse("Bad Request: missing code", 400);
  const ini = parseIniParams(url);
  const argv = buildArgvForCode(wrapCodeWithShutdownNewline(codeRaw), ini);
  const res = await runAuto(argv);
  return finalizeOk(url, res, "text/plain; charset=utf-8");
}

// --- main fetch handler ---
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    if (pathname === "/health") return textResponse("ok");

    if (pathname === "/__jsplus") {
      try {
        const mod = await import("../scripts/php_8_4.js");
        const def = (mod as any)?.default ?? null;
        const hasFactory = typeof def === "function";
        const payload = { imported: true, hasDefaultFactory: hasFactory, exportKeys: Object.keys(mod || {}), note: "import-only, no init" };
        return new Response(JSON.stringify(payload, null, 2), { status: 200, headers: { "content-type": "application/json; charset=utf-8" } });
      } catch (e: any) {
        return textResponse("Import glue failed:\n" + (e?.stack || String(e)), 500);
      }
    }

    if (pathname === "/run" && request.method === "GET") return routeRunGET(url);

    if (pathname === "/" || pathname === "/index.php") return routeRepoIndex(url, env);

    return textResponse("Not Found", 404);
  },
};
