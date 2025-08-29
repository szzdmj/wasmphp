// src/index.ts
import wasmAsset from "../scripts/php_8_4.wasm";

type Env = {
  SRC?: KVNamespace;
  ADMIN_TOKEN?: string;
};

const STATIC_EXT = /\.(?:js|css|png|jpe?g|gif|svg|webp|ico|json|txt|woff2?|ttf|map|html?)$/i;

// --- globals for Emscripten ---
(function ensureGlobals() {
  const g = globalThis as any;
  if (!g.location?.href) Object.defineProperty(g, "location", { value: { href: "file:///" }, configurable: true });
  if (!g.self) Object.defineProperty(g, "self", { value: g, configurable: true });
  else if (!g.self.location && g.location) g.self.location = g.location;
})();

// --- helpers ---
const DEFAULT_INIS = ["pcre.jit=0","opcache.enable=0","opcache.enable_cli=0","opcache.jit=0","opcache.jit_buffer_size=0","opcache.file_cache=","output_buffering=0","implicit_flush=1","zlib.output_compression=0","display_errors=1","display_startup_errors=1"];

function textResponse(body: string, status = 200, headers: Record<string,string> = {}) {
  return new Response(body, { status, headers: { "content-type": "text/plain; charset=utf-8", ...headers } });
}

function parseIniParams(url: URL) {
  const out: string[] = [];
  for (const s of url.searchParams.getAll("d").concat(url.searchParams.getAll("ini"))) {
    const t = s.trim();
    if (t && t.includes("=")) out.push(t);
  }
  return out;
}

function buildArgvForCode(code: string, iniList: string[] = []) {
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
  for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  return btoa(binary);
}

// --- KV key normalization ---
function kvKeyFromPath(pathname: string) {
  let p = decodeURIComponent(pathname);
  if (p.endsWith("/")) p += "index.php";
  if (p === "/") p = "/index.php";
  let key = p.replace(/^\/+/, "");
  if (!key || key.endsWith("/") || key.includes("..")) return null;
  if (!key.startsWith("public/")) key = "public/" + key;
  key = key.replace(/^public\/public\//, "public/");
  return key;
}

// --- PHP code normalize ---
function normalizePhpCodeForEval(src: string) {
  let s = src.trimStart();
  if (s.charCodeAt(0) === 0xfeff) s = s.slice(1);
  if (s.startsWith("<?php")) s = s.slice(5);
  else if (s.startsWith("<?")) s = s.slice(2);
  s = s.replace(/\?>\s*$/s,"");
  return s;
}

// --- wasm init helpers ---
function isWasmModule(x: any): x is WebAssembly.Module {
  return Object.prototype.toString.call(x) === "[object WebAssembly.Module]";
}
function makeInstantiateWithModule(wasmModule: WebAssembly.Module) {
  return (imports: WebAssembly.Imports, cb: (i: WebAssembly.Instance) => void) => {
    const instance = new WebAssembly.Instance(wasmModule, imports);
    try { cb(instance); } catch {}
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
  if (isWasmModule(wasmAsset)) { opts.instantiateWasm = makeInstantiateWithModule(wasmAsset as WebAssembly.Module); return opts; }
  if (typeof wasmAsset === "string") { const buf = await (await fetch(wasmAsset)).arrayBuffer(); opts.wasmBinary = buf; return opts; }
  if (wasmAsset instanceof ArrayBuffer) { opts.wasmBinary = wasmAsset; return opts; }
  if (ArrayBuffer.isView(wasmAsset)) { const v = wasmAsset as ArrayBufferView; opts.wasmBinary = v.buffer.slice(v.byteOffset,v.byteOffset+v.byteLength); return opts; }
  return opts;
}

// --- runAuto ---
async function runAuto(argv: string[], waitMs = 8000) {
  const debug: string[] = [], stdout: string[] = [], stderr: string[] = [];
  let exitStatus: number | undefined;
  try {
    const phpModule = await import("../scripts/php_8_4.js");
    const initCandidate = (phpModule as any).init || (phpModule as any).default || phpModule;
    if (typeof initCandidate !== "function") return { ok:false, stdout, stderr, debug, error:"PHP init factory not found" };
    const opts: any = await buildInitOptions({ arguments: argv.slice() });
    opts.print = txt => stdout.push(String(txt));
    opts.printErr = txt => stderr.push(String(txt));
    opts.onRuntimeInitialized = () => debug.push("auto:event:onRuntimeInitialized");
    await initCandidate(opts);
    const start = Date.now();
    while (Date.now()-start < waitMs) {
      if (typeof opts.__exitStatus === "number") { exitStatus=opts.__exitStatus; break; }
      if (stdout.length>0) break;
      await new Promise(r=>setTimeout(r,20));
    }
    return { ok:true, stdout, stderr, debug, exitStatus };
  } catch(e:any) { return { ok:false, stdout, stderr, debug:["auto:catch-top", e?.message||String(e)], error:e?.stack||String(e) }; }
}

// --- fetch PHP source ---
async function fetchKVPhpSource(env: Env, key: string) {
  try {
    if (!env?.SRC) return { ok:false, err:"KV not configured" };
    const txt = await env.SRC.get(key,"text");
    if (txt==null) return { ok:false, err:`KV missing: ${key}` };
    return { ok:true, code:normalizePhpCodeForEval(txt) };
  } catch(e:any) { return { ok:false, err:"KV fetch failed: "+(e?.message||String(e)) }; }
}

// --- fetch static content ---
async function fetchKVStatic(env: Env, key: string) {
  try {
    if (!env?.SRC) return null;
    const b = await env.SRC.get(key,"arrayBuffer");
    if (!b) return null;
    const ct = key.match(/\.[^.]+$/)?.[0]?.toLowerCase() || "";
    const mimeMap: Record<string,string> = { ".js":"application/javascript",".css":"text/css",".json":"application/json",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".gif":"image/gif",".svg":"image/svg+xml",".ico":"image/x-icon",".txt":"text/plain",".woff":"font/woff",".woff2":"font/woff2" };
    const contentType = mimeMap[ct] || "application/octet-stream";
    return new Response(b, { status:200, headers:{ "content-type":contentType } });
  } catch { return null; }
}

// --- main fetch handler ---
export default {
  async fetch(request: Request, env: Env) {
    try {
      const url = new URL(request.url);
      const path = url.pathname;

      if (path === "/health") return textResponse("ok");

      const key = kvKeyFromPath(path);
      if (key && STATIC_EXT.test(key)) {
        const resp = await fetchKVStatic(env,key);
        if (resp) return resp;
        return textResponse("Static Not Found",404);
      }

      if (path === "/" || path === "/index.php" || path === "/public/index.php") {
        const php = await fetchKVPhpSource(env,"public/index.php");
        if (!php.ok) return textResponse(php.err||"No code",502);
        const b64 = toBase64Utf8(php.code!);
        const oneLiner = wrapCodeWithShutdownNewline(`eval(base64_decode('${b64}'));`);
        const argv = buildArgvForCode(oneLiner, parseIniParams(url));
        const res = await runAuto(argv);
        return new Response(res.stdout.join("\n"), { status:200, headers:{ "content-type":"text/html; charset=utf-8" } });
      }

      if (path.startsWith("/run")) {
        const code = path==="/run" && request.method==="POST" ? await request.text() : url.searchParams.get("code")||"";
        if (!code) return textResponse("No code",400);
        const argv = buildArgvForCode(wrapCodeWithShutdownNewline(code), parseIniParams(url));
        const res = await runAuto(argv);
        return new Response(res.stdout.join("\n"),{status:200,headers:{"content-type":"text/plain; charset=utf-8"}});
      }

      return textResponse("Not Found",404);
    } catch(e:any) {
      return text
