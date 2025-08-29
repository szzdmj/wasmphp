// src/index.ts
import wasmAsset from "../scripts/php_8_4.wasm";

// --- Types ---
type Env = {
  SRC?: KVNamespace;
  ADMIN_TOKEN?: string;
};

// --- Ensure minimal globals for Emscripten ---
(function ensureGlobals() {
  const g = globalThis as any;
  if (typeof g.location === "undefined") {
    Object.defineProperty(g, "location", { value: { href: "file:///" }, configurable: true });
  }
  if (typeof g.self === "undefined") {
    Object.defineProperty(g, "self", { value: g, configurable: true });
  } else if (typeof (g.self as any).location === "undefined") {
    (g.self as any).location = g.location;
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

// --- Helpers ---
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
function wrapCodeWithShutdownNewline(code: string) {
  return `register_shutdown_function(function(){echo "\\n";}); ${code}`;
}
function toBase64Utf8(s: string) {
  const bytes = new TextEncoder().encode(s);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}
function normalizePhpCodeForEval(src: string): string {
  let s = src.trimStart();
  if (s.charCodeAt(0) === 0xfeff) s = s.slice(1);
  if (s.startsWith("<?php")) s = s.slice(5);
  else if (s.startsWith("<?")) s = s.slice(2);
  s = s.replace(/\?>\s*$/s, "");
  return s;
}
function kvKeyFromPath(pathname: string): string | null {
  let p = decodeURIComponent(pathname);
  if (p.endsWith("/")) p += "index.php";
  if (p === "/") p = "/index.php";
  let key = p.replace(/^\/+/, "");
  if (!key || key.includes("..")) return null;
  if (!key.startsWith("public/")) key = "public/" + key;
  key = key.replace(/^public\/public\//, "public/");
  return key;
}

// --- WASM Init ---
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
    if (!res.ok) throw new Error(`Failed to fetch wasm: ${res.status}`);
    opts.wasmBinary = await res.arrayBuffer();
    return opts;
  }
  if (wasmAsset instanceof ArrayBuffer) opts.wasmBinary = wasmAsset;
  if (ArrayBuffer.isView(wasmAsset)) opts.wasmBinary = wasmAsset.buffer.slice(wasmAsset.byteOffset, wasmAsset.byteOffset + wasmAsset.byteLength);
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
    if (typeof initCandidate !== "function") return { ok: false, stdout, stderr, debug, error: "PHP init factory not found" };
    debug.push("auto:build-options");
    const moduleOptions: any = await buildInitOptions({ arguments: argv.slice() });
    moduleOptions.print = (txt: string) => { try { stdout.push(String(txt)); } catch {} };
    moduleOptions.printErr = (txt: string) => { try { stderr.push(String(txt)); } catch {} };
    moduleOptions.onRuntimeInitialized = () => { debug.push("auto:onRuntimeInitialized"); };

    debug.push("auto:init-factory");
    try { await (initCandidate as any)(moduleOptions); } 
    catch (e1) { try { await (initCandidate as any)("WORKER", moduleOptions); debug.push("auto:factory:WORKER:ok"); } 
    catch (e2) { return { ok: false, stdout, stderr, debug, error: "autoRun factory failed" }; } }

    const start = Date.now();
    while (Date.now() - start < waitMs) {
      if (typeof moduleOptions.__exitStatus === "number") { exitStatus = moduleOptions.__exitStatus; debug.push("auto:exit:" + exitStatus); break; }
      if (stdout.length > 0) break;
      await new Promise(r => setTimeout(r, 20));
    }
    return { ok: true, stdout, stderr, debug, exitStatus };
  } catch (e: any) {
    return { ok: false, stdout, stderr, debug: ["auto:catch-top", e?.message || String(e)], error: e?.stack || String(e) };
  }
}

// --- KV fetch ---
async function fetchKVPhpSource(env: Env, key: string): Promise<{ ok: boolean; code?: string; err?: string }> {
  try {
    if (!env?.SRC || typeof env.SRC.get !== "function") return { ok: false, err: "KV not configured" };
    const txt = await env.SRC.get(key, "text");
    if (txt == null) return { ok: false, err: `KV object not found: ${key}` };
    return { ok: true, code: normalizePhpCodeForEval(txt) };
  } catch (e: any) { return { ok: false, err: e?.message || String(e) }; }
}

// --- Routes ---
async function routeRepoIndex(url: URL, env: Env) {
  const keysToTry = [
    "public/index.php",
    "index.php",
    "Static_Creation/public/index.php",
  ];

  let codeNormalized: string | undefined;
  if (env?.SRC) {
    for (const k of keysToTry) {
      const kv = await fetchKVPhpSource(env, k);
      if (kv.ok) { codeNormalized = kv.code; break; }
    }
  }
  if (!codeNormalized) return textResponse("PHP source not found in KV", 404);

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
  const argv = buildArgvForCode(wrapCodeWithShutdownNewline(codeRaw), parseIniParams(url));
  const res = await runAuto(argv, 10000);
  return finalizeOk(url, res, "text/plain; charset=utf-8");
}

// --- finalize ---
function finalizeOk(url: URL, res: any, defaultCT: string) {
  const stdout = (res.stdout || []).join("\n");
  const stderr = (res.stderr || []).join("\n");
  const ct = stdout.includes("<html") ? "text/html; charset=utf-8" : defaultCT;
  const body = stdout || stderr || `[wasmphp] no output, exitStatus=${res.exitStatus}`;
  return new Response(body, { status: 200, headers: { "content-type": ct } });
}

// --- fetch handler ---
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);
      const pathname = url.pathname.replace(/\/+$/, "");

      if (pathname === "/") return routeRepoIndex(url, env);
      if (pathname === "/index.php") return routeRepoIndex(url, env);
      if (pathname === "/run") return routeRunGET(url);
      if (pathname === "/health") return textResponse("ok");

      return textResponse("Not Found", 404);
    } catch (e: any) {
      return textResponse("WASM PHP runtime error:\n" + (e?.stack || e), 500);
    }
  }
};
